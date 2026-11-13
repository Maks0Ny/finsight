import {
  ApiError,
} from "../../../shared/api/ApiError";

export const UPLOAD_DATASET_ERRORS = {
  unauthorized:
    "Сессия завершена. Войдите в аккаунт снова",

  forbidden:
    "У вас недостаточно прав для загрузки датасета",

  organizationNotFound:
    "Организация не найдена",

  fileTooLarge:
    "Размер файла превышает 50 МБ",

  invalidFile:
    "Файл не прошёл проверку",

  serverUnavailable:
    "Сервер временно недоступен",

  unknown:
    "Не удалось загрузить датасет",
} as const;

export function getUploadDatasetError(
  error: unknown,
): string {
  if (!(error instanceof ApiError)) {
    return UPLOAD_DATASET_ERRORS.unknown;
  }

  if (error.status === 401) {
    return UPLOAD_DATASET_ERRORS.unauthorized;
  }

  if (error.status === 403) {
    return UPLOAD_DATASET_ERRORS.forbidden;
  }

  if (error.status === 404) {
    return UPLOAD_DATASET_ERRORS.organizationNotFound;
  }

  if (error.status === 413) {
    return UPLOAD_DATASET_ERRORS.fileTooLarge;
  }

  if (error.status === 422) {
    return UPLOAD_DATASET_ERRORS.invalidFile;
  }

  if (error.status >= 500) {
    return UPLOAD_DATASET_ERRORS.serverUnavailable;
  }

  return UPLOAD_DATASET_ERRORS.unknown;
}