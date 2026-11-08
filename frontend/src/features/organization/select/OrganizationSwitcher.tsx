import { useState } from "react";

import styles from "./OrganizationSwitcher.module.css";

export function OrganizationSwitcher() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.button}
        type="button"
        aria-expanded={isOpen} 
        onClick={() => setIsOpen((current) => !current)}
      > {/* Cообщает браузеру и экранным дикторам, открыто меню или закрыто*/}
        <span className={styles.icon}>
          ▦
        </span>

        <span className={styles.name}>
          ООО Альфа Аналитика
        </span>

        <span className={styles.chevron}>
          ⌄
        </span>
      </button>

      {isOpen && (
        <div className={styles.menu}>
          <button type="button">
            ООО Альфа Аналитика
          </button>

          <button type="button">
            FinSight Demo
          </button>

          <button type="button">
            + Создать организацию
          </button>
        </div>
      )}
    </div>
  );
}