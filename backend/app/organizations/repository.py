from sqlalchemy.orm import Session
from sqlalchemy import select
from .models import Organization, OrganizationMembership


def get_organization_by_slug(
    session: Session,
    slug: str,
) -> Organization | None:
    return session.scalar(
        select(Organization).where(Organization.slug == slug)
    )

def get_organization_by_id(
    session: Session,
    organization_id: int,
) -> Organization | None:
    return session.scalar(
        select(Organization).where(Organization.id == organization_id)
    )

def save_organization(
    session: Session,
    organization: Organization
) -> Organization:
    
    session.add(organization)
    return organization

def save_membership(
    session: Session,
    membership: OrganizationMembership,
) -> OrganizationMembership:
    
    session.add(membership)
    return membership


def get_organizations_by_user_id(
    session: Session,
    user_id: int,
) -> list[Organization]:
    statement = (
        select(Organization)
        .join(
            OrganizationMembership,
            OrganizationMembership.organization_id == Organization.id,
        )
        .where(
            OrganizationMembership.user_id == user_id,
            OrganizationMembership.status == "active",
        )
        .order_by(Organization.name)
    )
    return list(session.scalars(statement))


def check_status(
    session: Session,
    user_id: int,
    organization_id: int,
) -> OrganizationMembership | None:
    return session.scalar(
        select(OrganizationMembership).where(
            OrganizationMembership.status == "active",
            OrganizationMembership.user_id == user_id,
            OrganizationMembership.organization_id == organization_id,
        )
    ) 
    
def check_role(
    session: Session,
    user_id: int,
    organization_id: int,
) -> str | None:
    statement = select(OrganizationMembership.role).where(
        OrganizationMembership.user_id == user_id,
        OrganizationMembership.organization_id == organization_id,
        OrganizationMembership.status == "active",
    )
    return session.scalar(statement)
         
def list_members_by_organization_id(
    session: Session,
    organization_id: int,
) -> list[OrganizationMembership]:
    statement = (
        select(OrganizationMembership)
        .where(
            OrganizationMembership.organization_id == organization_id,
            OrganizationMembership.status == "active",
        )
        .order_by(OrganizationMembership.id)
    )
    return list(session.scalars(statement))


def add_user_by_id(
    session: Session,
    added_user_id: int,
    organization_id: int,
    role: str,
) -> OrganizationMembership:
    
    membership = OrganizationMembership(
        user_id=added_user_id,
        organization_id=organization_id,
        role=role,
        status="active",
    )
    session.add(membership)
    return membership