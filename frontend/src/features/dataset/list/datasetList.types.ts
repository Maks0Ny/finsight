import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

export type DatasetListProps = {
  organizationId: number;

  /*
    При изменении refreshKey список будет
    повторно загружен с backend.
  */
  refreshKey?: number;

  onDatasetSelect?: (
    dataset: Dataset,
  ) => void;
};