# FinSight: расширенный словарь данных

Дата: 02.10.2026. Статус: проектирование, без применения к рабочей БД.
Дополняет DATABASE_ARCHITECTURE.md. Ниже описана целевая версия 16 таблиц, включая авторизацию, уточнённую 03.10.2026: имена некоторых полей уточнены, новые поля добавляются будущими миграциями. Это не описание уже работающего приложения.

Отдельные цветные схемы всех таблиц со всеми именами колонок и типами: [DATABASE_TABLE_DIAGRAMS.md](DATABASE_TABLE_DIAGRAMS.md).

## Как читать

- **Б** — базовый контракт; нужен для основного сценария. **Р** — расширение под соответствующую функцию. Наличие в целевой схеме не обязывает реализовать функцию сейчас.
- `?` — допускается NULL. Даже базовое поле может быть NULL, если источник его не содержит или процесс ещё не завершился.
- ID/FK — BIGINT; даты событий — TIMESTAMPTZ; календарные даты — DATE. JSON — JSONB. UUID используется для идентификаторов запросов и попыток.
- Все денежные значения — Decimal/NUMERIC. В этой расширенной версии для исходных денежных сумм предлагается NUMERIC(28,8), вместо NUMERIC(20,4) раннего плана; оригинальное текстовое значение всё равно сохраняется в raw_dataset_rows. Источники с большей точностью требуют отдельного договора об округлении/типе.
- JSON имеет проверяемую версию структуры. Обязательные ссылки и основные фильтры не прячутся в JSON. Большие массивы, модели, кривые обучения, логи и файлы — артефакты в storage с хешами.
- Результаты и исходники сохраняются неизменяемыми. Операционные статусы/heartbeat изменяемы. Исправление успешного результата создаёт новую версию.
- Фиксируем наблюдаемые данные. Нет контрагента/валюты/метки — NULL, а не догадка. Исходное значение, нормализованное значение и вывод модели имеют разные поля.

## 1. users — аккаунт и настройки

Полный контракт регистрации, профиля, статусов и связей с организациями: [USERS_ARCHITECTURE.md](USERS_ARCHITECTURE.md).

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id | BIGINT PK | Б: идентификатор |
| email | VARCHAR(255) UNIQUE | Б: нормализованный логин |
| password_hash | VARCHAR(255) | Б: хеш пароля, не исходный пароль |
| name, second_name | VARCHAR(50) | Б: текущие имена полей проекта |
| middle_name? | VARCHAR(50) | Б: отчество |
| status | VARCHAR(20) | Б: active / blocked / deleted |
| created_at, updated_at | TIMESTAMPTZ | Б: создание и изменение |
| last_login_at? | TIMESTAMPTZ | Б: последний успешный вход |
| password_changed_at? | TIMESTAMPTZ | Р: время смены пароля |
| auth_version | INTEGER DEFAULT 0 | Б: версия отзыва токенов при реализованной авторизации |
| email_verified_at? | TIMESTAMPTZ | Р: факт подтверждения email |
| phone?, phone_verified_at? | VARCHAR(32) / TIMESTAMPTZ | Р: телефон и подтверждение |
| language, timezone | VARCHAR(16) / VARCHAR(64) | Р: язык, IANA timezone |
| theme | VARCHAR(10) DEFAULT system | Р: light / dark / system |
| avatar_storage_key? | TEXT | Р: управляемый файл аватара |
| notification_preferences_json | JSONB object DEFAULT {} | Р: реально поддержанные уведомления |
| terms_version?, terms_accepted_at? | VARCHAR(40) / TIMESTAMPTZ | Р: версия и дата согласия |
| privacy_version?, privacy_accepted_at? | VARCHAR(40) / TIMESTAMPTZ | Р: версия и дата согласия |
| blocked_at?, block_reason_code? | TIMESTAMPTZ / VARCHAR(80) | Р: блокировка |
| anonymized_at? | TIMESTAMPTZ | Р: обезличивание |

Роли организаций остаются в memberships. Подтверждения не дублируются bool + timestamp: факт определяется временем. Даты рождения, пола, платёжных карт и произвольного профиля не собираем без отдельной функции. История входов, устройств и неуспешных попыток — не массив в users; нужны auth_sessions/auth_events при реализации этих сценариев.

## 2. organizations — организация

Сценарии, права, состояния, валидация и API подробно описаны в [ORGANIZATIONS_ARCHITECTURE.md](ORGANIZATIONS_ARCHITECTURE.md).

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id | BIGINT PK | Б |
| name, slug | VARCHAR(200) / VARCHAR(100) UNIQUE | Б: название и URL-идентификатор |
| base_currency | VARCHAR(3) | Б: валюта представления |
| status | VARCHAR(20) | Б: active / suspended / archived |
| created_by_user_id | BIGINT FK users | Б: создатель |
| created_at, updated_at | TIMESTAMPTZ | Б |
| timezone, language | VARCHAR(64) / VARCHAR(16) | Р: настройки по умолчанию |
| legal_name? | VARCHAR(300) | Р: юридическое название |
| registration_country?, tax_identifier? | VARCHAR(2) / VARCHAR(80) | Р: страна и идентификатор, если нужны |
| description? | TEXT | Р: описание |
| logo_storage_key? | TEXT | Р: логотип |
| settings_json | JSONB object DEFAULT {} | Р: версия структуры, правила показа, ограничения импорта |
| archived_at?, suspended_at? | TIMESTAMPTZ | Р: даты соответствующих состояний |
| status_reason_code? | VARCHAR(80) | Р: причина ограничения |

Не делать tax_identifier глобально уникальным без определения стран и филиалов. Настройки доступа не должны быть произвольными клиентскими JSON. Фактически использованные настройки импорта и аналитики копируются в снимок запуска.

## 3. organization_memberships — роль конкретного пользователя в компании

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id | BIGINT PK | Б |
| organization_id, user_id | BIGINT FK | Б: связь компании и человека |
| role | VARCHAR(20) | Б: owner / analyst / viewer |
| status | VARCHAR(20) | Б: active / disabled |
| created_by_user_id? | BIGINT FK users | Б: кто добавил |
| joined_at, updated_at | TIMESTAMPTZ | Б |
| role_changed_at?, role_changed_by_user_id? | TIMESTAMPTZ / BIGINT FK users | Р: последнее изменение роли |
| disabled_at?, disabled_by_user_id? | TIMESTAMPTZ / BIGINT FK users | Р: отключение |
| disable_reason_code? | VARCHAR(80) | Р: причина |
| membership_version | INTEGER DEFAULT 0 | Р: optimistic concurrency для редактирования |

UNIQUE(organization_id, user_id). Полная история изменений — audit_events, а не только последние timestamps. Защита последнего owner требует транзакционных блокировок, одной membership_version недостаточно.

## 4. datasets — оригинал и итог импорта

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, uploaded_by_user_id | BIGINT PK/FK | Б |
| name, original_filename | VARCHAR(200) / VARCHAR(255) | Б: название набора и исходного файла |
| storage_key | TEXT UNIQUE | Б: побайтный оригинал |
| file_sha256, file_size_bytes | VARCHAR(64) / BIGINT | Б: целостность и размер |
| source_type | VARCHAR(30) | Б: csv_upload; будущие типы отдельными адаптерами |
| format | VARCHAR(20) | Б: csv; фактически распознанный формат |
| adapter_name, adapter_version | VARCHAR(80) / VARCHAR(40) | Б: контракт нормализации |
| schema_json | JSONB object | Б: заголовки по порядку, типы, источники колонок |
| import_config_json | JSONB object | Б: delimiter, quote, escape, encoding, date/decimal formats, timezone, mapping |
| profile_json | JSONB object DEFAULT {} | Б: итоговый профиль качества |
| status | VARCHAR(20) | Б: uploaded / validating / importing / ready / invalid / failed |
| attempt_number, worker_token?, heartbeat_at? | INTEGER / UUID / TIMESTAMPTZ | Б: текущая попытка и защита от старого worker |
| total_rows, valid_rows, invalid_rows, imported_rows | BIGINT DEFAULT 0 | Б: логические CSV-записи без заголовка |
| raw_rows_saved | BIGINT DEFAULT 0 | Б: сохранённые сырые записи |
| error_code?, error_message? | VARCHAR(100) / TEXT | Б: безопасная итоговая ошибка |
| created_at, updated_at, started_at?, completed_at? | TIMESTAMPTZ | Б |
| archived_at? | TIMESTAMPTZ | Б: архив отдельно от состояния импорта |
| source_system?, source_description? | VARCHAR(100) / TEXT | Р: происхождение файла |
| source_period_start?, source_period_end? | DATE | Р: заявленный период, не обязательно вычисленный |
| declared_content_type?, detected_content_type? | VARCHAR(100) | Р: клиентский и определённый сервером MIME |
| upload_request_id? | UUID | Р: корреляция запроса |
| client_upload_key? | VARCHAR(100) | Р: ключ идемпотентности загрузки в пределах организации |
| warnings_count, diagnostic_count | BIGINT DEFAULT 0 | Р: количество предупреждений и диагностик |
| diagnostics_truncated | BOOLEAN DEFAULT false | Р: выборка ошибок ограничена |
| profile_artifact_key?, profile_sha256? | TEXT / VARCHAR(64) | Р: полный большой профиль |
| parser_manifest_key?, parser_manifest_sha256? | TEXT / VARCHAR(64) | Р: границы записей, байтовые смещения, повреждённые участки |
| source_license?, source_reference? | TEXT | Р: лицензия/ссылка, если известны |

profile_json содержит версию схемы; по каждой колонке: долю/число пропусков, ошибки парсинга, типы, min/max, mean/std, квантили, частоты, количество уникальных значений с указанием точного/приближённого метода. Также дубликаты, распределение метки, количество по валютам, диапазон времени, признаки пригодности для задач. Профиль версионируется вместе с алгоритмом расчёта. Не складывать суммы разных валют.

Повторный file_sha256 допустим. UNIQUE(organization_id, client_upload_key) для ненулевого ключа; повторный запрос с тем же ключом и другим содержимым даёт конфликт. Ошибка парсера может не позволить достоверно подсчитать все логические записи: manifest фиксирует неопределённость, счётчик не изображает полный разбор.

## 5. raw_dataset_rows — точные исходные значения

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id | BIGINT PK/FK | Б |
| source_row_number | BIGINT | Б: номер логической записи |
| raw_values? | JSONB array | Б: строки в порядке колонок, без trim/кастов; NULL при malformed |
| parse_status | VARCHAR(20) | Б: parsed / malformed |
| validation_status | VARCHAR(20) | Б: pending / valid / invalid |
| created_at | TIMESTAMPTZ | Б: сохранение |
| source_line_start?, source_line_end? | BIGINT | Р: физические строки многострочного CSV |
| source_byte_start?, source_byte_end? | BIGINT | Р: полуинтервал байтов [start,end) оригинального файла |
| record_sha256? | VARCHAR(64) | Р: хеш исходных байтов записи, не JSON-сериализации |
| field_count? | INTEGER | Р: фактическое количество полей |
| validation_summary_json | JSONB object DEFAULT {} | Р: версия правил, коды и число нарушений |
| validated_at? | TIMESTAMPTZ | Р: проверка |

UNIQUE(dataset_id, source_row_number). Сохраняем и плохие записи, а не только пригодные для анализа. Разница между пустым значением и отсутствующим столбцом описана в parser contract; JSON NULL не должен бесконтрольно подменять исходную пустую строку. Повторяющиеся названия колонок сохраняются позиционно. Байтовые смещения заполняются только парсером, который умеет корректно отслеживать исходное кодирование и CSV quoting; не вычислять их из уже декодированных строк. Неразбираемый хвост гарантированно сохраняется оригинальным файлом.

## 6. dataset_import_issues — подробная диагностика

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id | BIGINT PK/FK | Б |
| attempt_number | INTEGER | Б: попытка обнаружения |
| raw_row_id? | BIGINT составной FK raw_dataset_rows | Р: конкретная сырая запись |
| source_row_number? | BIGINT | Б: номер, NULL для ошибки файла |
| column_name? | VARCHAR(255) | Б: понятное имя |
| column_index? | INTEGER | Р: позиция при повторяющихся заголовках; нумерация с 0 |
| code, message | VARCHAR(80) / TEXT | Б: машинный код и сообщение |
| severity | VARCHAR(10) | Р: info / warning / error |
| stage | VARCHAR(30) | Р: file / parse / validate / normalize / persist |
| rule_name?, rule_version? | VARCHAR(100) / VARCHAR(40) | Р: проверка |
| expected_type?, expected_constraint_json? | VARCHAR(50) / JSONB | Р: ожидание |
| context_json | JSONB object DEFAULT {} | Р: безопасные параметры проверки |
| created_at | TIMESTAMPTZ | Б |

Не размножать raw value по диагностическим таблицам: значение доступно по raw_row_id/column_index. Полный отчёт всех ошибок можно сохранять артефактом: ссылка и хеш — в datasets.profile_json.artifacts; в БД оставить ограниченную выборку. invalid_rows считает записи, diagnostic_count — нарушения. Наличие полного артефакта и его количество явно фиксируются; нельзя называть ограниченную выборку полным журналом.

## 7. transactions — канонический снимок операции

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id, raw_row_id | BIGINT PK/FK | Б: происхождение |
| source_row_number | BIGINT | Б |
| source_transaction_id? | VARCHAR(255) | Б: ID источника |
| transaction_time? | TIMESTAMPTZ | Б: реальный момент операции |
| amount? | NUMERIC(28,8) | Б: исходная сумма, без конвертации |
| currency? | VARCHAR(3) | Б: реальная валюта |
| category?, counterparty? | VARCHAR(150) | Б: только из источника/явного mapping |
| source_label? | SMALLINT | Б: размеченная метка, 0/1 |
| raw_features, extra_fields | JSONB object | Б: канонические признаки и остальные поля |
| created_at | TIMESTAMPTZ | Б |
| booking_date?, value_date? | DATE | Р: дата проводки/валютирования |
| source_timezone?, time_precision? | VARCHAR(64) / VARCHAR(20) | Р: интерпретация времени, day/second и т. п. |
| transaction_type?, direction?, source_status? | VARCHAR(80) / VARCHAR(20) / VARCHAR(80) | Р: тип, направление, исходное состояние |
| description?, payment_reference? | TEXT | Р: назначение и reference |
| account_reference?, counterparty_reference? | VARCHAR(255) | Р: идентификаторы из файла, без выдуманного справочника |
| merchant_category_code?, country_code? | VARCHAR(4) / VARCHAR(2) | Р: MCC/страна, если есть |
| fee_amount?, fee_currency? | NUMERIC(28,8) / VARCHAR(3) | Р: комиссия |
| balance_before?, balance_after?, balance_currency? | NUMERIC(28,8) / VARCHAR(3) | Р: балансы, если предоставлены |
| source_label_origin?, source_label_version? | VARCHAR(100) / VARCHAR(40) | Р: происхождение разметки |
| normalized_record_sha256? | VARCHAR(64) | Р: контроль снимка по версионированной канонической сериализации |
| normalization_trace_json | JSONB object DEFAULT {} | Р: mapping, касты, округления, предупреждения по полям |

UNIQUE(raw_row_id), UNIQUE(dataset_id, source_row_number). Несколько денежных полей без валюты не становятся автоматически RUB. direction может описывать поток независимо от знака amount: адаптер фиксирует sign convention. Денежные колонки не подходят для scaled признаков. Неизвестные колонки сохраняются в raw и extra_fields; часто фильтруемые поля позднее выносятся в отдельные колонки. Межфайловой дедупликации по одному хешу нет.

## 8. processing_runs — полный контракт обработки

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id, created_by_user_id | BIGINT PK/FK | Б |
| purpose | VARCHAR(30) | Б: cleaning / feature_engineering / ml_preprocessing |
| status | VARCHAR(20) | Б: pending / running / succeeded / failed |
| pipeline_version, code_version | VARCHAR(100) | Б: версия шагов и кода |
| config_json | JSONB object | Б: упорядоченные шаги, правила пропусков/дубликатов/outliers |
| split_config_json? | JSONB object | Б: seed, алгоритм, доли, стратификация/время |
| fitted_parameters_json? | JSONB object | Б: компактные обученные scaler/imputer/encoding параметры |
| input_rows, output_rows, excluded_rows | BIGINT | Б: итоговые количества |
| artifact_key?, artifact_sha256? | TEXT / VARCHAR(64) | Б: полный результат и manifest |
| worker_token?, heartbeat_at? | UUID / TIMESTAMPTZ | Б |
| error_code?, error_message? | VARCHAR(100) / TEXT | Б |
| created_at, started_at?, completed_at? | TIMESTAMPTZ | Б |
| request_id?, client_run_key? | UUID / VARCHAR(100) | Р: корреляция/идемпотентность |
| input_manifest_sha256?, output_schema_json? | VARCHAR(64) / JSONB | Р: контроль входов и типы результата |
| random_seed? | BIGINT | Р: общий seed; остальные seed явны в конфигурации |
| environment_json | JSONB object DEFAULT {} | Р: Python, зависимости, ОС, hardware, параметры threads |
| quality_before_json?, quality_after_json? | JSONB object | Р: сравнимые профили качества |
| transformation_summary_json | JSONB object DEFAULT {} | Р: сколько замен/пропусков/исключений по каждому шагу |
| drift_metrics_json? | JSONB object | Р: дрейф относительно явно указанного reference artifact |
| performance_json | JSONB object DEFAULT {} | Р: время стадий, CPU, peak RSS, прочитанные/записанные байты, метод измерения |
| artifacts_manifest_json | JSONB object DEFAULT {} | Р: логи, профили, параметры и матрицы с ключами/хешами/размером/форматом |
| cancellation_requested_at?, cancelled_at? | TIMESTAMPTZ | Р: только с реализацией cancelled status и протокола отмены |

В config_json.steps у каждого шага: step_id, type, version, columns, parameters, порядок. В transformation_summary: affected_cells/rows и метрики. Большие fitted параметры переносятся в артефакт. Каждый успешный run начинается с неизменяемых transactions: другой набор шагов — новый run. Обработка для ML фиксирует split до обучения статистик. Performance — измерения с единицами и scope, не просто число duration без определения.

## 9. processed_rows — результат обработки и объяснение изменений

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id, processing_run_id, transaction_id | BIGINT PK/FK | Б |
| values_json | JSONB object | Б: полный финальный результат строки |
| disposition | VARCHAR(20) | Б: included / excluded |
| exclusion_reason? | VARCHAR(100) | Б: почему исключена |
| split_role? | VARCHAR(20) | Б: train / validation / test / inference |
| created_at | TIMESTAMPTZ | Б |
| output_position? | BIGINT | Р: порядок включённой строки в матрице |
| feature_values_json?, target_value_json? | JSONB | Р: точный вход/цель ML, только при полезном разделении values_json |
| missing_fields_json, imputed_fields_json | JSONB array DEFAULT [] | Р: исходно отсутствующие и заполненные поля |
| quality_flags_json | JSONB array DEFAULT [] | Р: outlier, parse warning, duplicate candidate |
| transformation_trace_json | JSONB array DEFAULT [] | Р: step_id, field, before, after, reason, value_type |
| sample_weight? | DOUBLE PRECISION | Р: конечный неотрицательный вес |
| duplicate_of_transaction_id? | BIGINT составной FK transactions | Р: установленный дубль внутри dataset/org |
| result_sha256? | VARCHAR(64) | Р: контроль канонической сериализации результата |

UNIQUE(processing_run_id, transaction_id); output_position уникален внутри run для ненулевых значений. Дублирование feature_values и values допустимо только с явным контрактом и проверкой соответствия; иначе используем один источник истины. Для сохранения всех промежуточных шагов trace хранит изменения каждого шага; когда он велик, полные step snapshots сохраняются в артефакте run с индексом по transaction_id/step_id. Одного финального values_json недостаточно для обещания «сохранили каждое промежуточное преобразование».

## 10. ml_experiments — обучение, оценка и артефакт модели

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id, processing_run_id, created_by_user_id | BIGINT PK/FK | Б |
| model_type, task_type | VARCHAR(40) / VARCHAR(20) | Б: алгоритм и classification/regression |
| status | VARCHAR(20) | Б: pending / running / succeeded / failed |
| target_name, feature_names | VARCHAR(100) / JSONB array | Б: цель и порядок признаков |
| hyperparameters | JSONB object | Б: фактически использованные, включая defaults |
| split_config, preprocessing | JSONB object | Б: неизменяемый снимок контракта processing_run |
| metrics? | JSONB object | Б: по split, методика, sample_count и причины неопределённых метрик |
| threshold? | NUMERIC(8,7) | Б: рабочий порог classification |
| train_rows?, validation_rows?, test_rows? | BIGINT | Б: реальные размеры |
| artifact_key?, artifact_sha256? | TEXT / VARCHAR(64) | Б: модель и контроль целостности |
| model_version, code_version | VARCHAR(40) / VARCHAR(100) | Б: формат/код модели |
| worker_token?, heartbeat_at? | UUID / TIMESTAMPTZ | Б |
| error_code?, error_message? | VARCHAR(100) / TEXT | Б |
| created_at, started_at?, completed_at? | TIMESTAMPTZ | Б |
| name?, description? | VARCHAR(200) / TEXT | Р: описание эксперимента |
| random_seed?, environment_json | BIGINT / JSONB object | Р: воспроизводимость |
| input_manifest_sha256?, feature_schema_sha256? | VARCHAR(64) | Р: контроль входа и схемы |
| target_definition_json | JSONB object DEFAULT {} | Р: единицы, смысл, допустимые значения цели |
| training_summary_json | JSONB object DEFAULT {} | Р: iterations, converged, stopping reason, loss, fitted model size |
| performance_json | JSONB object DEFAULT {} | Р: времена, CPU/RAM и измерительный scope |
| feature_importance_json? | JSONB | Р: доступные по модели коэффициенты/важности, метод и ограничения |
| threshold_selection_json? | JSONB object | Р: метод выбора на validation, цель оптимизации |
| prediction_rows?, artifact_size_bytes? | BIGINT | Р: количество и размер |
| artifacts_manifest_json | JSONB object DEFAULT {} | Р: learning curves, evaluation, split manifest, logs |
| request_id?, client_run_key? | UUID / VARCHAR(100) | Р: корреляция/идемпотентность |

metrics: для classification — confusion matrix, precision/recall/F1, support, ROC-AUC/PR-AUC при применимости, class balance; для regression — MAE/MSE/RMSE/R² и ошибки по группам. Каждая метрика имеет split и sample_count; undefined хранится как NULL с reason, не NaN и не фиктивный 0. Метрики test не используют для подбора threshold или гиперпараметров.

Весы, коэффициенты, scaler, дерево со всеми узлами, learning curves по итерациям, версии и split manifest сохраняются полностью в артефактах. Большие кривые не кладём в строку эксперимента. feature importance не является автоматическим причинным объяснением.

## 11. predictions — результат для конкретного обработанного входа

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id, experiment_id, transaction_id | BIGINT PK/FK | Б |
| processing_run_id, processed_row_id | BIGINT составные FK | Б: точная версия входа |
| task_type, split_role | VARCHAR(20) | Б: задача и часть выборки |
| risk_probability?, predicted_label? | DOUBLE PRECISION / SMALLINT | Б: classifier probability и 0/1 |
| predicted_value?, residual? | DOUBLE PRECISION | Б: regression output и actual-predicted |
| explanation_json? | JSONB object | Б: путь дерева/вклад признаков и версия метода |
| created_at | TIMESTAMPTZ | Б |
| decision_score? | DOUBLE PRECISION | Р: исходный margin/logit, если модель его имеет |
| threshold_used? | NUMERIC(8,7) | Р: точный порог принятия решения |
| actual_target_json? | JSONB | Р: снимок фактической цели, тип/значение |
| absolute_error?, squared_error? | DOUBLE PRECISION | Р: кэш производных для аналитики, с проверкой формулы |
| uncertainty_json? | JSONB object | Р: только если реализован метод оценки неопределённости |
| input_sha256? | VARCHAR(64) | Р: хеш реально поданного вектора |
| inference_batch_id? | UUID | Р: пакет вычислений |
| latency_ms? | DOUBLE PRECISION | Р: только реальное измерение на строку, не batch_time/rows |
| warning_flags_json | JSONB array DEFAULT [] | Р: пропуски, extrapolation и другие определённые проверки |

UNIQUE(experiment_id, transaction_id). В расширенной схеме predictions прямо привязывается к processed_rows: у processed_rows нужен UNIQUE(id, processing_run_id, transaction_id, dataset_id, organization_id), составной FK включает все эти поля; у ml_experiments — UNIQUE(id, processing_run_id, dataset_id, organization_id, task_type), соответствующий FK фиксирует тот же run и вид задачи. Это не позволяет подставить другую версию обработанной строки.

Classification и regression имеют взаимоисключающие формы NULL/CHECK. Все FLOAT конечны. Probability не называется «уверенностью», а uncertainty не возникает из одной probability. Новые человеческие метки/решения проверяющего не перезаписывают actual_target/source_label: для них нужен отдельный review-сценарий с историей.

## 12. reports — воспроизводимая выгрузка

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id, organization_id, dataset_id, requested_by_user_id | BIGINT PK/FK | Б |
| experiment_id? | BIGINT составной FK | Б: модель для ML-отчёта |
| type, status | VARCHAR(40) / VARCHAR(20) | Б: тип и состояние |
| filters_json | JSONB object | Б: канонические фильтры, сортировка, threshold |
| presentation_json | JSONB object | Б: формат дат/денег, курсы и timezone |
| storage_key?, file_sha256? | TEXT UNIQUE / VARCHAR(64) | Б: итоговый файл |
| row_count?, file_size_bytes? | BIGINT | Б: объём результата |
| worker_token?, heartbeat_at? | UUID / TIMESTAMPTZ | Б |
| error_code?, error_message? | VARCHAR(100) / TEXT | Б |
| created_at, started_at?, completed_at? | TIMESTAMPTZ | Б |
| processing_run_id? | BIGINT составной FK | Р: версия данных для экспорта processed |
| name?, format | VARCHAR(200) / VARCHAR(20) | Р: имя и csv/xlsx/pdf при реализации |
| report_version | VARCHAR(40) | Р: версия генератора/шаблона |
| selected_columns_json | JSONB array | Р: порядок, названия, типы и происхождение колонок |
| input_manifest_sha256? | VARCHAR(64) | Р: снимок входных идентификаторов |
| metrics_snapshot_json? | JSONB object | Р: числа, вошедшие в отчёт |
| content_type?, encoding?, delimiter? | VARCHAR(100) / VARCHAR(40) / VARCHAR(4) | Р: контракт файла |
| csv_sanitization_json | JSONB object DEFAULT {} | Р: политика защиты формул и количество изменённых ячеек |
| performance_json | JSONB object DEFAULT {} | Р: длительность, байты, память |
| request_id?, client_report_key? | UUID / VARCHAR(100) | Р: корреляция/идемпотентность |

Если заданы experiment_id и processing_run_id, их совпадение проверяется составным FK на (experiment_id, processing_run_id, dataset_id, organization_id); если один NULL, отдельные FK всё равно проверяют оставшийся контекст. Отчёт хранит артефакт, а не только параметры повторного запроса. Скачивания добавляют audit event; download_count при необходимости лишь кэш, не история скачиваний. Автоматический expires_at не вводим: владелец попросил сохранять результаты.

## 13. audit_events — неизменяемая история действий

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id | BIGINT PK | Б |
| organization_id?, actor_user_id? | BIGINT FK | Б: контекст и пользователь |
| action, resource_type, resource_id? | VARCHAR(80) / VARCHAR(50) / BIGINT | Б: действие и объект |
| details_json | JSONB object | Б: разрешённые метаданные |
| created_at | TIMESTAMPTZ | Б: запись в журнал |
| occurred_at | TIMESTAMPTZ | Р: время фактического события |
| actor_type | VARCHAR(20) | Р: user / worker / system |
| actor_service? | VARCHAR(100) | Р: идентификатор сервиса/worker |
| outcome | VARCHAR(20) | Р: succeeded / failed / denied |
| error_code? | VARCHAR(100) | Р: причина отказа/ошибки |
| request_id?, correlation_id? | UUID | Р: объединение событий операции |
| source_ip?, user_agent? | INET / TEXT | Р: только при нужном сценарии аудита |
| changed_fields_json? | JSONB object | Р: разрешённые before/after значения |
| event_schema_version | VARCHAR(40) | Р: контракт события |

Данные аудита не редактирует обычный API; для приложения можно разделить права INSERT и UPDATE/DELETE. Не сохраняем пароли/токены/полные финансовые строки, даже в changed_fields. Для отказа доступа organization_id берётся из проверенного контекста, а не автоматически из чужого ID клиента. Audit не обещает криптографическую защиту от администратора БД; она требует отдельной архитектуры хранения.

## 14. exchange_rates — курс и происхождение ответа

| Колонки | Тип | Уровень и назначение |
|---|---|---|
| id | BIGINT PK | Б |
| provider, currency, quote_currency | VARCHAR(30) / VARCHAR(3) / VARCHAR(3) | Б: источник и валютная пара |
| rate_date | DATE | Б: дата действия курса |
| nominal, value | NUMERIC(28,8) / NUMERIC(28,12) | Б: стоимость nominal единиц; оба > 0 |
| fetched_at, source_url | TIMESTAMPTZ / TEXT | Б: получение и источник |
| source_revision_sha256 | VARCHAR(64) | Р: версия полного ответа источника |
| source_payload_key?, source_payload_sha256? | TEXT / VARCHAR(64) | Р: сохранённый исходный ответ |
| provider_currency_id?, currency_name? | VARCHAR(80) / VARCHAR(150) | Р: идентификатор/название источника |
| published_at?, supersedes_rate_id? | TIMESTAMPTZ / BIGINT FK exchange_rates | Р: публикация и исправленная версия |
| fetch_request_id?, parser_version? | UUID / VARCHAR(40) | Р: происхождение разбора |
| response_metadata_json | JSONB object DEFAULT {} | Р: разрешённые HTTP метаданные и длительность |

Для полного хранения исправлений меняем ранний UNIQUE(provider,currency,quote_currency,rate_date) на UNIQUE(provider,currency,quote_currency,rate_date,source_revision_sha256). Для этой версии source_revision_sha256 становится обязательным. Новое значение курса создаёт новую строку; старые отчёты ссылаются на старый ID и снимок nominal/value. supersedes_rate_id проверяет ту же валютную пару/дату в сервисе. Полученные ответы сохраняются побайтно с хешем; повторная проверка того же ответа не создаёт новый курс, история запросов при необходимости хранится отдельно. RUB→RUB можно считать единичной конверсией без фиктивного внешнего ответа.

## 15. auth_sessions — сессия входа

| Колонка | Тип / ограничение | Назначение |
|---|---|---|
| id | UUID PK, серверная генерация | Семейство токенов/ID входа |
| user_id | BIGINT FK users.id NOT NULL, RESTRICT | Владелец |
| auth_version_at_creation | INTEGER NOT NULL | Версия users.auth_version при входе |
| created_at | TIMESTAMPTZ NOT NULL | Начало сессии |
| absolute_expires_at | TIMESTAMPTZ NOT NULL | Непереносимый предельный срок |
| idle_expires_at | TIMESTAMPTZ NOT NULL | Предел по неактивности |
| last_seen_at | TIMESTAMPTZ NOT NULL | Последний авторизованный запрос; обновление можно ограничить разом в минуту |
| last_refreshed_at | TIMESTAMPTZ NOT NULL | Последняя успешная ротация или login |
| revoked_at? | TIMESTAMPTZ | Когда отозвали |
| revocation_reason? | VARCHAR(80) | logout / logout_all / password_changed / account_blocked / refresh_reuse / user_revoked |
| revoked_by_user_id? | BIGINT FK users.id | Кто отозвал, NULL для автоматики |
| csrf_nonce | UUID NOT NULL | Несекретная привязка CSRF к сессии |
| login_method | VARCHAR(30) NOT NULL DEFAULT password | Способ входа |
| device_label? | VARCHAR(150) | Подпись для списка устройств; не доказательство личности |
| user_agent? | TEXT | Клиент при входе, с ограничением размера |
| created_ip?, last_seen_ip? | INET | Наблюдаемые адреса, если этот сбор включён |
| login_request_id? | UUID | Корреляция запроса входа |

Ограничения, ротация, сроки, CSRF и API: [AUTH_ARCHITECTURE.md](AUTH_ARCHITECTURE.md).

## 16. auth_refresh_tokens — неизменяемые поколения refresh

| Колонка | Тип / ограничение | Назначение |
|---|---|---|
| id | UUID PK | ID выпуска, не секрет |
| session_id | UUID FK auth_sessions.id NOT NULL, RESTRICT | Семейство |
| token_digest | BYTEA NOT NULL UNIQUE; длина 32 | SHA-256 секрета |
| generation | INTEGER NOT NULL >= 0 | Порядковый номер, первый 0 |
| parent_token_id? | UUID | Предыдущее поколение |
| issued_at | TIMESTAMPTZ NOT NULL | Выпуск |
| expires_at | TIMESTAMPTZ NOT NULL | Срок этого поколения |
| consumed_at? | TIMESTAMPTZ | Когда один раз обменяли |
| revoked_at? | TIMESTAMPTZ | Явный отзыв текущего поколения |
| revocation_reason? | VARCHAR(80) | Причина |
| issued_request_id? | UUID | Запрос выпуска |
| consumed_request_id? | UUID | Запрос обмена |

Ограничения, ротация, сроки, CSRF и API: [AUTH_ARCHITECTURE.md](AUTH_ARCHITECTURE.md).

## Хранение истории без бесконечных JSON-массивов

16 таблиц описывают аналитический сценарий и сессии авторизации, но полную историю повторных попыток обработки нельзя представить только last_error и heartbeat. Для запуска «серьёзной» версии рекомендуются следующие точечные расширения; это отдельные таблицы в той же БД:

| Таблица | Когда нужна | Ключевые поля |
|---|---|---|
| job_attempts | Полная история импорта/обработки/ML/экспорта | id, organization_id, dataset_id, kind, dataset_job_id?/processing_run_id?/experiment_id?/report_id?, attempt_number, worker_token, worker_name, queued_at, started_at, heartbeat_at, completed_at, status, error_code, error_message, performance_json, artifacts_manifest_json |
| artifacts | Много файлов и единая проверка ссылок | id, organization_id?, dataset_id?, kind, storage_key UNIQUE, sha256, size_bytes, format, schema_version, created_at; владельцы связываются явными FK/association tables |
| processing_step_results | Запросы и сравнение каждого шага обработки | id, organization_id, dataset_id, processing_run_id, step_id, ordinal, step_type, step_version, config_json, fitted_parameters_json, input_schema_json, output_schema_json, metrics_json, artifact_key, artifact_sha256, started_at, completed_at, status |
| auth_verification_tokens | При реализации восстановления пароля/подтверждения контактов | id, user_id, purpose, token_digest, created_at, expires_at, consumed_at; не заменяет refresh tokens |

У job_attempts ровно одна job-ссылка ненулевая (CHECK); реальные FK и составные связи проверяют tenant/dataset. dataset_job_id может ссылаться на тот же datasets.id: имя явно отличает предметный dataset от задания импорта. UNIQUE(job_reference, attempt_number) реализуется отдельными частичными UNIQUE по каждому типу. Тип задания и выбранная ссылка согласованы CHECK. Не использовать resource_type/resource_id без FK для рабочих задач; такая историческая ссылка допустима только в audit.

Без этих расширений полная информация об отдельных попытках и шагах должна сохраняться неизменяемыми файловыми manifests, ссылки на них — в audit events и artifacts_manifest_json. Успешные версии не удаляются. Технические временные файлы, бесконечные повторяющиеся heartbeat и секреты не входят в обещание хранить все предметные данные.

## Правила полноты и проверка будущей реализации

1. Сохранён оригинал и подтверждён его хеш; каждая доступная разобранная запись сохранена до фильтрации.
2. Невалидные записи остаются в raw. Исправления не маскируются под исходные значения.
3. Каждое изменение имеет run/step/version; финальная строка и промежуточные изменения восстанавливаются по manifest/trace.
4. Каждый прогноз связан с экспериментом и конкретным processed_row той же версии; каждый отчёт — с неизменяемым снимком входов.
5. Любая измеренная метрика имеет единицы, метод, версию и scope; не измерено → NULL, а не 0.
6. JSON, manifest и SHA-256 сериализация имеют явные версии. Хеш списка признаков без указания их порядка не подтверждает вход модели.
7. Файловое хранилище и БД резервируются вместе; отдельно проверяется восстановление связей и артефактов.
8. Итоговые CHECK, FK, nullable/defaults и миграции проверяются на PostgreSQL. Этот документ — проект контракта, тесты и изменения БД сейчас не выполнялись.
