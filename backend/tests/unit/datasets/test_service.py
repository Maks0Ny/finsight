from types import SimpleNamespace
from unittest.mock import Mock

from backend.app.datasets import service


def test_datasets_list_returns_organization_datasets_for_analyst(monkeypatch):
    # Подменяем внешние зависимости сервиса
    session = Mock()
    organization = SimpleNamespace(status="active")
    expected_datasets = [SimpleNamespace(id=1), SimpleNamespace(id=2)]

    get_organization = Mock(return_value=organization)
    get_role = Mock(return_value="analyst")
    get_datasets = Mock(return_value=expected_datasets)

    monkeypatch.setattr(service, "get_organization_by_id", get_organization)
    monkeypatch.setattr(service, "check_role", get_role)
    monkeypatch.setattr(
        service,
        "get_datasets_by_organization_id",
        get_datasets,
    )


    result = service.datasets_list(
        session=session,
        user_id=7,
        organization_id=42,
    )

    # Проверяем и результат, и взаимодействие с зависимостями
    assert result == expected_datasets
    get_organization.assert_called_once_with(session, 42)
    get_role.assert_called_once_with(session, 7, 42)
    get_datasets.assert_called_once_with(session, 7, 42)
