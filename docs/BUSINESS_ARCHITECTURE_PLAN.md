# FinSight — бизнес-архитектура и план самостоятельной реализации

**Статус:** проектное решение, а не описание готового приложения.  
**Основа:** двухстраничный PDF «Требования к проекту» преподавателя, ранее переданная проектная документация и текущая заготовка Backend на 22.09.2026.  
**Назначение:** дать владельцу проекта точную карту сущностей, полей, связей, правил и методов. Реализацию методов, миграций и интерфейса пишет владелец.

## 1. Что именно строим

FinSight — B2B веб-сервис анализа финансовых транзакций организации. Аналитик загружает CSV; система проверяет файл, импортирует строки, показывает сводку и список операций, запускает собственные ML-алгоритмы и позволяет выгрузить результат. Владелец организации управляет участниками. Наблюдатель просматривает разрешённые данные.

Ценность MVP: вместо ручного просмотра большого CSV компания получает очищенный набор операций, бизнес-показатели и список транзакций для проверки. Оценка риска — аналитический сигнал, а не обвинение в мошенничестве.

Стек, который нужно согласовать с лектором: React + TypeScript, FastAPI + Python, PostgreSQL, SQLAlchemy, Alembic, Pandas, NumPy, pytest. Для начала Frontend может использовать встроенный fetch и обычный CSS. Авторизация — хеш пароля и короткоживущий access token. Основные ML-модели (линейная регрессия, бинарная логистическая регрессия, дерево решений) реализуются самим студентом.

### 1.1 Источники требований и степень обязательности

PDF преподавателя требует: отдельные Frontend/Backend/БД, HTTP, тесты, минимум 4 страницы, единый дизайн, минимум 3 формы, массовый список, JS/TS, минимум 4 таблицы, комментарии и unit-тесты. Тема и стек согласуются с лектором. В PDF **не требуются** конкретные 9 или 11 таблиц и конкретные ML-алгоритмы: это решения текущего проекта.

PDF перечисляет 10 возможностей для дополнительных баллов. Окончательное число баллов и факт зачёта определяет преподаватель. Отметка в этом документе означает «спроектировано»; балл можно показывать только после реализации и демонстрации.

| Пункт | Проектное решение | Доказательство на защите |
|---|---|---|
| Покрытие Backend >75% | Внутренний порог не ниже 80% line coverage | Вывод pytest-cov и зелёные тесты |
| OpenAPI | Описанные FastAPI request/response-схемы и операция экспорта openapi.json | Работающие /docs и /openapi.json |
| Многие ко многим | users ↔ organizations через organization_memberships | Миграция, данные и API членства |
| Docker | Образы Backend/Frontend и compose с PostgreSQL после локального MVP | Запуск чистой среды по инструкции |
| Телефоны | Адаптивные Dashboard, Datasets, детали, фильтры; таблица с прокруткой или карточками | Демонстрация узкого экрана |
| Внешний веб-сервис | Официальный сервис Банка России для курсов, только при наличии валюты в CSV | Реальный ответ + тест отказа провайдера |
| Авторизация | Вход, токен, роли и проверка принадлежности организации | Защищённые маршруты и отказ чужому пользователю |
| Нагрузочное тестирование | Повторяемый сценарий Locust на чтение и отдельно загрузку | Отчёт с числом пользователей, RPS, p95 и ошибками |
| Светлая/тёмная тема | Переключатель, сохранение выбора, обе темы для всех основных страниц | Переключение и сохранение после перезагрузки |
| Массовая загрузка CSV/XML | CSV-поток частями, валидация и массовая вставка | Загрузка большого CSV без чтения целиком в память |

Для последнего пункта PDF пишет «CSV, XML» как форматы массовой загрузки. Текущий продукт реализует CSV; если преподаватель трактует пункт как обязательность **обоих** форматов, понадобится отдельный XML-адаптер. Это следует уточнить при согласовании.

## 2. Границы системы и бизнес-роли

~~~text
React → HTTP /api/v1 → FastAPI
                       ├─ Auth / Users / Organizations
                       ├─ Datasets → local storage → chunked import
                       ├─ Transactions / Analytics
                       ├─ ML Experiments / Predictions
                       ├─ Reports / Audit
                       └─ CurrencyRates provider → Банк России
                         │
                         └→ PostgreSQL
~~~

Сервер является единственной точкой доступа к PostgreSQL и файлам. Frontend получает JSON, статусы и ссылки для скачивания, но не абсолютные пути на диске.

| Роль | Смотреть данные своей организации | Загружать CSV | Запускать ML | Выгружать отчёт | Управлять участниками |
|---|---:|---:|---:|---:|---:|
| Owner | да | да | да | да | да |
| Analyst | да | да | да | да | нет |
| Viewer | да | нет | нет | нет | нет |

Пользователь может иметь разные роли в разных организациях. Роль хранится в membership, а не в users. Администратор самой платформы, если появится, — отдельное системное право; оно не подменяет Owner организации.

**Создание первой организации:** отдельная операция регистрации владельца атомарно создаёт User, Organization и membership(role=owner). Произвольный клиент не может сам назначить себе роль owner в чужой организации. Позднее Owner добавляет существующего пользователя или создаёт приглашение; для MVP достаточно управляемого добавления существующего пользователя.

**Инвариант доступа:** любой dataset, transaction, experiment, prediction и report читается через organization_id из проверенного membership. Один публичный ID недостаточен. Для вкладки технических метрик разрешение наследуется от организации.

## 3. Сценарии и состояния

1. Владелец регистрирует организацию или создаётся начальный аккаунт через управляемую команду.
2. Пользователь входит, выбирает организацию.
3. Owner/Analyst загружает CSV; система создаёт Dataset и сохраняет исходный файл под внутренним ID.
4. Система проверяет заголовок, выбирает адаптер, валидирует строки, импортирует частями, ведёт счётчики и ошибки.
5. Пользователь открывает сводку и серверно-пагинируемый список транзакций.
6. Analyst запускает один из трёх ML-экспериментов; система сохраняет параметры, метрики и артефакт модели.
7. Система записывает прогнозы по операциям; бизнес-экран показывает риск, сумму и объяснение.
8. Owner/Analyst экспортирует отфильтрованный или подозрительный список в CSV.
9. Если CSV имеет реальную валюту и дату, курс Банка России даёт отдельное рублёвое представление с указанием даты и источника.

Состояния Dataset: UPLOADED → VALIDATING → IMPORTING → READY; альтернативные исходы INVALID (ошибка структуры) и FAILED (технический сбой). Допустимы повторная попытка из FAILED и архивирование после READY. Статус меняет сервис, а не произвольный HTTP-клиент. Повторная попытка не должна создавать дубликаты транзакций.

Состояния Experiment и Report: PENDING → RUNNING → SUCCEEDED либо FAILED. Клиент опрашивает статус, если операция не укладывается в короткий HTTP-запрос. Для первой версии достаточно контролируемой фоновой задачи приложения; отдельная распределённая очередь пока не требуется.

## 4. Схема БД

План: **одна БД PostgreSQL**, 11 предметных таблиц и служебная alembic_version. Число предметных таблиц можно менять через миграции по мере реализации. Типы ниже — проектное предложение; денежные величины — NUMERIC, время — TIMESTAMPTZ, даты — DATE, структурированные профили/признаки — JSONB. ID предлагаются BIGINT identity для единообразия с текущим целочисленным User.id.

Сокращения: PK — первичный ключ; FK — внешний ключ; UQ — уникальность; NN — NOT NULL. У каждой организации есть прямой organization_id на бизнес-записях. Если дочерняя таблица содержит и parent_id, и organization_id, полезен составной FK на пару (parent_id, organization_id), чтобы база дополнительно защищала от смешения компаний. Для этого у родителя нужен UQ(id, organization_id).

~~~mermaid
erDiagram
    users ||--o{ organization_memberships : member
    organizations ||--o{ organization_memberships : has
    organizations ||--o{ datasets : owns
    users ||--o{ datasets : uploads
    datasets ||--o{ dataset_import_issues : has
    datasets ||--o{ transactions : contains
    datasets ||--o{ ml_experiments : trains
    ml_experiments ||--o{ predictions : produces
    transactions ||--o{ predictions : receives
    organizations ||--o{ reports : owns
    users ||--o{ reports : requests
    organizations ||--o{ audit_events : scopes
    users ||--o{ audit_events : acts
~~~

Последняя связь «exchange_rates → transactions» логическая. В первой версии конверсию можно вычислять при запросе, не добавляя FK в transactions; исходные суммы всегда сохраняются. Если конвертированное значение сохраняется, нужны rate_id, дата и источник курса, чтобы результат был воспроизводим.

### 4.1 users

Назначение: учётная запись и профиль человека. Существующий расширенный профиль сохраняется в плане; его поля не обязаны участвовать в MVP.

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID пользователя |
| email | VARCHAR(255) NN UQ | Логин; сервис нормализует регистр |
| phone | VARCHAR(20) UQ NULL | Телефон в единообразном формате, если указан |
| password_hash | VARCHAR(255) NN | Только хеш, никогда исходный пароль |
| first_name | VARCHAR(50) NN | Имя; соответствует текущему name |
| middle_name | VARCHAR(50) NULL | Отчество |
| last_name | VARCHAR(50) NN | Фамилия; соответствует current second_name |
| birth_date | DATE NULL | Не UQ: у разных людей бывает одна дата рождения |
| gender | VARCHAR(20) NULL | Опциональные данные профиля |
| is_verified_email / is_verified_phone | BOOLEAN NN DEFAULT false | Меняются только после реального подтверждения |
| is_platform_admin | BOOLEAN NN DEFAULT false | Замена неясного is_supervise; только для системного управления |
| status | VARCHAR(20) NN DEFAULT active | active / blocked / deleted |
| is_active | BOOLEAN NN DEFAULT true | Если сохранено вместе со status, инвариант: true ⇔ status=active; предпочтительнее позже оставить один источник истины |
| avatar_url | TEXT NULL | Ссылка на разрешённое изображение |
| language / timezone | VARCHAR(16) / VARCHAR(64) NN с разумными defaults | Настройки профиля |
| referral_code | VARCHAR(40) UQ NULL | Резерв профиля; реферальный сценарий не является целью проекта |
| referral_id | BIGINT FK users.id NULL | Кто пригласил; защита от self-reference |
| accepted_terms_at / accepted_privacy_policy_at | TIMESTAMPTZ NULL | Время подтверждённого согласия |
| allow_push_notifications / allow_marketing_emails | BOOLEAN NN DEFAULT false | Настройки уведомлений |
| created_at / updated_at | TIMESTAMPTZ NN | Создание и изменение |
| last_login_at | TIMESTAMPTZ NULL | Последний успешный вход |

Если обязательное поле не вводится через UserCreate, оно должно получать серверное значение. Отсутствие подтверждения email/phone нельзя показывать как подтверждение. Индексы: UQ(email), UQ(phone) при непустом phone, индекс status при реальной потребности.

### 4.2 organizations

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID компании |
| name | VARCHAR(200) NN | Отображаемое имя |
| slug | VARCHAR(100) UQ NN | Удобный короткий идентификатор |
| base_currency | CHAR(3) NN DEFAULT RUB | Валюта представления, не валюта всех исходных строк |
| status | VARCHAR(20) NN DEFAULT active | active / suspended / archived |
| created_by_user_id | BIGINT FK users.id NN | Кто создал |
| created_at / updated_at | TIMESTAMPTZ NN | Аудит времени |

### 4.3 organization_memberships

Физическое доказательство many-to-many: один user может иметь несколько memberships, одна organization — многих users.

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID связи |
| organization_id | BIGINT FK organizations.id NN | Компания |
| user_id | BIGINT FK users.id NN | Участник |
| role | VARCHAR(20) NN CHECK owner/analyst/viewer | Права именно в этой компании |
| status | VARCHAR(20) NN DEFAULT active | active / disabled |
| joined_at | TIMESTAMPTZ NN | Дата добавления |
| created_by_user_id | BIGINT FK users.id NULL | Кто добавил |

Ограничение UQ(organization_id, user_id), индексы по обеим FK. Бизнес-правило: нельзя отключить или понизить последнего активного Owner.

### 4.4 datasets

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID загрузки |
| organization_id | BIGINT FK organizations.id NN | Владелец |
| uploaded_by_user_id | BIGINT FK users.id NN | Загрузивший |
| original_filename | VARCHAR(255) NN | Только метаданные, не путь |
| storage_key | TEXT NN UQ | Внутренний путь по ID организации/набора |
| file_size_bytes | BIGINT NN CHECK >=0 | Размер |
| sha256 | CHAR(64) NULL | Контрольная сумма; одинаковые файлы допустимы как разные загрузки |
| status | VARCHAR(20) NN | Состояние обработки |
| adapter_code | VARCHAR(100) NULL | Выбранный адаптер |
| detected_columns / column_mapping | JSONB NULL | Исходная схема и каноническое отображение |
| profile_json | JSONB NULL | Пропуски, диапазоны, баланс классов, предупреждения |
| total_rows / valid_rows / invalid_rows / imported_rows | BIGINT NN DEFAULT 0 | Счётчики |
| error_code / error_message | VARCHAR(100) / TEXT NULL | Контролируемая ошибка, без SQL и путей |
| created_at / started_at / completed_at | TIMESTAMPTZ | Время этапов |

Проверка: valid_rows + invalid_rows = total_rows после завершения; imported_rows = valid_rows после READY. UQ(id, organization_id) для составных FK. Индекс (organization_id, created_at DESC).

### 4.5 dataset_import_issues

Хранит **ограниченную выборку** ошибочных строк (например, максимум 1000); полные счётчики лежат в datasets. Так нельзя заполнить БД миллионами ошибок из одного испорченного файла.

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID ошибки |
| organization_id | BIGINT NN | Граница компании |
| dataset_id | BIGINT NN | Составной FK(dataset_id, organization_id) → datasets(id, organization_id) |
| source_row_number | BIGINT NULL | Номер строки, NULL для ошибки заголовка |
| column_name | VARCHAR(255) NULL | Проблемная колонка |
| code | VARCHAR(80) NN | Машинный код ошибки |
| message | TEXT NN | Сообщение без секретов |
| created_at | TIMESTAMPTZ NN | Время обнаружения |

Индекс (dataset_id, source_row_number). Не хранить полный сырой ряд при наличии чувствительных значений.

### 4.6 transactions

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID операции |
| organization_id | BIGINT NN | Компания |
| dataset_id | BIGINT NN | Составной FK(dataset_id, organization_id) → datasets(id, organization_id) |
| source_row_number | BIGINT NN | Номер строки в CSV |
| source_transaction_id | VARCHAR(255) NULL | ID из источника, если есть |
| transaction_time | TIMESTAMPTZ NULL | Только если дата/время есть в источнике |
| amount | NUMERIC(20,4) NULL | Исходная сумма; может отсутствовать |
| currency | CHAR(3) NULL | Исходная валюта, не выдумывать |
| category / counterparty | VARCHAR(150) NULL | Только при наличии и разрешённом отображении |
| source_label | SMALLINT NULL CHECK IN (0,1) | Исходная размеченная метка; не прогноз модели |
| raw_features | JSONB NN DEFAULT {} | Дополнительные канонические числовые признаки |
| extra_fields | JSONB NN DEFAULT {} | Дополнительные безопасные поля |
| created_at | TIMESTAMPTZ NN | Импорт |

UQ(dataset_id, source_row_number) защищает повторную вставку. Для составного FK из predictions также нужен UQ(id, dataset_id, organization_id). Индексы: (dataset_id, id), (dataset_id, transaction_time), (dataset_id, amount); добавлять индексы под реально работающие фильтры. Адаптер не обязан находить category, counterparty, currency или transaction_time в каждом CSV.

### 4.7 ml_experiments

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID запуска |
| organization_id | BIGINT NN | Компания |
| dataset_id | BIGINT NN | Составной FK(dataset_id, organization_id) → datasets |
| created_by_user_id | BIGINT FK users.id NN | Кто запустил |
| model_type | VARCHAR(40) NN | linear_regression / logistic_regression / decision_tree_classifier |
| status | VARCHAR(20) NN | pending / running / succeeded / failed |
| target_name | VARCHAR(100) NN | Исходная метка или числовая цель |
| feature_names | JSONB NN | Упорядоченный список признаков |
| hyperparameters | JSONB NN | Параметры модели |
| split_config | JSONB NN | Доли, seed, стратификация |
| preprocessing | JSONB NN | Обработка пропусков, scaling, версии |
| metrics | JSONB NULL | MAE/MSE/RMSE/R² или precision/recall/F1 и др. |
| threshold | NUMERIC(8,6) NULL | Порог классификации |
| train_rows / validation_rows / test_rows | BIGINT NULL | Размеры выборок |
| artifact_key | TEXT NULL | Относительный путь к параметрам модели |
| model_version | VARCHAR(40) NN | Версия формата артефакта/алгоритма |
| error_code / error_message | VARCHAR(100) / TEXT NULL | Ошибка обучения |
| created_at / started_at / completed_at | TIMESTAMPTZ | Время |

UQ(id, dataset_id, organization_id) для связанных predictions. Обучение разрешено только для READY dataset и доступной цели: бинарная метка нужна классификаторам, осмысленная числовая цель — регрессии. Метрики рассчитываются на отложенной выборке, а не на тренировочной.

### 4.8 predictions

Одна запись относится к одной транзакции и одному эксперименту. Составные FK к transactions и ml_experiments проверяют совпадение компании и dataset.

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID прогноза |
| organization_id / dataset_id | BIGINT NN | Контекст |
| transaction_id | BIGINT NN | FK на транзакцию того же dataset и организации |
| experiment_id | BIGINT NN | FK на эксперимент того же dataset и организации |
| risk_probability | NUMERIC(8,7) NULL CHECK 0..1 | Для классификации |
| predicted_label | SMALLINT NULL CHECK IN (0,1) | Класс при выбранном пороге |
| expected_amount | NUMERIC(20,4) NULL | Для регрессии |
| residual | NUMERIC(20,4) NULL | actual - expected |
| relative_deviation | NUMERIC(18,8) NULL | residual / max(abs(expected), epsilon) |
| explanation_json | JSONB NULL | Путь дерева или факты для проверки |
| created_at | TIMESTAMPTZ NN | Время применения |

Составные FK: (transaction_id, dataset_id, organization_id) → transactions(id, dataset_id, organization_id) и (experiment_id, dataset_id, organization_id) → ml_experiments(id, dataset_id, organization_id). UQ(experiment_id, transaction_id). Для классификационного эксперимента заполняются risk_probability/predicted_label; для регрессионного — expected_amount/residual, если есть фактическая сумма. Не смешивать source_label и predicted_label. Индекс (dataset_id, risk_probability DESC) для списка риска.

### 4.9 reports

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID отчёта |
| organization_id | BIGINT FK organizations.id NN | Владелец |
| dataset_id | BIGINT NN | Составной FK к datasets |
| requested_by_user_id | BIGINT FK users.id NN | Автор запроса |
| type | VARCHAR(40) NN | filtered_transactions / suspicious_transactions / dataset_summary |
| status | VARCHAR(20) NN | pending / running / succeeded / failed |
| filters_json | JSONB NN | Параметры воспроизводимой выгрузки |
| storage_key | TEXT NULL UQ | Внутренний путь после завершения |
| row_count | BIGINT NULL | Выгружено строк |
| error_code / error_message | VARCHAR(100) / TEXT NULL | Контролируемая ошибка |
| created_at / completed_at | TIMESTAMPTZ | Время |

Выдача файла допускается только после повторной проверки membership и организации отчёта. Ячейки CSV, начинающиеся с опасных для таблиц символов, обрабатываются при экспорте.

### 4.10 audit_events

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID события |
| organization_id | BIGINT FK organizations.id NULL | Контекст; NULL для системного входа |
| actor_user_id | BIGINT FK users.id NULL | Кто действовал; может быть NULL для системной задачи |
| action | VARCHAR(80) NN | dataset.uploaded, experiment.started, report.exported, membership.changed |
| resource_type | VARCHAR(50) NN | Тип объекта |
| resource_id | BIGINT NULL | ID объекта |
| details_json | JSONB NN DEFAULT {} | Метаданные без паролей, токенов и содержимого CSV |
| created_at | TIMESTAMPTZ NN | Время |

Индексы (organization_id, created_at DESC), (actor_user_id, created_at DESC). Это журнал действий, а не замена прикладных таблиц.

### 4.11 exchange_rates

Кэш официального внешнего источника. Таблица может появиться только на бонусном этапе интеграции.

| Поле | Тип и ограничения | Смысл |
|---|---|---|
| id | BIGINT PK | ID записи курса |
| provider | VARCHAR(30) NN DEFAULT cbr | Источник |
| currency | CHAR(3) NN | ISO-код валюты |
| quote_currency | CHAR(3) NN DEFAULT RUB | Валюта курса |
| rate_date | DATE NN | Дата официального курса |
| nominal | NUMERIC(20,4) NN CHECK >0 | Сколько единиц валюты соответствует курсу |
| value | NUMERIC(20,6) NN CHECK >0 | Рублёвая стоимость nominal единиц |
| fetched_at | TIMESTAMPTZ NN | Когда получено |
| source_url | TEXT NN | Источник для аудита |

UQ(provider, currency, quote_currency, rate_date). Пересчёт: сумма_руб = сумма_исходная × value / nominal. Если курс недоступен, исходная сумма остаётся доступной; бизнес-дашборд не должен складывать суммы разных валют как одно число.

### 4.12 Порядок миграций и правила БД

1. users, organizations, organization_memberships.
2. datasets, dataset_import_issues, transactions.
3. ml_experiments, predictions.
4. reports, audit_events.
5. exchange_rates для бонуса внешней интеграции.

Все изменения таблиц после первой миграции — отдельные Alembic revisions. Автогенерированную миграцию проверить вручную: FK, UQ, NULL, defaults, индексы и порядок создания. Пароли и сырой финансовый CSV не сохранять в истории миграций. Для тестов использовать отдельную тестовую БД.

### 4.13 Политика удаления и целостность

В обычном интерфейсе организации и наборы данных **архивируются**, а не удаляются физически. Это сохраняет происхождение прогнозов и отчётов. Пользователя блокируют через status; пароль и личные данные можно очищать отдельной процедурой, если она понадобится. Для FK от финансовых объектов использовать RESTRICT/NO ACTION по умолчанию; физическое удаление делать только отдельным контролируемым сценарием в порядке reports/predictions/experiments/issues/transactions/dataset. Для users.referral_id и audit_events.actor_user_id допустим SET NULL, если политика хранения допускает удаление учётной записи. Каскадное удаление нельзя ставить на все связи без проверки: оно способно незаметно уничтожить историю анализа.

На уровне БД дополнительно проверить: status и role через CHECK или ограниченный enum; числовые счётчики >=0; сумма может быть отрицательной только если адаптер описывает возвраты; валюта — ISO-код при наличии; probability между 0 и 1; файл отчёта доступен только при status=SUCCEEDED. Бизнес-правила межтабличного доступа всё равно остаются в service/repository и тестах.
## 5. API-схемы и бизнес-правила по модулям

Обозначение: «вход» — Pydantic-схема запроса; «выход» — ответ API; «метод» — ориентир для твоей реализации. Названия можно изменить, сохранив ответственность. Все функции, читающие данные организации, получают проверенный organization_id. Удобно передавать DB Session явно из router в service и repository.

### 5.1 users и auth

**Входные схемы:** UserCreate(email, password, first_name, last_name, phone?); UserProfileUpdate(имя/фамилия/телефон/язык/часовой пояс/уведомления); LoginRequest(email, password); ChangePasswordRequest(current_password, new_password).

**Выходные схемы:** UserRead(id, email, phone?, имена, статусы подтверждения, настройки, created_at); TokenResponse(access_token, token_type, expires_in); CurrentUserResponse(user, memberships). Ни один ответ не содержит password_hash.

**Методы repository:** get_by_id, get_by_email, create, update_profile, update_password_hash, update_last_login. Сервис не выполняет SQL; репозиторий не хеширует пароль.

**Методы service:** register_owner, create_user, authenticate, get_current_user, update_profile, change_password, deactivate_user. register_owner выполняет User + Organization + Owner membership в одной транзакции. Email уникален после нормализации; дубль даёт 409. Пароль хешируется через выбранную библиотеку, в лог не попадает. Смена пароля требует проверку старого пароля или отдельный процесс восстановления. last_login_at меняется только после успешной авторизации.

**Пометка текущего кода:** в users/models.py уже есть расширенный профиль, но типы дат/флагов и nullable надо согласовать со схемами; birth_date не unique. Импорты из app должны быть единообразны. В core/config.py сейчас указан psycopg2, а requirements.txt устанавливает psycopg; нужно выбрать один драйвер. В session.py комментарий к autoflush=False не должен называть flush «фиксацией»: commit остаётся отдельной операцией. Это проектные замечания, код этим отчётом не меняется.

### 5.2 organizations и memberships

**Вход:** OrganizationCreate(name, slug?); MemberAdd(user_email, role); MemberRoleUpdate(role).  
**Выход:** OrganizationRead; MembershipRead(user_id, organization_id, role, status); OrganizationMemberList.

**Методы repository:** create_organization, get_scoped_organization, get_membership, list_members, add_member, update_role, disable_member.  
**Методы service:** register_with_owner, assert_membership, require_role, add_member, change_role, remove_member, list_user_organizations.

**Правила:** только Owner управляет участниками; при запросе ресурса всегда проверяется membership текущего пользователя; последний Owner остаётся активен. Одна пара user/org существует один раз.

### 5.3 datasets и импорт

**Вход:** DatasetUpload(file, optional adapter_code); DatasetMappingConfirm(mapping) только если автоопределение недостаточно; DatasetListFilter(status, page, page_size).  
**Выход:** DatasetRead; DatasetStatusRead; DatasetProfileRead; ImportIssueRead; Page[DatasetRead].

**Методы adapter:** supports(headers), canonical_fields(), feature_names(), target_name(), amount_target(), transform_chunk(chunk), optional_business_fields(). Адаптер не зависит от FastAPI и SQLAlchemy.

**Методы repository:** create_uploaded, get_scoped, list_scoped, transition_status, save_profile, increment_counts, bulk_insert_transactions, list_issues, add_issue_samples, clear_partial_import_for_retry.

**Методы service:** upload_dataset, validate_dataset, profile_dataset, import_dataset_chunks, get_status, get_dataset, retry_import, archive_dataset. Выбор адаптера и маппинг отделяют схему внешнего Kaggle CSV от доменных полей. Исходное имя файла — только для отображения; путь строится из внутренних ID. Импорт читает частями, считает ошибки и вставляет пакетами. Промежуточный статус виден пользователю.

**Проверки:** максимальный размер файла; CSV-совместимость; читаемый заголовок; отсутствие дубликатов имён колонок после нормализации; обязательные поля и типы; допустимые метки; NaN/∞; предсказуемая обработка битых строк. Нельзя тихо превращать любой плохой ввод в ноль. Повторный импорт не дублирует строки.

### 5.4 transactions и analytics

**Вход:** TransactionFilter(dataset_id, page, page_size, sort, amount_min/max?, date_from/to?, predicted_label?, min_risk?, category?).  
**Выход:** TransactionRead; TransactionDetailRead; Page[TransactionRead]; DatasetSummaryRead; TimelinePoint; AmountBucket; RiskSummary.

**Методы repository:** list_scoped_paginated, get_scoped_by_id, aggregate_amounts, aggregate_by_time, list_high_risk. Фильтры применяются на сервере, сортировка только по разрешённым полям, размер страницы ограничен.

**Методы service:** list_transactions, get_transaction_detail, build_dataset_summary, build_risk_summary, get_time_series, get_amount_distribution. Нет времени — нет временного графика; нет суммы — не показывать сумму/медиану; смешанные валюты — агрегировать раздельно или по подтверждённому курсу. До запуска ML нельзя показывать ноль подозрительных как результат модели: это состояние «анализ ещё не выполнен».

### 5.5 ml и experiments

**Вход:** ExperimentCreate(dataset_id, model_type, feature_names, target_name, split_ratio, seed, hyperparameters, threshold?); ExperimentFilter(status/model_type); PredictionFilter(experiment_id, min_risk?, label?).  
**Выход:** ExperimentRead; ExperimentMetricsRead; PredictionRead; DecisionPathRead; RegressionDeviationRead.

**Методы общего слоя:** select_features, split_dataset, fit_preprocessor_on_train, transform_validation_test, serialize_artifact, load_trusted_artifact, calculate_metrics. Параметры scaler берутся только из train; метка не попадает в X. Seed и список признаков сохраняются.

**Методы собственных моделей:** LinearRegression.forward/predict и расчёт градиента через тренер; LogisticRegression.predict_proba/predict и численно устойчивая sigmoid; DecisionTreeClassifier.fit/predict/predict_proba/decision_path. Для дерева критерий Gini, числовые пороги, max_depth/min_samples_split/min_samples_leaf. Готовые estimator-классы запрещены проектной документацией.

**Методы repository/service:** create_experiment, mark_running, save_metrics_and_artifact, mark_failed, insert_predictions_batch; launch_experiment, train_and_evaluate, run_inference, list_experiments, get_experiment, list_predictions. Классификация требует бинарной метки; регрессия — осмысленной числовой цели. Для несбалансированного fraud-набора обязательно показывать precision/recall/F1 и долю классов, одной accuracy недостаточно. Артефакт модели содержит feature_names, preprocessing, параметры и версию; произвольный пользовательский pickle не загружать.

### 5.6 reports, audit и курсы

**Reports:** ReportCreate(dataset_id, type, filters, experiment_id?); ReportRead. Методы request_report, build_report, get_report, download_report. В CSV экспортируется только организация пользователя и выбранные строки; перед выдачей повторная проверка доступа; при экспорте обезвредить формулы в текстовых ячейках.

**Audit:** record_event(actor_id, organization_id, action, resource, details), list_events_scoped. Ошибка записи аудита для критических действий должна иметь определённую политику: либо откат операции, либо отдельный надёжный retry; не объявлять полный аудит, если события теряются молча.

**CurrencyRates provider:** get_daily_rate(currency, date), convert(amount, currency, date), get_cached_rate, save_rate. Внешний ответ читается только сервером; нужны таймауты, ограничение размера ответа, валидация XML, логирование ошибок без секретов, кэш. Провайдер не вызывается для датасета без валюты. Для демонстрации интеграции создать отдельный небольшой синтетический CSV с настоящими колонками transaction_date, amount, currency и адаптер currency_transactions.py; основной Kaggle CSV при отсутствии currency не менять. В тестах использовать подменённый HTTP-клиент.

### 5.7 Карточки главных методов для написания кода

Это псевдосигнатуры, а не готовые реализации. Каждому методу нужны явные вход, результат, проверки и побочный эффект. DB Session создаётся на запрос в database/session.py и передаётся дальше; сервис решает границу commit/rollback.

| Метод (пример сигнатуры) | Проверки до действия | Результат и эффект |
|---|---|---|
| register_owner(db, UserCreate, OrganizationCreate) → RegistrationResult | email свободен; поля валидны | Одна транзакция: user + organization + owner membership; при ошибке откат всех трёх |
| authenticate(db, email, password) → TokenResponse | пользователь существует и active; хеш совпадает | Выдать токен с user_id и сроком; обновить last_login_at; неверные данные → 401 |
| require_role(db, user_id, org_id, allowed_roles) → Membership | активная membership и разрешённая роль | Вернуть контекст организации или отказать до доступа к объекту |
| upload_dataset(db, org_id, actor_id, file) → DatasetRead | роль, размер, расширение/содержимое, лимиты | Создать Dataset, безопасно сохранить файл, запустить обработку; ошибка сохранения переводит статус в FAILED |
| process_dataset(db, dataset_id) → DatasetStatusRead | статус допускает обработку; файл существует | Адаптер, валидация, профиль, чанки, bulk insert, счётчики, READY/INVALID/FAILED |
| list_transactions(db, org_id, dataset_id, filters) → Page[TransactionRead] | membership; dataset принадлежит org; допустимые сортировки | Один серверный запрос с limit/offset или курсором и общим count |
| get_dataset_summary(db, org_id, dataset_id) → DatasetSummaryRead | доступ и READY/разрешённое частичное состояние | Агрегаты из БД; отсутствующие поля представлены как unavailable, не как выдуманный ноль |
| launch_experiment(db, org_id, actor_id, ExperimentCreate) → ExperimentRead | роль; READY; допустимая цель и признаки; лимиты | PENDING, затем запуск обучения; повторная отправка не должна бесконтрольно создавать дубликаты |
| train_and_evaluate(experiment_id) → MetricsAndArtifact | train/test без утечки, корректные размеры классов | Обучить собственную модель, сохранить метрики и артефакт, SUCCEEDED/FAILED |
| run_inference(db, experiment_id) → count | успешный experiment; совместимый feature schema | Прогнозы пачками; UQ по паре experiment/transaction |
| request_report(db, org_id, actor_id, ReportCreate) → ReportRead | роль, ресурс, допустимые фильтры | Создать report, записать файл, статус SUCCEEDED/FAILED и audit event |
| get_daily_rate(currency, date) → RateRead | валюта/дата допустимы | Кэш → официальный источник → проверка ответа → кэш; контролируемая ошибка при недоступности |

Для сложных операций не держать транзакцию БД открытой во время долгого чтения CSV, ML-обучения или сетевого запроса к Банку России. Отдельно фиксировать статус и атомарно записывать одну пачку данных со счётчиком. При чтении объекта по ID сначала применить organization_id в запросе.
## 6. Примерный HTTP-контракт

Единый префикс: /api/v1. Все маршруты, кроме регистрации/входа/health, требуют пользователя. organization_id берётся из выбранного workspace и проверяется через membership; передача ID клиентом сама по себе не даёт права доступа.

| Метод и путь | Вход → выход | Кто может |
|---|---|---|
| POST /auth/register-owner | OwnerRegistration → TokenResponse + OrganizationRead | анонимный; создаёт только новую организацию |
| POST /auth/login | LoginRequest → TokenResponse | анонимный |
| GET /users/me | — → UserRead | вошедший |
| PATCH /users/me | UserProfileUpdate → UserRead | сам пользователь |
| POST /users/me/change-password | ChangePasswordRequest → 204 | сам пользователь |
| GET /organizations | — → список OrganizationRead | вошедший |
| GET /organizations/{org_id}/members | — → список MembershipRead | участник |
| POST /organizations/{org_id}/members | MemberAdd → MembershipRead | Owner |
| PATCH /organizations/{org_id}/members/{user_id} | MemberRoleUpdate → MembershipRead | Owner |
| POST /organizations/{org_id}/datasets | multipart CSV → DatasetRead | Owner, Analyst |
| GET /organizations/{org_id}/datasets | фильтры → Page[DatasetRead] | участник |
| GET /organizations/{org_id}/datasets/{dataset_id} | — → DatasetRead + профиль | участник |
| GET /organizations/{org_id}/datasets/{dataset_id}/issues | page → Page[ImportIssueRead] | участник |
| POST /organizations/{org_id}/datasets/{dataset_id}/retry | — → DatasetStatusRead | Owner, Analyst |
| GET /organizations/{org_id}/datasets/{dataset_id}/transactions | фильтры → Page[TransactionRead] | участник |
| GET /organizations/{org_id}/transactions/{transaction_id} | — → TransactionDetailRead | участник |
| GET /organizations/{org_id}/datasets/{dataset_id}/analytics | — → DatasetSummaryRead | участник |
| POST /organizations/{org_id}/experiments | ExperimentCreate → ExperimentRead | Owner, Analyst |
| GET /organizations/{org_id}/experiments/{experiment_id} | — → ExperimentRead + metrics | участник |
| GET /organizations/{org_id}/experiments/{experiment_id}/predictions | фильтры → Page[PredictionRead] | участник |
| POST /organizations/{org_id}/reports | ReportCreate → ReportRead | Owner, Analyst |
| GET /organizations/{org_id}/reports/{report_id}/download | — → файл | Owner, Analyst |
| GET /organizations/{org_id}/currency-rates | currency/date → RateRead | участник; только где есть предметный смысл |
| GET /health | — → статус | публичный |

Единый формат ошибки: code, message, details?; без stack trace, SQL, внутренних путей и токенов. Примеры кодов: VALIDATION_ERROR 422, UNAUTHORIZED 401, FORBIDDEN 403, NOT_FOUND 404, CONFLICT 409, TOO_LARGE 413, UNSUPPORTED_CSV 415, EXTERNAL_PROVIDER_UNAVAILABLE 503. Для чужого объекта 404 может скрывать его существование; применять последовательно.

### 6.1 Последовательность вызовов: загрузка CSV

~~~text
DatasetUploadForm
  → POST /datasets
  → datasets.router.upload
  → require_role(owner|analyst)
  → datasets.service.upload_dataset
  → datasets.repository.create_uploaded
  → datasets.storage.save_stream_to_generated_path
  → datasets.service.process_dataset
      → adapter.detect
      → validator.validate_header
      → parser.iter_chunks
      → adapter.transform_chunk
      → validator.validate_chunk
      → transactions.repository.bulk_insert
      → datasets.repository.update_counters_and_status
  → GET /datasets/{id} до READY/INVALID/FAILED
  → Dashboard + Transactions
~~~

Пометка к транзакциям БД: запись пачки строк и соответствующего счётчика должна быть согласована. При сбое частичный импорт не объявляется READY. Для retry нужен понятный способ очистить/переиспользовать уже импортированные строки; UQ(dataset_id, source_row_number) служит последней защитой от дубликатов.

### 6.2 Последовательность вызовов: ML

~~~text
ExperimentForm
  → POST /experiments
  → authorize + READY dataset + validate target/features
  → persist PENDING
  → split data with fixed seed
  → fit preprocessing on train only
  → train custom model
  → evaluate on held-out data
  → store artifact + metrics, status SUCCEEDED
  → infer in batches + store predictions
  → Suspicious Analysis / Regression Analysis
~~~

В бизнес-экране дерево может показывать решение по порогам. Логистическая регрессия показывает вероятность и факты транзакции, без ложной причинной интерпретации. Регрессия показывает ожидаемую сумму и отклонение, но не называет отклонение мошенничеством.

## 7. Frontend: страницы, формы и состояния

Минимум преподавателя (4 страницы, 3 формы) перекрывается следующими **рабочими**, а не пустыми, экранами:

| Страница | Данные/действие |
|---|---|
| Login | Форма входа, ошибки авторизации |
| Dashboard | Деньги, объём, доля риска, графики по доступным полям |
| Datasets | Список наборов, форма CSV-загрузки |
| Dataset Details | Статус, профиль качества, ошибки строк |
| Transactions | Серверная таблица, пагинация, фильтры, карточка операции |
| Suspicious Analysis | Прогнозы, риск, объяснение, ссылка на операцию |
| Regression Analysis | Факт/ожидание/отклонение |
| ML Experiments | Форма запуска, параметры, technical metrics |
| Reports | Список и скачивание отчётов |
| Settings | Профиль и переключатель темы |

Формы, которые можно показать: Login; CSV Upload; Transaction Filters; Experiment Configuration; Profile Settings. Дизайн единый через общий layout, типографику, кнопки, формы и состояния. У каждого экрана различаются loading, empty, processing, permission denied, recoverable error и failed. Большая таблица не загружает все строки в браузер.

На телефоне Dashboard перестраивается в одну колонку; фильтры открываются компактно; таблица имеет горизонтальную прокрутку или карточный режим. Переключатель Light/Dark использует общие CSS-переменные и сохраняет пользовательский выбор (локально в браузере либо в профиле). Статус риска не передаётся одним только цветом.

## 8. Файлы для самостоятельной реализации

~~~text
backend/
  app/
    main.py                 # сборка FastAPI и routers
    core/config.py          # настройки
    core/security.py        # пароли, токены
    database/base.py        # общий DeclarativeBase
    database/session.py     # Engine, SessionLocal, get_session
    database/metadata.py    # импорты всех ORM-моделей для Alembic
    auth/{router,service,schemas,tokens}.py
    users/{models,schemas,repository,service,router,errors}.py
    organizations/{models,schemas,repository,service,router,permissions}.py
    datasets/{models,schemas,repository,service,router,storage,parser,validator,profiler}.py
    datasets/adapters/{base,fraud_dataset,currency_transactions}.py
    transactions/{models,schemas,repository,service,router,filters}.py
    analytics/{schemas,service,router,aggregations}.py
    ml/common/{features,split,scaler,trainer,serialization}.py
    ml/regression/{linear_regression,losses,metrics,service}.py
    ml/classification/{logistic_regression,decision_tree,tree_node,losses,metrics,service}.py
    ml/experiments/{models,schemas,repository,service,router}.py
    predictions/{models,schemas,repository,service,router}.py
    reports/{models,schemas,repository,service,router,csv_exporter}.py
    audit/{models,repository,service}.py
    integrations/currency_rates/{provider,cbr_provider,models,repository,service,schemas}.py
  alembic/versions/          # новая миграция на каждое изменение схемы
  tests/{unit,integration,fixtures}/
  load_tests/locustfile.py   # после работающего MVP
frontend/
  src/app/                  # маршруты и общий layout
  src/pages/                # страницы выше
  src/features/             # формы и действия
  src/entities/             # Dataset, Transaction, Experiment и API-типы
  src/shared/               # fetch client, общие компоненты и CSS темы
storage/
  datasets/{organization_id}/{dataset_id}/source.csv
  model-artifacts/{experiment_id}/model.json
  reports/{report_id}/result.csv
~~~

Обычное направление зависимости: router → service → repository → PostgreSQL. Service координирует также валидатор, адаптер, аналитику и ML. Математика ML не импортирует FastAPI и SQLAlchemy. Создавать пустые файлы заранее не требуется; схема показывает конечную ответственность.

## 9. Проверки, которые доказывают правила

| Область | Сценарии |
|---|---|
| users/auth | уникальный email; неверный пароль; хеш вместо plaintext; закрытый API без токена |
| organizations | A не читает dataset B; Analyst не меняет роли; нельзя удалить последнего Owner |
| import | валидный/пустой CSV; неизвестная схема; плохое число; ошибка строки; повторный импорт без дублей; крупный файл частями |
| transactions | пагинация/сортировка; фильтр суммы; неподдерживаемое поле; чужая операция по ID |
| analytics | точные суммы на маленьких фикстурах; отсутствие amount/time/currency; несколько валют |
| ML | известные прогнозы и градиенты; обучение снижает loss; sigmoid конечна; Gini и лучший split; stopping; отсутствие data leakage; метрики при нулевом знаменателе |
| predictions | ровно одна запись на пару experiment/transaction; одинаковые dataset/org; объяснение дерева |
| reports | экспорт фильтров; запрет чужого файла; безопасность формул CSV |
| integration | правильный nominal; таймаут; недоступный Банк России; кэш; нет вызова без currency |
| load | повторяемый набор/число пользователей, время прогона, ошибки, p50/p95, RPS |

Общая цель Backend: **line coverage ≥80%**; PDF требует для бонуса строго >75%. Покрытие не заменяет проверки предметных правил. Unit-тесты обязательны, интеграционные тесты особенно важны для FK, доступа и импорта. Стандартный suite не зависит от сети и большого Kaggle CSV; внешний сервис подменяется. Отдельный opt-in smoke test может проверять реальный источник курса.

### 9.1 Конкретное закрытие поздних бонусов

- **OpenAPI:** у каждого маршрута описать Pydantic-схемы, status codes и примеры ошибок; после реализации сохранить фактический openapi.json. Наличие одной пустой страницы Swagger недостаточно для доказательства контрактов.
- **Docker:** после стабильного локального сценария добавить backend Dockerfile, frontend Dockerfile и compose с PostgreSQL. Передать секреты через локальный env, иметь volume для данных PostgreSQL и storage, выполнить миграции контролируемым способом, показать чистый запуск и health-проверку. Не класть реальные секреты в образ.
- **Нагрузка:** Locust HttpUser с входом и типичной смесью list datasets, paginated transactions, analytics, details; отдельно ограниченный сценарий CSV upload. Записать конфигурацию стенда, размер данных, пользователей, длительность, RPS, p50/p95 и процент ошибок. Нагрузочный тест не должен случайно перегружать сторонний сервис курсов.
- **Мобильный интерфейс:** проверить минимум 360–390 px ширины, доступность формы входа/загрузки/фильтров, читаемость статусов и таблицы. Сохранить снимки реально работающих экранов.
- **Темы:** единые CSS-токены для обеих тем, пользовательский переключатель, сохранение выбора между обновлениями страницы; графики и статусы также читаемы в обеих темах.
- **Валютный сервис:** использовать официальный дневной XML-источник Банка России; сохранить nominal, value, дату и источник. Воспроизвести успешный ответ на синтетическом multi-currency CSV и контролируемый отказ сети. Без валюты в исходном наборе интеграция не вызывается.
## 10. Порядок реализации — от текущего состояния

| Шаг | Пиши и проверяй | Наблюдаемый результат |
|---:|---|---|
| 1 | Исправить config/session и единый путь импортов; проверить драйвер, env и /health | Backend стартует и соединяется с тестовой БД |
| 2 | Довести расширенный User: типы, NULL/default, UserCreate/UserRead, email-validator | Поля имеют ясный смысл; пароль отсутствует в ответе |
| 3 | Organization + Membership + первая миграция | 3 связанные таблицы, Owner membership |
| 4 | Users/Auth services, repositories, token и роли; тесты доступа | Вход и закрытый /users/me |
| 5 | Dataset model/storage/adapter/validation + миграция | Малый CSV получает статус и профиль |
| 6 | Transaction model/chunk import/list + миграция | Строки в БД, таблица с пагинацией |
| 7 | Analytics + первые 5 страниц Frontend | Полный вертикальный сценарий Login → Upload → Transactions → Dashboard |
| 8 | Три собственные модели + unit-тесты без API/БД | Математика на маленьких проверяемых данных |
| 9 | Experiments/Predictions + миграция + технические/бизнес-экраны | Анализ риска и отклонения с происхождением результата |
| 10 | Reports/Audit + миграция | CSV-выгрузка и журнал действий |
| 11 | Добрать coverage ≥80%, OpenAPI, мобильную верстку и темы | Обязательные и ранние бонусные пункты готовы к показу |
| 12 | Внешние курсы, кэш и отказоустойчивость; Locust | Предметная интеграция и измерение нагрузки |
| 13 | Docker/compose, чистый запуск, финальная документация | Упакованная система и воспроизводимая демонстрация |

На каждом шаге: запустить соответствующий маршрут, проверить БД/HTTP/экран, написать осмысленный тест, затем переходить дальше. Не отмечать в отчёте «реализовано», пока функция не наблюдается в работающем приложении.

## 11. Демонстрация преподавателю

1. Показать согласование темы и стека.
2. Войти пользователем Owner; открыть 5+ работающих страниц и 3+ работающих формы.
3. Показать таблицы и FK в PostgreSQL; одного пользователя в двух организациях с разными ролями.
4. Загрузить CSV, наблюдать статус, увидеть строки и профиль данных; показать чужую организацию с отказом доступа.
5. Запустить каждую собственную ML-модель и объяснить её метрики на технической странице.
6. Экспортировать CSV, открыть OpenAPI-документацию и показать тесты с coverage >75%.
7. Показать узкий экран, две темы, результат Locust, интеграцию с Банком России и отказ внешнего сервиса.
8. Запустить Docker-версию в чистом окружении и повторить короткий сценарий.

Для доказательства каждого бонуса сохранить команду запуска, результат и снимок экрана одной и той же финальной версии приложения. Нельзя заявлять все дополнительные баллы только по наличию файлов.

## 12. Решения, которые стоит зафиксировать перед кодом

- Какой именно CSV является первым поддерживаемым набором, его лицензия и реальные колонки. От этого зависят adapter, графики и пригодность regression target.
- Нужна ли публичная регистрация или начальный Owner создаётся управляемой командой. Оба варианта сохраняют правило атомарного создания membership.
- Требует ли преподаватель одновременно CSV и XML для бонуса. Если да, добавить XML как отдельный адаптер после CSV.
- Какие поля расширенного User реально обязательны при создании. Остальные получают NULL/default. Реферальные поля можно оставить зарезервированными, без выдуманной бизнес-функции.
- Согласован ли Python + FastAPI с лектором: PDF требует согласования стека.
- Для задач загрузки и обучения выбрать ограничение размера/времени и способ фонового выполнения, который надёжно переживает ожидаемый сценарий демонстрации.

## Источники

- Локальный PDF преподавателя: «Требования к проекту.pdf», 2 страницы, редакция файла от 07.10.2025.
- Ранее предоставленный архив codex_final_project_documentation.zip: PROJECT_SPEC, ARCHITECTURE, DATA, ML, SECURITY, TESTING, REQUIREMENTS_COMPLIANCE, BONUS_POINTS_PLAN, EXTERNAL_INTEGRATION.
- Официальный Банк России: https://www.cbr.ru/development/sxml/ — ежедневные XML-курсы и справочник валют; https://www.cbr.ru/currency_base/daily/ — отображение валюты, количества единиц и курса.
- FastAPI: https://fastapi.tiangolo.com/tutorial/metadata/ — OpenAPI и адреса документации.
- Locust: https://docs.locust.io/en/stable/ — сценарии HttpUser и отчёты нагрузки.


