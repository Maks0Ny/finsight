from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from core.config import settings
from collections.abc import Iterator

# Создание подключения к базе данных c логгирвоанием SQL-запросов
engine = create_engine(settings.db_url(), 
                       echo=True,
                       pool_pre_ping=True,
                       )

# Создание фабрики сессий для работы с базой данных
SessionLocal = sessionmaker(
    bind=engine,  # Указывает, через какое подключение работать с PostgreSQL
    autoflush=False, # Отключает автоматическую фиксацию изменений в базе данных при каждом запросе
    expire_on_commit=False, # Отключает автоматическое удаление объектов из сессии после фиксации изменений в базе данных
)


# Функция для получения сессии базы данных
def get_session() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session