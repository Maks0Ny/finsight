class AppError(Exception):
    status_code = 500
    detail = "Error"