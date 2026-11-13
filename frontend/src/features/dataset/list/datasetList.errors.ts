import {
  ApiError,
} from "../../../shared/api/ApiError";

export const DATASET_LIST_ERRORS = {
  unauthorized:
    "Сессия завершена. Войдите в аккаунт снова",

  forbidden:
    "У вас недостаточно прав для просмотра датасетов",

  organizationNotFound:
    "Организация не найдена",

  serverUnavailable:
    "Сервер временно недоступен",

  unknown:
    "Не удалось получить список датасетов",
} as const;

export function getDatasetListError(
  error: unknown,
): string {
  if (!(error instanceof ApiError)) {
    return DATASET_LIST_ERRORS.unknown;
  }

  if (error.status === 401) {
    return DATASET_LIST_ERRORS.unauthorized;
  }

  if (error.status === 403) {
    return DATASET_LIST_ERRORS.forbidden;
  }

  if (error.status === 404) {
    return DATASET_LIST_ERRORS.organizationNotFound;
  }

  if (error.status >= 500) {
    return DATASET_LIST_ERRORS.serverUnavailable;
  }

  return DATASET_LIST_ERRORS.unknown;
}