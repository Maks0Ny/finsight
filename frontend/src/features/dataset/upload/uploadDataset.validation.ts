import type {
  UploadDatasetFormValues,
} from "./uploadDataset.types";

const MAX_DATASET_NAME_LENGTH = 200;

const MAX_FILE_SIZE_BYTES =
  50 * 1024 * 1024;

export function validateUploadDataset(
  values: UploadDatasetFormValues,
): string {
  const name = values.name.trim();
  const file = values.file;

  if (!name) {
    return "Введите название датасета";
  }

  if (name.length > MAX_DATASET_NAME_LENGTH) {
    return "Название не должно превышать 200 символов";
  }

  if (!file) {
    return "Выберите CSV-файл";
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return "Поддерживаются только CSV-файлы";
  }

  if (file.size === 0) {
    return "Выбранный файл пуст";
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return "Размер файла не должен превышать 50 МБ";
  }

  return "";
}