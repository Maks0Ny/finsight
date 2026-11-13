import styles from "./TeamPage.module.css";

export function TeamPage() {
  return (
    <section className={styles.page}>
      <div className={styles.heading}>
        <div>
          <h1>Команда</h1>
          <p>Управляйте участниками вашей организации.</p>
        </div>

        <button className={styles.inviteButton} type="button">
          + Пригласить участника
        </button>
      </div>

      <div className={styles.members}>
        <h2>Участники</h2>

        <div className={styles.member}>
          <div className={styles.avatar}>ИИ</div>

          <div className={styles.information}>
            <strong>Иван Иванов</strong>
            <span>ivan@example.com</span>
          </div>

          <span className={styles.role}>Владелец</span>
        </div>
      </div>
    </section>
  );
}