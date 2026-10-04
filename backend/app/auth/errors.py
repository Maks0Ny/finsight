from ..core.errors import AppError


class InvalidAccessTokenError(AppError):
    status_code = 401
    detail = "Invalid or expired access token"


class InvalidCredentialsError(AppError):
    status_code = 401
    detail = "Invalid email or password"


class InvalidRefreshTokenError(AppError):
    status_code = 401
    detail = "Invalid or expired refresh token"