import { useState } from "react";

import styles from "./UserMenu.module.css";
import { useUserMenu } from "./useUserMenu";

export function UserMenu() {
    const {
        isOpen,
        toggleMenu,
        closeMenu,
    } = useUserMenu();

    return (
        <div className={styles.wrapper}>
            <button
                className={styles.button} 
                type="button" 
                aria-expanded={isOpen} 
                onClick={toggleMenu}
            > 
                <span className={styles.avatar}>
                    ХМ
                </span>

                 <span className={styles.information}>
                    <strong className={styles.name}>
                        Максим Асанди
                    </strong>

                    <span className={styles.role}>
                        Владелец
                    </span>
                </span>

                <span className={styles.chevron}>
                    ⌄
                </span>
            </button>

            {isOpen && (
                <div
                    className={styles.menu}
                    id="user-menu"
                    role="menu"
                >
                    <button
                        className={styles.menuItem}
                        type="button"
                        role="menuitem"
                        onClick={closeMenu}
                    >
                        Профиль
                    </button>

                    <button
                        className={styles.menuItem}
                        type="button"
                        role="menuitem"
                        onClick={closeMenu}
                    >
                        Настройки
                    </button>

                    <button
                        className={`${styles.menuItem} ${styles.logout}`}
                        type="button"
                        role="menuitem"
                        onClick={closeMenu}
                    >
                        Выход
                    </button>
                </div>
            )}
        </div>
    )
}