import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional

DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "users.json"


def _ensure_data_file() -> None:
    DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    if not DATA_PATH.exists():
        DATA_PATH.write_text("[]", encoding="utf-8")


def load_users() -> List[Dict[str, str]]:
    _ensure_data_file()
    try:
        content = DATA_PATH.read_text(encoding="utf-8")
        return json.loads(content or "[]")
    except json.JSONDecodeError:
        return []


def save_users(users: List[Dict[str, str]]) -> None:
    _ensure_data_file()
    DATA_PATH.write_text(json.dumps(users, ensure_ascii=False, indent=2), encoding="utf-8")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def find_user(email: str) -> Optional[Dict[str, str]]:
    users = load_users()
    for user in users:
        if user.get("email") == email:
            return user
    return None


def register_user(name: str, email: str, password: str) -> Dict[str, str]:
    users = load_users()
    if any(u.get("email") == email for u in users):
        raise ValueError("Email đã tồn tại")

    user = {"name": name, "email": email, "password": hash_password(password)}
    users.append(user)
    save_users(users)
    return {"name": name, "email": email}


def authenticate_user(email: str, password: str) -> Optional[Dict[str, str]]:
    user = find_user(email)
    if not user:
        return None

    if user.get("password") != hash_password(password):
        return None

    return {"name": user.get("name", ""), "email": user.get("email", "")}
