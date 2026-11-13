import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

import {
  getDatasetList,
} from "./datasetList.api";

import {
  getDatasetListError,
} from "./datasetList.errors";

export function useDatasetList(
  organizationId: number,
  refreshKey = 0,
) {
  const [
    datasets,
    setDatasets,
  ] = useState<Dataset[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const loadDatasets = useCallback(
    async function () {
      setIsLoading(true);
      setError("");

      try {
        const receivedDatasets =
          await getDatasetList(
            organizationId,
          );

        setDatasets(receivedDatasets);
      } catch (loadError) {
        setDatasets([]);

        setError(
          getDatasetListError(loadError),
        );
      } finally {
        setIsLoading(false);
      }
    },
    [organizationId],
  );

  useEffect(() => {
    void loadDatasets();
  }, [
    loadDatasets,
    refreshKey,
  ]);

  return {
    datasets,
    isLoading,
    error,
    reload: loadDatasets,
  };
}