from models.expense_model import ExpenseAlertRequest, ExpenseCreate, ExpenseUpdate
from services import expense_service


async def create_expense(data: ExpenseCreate) -> dict:
    
    return await expense_service.create_expense(data)


async def check_expense_budget(data) -> dict | None:
    
    return await expense_service.check_expense_budget(data)


async def get_all_expenses() -> list[dict]:
    
    return await expense_service.get_all_expenses()


async def get_expense_by_id(expense_id: str) -> dict:
    
    return await expense_service.get_expense_by_id(expense_id)


async def update_expense(expense_id: str, data: ExpenseUpdate) -> dict:
    
    return await expense_service.update_expense(expense_id, data)


async def delete_expense(expense_id: str) -> None:
    
    await expense_service.delete_expense(expense_id)