from models.budget_model import BudgetCreate, BudgetUpdate
from services import budget_service


async def create_budget(data: BudgetCreate) -> dict:

    return await budget_service.create_budget(data)


async def get_all_budgets() -> list[dict]:
   
    return await budget_service.get_all_budgets()


async def get_budget_by_id(budget_id: str) -> dict:
    
    return await budget_service.get_budget_by_id(budget_id)


async def update_budget(budget_id: str, data: BudgetUpdate) -> dict:
   
    return await budget_service.update_budget(budget_id, data)


async def get_budget_alerts(warn: bool = True) -> list[dict]:
   
    return await budget_service.get_budget_alerts(warn=warn)


async def delete_budget(budget_id: str) -> None:
   
    await budget_service.delete_budget(budget_id)