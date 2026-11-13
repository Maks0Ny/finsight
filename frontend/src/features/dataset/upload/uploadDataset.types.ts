import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

export type UploadDatasetInput = {
  organizationId: number;
  name: string;
  file: File;
};

export type UploadDatasetFormValues = {
  name: string;
  file: File | null;
};

export type UploadDatasetProps = {
  organizationId: number;

  onUploaded?: (
    dataset: Dataset,
  ) => void; /*Функция ничего не обязана возвращать*/
};