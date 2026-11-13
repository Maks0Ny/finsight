
import { NavLink } from "react-router";
import { 
    mainNavigation,
    secondaryNavigation,
} from "./sidebarNavigation"

import styles from "./AppSidebar.module.css";

export function AppSidebar() {

    type LinkClassData = {
        isActive: boolean;
    }

    function getLinkClass(data: LinkClassData) {
        if (data.isActive) {
            return styles.link + " " + styles.active;
        }
            return styles.link;
        }

    return (
        <aside className={styles.sidebar}>
            <nav
                className = {styles.mainNavigation}
                aria-label="Основная навигация"
            >
                {mainNavigation.map((item) => (
                    <NavLink
                        className={getLinkClass}
                        key={item.path} 
                        to={item.path}
                    >
                        <span className={styles.icon}>
                            O
                        </span>
                        <span>
                            {item.label}
                        </span>
                    </NavLink>    
                ))}
            </nav>
            <nav
                className = {styles.secondaryNavigation}
                aria-label="Дополнительная навигация"
            >
                {secondaryNavigation.map((item) => (
                <NavLink
                    className = {getLinkClass}
                    key={item.path}
                    to={item.path}
                >
                    <span className={styles.icon}>
                        ○
                    </span>

                    <span>
                        {item.label}
                    </span>
                </NavLink>
                ))}
            </nav>
        </aside>
    )
}