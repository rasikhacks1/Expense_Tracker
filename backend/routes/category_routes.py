from fastapi import APIRouter, status, Query
from fastapi.responses import Response

from models.category_model import CategoryCreate, CategoryUpdate
import controllers.category_controller as controller

router = APIRouter(
    prefix="/api/categories",
    tags=["Categories"],
)


@router.get(
    "/",
    summary="Get all categories",
    description="Returns categories, optionally filtered by type ('expense' or 'budget').",
    status_code=status.HTTP_200_OK,
)
async def list_categories(type: str | None = Query(None, description="Filter by 'expense' or 'budget'")):
    return await controller.get_all_categories(type)


@router.get(
    "/{category_id}",
    summary="Get a single category by ID",
    description="Returns a single category. Returns 400 for invalid ID format, 404 if not found.",
    status_code=status.HTTP_200_OK,
)
async def get_category(category_id: str):
    return await controller.get_category_by_id(category_id)


@router.post(
    "/",
    summary="Create a new category",
    description="Creates a category with a unique name per type. Returns 409 if the name already exists for that type.",
    status_code=status.HTTP_201_CREATED,
)
async def create_category(body: CategoryCreate):
    return await controller.create_category(body)


@router.put(
    "/{category_id}",
    summary="Update an existing category",
    description="Partially updates a category. Only provided fields are updated. Returns 404 if not found.",
    status_code=status.HTTP_200_OK,
)
async def update_category(category_id: str, body: CategoryUpdate):

    return await controller.update_category(category_id, body)


@router.delete(
    "/{category_id}",
    summary="Delete a category",
    description="Permanently deletes a category by ID. Returns 204 No Content on success.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_category(category_id: str):
   
    await controller.delete_category(category_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)