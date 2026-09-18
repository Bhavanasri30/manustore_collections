from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: Optional[str] = None


class CategoryResponse(CategoryCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=200)
    description: Optional[str] = None
    price: float = Field(gt=0)
    stock_quantity: int = Field(default=0, ge=0)
    sizes: Optional[str] = None
    colors: Optional[str] = None
    image_url: Optional[str] = None
    is_available: bool = True
    category_id: int


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(default=None, gt=0)
    stock_quantity: Optional[int] = Field(default=None, ge=0)
    sizes: Optional[str] = None
    colors: Optional[str] = None
    image_url: Optional[str] = None
    is_available: Optional[bool] = None
    category_id: Optional[int] = None


class ProductResponse(ProductCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class KnowledgeCreate(BaseModel):
    title: str = Field(min_length=2, max_length=200)
    content: str = Field(min_length=5)
    document_type: str = Field(min_length=2, max_length=50)


class KnowledgeUpdate(BaseModel):
    title: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=200,
    )
    content: Optional[str] = Field(
        default=None,
        min_length=5,
    )
    document_type: Optional[str] = Field(
        default=None,
        min_length=2,
        max_length=50,
    )


class KnowledgeResponse(KnowledgeCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)