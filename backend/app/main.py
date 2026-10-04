from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from backend.app.health.router import router as health_router
from backend.app.users.router import router as user_router
from backend.app.auth.router import router as auth_router
from backend.app.users.errors import AppError



app = FastAPI(title="API")
app.include_router(health_router)
app.include_router(user_router)
app.include_router(auth_router)


@app.exception_handler(AppError) # если возникает эта ошибка, то вызываем обработчик
async def handle_app_error(
    request: Request, 
    exc: AppError
):
    return JSONResponse(
        status_code = exc.status_code,
        content={"detail": exc.detail}
    )