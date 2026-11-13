import type { FormEvent } from "react";

import { useHeaderSearch } from "./useHeaderSearch";

import styles from "./HeaderSearch.module.css";

type HeaderSearchProps = {
  onSearch?: (query: string) => void;
};

export function HeaderSearch({
  onSearch,
}: HeaderSearchProps) {
  const {
    isOpen,
    query,
    toggleSearch,
    closeSearch,
    changeQuery,
  } = useHeaderSearch();

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const preparedQuery = query.trim();

    if (!preparedQuery) {
      return;
    }

    onSearch?.(preparedQuery);
  }

  if (!isOpen) {
    return (
      <button
        className={styles.openButton}
        type="button"
        aria-label="Открыть поиск"
        title="Поиск"
        onClick={toggleSearch}
      >
        <svg
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <path d="m16 16 5 5" />
        </svg>
      </button>
    );
  }

  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          closeSearch();
        }
      }}
    >
      <svg
        className={styles.searchIcon}
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="11"
          cy="11"
          r="7"
        />

        <path d="m16 16 5 5" />
      </svg>

      <input
        className={styles.input}
        type="search"
        value={query}
        placeholder="Поиск..."
        aria-label="Поиск по приложению"
        autoFocus
        onChange={(event) => {
          changeQuery(event.currentTarget.value);
        }}
      />

      {query && (
        <button
          className={styles.clearButton}
          type="button"
          aria-label="Очистить поиск"
          title="Очистить"
          onClick={() => changeQuery("")}
        >
          ×
        </button>
      )}

      <button
        className={styles.closeButton}
        type="button"
        aria-label="Закрыть поиск"
        onClick={closeSearch}
      >
        Закрыть
      </button>
    </form>
  );
}