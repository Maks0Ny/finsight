import styles from "./DashboardPage.module.css";

export function DashboardPage() {
  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Обзор</h1>
          <p>Основные показатели и состояние ваших данных.</p>
        </div>

        <select className={styles.period} defaultValue="month">
          <option value="week">Последняя неделя</option>
          <option value="month">Последний месяц</option>
          <option value="year">Последний год</option>
        </select>
      </div>

      <div className={styles.statistics}>
        <article className={styles.statCard}>
          <span>Всего датасетов</span>
          <strong>12</strong>
          <small>+3 за месяц</small>
        </article>

        <article className={styles.statCard}>
          <span>Загружено строк</span>
          <strong>128 450</strong>
          <small>+18% за месяц</small>
        </article>

        <article className={styles.statCard}>
          <span>Завершено анализов</span>
          <strong>24</strong>
          <small>+5 за месяц</small>
        </article>

        <article className={styles.statCard}>
          <span>Обнаружено аномалий</span>
          <strong>17</strong>
          <small className={styles.warning}>Требуют проверки</small>
        </article>
      </div>

      <div className={styles.content}>
        <section className={styles.activity}>
          <div className={styles.sectionHeading}>
            <h2>Последняя активность</h2>
            <a href="/datasets">Все датасеты</a>
          </div>

          <div className={styles.activityItem}>
            <div>
              <strong>Продажи за октябрь</strong>
              <span>ML-анализ успешно завершён</span>
            </div>

            <time>Сегодня, 12:40</time>
          </div>

          <div className={styles.activityItem}>
            <div>
              <strong>Транзакции клиентов</strong>
              <span>Выполняется обработка данных</span>
            </div>

            <time>Сегодня, 11:15</time>
          </div>

          <div className={styles.activityItem}>
            <div>
              <strong>Расходы филиалов</strong>
              <span>Файл загружен и ожидает проверки</span>
            </div>

            <time>Вчера, 18:22</time>
          </div>
        </section>

        <aside className={styles.quickActions}>
          <h2>Быстрые действия</h2>

          <a href="/datasets">Загрузить CSV</a>
          <a href="/analytics">Открыть аналитику</a>
          <a href="/reports">Создать отчёт</a>
          <a href="/team">Управление командой</a>
        </aside>
      </div>
    </section>
  );
}