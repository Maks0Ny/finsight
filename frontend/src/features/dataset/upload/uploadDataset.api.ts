import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

import {
  httpClient,
} from "../../../shared/api/httpClient";

import type {
  UploadDatasetInput,
} from "./uploadDataset.types";

export function uploadDataset(
  input: UploadDatasetInput,
): Promise<Dataset> /*функция вернёт объект типа Dataset, но не сразу, а после завершения асинхронной операции*/
{
  const formData = new FormData();

  formData.append(
    "name",
    input.name,
  );

  formData.append(
    "file",
    input.file,
  );

  return httpClient<Dataset>(
    '/organizations/${input.organizationId}/datasets/upload',
    {
      method: "POST",
      body: formData,
    },
  );
}