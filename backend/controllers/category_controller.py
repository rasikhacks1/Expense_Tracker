from models.category_model import CategoryCreate, CategoryUpdate
from services import category_service


async def create_category(data: CategoryCreate) -> dict:
   
    return await category_service.create_category(data)


async def get_all_categories(category_type: str | None = None) -> list[dict]:
   
    return await category_service.get_all_categories(category_type)


async def get_category_by_id(category_id: str) -> dict:
    
    return await category_service.get_category_by_id(category_id)


async def update_category(category_id: str, data: CategoryUpdate) -> dict:
    
    return await category_service.update_category(category_id, data)


async def delete_category(category_id: str) -> None:
    
    await category_service.delete_category(category_id)