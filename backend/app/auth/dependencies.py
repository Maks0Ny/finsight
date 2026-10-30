from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database.session import get_session

from ..users.models import User
from ..users.repository import get_user_by_id

from .errors import InvalidAccessTokenError
from .security import get_user_id_from_access_token

bearer_scheme = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_session),
) -> User:
    
    user_id = get_user_id_from_access_token(credentials.credentials)
    user = get_user_by_id(db, user_id)

    if user is None:
        raise InvalidAccessTokenError()

    return user
    