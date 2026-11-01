from ..core.errors import AppError


class InvalidDatasetFileError(AppError):
    status_code = 422
    detail = "Invalid CSV file or dataset name"


class DatasetFileTooLargeError(AppError):
    status_code = 413
    detail = "CSV file is too large"
    
    
class DatasetNotFoundError(AppError):
    status_code = 404
    detail = "Dataset not found"