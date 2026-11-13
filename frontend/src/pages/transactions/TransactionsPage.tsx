import styles from "./TransactionsPage.module.css";

export function TransactionsPage() {
  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Транзакции</h1>
          <p>Просматривайте и анализируйте операции из загруженных данных.</p>
        </div>

        <button className={styles.exportButton} type="button">
          Экспортировать
        </button>
      </div>

      <div className={styles.statistics}>
        <article>
          <span>Всего транзакций</span>
          <strong>48 392</strong>
        </article>

        <article>
          <span>Общая сумма</span>
          <strong>12 840 500 ₽</strong>
        </article>

        <article>
          <span>Средняя операция</span>
          <strong>2 653 ₽</strong>
        </article>

        <article>
          <span>Аномальные операции</span>
          <strong className={styles.warning}>17</strong>
        </article>
      </div>

      <section className={styles.transactions}>
        <div className={styles.filters}>
          <input type="search" placeholder="Поиск транзакции" />

          <select defaultValue="all">
            <option value="all">Все категории</option>
            <option value="sales">Продажи</option>
            <option value="expenses">Расходы</option>
            <option value="returns">Возвраты</option>
          </select>

          <input type="date" />
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Описание</th>
                <th>Категория</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>#10482</td>
                <td>12.11.2026</td>
                <td>Оплата заказа</td>
                <td>Продажи</td>
                <td className={styles.income}>+24 500 ₽</td>
                <td>
                  <span className={styles.completed}>Завершена</span>
                </td>
              </tr>

              <tr>
                <td>#10481</td>
                <td>12.11.2026</td>
                <td>Закупка оборудования</td>
                <td>Расходы</td>
                <td className={styles.expense}>−82 000 ₽</td>
                <td>
                  <span className={styles.completed}>Завершена</span>
                </td>
              </tr>

              <tr>
                <td>#10480</td>
                <td>11.11.2026</td>
                <td>Необычная операция</td>
                <td>Расходы</td>
                <td className={styles.expense}>−145 000 ₽</td>
                <td>
                  <span className={styles.suspicious}>Аномалия</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}