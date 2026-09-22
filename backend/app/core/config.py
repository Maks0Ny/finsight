from pydantic_settings import BaseSettings, SettingsConfigDict
from sqlalchemy import URL


# Читает настройки из переменных окружения и .env, проверяет их типы и создаёт объект Setting
class Settings(BaseSettings):
    dp_host: str = "localhost"
    dp_port: int = 5432
    dp_user: str = "postgres"
    dp_password: str = "postgres"
    dp_name: str = "postgres"
    
    
    # Настройки для подключения к бд
    model_config = SettingsConfigDict(env_file=".env", 
                                      env_file_encoding="utf-8",
                                      extra="ignore")
    
    
    # Метод для создания URL подключения к базе данных PostgreSQL
    def db_url(self) -> URL:
        return URL.create(
            "postgresql+psycopg2",
            username=self.dp_user,
            password=self.dp_password,
            host=self.dp_host,
            port=self.dp_port,
            database=self.dp_name        
        )
    
    
    
    
settings = Settings()
    
    
    