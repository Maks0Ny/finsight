from backend.app.core.errors import AppError

class UserNotFoundError(AppError):
    status_code = 404
    detail = "User not found"
    
    
class UserAlreadyExistsError(AppError):
    status_code = 409
    detail = "User already exists"