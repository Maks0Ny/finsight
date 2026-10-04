# FinSight: авторизация, сессии и refresh-токены

Дата: 03.10.2026. Статус: проектный контракт; код и миграции не изменены.
Этот документ заменяет упрощённое предложение хранить refresh_token_hash прямо в auth_sessions. Сессия и история поколений токена разделяются: auth_sessions + auth_refresh_tokens. Основная архитектура теперь включает 16 таблиц, если реализуется полноценная авторизация.

Регистрация владельца, профиль и статусы User описаны в [USERS_ARCHITECTURE.md](USERS_ARCHITECTURE.md). Основной POST /auth/register создаёт User + первую Organization + owner Membership в одной транзакции; затем отдельный login выдаёт сессию.

## 1. Что уже есть и чего нет

В requirements уже указаны PyJWT и pwdlib[argon2]. В текущем users.service.register_user password_hash присваивается константа 1234567890, а не хеш. Нет login, проверки пароля, выдачи токенов, middleware/dependency авторизации и таблиц сессий. GET /users/{user_id} сейчас не требует аутентификации. Наличие библиотек не означает реализованную безопасность.

До использования с реальными пользователями заменить заглушку настоящим хешированием и защитить профильные API. Этот документ описывает реализацию, а не результат проверки защищённости проекта.

## 2. Решения для FinSight

| Объект | Решение |
|---|---|
| Access token | Подписанный JWT, живёт 10 минут; выдаётся JSON-ответом, хранится в памяти Frontend |
| Refresh token | Непрозрачный случайный секрет, 32 случайных байта CSPRNG → base64url; не JWT |
| Секрет refresh на клиенте | HttpOnly cookie, Secure в production, host-only, SameSite=Lax |
| Секрет refresh на сервере | Только SHA-256 точного ASCII-представления токена, BYTEA 32 байта |
| Ротация | Каждое успешное обновление создаёт новый refresh; старый помечается использованным |
| Семейство токенов | Одна auth_session — одно семейство, отдельное для каждого входа |
| Неактивность | 7 дней с последнего успешного login/refresh |
| Абсолютный срок | 30 дней с создания; ротация не переносит этот предел |
| Немедленный отзыв | Проверка session/user в PostgreSQL на каждом защищённом запросе |
| Роли | Проверять текущий membership, не брать права из долгоживущего JWT |

Сроки — предлагаемые настройки продукта, не нормативное требование. Для MVP нет remember_me: одинаковая политика для всех. Отдельные устройства — фактически отдельные входы/профили браузера, не гарантированная аппаратная идентификация.

SHA-256 подходит здесь для высокоэнтропийного случайного секрета. Пароли имеют другую природу и хешируются Argon2id через библиотеку. Не применять SHA-256 к паролю. Хеши refresh не возвращаются клиенту и не пишутся в логи.

## 3. auth_sessions — сессия входа

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

Не дублируем active/is_active/status: активность вычисляется по revoked_at, срокам и users.status/auth_version. Не связываем с одной организацией: человек выбирает организацию внутри своего аккаунта.

CHECK: created_at < absolute_expires_at; created_at <= idle_expires_at <= absolute_expires_at; даты last_seen/last_refreshed не раньше created_at; revoked_at и revocation_reason согласованы. Оценка NOW() не помещается в частичный индекс «активная сессия»: в индекс входит revoked_at IS NULL, сроки фильтруются запросом.

Индекс (user_id, created_at DESC, id) для списка; частичный (user_id, absolute_expires_at) WHERE revoked_at IS NULL для управления ещё не отозванными сессиями. IP/UA — подсказки и диагностика, не жёсткая привязка токена: они могут изменяться.

## 4. auth_refresh_tokens — неизменяемые поколения refresh

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

UNIQUE(session_id, generation), UNIQUE(id, session_id). Составной FK(parent_token_id, session_id) → auth_refresh_tokens(id, session_id) защищает семейство. Частичный UNIQUE(parent_token_id) WHERE parent_token_id IS NOT NULL запрещает двух детей одного выпуска. CHECK parent_token_id != id; generation=0 ⇔ parent_token_id IS NULL; expires_at > issued_at; consumed/revoked не раньше issued_at.

Частичный UNIQUE(session_id) WHERE consumed_at IS NULL AND revoked_at IS NULL гарантирует не больше одного необработанного поколения. Даже истёкший текущий токен попадает в этот индекс: его нельзя обходить, создавая новый выпуск без login. При ротации сначала помечаем старый consumed, затем вставляем новый в одной транзакции.

Связь generation = parent.generation+1, соответствие сроков сессии и active state проверяются сервисом под блокировкой. Генерации и хеши не меняются; consumed/revoked — однократные переходы. Историю старых digest сохраняем до абсолютного конца семейства и установленного срока расследования, иначе исчезает возможность сопоставить повторный токен.

Истёкшее семейство в любом случае запрещено. Предложение для retention auth-метаданных: 90 дней после окончания/отзыва, настраиваемо. Это отдельная политика от бессрочного сохранения финансовых версий; сырые секреты не сохраняются никогда.

## 5. Access JWT и текущая проверка доступа

Предлагаем HS256 для одного Backend. JWT_SIGNING_KEY — отдельный случайный секрет минимум 32 байта вне репозитория; JWT_CSRF_KEY — другой секрет. Несколько независимых сервисов с правом проверки токенов потребуют отдельного решения об асимметричных ключах.

Claims: sub=str(user.id), sid=str(session.id), ver=users.auth_version, jti=UUID, iss=finsight-auth, aud=finsight-api, iat, nbf, exp, token_type=access. alg фиксируется в конфигурации verifier, не выбирается из входного токена. Header typ=JWT; обязательность claims, UUID/int типы и token_type проверяются явно. JWT не содержит password_hash, refresh digest, email, финансовые поля и снимки ролей.

Dependency проверяет подпись/issuer/audience/время с ограниченным clock skew 30 секунд, затем users.status=active, auth_version=ver=auth_version_at_creation, session.user_id=sub, отсутствие revoked_at и действующие абсолютный/idle сроки. exp не превышает absolute_expires_at; idle срок проверяется отдельно. Это stateful авторизация несмотря на JWT: именно она даёт отзыв следующего запроса без ожидания 10 минут. При недоступной БД возвращаем 503 и не выдаём доступ.

Для действия в организации отдельно проверяются текущие organization.status и active membership/role по контракту ORGANIZATIONS_ARCHITECTURE.md: archived допускает прежние чтения по роли, suspended закрывает финансовые данные, новые задания требуют active. user A не может отозвать или прочитать сессию user B по одному UUID. Смена роли действует на следующий запрос. Повторная проверка прав нужна при выполнении чувствительной операции, если она могла долго ждать выполнения.

Отзыв не отменяет автоматически уже выполняющийся запрос или фоновую задачу: для них определяется проверка перед критической записью/публикацией. Идентификатор сессии может сохраняться в audit details; bearer JWT не сохраняется.

## 6. Cookie, browser и CSRF

В production предлагаем общий origin Frontend/API через reverse proxy и HTTPS. Cookie: __Host-finsight_refresh; Secure; HttpOnly; SameSite=Lax; Path=/; без Domain. Префикс __Host требует Path=/, поэтому нельзя одновременно обещать ему Path=/api/v1/auth. Max-Age — остаток срока текущего refresh. Cookie обновляется только после успешного DB commit. Удаление использует то же имя/Path/Domain-контракт. Для HTTP разработки — отдельное непроизводственное имя и настройки; production запрещает insecure cookie.

Frontend держит access только в памяти, передаёт Authorization: Bearer. После reload выполняет bootstrap /auth/csrf → /auth/refresh → /auth/me. credentials: include для cookie endpoints. В localStorage допустимы тема/выбор организации, не токены. Cookie/CORS не устраняют XSS: код внутри origin всё ещё может делать действия пользователя.

CSRF-контракт:

1. Login/register принимают application/json и специальный заголовок X-FinSight-Client: web. Проверяют точное совпадение Origin с allowlist; null/отсутствующий origin для cookie browser flow отвергается. Это защищает также от login CSRF. Не принимать вход через GET или form-urlencoded.
2. GET /auth/csrf читает текущую refresh cookie, по digest находит семейство и проверяет user, сессию, сроки и состояние поколения. Он не ротирует token, не продлевает idle. Ответ no-store содержит HMAC-SHA256(CSRF_KEY, version || session.id || csrf_nonce), base64url, хранится в памяти Frontend. Формат сообщения однозначен и версионирован. endpoint не разрешён чужим origins через CORS.
3. Refresh/logout, если используют cookie, требуют Origin, application/json, X-FinSight-CSRF с вычисленным значением, constant-time сравнение. CSRF nonce живёт до конца семейства и не меняется при каждом refresh, чтобы вкладки могли его использовать.
4. GET /csrf допускает распознанный использованный токен непросроченного активного семейства только для получения CSRF challenge; доступ к данным и refresh это не даёт. Это позволяет дойти до явного replay detection на POST /refresh при предъявлении старого токена. Replay требует реальный digest и валидный CSRF/Origin, а не только session UUID.
5. Для иных изменяющих cookie-auth endpoint применяются те же правила. Bearer-only endpoint не подхватывает refresh cookie как альтернативное удостоверение.

CORS: production same-origin; dev явный список frontend origins, allow_credentials=true, конкретные методы/headers. Нельзя wildcard origins с credentials. Не полагаться только на SameSite. Для auth-ответов Cache-Control: no-store; не логировать Authorization/Cookie/Set-Cookie и тело с паролем.

Если истёкшая cookie не позволяет получить CSRF, клиент очищает локальный access и идёт на login. Следующий успешный login заменяет cookie; очистка недействительной cookie может выполняться как часть проверенного same-origin login/refresh запроса без изменения чужих сессий.

## 7. Атомарный login

1. Проверить JSON/Origin/header, лимиты длины и rate limit, нормализовать email.
2. Проверить пароль Argon2id. Для несуществующего пользователя выполнить проверку dummy hash; наружу общий auth_invalid_credentials без раскрытия существования email. Нельзя обещать абсолютно одинаковое время ответа: проверка лишь уменьшает очевидную разницу.
3. Дорогую проверку пароля проводить до блокировок. Затем BEGIN, блокировать user FOR UPDATE, повторно проверить status/auth_version и совпадение версии проверенного password_hash/password_changed_at. При изменении во время проверки — повторить проверку вне транзакции или отказать.
4. Создать новую session, generation=0, случайный секрет и digest; срок refresh=min(now+7d, absolute_expires_at). Обновить last_login_at. Событие auth.login_succeeded в том же commit.
5. После commit вернуть access и Set-Cookie. Refresh никогда не помещается в JSON ответа.

Имеющуюся cookie при новом входе желательно отозвать, если она корректно распознаётся, чтобы не оставлять забытый вход в том же профиле браузера. Если это сессия другого пользователя, блокировки users берутся в порядке ID, затем sessions в порядке UUID; не нарушать порядок из раздела 8. Другие устройства сохраняются.

## 8. Атомарная ротация и повторное использование

Все auth mutations используют один порядок блокировок: user → session → token. Из digest первоначально читаются IDs без блокировки, затем user FOR UPDATE, session FOR UPDATE, token FOR UPDATE и повторная проверка неизменяемых связей. Logout-all берёт user, затем sessions по UUID. Это сериализует refresh, logout, смену пароля и блокировку аккаунта; для масштаба протокол можно уточнить позже.

Refresh:

1. Проверить Origin/CSRF/content-type/rate limit/ограниченную длину и canonical format opaque token. Найти digest. Не найден → 401, без отзыва произвольных сессий.
2. Под блокировками проверить user/status/auth_version, сессию и сроки. Отозванная/истёкшая session → 401.
3. Если token.consumed_at уже задан — отозвать всё семейство auth_sessions.revoked_at/reason=refresh_reuse и текущий необработанный token; записать audit. COMMIT этого отзыва, затем вернуть 401. Не бросать исключение внутри unit-of-work так, чтобы оно откатило отзыв.
4. Если токен явно revoked/expired — отказ, без выпуска нового. Проверка consumed выполняется для действующего семейства даже если старое поколение уже expired: повтор должен быть наблюдаемым.
5. Для свежего поколения пометить consumed_at, создать generation+1 с parent_token_id, expires_at=min(now+7d, absolute_expires_at). Обновить idle_expires_at и last_refreshed_at. Создать событие auth.refresh_rotated, COMMIT.
6. Вернуть новый access и новую refresh cookie. Ошибка БД до commit откатывает все изменения, токен остаётся пригодным. Ошибка доставки после commit — отдельный случай ниже.

Сессия — семейство; отдельная family_id не нужна. Revoked_at сессии немедленно инвалидирует все access/refresh семейства, даже если исторические consumed строки отдельно не обновляются.

## 9. Параллельные запросы и потеря ответа

Выбрана строгая одноразовая ротация, без grace window. Два запроса с одним поколением: первый ротирует, второй после блокировки видит consumed и отзывает семейство. Даже победивший access больше не проходит stateful проверку. Сервер не может надёжно отличить добросовестный дубль от украденного токена только по IP/UA.

Frontend обязан иметь single-flight refresh в одной вкладке и общий coordinator между вкладками. После захвата межвкладочной блокировки cookie берётся браузером в момент отправки запроса; не сохраняется JS. Каждая вкладка может последовательно получить свой access с актуальной cookie; старые access остаются рабочими до exp, пока session не отозвана. Logout сообщает другим вкладкам, чтобы они очистили память. Одновременные login/logout/refresh тоже координируются.

После network timeout не повторять тот же refresh автоматически: commit мог состояться, а новый Set-Cookie не дойти. Пользователь возвращается на login; корректный login может отозвать распознанное старое семейство. Это известный UX-компромисс. Если позже нужен прозрачный retry, отдельно проектируется краткоживущий idempotency cache с защищённым хранением ответа/секрета; одних digest для повторной выдачи прежнего нового токена недостаточно. Не принимать spent token повторно без такого протокола.

Повтор исходного business запроса после refresh — максимум один раз. Автоматически воспроизводим чтения; записи/загрузки только когда 401 сформирован auth dependency до действия либо endpoint имеет ключ идемпотентности и сохранённое тело. Не дублировать импорт из-за неопределённого результата сетевого запроса.

## 10. Logout, пароль и управление устройствами

- Logout текущей сессии: cookie + CSRF или валидный Bearer, в соответствии с явно выбранным endpoint contract; отозвать только текущую session, очистить cookie и access. Повторный logout отвечает 204; отсутствующая/неизвестная cookie не отзывает другие сессии.
- Logout-all: валидный access, повторная проверка пароля для чувствительного действия; под блокировкой user увеличить auth_version, отозвать все сессии и текущие refresh, COMMIT, очистить cookie.
- Удаление одного устройства: валидный access, user_id ownership; отзыв выбранной session. Если она текущая, очистить cookie/память; для чужого ID не раскрывать владельца.
- Смена пароля: проверить старый пароль, повторная проверка версии под user lock, заменить Argon2 hash, password_changed_at, auth_version++, отозвать все сессии. Простой первый сценарий требует нового входа, не оставляет исключение для текущей сессии.
- Восстановление пароля: отдельные одноразовые высокоэнтропийные verification tokens, digest/expiry/consumed, rate limit и доставка. Это не refresh token; отдельная таблица auth_verification_tokens вводится только с реализацией восстановления/подтверждения email.
- Блокировка аккаунта: user.status и auth_version меняются вместе с отзывом сессий; правило последнего активного owner из основной архитектуры сохраняется. Для совместных user/org изменений общий порядок user → organizations по ID → sessions; membership операции не должны брать user после organization.
- Повторный refresh обновляет idle срок; обычные business requests меняют last_seen, но не продлевают refresh idle. Это явная политика, а не два противоречащих способа отсчёта.

## 11. HTTP-контракты

Все маршруты ниже — /api/v1; auth router нельзя считать уже подключённым.

| Маршрут | Авторизация/вход | Результат |
|---|---|---|
| POST /auth/login | email/password, Origin/client header | 200 access_token, token_type, expires_in, session_id; refresh Set-Cookie |
| GET /auth/csrf | Refresh cookie; origin allowlist | 200 csrf_token; без ротации |
| POST /auth/refresh | Cookie + Origin + CSRF; JSON {} | 200 новый access и Set-Cookie |
| POST /auth/logout | Cookie + Origin + CSRF; JSON {} | 204, отзыв текущей сессии и очистка cookie |
| POST /auth/logout-all | Bearer + current_password; Origin/client header | 204, глобальный отзыв и очистка cookie |
| GET /auth/me | Bearer | Профиль без секретов и memberships |
| GET /auth/sessions | Bearer | Пагинируемый список своих сессий, is_current и вычисленный статус |
| DELETE /auth/sessions/{id} | Bearer, ownership | 204, отзыв выбранной сессии |
| POST /auth/change-password | Bearer + current_password/new_password | 204, смена пароля и глобальный отзыв |

Browser cookie logout при утраченном access всё ещё доступен, если refresh/session действуют. Истёкшая/отозванная session не продлевается ради logout; можно вернуть 204 и очистить cookie после same-origin/client-header проверки без изменения DB. Для действующей session CSRF обязателен. Logout-all требует рабочий access; при необходимости получить его через refresh.

Ошибки: 401 auth_invalid_credentials / access_expired / session_invalid; 403 csrf_invalid / origin_denied / permission_denied; 429 rate_limited; 503 auth_unavailable. Frontend обновляет access только при access_expired, а не при каждом 401/403. Не выдавать клиенту внутренние digest/stacktrace. Пользовательская форма invalid credentials не раскрывает существование аккаунта.

Session Read: id, device_label, user_agent summary, created_at, last_seen_at, absolute_expires_at, idle_expires_at, revoked_at, safe reason, is_current. Ни token_digest, ни CSRF nonce, ни полный IP по умолчанию не входят в ответ.

## 12. Rate limit, конфигурация, аудит

Предлагаемые начальные лимиты, настройка по измерениям: login 5 попыток/минуту на нормализованный аккаунт и 20/минуту на наблюдаемый IP; refresh 30/минуту на session плюс внешний IP-лимит; GET csrf также лимитируется. Пределы не являются гарантией от атак. Для нескольких worker лимиты должны иметь общее хранилище/reverse proxy, не отдельный Python dict процесса. Постоянной блокировки аккаунта за неуспешные попытки по умолчанию нет; можно иначе устроить отказ в обслуживании чужому пользователю.

Настройки: ACCESS_TOKEN_TTL_SECONDS=600; REFRESH_IDLE_TTL_SECONDS=604800; SESSION_ABSOLUTE_TTL_SECONDS=2592000; JWT_SIGNING_KEY; JWT_CSRF_KEY; JWT_ISSUER; JWT_AUDIENCE; JWT_ALLOWED_ALGORITHM; AUTH_ALLOWED_ORIGINS; cookie name/security flags; AUTH_METADATA_RETENTION_DAYS=90. Секреты берутся из environment/secret storage, не дефолтное значение и не БД. Ротация signing key требует версионированного набора доверенных ключей и bounded kid lookup; неизвестный kid не обращается к произвольному URL. CSRF key rotation предусматривает получение нового challenge, а не бессрочное принятие старых ключей.

Audit actions: auth.login_succeeded, auth.login_failed, auth.refresh_rotated, auth.refresh_reuse_detected, auth.session_revoked, auth.logout_all, auth.password_changed, auth.account_blocked. details: session_id, token record id/generation (не secret/digest), reason, request_id. failed login не создаёт запись для каждой бесконечной внешней попытки без лимита: лимиты/агрегация защищают журнал от переполнения.

Login/signup/password requests не логируют тело. Не сохранять токены в URL/query параметрах, error monitoring, трассировках и body audit. IP от reverse proxy доверять только явно разрешённым proxy, а не любому X-Forwarded-For. В MVP нет device fingerprinting.

## 13. Границы модулей и порядок реализации

backend/app/auth/models.py — обе таблицы; schemas.py — контракты; passwords.py — Argon2; access_tokens.py — JWT; refresh_tokens.py — CSPRNG/digest; csrf.py — challenge; repository.py — выборки/блокировки без commit; service.py — unit-of-work и lifecycle; dependencies.py — текущие user/session/права; cookies.py — Set/Clear; router.py — HTTP. Session commit выполняет сервис, иначе атомарные auth изменения распадутся на независимые операции.

Frontend: один API client; access в памяти; bootstrap; refresh coordinator; auth error mapping; page устройств; logout notifications. Переключение организаций не требует новых токенов, доступ проверяется по membership.

Порядок:
1. Воспроизводимые миграции users, настоящий password hash и status/auth_version.
2. auth_sessions/auth_refresh_tokens, FK/CHECK/индексы.
3. Login + защищённый me + stateful JWT verification.
4. Cookies/Origin/CSRF + refresh транзакция.
5. Frontend coordinator, timeout/401 handling.
6. Logout/devices/logout-all/change-password.
7. Rate limit, secret config, audit/redaction и production HTTPS.

## 14. Проверки перед реальным использованием

| Сценарий | Ожидаемый результат |
|---|---|
| Неверный/несуществующий email и пароль | Общий отказ, нет сессии |
| Корректный вход | Argon2 проверен, одна session и generation=0, refresh только cookie |
| Успешный refresh | Старый consumed, один новый child, текущий refresh единственный |
| Два параллельных refresh | Одно создание child, затем семейство отозвано при replay |
| Replay использованного поколения | Отзыв COMMIT сохраняется, все access семьи отвергаются |
| Неизвестный токен или подставленный session ID | Отказ без отзыва чужого семейства |
| Истечение idle/absolute | Отказ; ротация не переносит absolute |
| Logout-all vs refresh/login | Согласованные блокировки; нет session со старым auth_version после завершённого отзыва |
| Password change vs login | Проверенный старый пароль не создаёт сессию после смены без повторной проверки |
| Чужая сессия в API устройств | Нет чтения/отзыва |
| JWT неверный alg/iss/aud/claims | Отказ до доступа к данным |
| Утрата прав организации | Следующий бизнес-запрос запрещён |
| CSRF, чужой/null Origin, simple form | Отказ, сессия не ротирована и не отозвана |
| Недоступна БД / rollback до commit | 503, нет частичной ротации/выдачи cookie |
| Commit есть, ответ потерян | Нет автоматического replay, предусмотрен новый login |
| Несколько вкладок/reload | Общий coordinator; токены не в web storage |
| Логи, session read, ошибки | Нет plaintext refresh/password/JWT/digest |

Эти тесты требуют реальной PostgreSQL для конкурентных блокировок/индексов и браузерных проверок для cookie/CORS/CSRF. Сейчас это план верификации; auth реализация не выполнялась.

## Основания решений

Используем принцип refresh rotation и отзыва семейства при повторе из [RFC 9700, §4.14.2](https://www.rfc-editor.org/rfc/rfc9700.html#section-4.14.2). FinSight здесь проектируется как собственное first-party приложение, а не как полностью совместимый OAuth authorization server; grant=password OAuth не вводится.

Cookie атрибуты и отделение браузерного хранения секретов от web storage опираются на [OWASP Session Management](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html). Дополнительные сроки и stateful JWT проверки — наши решения для продукта.

Защита запросов сочетает origin validation, custom headers и session-bound CSRF challenge; SameSite не является единственным механизмом. Основа: [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html). Конкретный HMAC-контракт и bootstrap определены этим проектом и требуют тестов.
