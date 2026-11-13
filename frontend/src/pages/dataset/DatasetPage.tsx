import {
  useState,
} from "react";

import {
  DatasetList,
} from "../../features/dataset/list";

import {
  UploadDataset,
} from "../../features/dataset/upload";

import styles from "./DatasetPage.module.css";

export function DatasetPage() {
  const [
    datasetListRefreshKey,
    setDatasetListRefreshKey,
  ] = useState(0);

  function refreshDatasetList() {
    setDatasetListRefreshKey(
      (currentKey) => currentKey + 1,
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Датасеты</h1>

          <p>
            Загружайте CSV-файлы
            и запускайте анализ данных.
          </p>
        </div>
      </div>

      <UploadDataset
        organizationId={1}
        onUploaded={refreshDatasetList}
      />

      <DatasetList
        organizationId={1}
        refreshKey={datasetListRefreshKey}
      />
    </section>
  );
}