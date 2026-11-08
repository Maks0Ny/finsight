import brandMark from "../../../../../assets/brand/finsight-mark.svg";

import styles from "./HeaderBrand.module.css";

export function HeaderBrand() {
  return (
    <div className={styles.brand}>
      <img
        className={styles.mark}
        src={brandMark}
        alt=""
      />

      <strong className={styles.name}>
        FinSight
      </strong>
    </div>
  );
}