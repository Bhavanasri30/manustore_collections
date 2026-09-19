from pathlib import Path
import re

import chromadb
from sentence_transformers import SentenceTransformer
from sqlalchemy.orm import Session

from backend.app import models
from backend.app.groq_service import generate_response


CHROMA_PATH = Path(__file__).resolve().parent.parent / "chroma_data"
COLLECTION_NAME = "manustore_knowledge"
OUT_OF_SCOPE_MESSAGE = (
    "I can only help with ManuStore products, prices, stock, sizes, colours, "
    "orders, delivery, payments, returns and store information."
)

ALLOWED_KEYWORDS = {
    "manustore",
    "product",
    "products",
    "saree",
    "sarees",
    "kurti",
    "kurtis",
    "kurta",
    "kurtas",
    "anarkali",
    "anarkalis",
    "frock",
    "frocks",
    "dress",
    "dresses",
    "price",
    "cost",
    "stock",
    "available",
    "availability",
    "size",
    "sizes",
    "colour",
    "colours",
    "color",
    "colors",
    "material",
    "fabric",
    "order",
    "orders",
    "delivery",
    "shipping",
    "payment",
    "return",
    "exchange",
    "contact",
    "store",
    "collection",
    "collections",
}

GREETING_WORDS = {"hi", "hello", "hey", "namaste"}

_embedding_model = None


def get_embedding_model():
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def get_chroma_client():
    CHROMA_PATH.mkdir(parents=True, exist_ok=True)
    return chromadb.PersistentClient(path=str(CHROMA_PATH))


def get_collection():
    return get_chroma_client().get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )


def build_product_document(product, category_name: str) -> str:
    availability = "available" if product.is_available and product.stock_quantity > 0 else "out of stock"
    return (
        f"Product: {product.name}. "
        f"Category: {category_name}. "
        f"Description: {product.description or 'Not provided'}. "
        f"Price: ₹{product.price}. "
        f"Stock quantity: {product.stock_quantity}. "
        f"Availability: {availability}. "
        f"Sizes: {product.sizes or 'Not specified'}. "
        f"Colours: {product.colors or 'Not specified'}."
    )


def sync_vector_store(db: Session) -> int:
    client = get_chroma_client()
    try:
        client.delete_collection(COLLECTION_NAME)
    except Exception:
        pass

    collection = client.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"},
    )

    ids = []
    documents = []
    metadatas = []

    products = db.query(models.Product).all()
    for product in products:
        category_name = product.category.name if product.category else "Uncategorized"
        ids.append(f"product_{product.id}")
        documents.append(build_product_document(product, category_name))
        metadatas.append(
            {
                "source": "product",
                "record_id": product.id,
                "category": category_name,
            }
        )

    knowledge_documents = db.query(models.KnowledgeDocument).all()
    for document in knowledge_documents:
        ids.append(f"knowledge_{document.id}")
        documents.append(f"{document.title}. {document.content}")
        metadatas.append(
            {
                "source": "knowledge",
                "record_id": document.id,
                "document_type": document.document_type,
            }
        )

    if not documents:
        return 0

    embeddings = get_embedding_model().encode(documents).tolist()
    collection.upsert(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    return len(documents)


def is_in_scope(question: str) -> bool:
    words = set(re.findall(r"[a-zA-Z]+", question.lower()))
    if not words:
        return False
    if words.issubset(GREETING_WORDS):
        return True
    return bool(words.intersection(ALLOWED_KEYWORDS))


def retrieve_context(question: str, limit: int = 4) -> list[str]:
    collection = get_collection()
    if collection.count() == 0:
        return []

    query_embedding = get_embedding_model().encode([question]).tolist()
    results = collection.query(
        query_embeddings=query_embedding,
        n_results=min(limit, collection.count()),
        include=["documents", "distances", "metadatas"],
    )

    documents = results.get("documents", [[]])[0]
    distances = results.get("distances", [[]])[0]
    return [
        document
        for document, distance in zip(documents, distances)
        if distance <= 0.45
    ]


def answer_question(question: str) -> dict:
    cleaned_question = question.strip()
    words = set(re.findall(r"[a-zA-Z]+", cleaned_question.lower()))

    if words and words.issubset(GREETING_WORDS):
        return {
            "answer": "Hi! I can help with ManuStore products, prices, stock, sizes, delivery, orders, payments, returns and exchanges.",
            "status": "greeting",
            "sources": [],
        }

    if not is_in_scope(cleaned_question):
        return {"answer": OUT_OF_SCOPE_MESSAGE, "status": "out_of_scope", "sources": []}

    context_documents = retrieve_context(cleaned_question)
    if not context_documents:
        return {
            "answer": "I could not find that information in the ManuStore catalogue.",
            "status": "not_found",
            "sources": [],
        }

    answer = generate_response(
        user_question=cleaned_question,
        context="\n\n".join(context_documents),
    )
    return {
        "answer": answer,
        "status": "answered",
        "sources": context_documents,
    }
