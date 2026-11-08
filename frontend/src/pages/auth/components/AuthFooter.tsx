import brandMark from "../../../../assets/brand/finsight-mark.svg";

export function AuthFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <img
          className="site-footer__mark"
          src={brandMark}
          alt=""
        />

        <div className="site-footer__brand-text">
          <strong>FinSight</strong>
          <span>© 2026. Все права защищены.</span>
        </div>
      </div>

      <nav
        className="site-footer__links"
        aria-label="Правовая информация"
      >
        <a href="#">Конфиденциальность</a>
        <a href="#">Условия использования</a>
        <a href="#">Поддержка</a>
      </nav>
    </footer>
  );
}