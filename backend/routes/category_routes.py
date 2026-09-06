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
def list_categories():
    return ctrl.get_all_categories()


@router.get("/{category_id}", summary="Get category by ID")
def get_category(category_id: str):
    return ctrl.get_category_by_id(category_id)


@router.post("/", summary="Create a new category", status_code=201)
def create_category(body: CategoryCreate):
    return ctrl.create_category(body)


@router.put("/{category_id}", summary="Update a category")
def update_category(category_id: str, body: CategoryUpdate):
    return ctrl.update_category(category_id, body)


@router.delete("/{category_id}", summary="Delete a category")
def delete_category(category_id: str):
    return ctrl.delete_category(category_id)
