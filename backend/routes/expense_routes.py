from fastapi import APIRouter, status
from fastapi.responses import Response

from models.expense_model import ExpenseAlertRequest, ExpenseCreate, ExpenseUpdate
import controllers.expense_controller as controller

router = APIRouter(
    prefix="/api/expenses",
    tags=["Expenses"],
)


@router.post(
    "/check-budget",
    summary="Check an expense against its budget",
    description=(
        "Evaluates a candidate expense (category, amount, date) against the "
        "matching monthly budget. Returns the budget status (ok/warning/over) "
        "and the projected spend, without persisting anything. Returns an empty "
        "body if no budget exists for that category/month."
    ),
    status_code=status.HTTP_200_OK,
)
async def check_expense_budget(body: ExpenseAlertRequest):
    return await controller.check_expense_budget(body)


@router.get(
    "/",
    summary="Get all expenses",
    description="Returns a list of all expenses sorted by date (newest first).",
    status_code=status.HTTP_200_OK,
)
async def list_expenses():
    return await controller.get_all_expenses()


@router.get(
    "/{expense_id}",
    summary="Get a single expense by ID",
    description="Returns a single expense. Returns 400 for invalid ID format, 404 if not found.",
    status_code=status.HTTP_200_OK,
)
async def get_expense(expense_id: str):

    return await controller.get_expense_by_id(expense_id)


@router.post(
    "/",
    summary="Create a new expense",
    description="Creates a new expense and returns the created document with its assigned ID.",
    status_code=status.HTTP_201_CREATED,
)
async def create_expense(body: ExpenseCreate):
    return await controller.create_expense(body)


@router.put(
    "/{expense_id}",
    summary="Update an existing expense",
    description="Partially updates an expense. Only provided fields are updated. Returns 404 if not found.",
    status_code=status.HTTP_200_OK,
)
async def update_expense(expense_id: str, body: ExpenseUpdate):
    return await controller.update_expense(expense_id, body)


@router.delete(
    "/{expense_id}",
    summary="Delete an expense",
    description="Permanently deletes an expense by ID. Returns 204 No Content on success.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_expense(expense_id: str):
    await controller.delete_expense(expense_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)