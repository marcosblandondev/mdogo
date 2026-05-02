import os
import pytest

@pytest.fixture(autouse=True)
def set_working_dir(monkeypatch):
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    monkeypatch.chdir(backend_dir)
