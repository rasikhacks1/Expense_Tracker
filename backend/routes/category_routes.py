"""
routes/category_routes.py
--------------------------
Presentation Layer interface — API routes for Categories.
"""

from fastapi import APIRouter
from models.category_model import CategoryCreate, CategoryUpdate
import controllers.category_controller as ctrl

router = APIRouter(prefix="/api/categories", tags=["Categories"])


@router.get("/", summary="List all categories")
async def list_categories():
    return await ctrl.get_all_categories()


@router.get("/{category_id}", summary="Get category by ID")
async def get_category(category_id: str):
    return await ctrl.get_category_by_id(category_id)


@router.post("/", summary="Create a new category", status_code=201)
async def create_category(body: CategoryCreate):
    return await ctrl.create_category(body)


@router.put("/{category_id}", summary="Update a category")
async def update_category(category_id: str, body: CategoryUpdate):
    return await ctrl.update_category(category_id, body)


@router.delete("/{category_id}", summary="Delete a category")
async def delete_category(category_id: str):
    return await ctrl.delete_category(category_id)
