from ..core.errors import AppError


class OrganizationSlugAlreadyExistsError(AppError):
    status_code = 409
    detail = "Organization slug already exists"
    
    
class OrganizationForbiddenError(AppError):
    status_code = 403
    detail = "User does not have access"
    
    
class OrganizationNotFoundError(AppError):
    status_code = 404
    detail = "Organization not found"