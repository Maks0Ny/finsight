import {
  type ChangeEvent,
  type DragEvent,
  type FormEvent,
  useState,
} from "react";

import {
  useUploadDataset,
} from "./useUploadDataset";

import {
  validateUploadDataset,
} from "./uploadDataset.validation";

import type {
  UploadDatasetProps,
} from "./uploadDataset.types";

import styles from "./UploadDataset.module.css";

export function UploadDataset(
  props: UploadDatasetProps,
) {
  const {
    organizationId,
    onUploaded,
  } = props;

  const {
    upload,
    isLoading,
    error: requestError,
    uploadedDataset,
    resetUpload,
  } = useUploadDataset();

  const [
    name,
    setName,
  ] = useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] = useState<File | null>(null);

  const [
    validationError,
    setValidationError,
  ] = useState("");

  function selectFile(
    file: File | null,
  ) {
    setSelectedFile(file);
    setValidationError("");
    resetUpload();

    if (
      file &&
      !name.trim()
    ) {
      const nameWithoutExtension =
        file.name.replace(/\.csv$/i, "");

      setName(nameWithoutExtension);
    }
  }

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0] ?? null;

    selectFile(file);
  }

  function handleDragOver(
    event: DragEvent<HTMLLabelElement>,
  ) {
    event.preventDefault();
  }

  function handleDrop(
    event: DragEvent<HTMLLabelElement>,
  ) {
    event.preventDefault();

    const file =
      event.dataTransfer.files[0] ?? null;

    selectFile(file);
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationResult =
      validateUploadDataset({
        name,
        file: selectedFile,
      });

    if (validationResult) {
      setValidationError(
        validationResult,
      );

      return;
    }

    setValidationError("");

    if (!selectedFile) {
      return;
    }

    const dataset = await upload({
      organizationId,
      name: name.trim(),
      file: selectedFile,
    });

    if (dataset) {
      onUploaded?.(dataset);
    }
  }

  const displayedError =
    validationError || requestError;

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>
            Загрузка датасета
          </h2>

          <p className={styles.description}>
            Добавьте CSV-файл размером до 50 МБ
          </p>
        </div>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <div className={styles.field}>
          <label
            className={styles.label}
            htmlFor="dataset_name"
          >
            Название датасета
          </label>

          <input
            className={styles.input}
            id="dataset_name"
            type="text"
            name="dataset_name"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setValidationError("");
              resetUpload();
            }}
            placeholder="Например, продажи за ноябрь"
            maxLength={200}
            disabled={isLoading}
          />
        </div>

        <label
          className={styles.dropzone}
          htmlFor="dataset_file"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <input
            className={styles.fileInput}
            id="dataset_file"
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          <strong className={styles.dropzoneTitle}>
            Перетащите CSV-файл сюда
          </strong>

          <span className={styles.dropzoneText}>
            или нажмите, чтобы выбрать файл
          </span>

          <span className={styles.selectButton}>
            Выбрать файл
          </span>

          <small className={styles.limit}>
            Максимальный размер — 50 МБ
          </small>
        </label>

        {selectedFile && (
          <div className={styles.selectedFile}>
            <div className={styles.fileInformation}>
              <strong>
                {selectedFile.name}
              </strong>

              <span>
                {formatFileSize(
                  selectedFile.size,
                )}
              </span>
            </div>

            <button
              className={styles.removeButton}
              type="button"
              onClick={() => selectFile(null)}
              disabled={isLoading}
            >
              Удалить
            </button>
          </div>
        )}

        {displayedError && (
          <p
            className={styles.error}
            role="alert"
          >
            {displayedError}
          </p>
        )}

        {uploadedDataset && (
          <p
            className={styles.success}
            role="status"
          >
            Датасет «{uploadedDataset.name}»
            успешно загружен
          </p>
        )}

        <button
          className={styles.submitButton}
          type="submit"
          disabled={
            isLoading ||
            !selectedFile
          }
        >
          {isLoading
            ? "Загружаем..."
            : "Загрузить датасет"}
        </button>
      </form>
    </section>
  );
}

function formatFileSize(
  sizeInBytes: number,
): string {
  const sizeInMegabytes =
    sizeInBytes / 1024 / 1024;

  if (sizeInMegabytes >= 1) {
    return `${sizeInMegabytes.toFixed(2)} МБ`;
  }

  const sizeInKilobytes =
    sizeInBytes / 1024;

  return `${sizeInKilobytes.toFixed(1)} КБ`;
}