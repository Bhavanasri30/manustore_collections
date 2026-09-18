import os
from pathlib import Path

from dotenv import load_dotenv
from groq import Groq


ENV_FILE = Path(__file__).resolve().parent.parent / ".env"
load_dotenv(ENV_FILE)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")

if not GROQ_API_KEY:
    raise RuntimeError(f"GROQ_API_KEY is missing from {ENV_FILE}")

client = Groq(api_key=GROQ_API_KEY)


def generate_response(
    user_question: str,
    context: str = "",
) -> str:
    system_prompt = """
You are the ManuStore shopping assistant.

Answer only questions related to ManuStore products, prices, stock,
sizes, colours, orders, delivery, payment, returns and contact details.

Use only the provided context.
Never invent products, prices, stock, policies or contact information.
If the context does not contain the answer, clearly say that the
information is unavailable.
Keep answers short, friendly and useful.
"""

    completion = client.chat.completions.create(
                model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": (
                    f"Context:\n{context}\n\n"
                    f"Question:\n{user_question}"
                ),
            },
        ],
        temperature=0.2,
        max_tokens=400,
    )

    return completion.choices[0].message.content