from flask import Flask, jsonify, request
from flask_cors import CORS

from dss_core import rank_tours
from tours_loader import load_tours
from auth import authenticate_user, register_user

app = Flask(__name__)
CORS(app)


@app.route("/api/tours", methods=["GET"])
def get_tours():
    tours = load_tours()
    return jsonify(tours)


@app.route("/api/rank", methods=["POST"])
def rank_endpoint():
    data = request.get_json()

    tours = load_tours()
    ranked = rank_tours(tours, data)

    return jsonify(ranked)


@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not name or not email or not password:
        return jsonify({"error": "Thiếu thông tin đăng ký"}), 400

    try:
        user = register_user(name, email, password)
    except ValueError as exc:
        return jsonify({"error": str(exc)}), 400

    return jsonify({"message": "Đăng ký thành công", "user": user})


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Thiếu email hoặc mật khẩu"}), 400

    user = authenticate_user(email, password)
    if not user:
        return jsonify({"error": "Sai email hoặc mật khẩu"}), 401

    return jsonify({"message": "Đăng nhập thành công", "user": user})


if __name__ == "__main__":
    app.run(debug=True)
