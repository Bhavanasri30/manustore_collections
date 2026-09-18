from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app import models, schemas
from backend.app.database import get_db
from backend.app.rag_service import answer_question, sync_vector_store


router = APIRouter(prefix="/api", tags=["ManuStore"])


@router.post(
    "/categories",
    response_model=schemas.CategoryResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_category(
    category: schemas.CategoryCreate,
    db: Session = Depends(get_db),
):
    existing_category = (
        db.query(models.Category)
        .filter(models.Category.name == category.name)
        .first()
    )

    if existing_category:
        raise HTTPException(
            status_code=400,
            detail="Category already exists",
        )

    new_category = models.Category(**category.model_dump())
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


@router.get(
    "/categories",
    response_model=list[schemas.CategoryResponse],
)
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).order_by(models.Category.id).all()


@router.post(
    "/products",
    response_model=schemas.ProductResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_product(
    product: schemas.ProductCreate,
    db: Session = Depends(get_db),
):
    category = db.get(models.Category, product.category_id)

    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    new_product = models.Product(**product.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product


@router.get(
    "/products",
    response_model=list[schemas.ProductResponse],
)
def get_products(db: Session = Depends(get_db)):
    return db.query(models.Product).order_by(models.Product.id).all()


@router.get(
    "/products/{product_id}",
    response_model=schemas.ProductResponse,
)
def get_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    return product


@router.put(
    "/products/{product_id}",
    response_model=schemas.ProductResponse,
)
def update_product(
    product_id: int,
    product_data: schemas.ProductUpdate,
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    updates = product_data.model_dump(exclude_unset=True)

    if "category_id" in updates:
        category = db.get(models.Category, updates["category_id"])
        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

    for field, value in updates.items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.delete("/products/{product_id}")
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
):
    product = db.get(models.Product, product_id)

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()
    return {
        "message": "Product deleted successfully",
        "product_id": product_id,
    }


@router.post(
    "/knowledge",
    response_model=schemas.KnowledgeResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_knowledge(
    knowledge: schemas.KnowledgeCreate,
    db: Session = Depends(get_db),
):
    new_document = models.KnowledgeDocument(**knowledge.model_dump())
    db.add(new_document)
    db.commit()
    db.refresh(new_document)
    return new_document


@router.get(
    "/knowledge",
    response_model=list[schemas.KnowledgeResponse],
)
def get_knowledge(db: Session = Depends(get_db)):
    return (
        db.query(models.KnowledgeDocument)
        .order_by(models.KnowledgeDocument.id)
        .all()
    )


@router.get(
    "/knowledge/{document_id}",
    response_model=schemas.KnowledgeResponse,
)
def get_knowledge_document(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = db.get(models.KnowledgeDocument, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Knowledge document not found",
        )

    return document


@router.put(
    "/knowledge/{document_id}",
    response_model=schemas.KnowledgeResponse,
)
def update_knowledge(
    document_id: int,
    knowledge: schemas.KnowledgeUpdate,
    db: Session = Depends(get_db),
):
    document = db.get(models.KnowledgeDocument, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Knowledge document not found",
        )

    updates = knowledge.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(document, field, value)

    db.commit()
    db.refresh(document)
    return document


@router.delete("/knowledge/{document_id}")
def delete_knowledge(
    document_id: int,
    db: Session = Depends(get_db),
):
    document = db.get(models.KnowledgeDocument, document_id)

    if not document:
        raise HTTPException(
            status_code=404,
            detail="Knowledge document not found",
        )

    db.delete(document)
    db.commit()
    return {
        "message": "Knowledge document deleted successfully",
        "document_id": document_id,
    }


@router.post("/rag/sync")
def sync_rag_data(db: Session = Depends(get_db)):
    indexed_documents = sync_vector_store(db)
    return {
        "message": "RAG data synchronized successfully",
        "indexed_documents": indexed_documents,
    }


@router.post(
    "/chat",
    response_model=schemas.ChatResponse,
)
def chat_with_manustore(chat: schemas.ChatRequest):
    return answer_question(chat.message)
