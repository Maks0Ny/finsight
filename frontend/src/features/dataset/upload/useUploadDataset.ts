import {
  useState,
} from "react";

import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

import {
  uploadDataset,
} from "./uploadDataset.api";

import {
  getUploadDatasetError,
} from "./uploadDataset.errors";

import type {
  UploadDatasetInput,
} from "./uploadDataset.types";

export function useUploadDataset() {
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    uploadedDataset,
    setUploadedDataset,
  ] = useState<Dataset | null>(null);

  async function upload(
    input: UploadDatasetInput,
  ): Promise<Dataset | null> {
    setIsLoading(true);
    setError("");
    setUploadedDataset(null);

    try {
      const dataset =
        await uploadDataset(input);

      setUploadedDataset(dataset);

      return dataset;
    } catch (uploadError) {
      setError(
        getUploadDatasetError(uploadError),
      );

      return null;
    } finally {
      setIsLoading(false);
    }
  }

  function resetUpload() {
    setError("");
    setUploadedDataset(null);
  }

  return {
    upload,
    resetUpload,
    isLoading,
    error,
    uploadedDataset,
  };
}