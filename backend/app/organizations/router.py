from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .models import Organization
from .service import (
    register_organization, 
    search_organization, 
    list_my_organizations,
    organization_members,
    add_new_member,
)
from .schemas import (
    OrganizationCreateRequest, 
    OrganizationResponse, 
    OrganizationMemberResponse,
    AddMemberRequest
)

from ..auth.dependencies import get_current_user
from ..database.session import get_session
from ..users.models import User

router = APIRouter(prefix="/organizations", tags=["Oraganizations"])


@router.get(
    "",
    response_model=list[OrganizationResponse],
    status_code=status.HTTP_200_OK
)
def my_organizations(
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list:
    return list_my_organizations(db, current_user.id)

@router.get(
    "/{organization_id}",
    response_model=OrganizationResponse,
    status_code=status.HTTP_200_OK)
def get_organization(
    organization_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> Organization:
    return search_organization(db, current_user.id, organization_id)

@router.get(
    "/{organization_id}/members",
    response_model=list[OrganizationMemberResponse],
    status_code=status.HTTP_200_OK)
def list_members(
    organization_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
) -> list[OrganizationMemberResponse]:
    
    members = organization_members(db, current_user.id, organization_id)
    return [
        OrganizationMemberResponse(
            user_id=member.user_id,
            name=member.user.name,
            second_name=member.user.second_name,
            role=member.role,
        )
        for member in members
    ]

@router.post(
    "/create",
    response_model=OrganizationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_organization(
    data: OrganizationCreateRequest,
    db: Session = Depends(get_session),
    current_user: User = Depends(get_current_user)
) -> OrganizationResponse:
    organization = register_organization(db, data, current_user.id)
    return OrganizationResponse.model_validate(organization) # Явно превращает объект SQLAlchemy Organization в Pydantic-схему OrganizationResponse


@router.post(
    "/{organization_id}/members",
    response_model=OrganizationMemberResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_member(
    data: AddMemberRequest,
    organization_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_session),
) -> OrganizationMemberResponse:
    
    member = add_new_member(
        db, 
        current_user.id, 
        organization_id, 
        data.user_id, 
        data.role
    )
    return OrganizationMemberResponse(
        user_id=member.user_id,
        name=member.user.name,
        second_name=member.user.second_name,
        role=member.role,
    )

@router.patch("/{id}")
def update_organization():
    pass




