from app.core.errors import AppError

class UserNotFoundError(AppError):
    status_code = 404
    detail = "User not found"