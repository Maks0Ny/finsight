import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

import {
  httpClient,
} from "../../../shared/api/httpClient";

export function getDatasetList(
  organizationId: number,
): Promise<Dataset[]> {
  return httpClient<Dataset[]>(
    `/organizations/${organizationId}/datasets/list/`,
  );
}