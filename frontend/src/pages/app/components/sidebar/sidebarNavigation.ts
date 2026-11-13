export type SidebarNavigationItem = {
    label: string;
    path: string;
};


export const mainNavigation: SidebarNavigationItem[] = [
    {
        label: "Обзор",
        path: "/dashboard",
    },
    {
        label: "Датасеты",
        path: "/datasets",
    },
    {
        label: "Транзакции",
        path: "/transactions",
    },
    {
        label: "Аналитика",
        path: "/analytics",
    },
    {
        label: "ML-эксперименты",
        path: "/experiments",
    },
    {
        label: "Отчёты",
        path: "/reports",
    },
];

export const secondaryNavigation: SidebarNavigationItem[] = [
  {
    label: "Команда",
    path: "/team",
  },
  {
    label: "Настройки",
    path: "/settings",
  },
];
