from sqlalchemy.orm import Session
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .errors import OrganizationSlugAlreadyExistsError, OrganizationForbiddenError, OrganizationNotFoundError
from .schemas import OrganizationCreateRequest
from .models import Organization, OrganizationMembership
from .repository import (
    get_organization_by_slug,
    get_organization_by_id,
    get_organizations_by_user_id,
    save_membership,
    save_organization,
    check_status,
    list_members_by_organization_id,
    check_role,
    add_user_by_id,
)


def search_organization(
    session: Session,
    user_id: int,
    organization_id: int,
) -> Organization:
    
    if check_status(session, user_id, organization_id) is None:
        raise OrganizationForbiddenError()

    organization = get_organization_by_id(session, organization_id)
    if organization is None:
        raise OrganizationNotFoundError()

    return organization


def register_organization(
    session: Session,
    data: OrganizationCreateRequest,
    creator_user_id: int,
) -> Organization:
    
    if get_organization_by_slug(session, data.slug) is not None:
        raise OrganizationSlugAlreadyExistsError()

    now = datetime.now(timezone.utc)

    organization = Organization(
        name=data.name,
        slug=data.slug,
        base_currency=data.base_currency,
        timezone=data.timezone,
        language=data.language,
        status="active",
        created_by_user_id=creator_user_id,
        created_at=now,
        updated_at=now,
    )
    
    try:
        save_organization(session, organization)
        session.flush()  # INSERT без COMMIT: теперь доступен organization.id

        membership = OrganizationMembership(
            organization_id=organization.id,
            user_id=creator_user_id,
            role="owner",
            status="active",
        )
        save_membership(session, membership)

        session.commit()
    
    # IntegrityError означает нарушение ограничения БД
    except IntegrityError as exc:
        session.rollback()

        # exc.orig исходная ошибка PostgreSQL внутри SQLAlchemy IntegrityError.
        # Внутренний getattr безопасно читает её атрибут .diag
        # (диагностику ошибки); если .diag нет, возвращает None.
        # Внешний getattr читает из диагностики атрибут .constraint_name
        # (имя нарушенного ограничения БД); если его нет, тоже возвращает None.
        constraint_name = getattr(
            getattr(exc.orig, "diag", None),
            "constraint_name",
            None,
        )
        
        if constraint_name == "organizations_slug_key":
            raise OrganizationSlugAlreadyExistsError() from exc
        raise
    
    return organization
    
    
def list_my_organizations(
    session: Session,
    user_id: int,
) -> list[Organization]:
    return get_organizations_by_user_id(session, user_id)


def organization_members(
    session: Session,
    user_id: int,
    organization_id: int,
) -> list:
    if get_organization_by_id(session, organization_id) is None:
        raise OrganizationNotFoundError()
    
    if check_status(session, user_id, organization_id) is None:
            raise OrganizationForbiddenError()
    
    return list_members_by_organization_id(session, organization_id)


def add_new_member(
    session: Session,
    user_id: int,
    organization_id: int,
    added_user_id: int,
    role: str,
) -> OrganizationMembership:
    if check_role(session, user_id, organization_id) != "owner":
        raise OrganizationForbiddenError
    
    return add_user_by_id(session, added_user_id, organization_id, role)