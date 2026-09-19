from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from backend.app import models
from backend.app.database import Base, engine
from backend.app.routes import router


app = FastAPI(
    title="ManuStore API",
    description="Backend API for ManuStore Collections",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)

Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "ManuStore backend is running",
        "status": "success",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "ManuStore API",
    }


@app.get("/api/database-health")
def database_health():
    try:
        with engine.connect() as connection:
            database_name = connection.execute(
                text("SELECT current_database()")
            ).scalar()

        return {
            "status": "connected",
            "database": database_name,
        }

    except Exception as error:
        return {
            "status": "error",
            "message": str(error),
        }