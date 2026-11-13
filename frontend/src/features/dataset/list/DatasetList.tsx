import {
  Link,
} from "react-router";

import type {
  Dataset,
} from "../../../entities/dataset/dataset.types";

import {
  useDatasetList,
} from "./useDatasetList";

import type {
  DatasetListProps,
} from "./datasetList.types";

import styles from "./DatasetList.module.css";

const STATUS_LABELS: Record<string, string> = {
  uploaded: "Загружен",
  processing: "Обрабатывается",
  ready: "Готов",
  completed: "Завершён",
  failed: "Ошибка",
  error: "Ошибка",
};

export function DatasetList(
  props: DatasetListProps,
) {
    const organizationId = props.organizationId;
    const refreshKey = props.refreshKey;
    const onDatasetSelect = props.onDatasetSelect;

    const result = useDatasetList(
        organizationId,
        refreshKey,
    );

    const datasets = result.datasets;
    const isLoading = result.isLoading;
    const error = result.error;
    const reload = result.reload;

    if (isLoading) {
        return (
        <section className={styles.panel}>
            <p
            className={styles.loading}
            role="status"
            >
            Загружаем датасеты...
            </p>
        </section>
        );
    }

    if (error) {
        return (
            <section className={styles.panel}>
                <div className={styles.errorState}>
                <p role="alert">
                    {error}
                </p>

                <button
                    className={styles.retryButton}
                    type="button"
                    onClick={() => {
                    void reload();
                    }}
                >
                    Повторить
                </button>
                </div>
            </section>
        );
    }

    return (
        <section className={styles.panel}>
            <header className={styles.header}>
                <div>
                    <h2 className={styles.title}>
                        Последние датасеты
                    </h2>

                    <p className={styles.description}>
                        Загружено: {datasets.length}
                    </p>
                </div>

                <button
                    className={styles.refreshButton}
                    type="button"
                    onClick={() => {
                    void reload();
                }}
                >
                    Обновить
                </button>
            </header>

            {datasets.length === 0 ? (
                <div className={styles.emptyState}>
                    <h3>Датасетов пока нет</h3>

                    <p>
                        Загрузите первый CSV-файл,
                        чтобы он появился в списке.
                    </p>
                </div>
            ) : (
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                        <tr>
                            <th>Название</th>
                            <th>Файл</th>
                            <th>Статус</th>
                            <th>Размер</th>
                            <th>Строки</th>
                            <th>Загружен</th>
                            <th aria-label="Действия" />
                        </tr>
                        </thead>

                        <tbody>
                        {datasets.map((dataset) => (
                            <DatasetRow
                            key={dataset.id}
                            dataset={dataset}
                            onSelect={onDatasetSelect}
                            />
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
    }

type DatasetRowProps = {
    dataset: Dataset;

    onSelect?: (
        dataset: Dataset,
    ) => void;
};

function DatasetRow(
    props: DatasetRowProps,
){
    const {
        dataset,
        onSelect,
    } = props;

    const statusClass =
        styles[dataset.status] ??
        styles.defaultStatus;

    const statusLabel =
        STATUS_LABELS[dataset.status] ??
        dataset.status;

    return (
        <tr>
        <td>
            <button
                className={styles.datasetButton}
                type="button"
                onClick={() => {
                onSelect?.(dataset);
            }}
            >
                {dataset.name}
            </button>
        </td>

        <td>
            {dataset.original_filename}
        </td>

        <td>
            <span
                className={`${styles.status} ${statusClass}`}
            >
                {statusLabel}
            </span>
        </td>

        <td>
            {formatFileSize(
                dataset.file_size_bytes,
            )}
        </td>

        <td>
            {formatRows(
                dataset.total_rows,
            )}
        </td>

        <td>
            {formatDate(
                dataset.created_at,
            )}
        </td>

        <td>
            <Link
                className={styles.openLink}
                to={`/datasets/${dataset.id}`}
            >
                Открыть
            </Link>
        </td>
        </tr>
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

function formatRows(
    rows: number,
): string {
    if (!rows) {
        return "—";
    }

    return rows.toLocaleString("ru-RU");
}

function formatDate(
    dateString: string,
): string {
    const date = new Date(dateString);

    return date.toLocaleString( /*берет системную дату и форматирует ее согласно правилам выбранного языка и переданных настроек*/
        "ru-RU",
        {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    );
}