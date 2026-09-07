from fastapi import APIRouter, status
from fastapi.responses import Response

from models.budget_model import BudgetCreate, BudgetUpdate
import controllers.budget_controller as controller

router = APIRouter(
    prefix="/api/budgets",
    tags=["Budgets"],
)


@router.get(
    "/alerts",
    summary="Get budget alerts (at-risk / over)",
    description=(
        "Returns budgets that are at warning (>=80%) or over (>=100%) "
        "the monthly limit. Filter with ?warn=0 for over-only."
    ),
    status_code=status.HTTP_200_OK,
)
async def list_budget_alerts(warn: bool = True):
    return await controller.get_budget_alerts(warn=warn)


@router.get(
    "/",
    summary="Get all budgets",
    description="Returns all budgets, each with its 'spent' amount computed from expenses.",
    status_code=status.HTTP_200_OK,
)
async def list_budgets():

    return await controller.get_all_budgets()


@router.get(
    "/{budget_id}",
    summary="Get a single budget by ID",
    description="Returns a single budget with its spent amount. Returns 400 for invalid ID, 404 if not found.",
    status_code=status.HTTP_200_OK,
)
async def get_budget(budget_id: str):
    
    return await controller.get_budget_by_id(budget_id)


@router.post(
    "/",
    summary="Create a new budget",
    description="Creates a monthly budget for a category. Returns 409 if that category already has a budget that month.",
    status_code=status.HTTP_201_CREATED,
)
async def create_budget(body: BudgetCreate):

    return await controller.create_budget(body)


@router.put(
    "/{budget_id}",
    summary="Update an existing budget",
    description="Partially updates a budget. Only provided fields are updated. Returns 404 if not found.",
    status_code=status.HTTP_200_OK,
)
async def update_budget(budget_id: str, body: BudgetUpdate):

    return await controller.update_budget(budget_id, body)


@router.delete(
    "/{budget_id}",
    summary="Delete a budget",
    description="Permanently deletes a budget by ID. Returns 204 No Content on success.",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_budget(budget_id: str):

    await controller.delete_budget(budget_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)