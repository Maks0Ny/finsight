from fastapi import APIRouter

router = APIRouter(prefix="/health", tags=["Health"])


# endpoint для проверки работоспособности сервиса
@router.get("")
def health():
    return {"status": "ok"}