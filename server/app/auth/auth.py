from app.auth import auth_bp
from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user




@auth_bp.route('/check-auth')
def check_auth():
    print(22)
    return jsonify(authenticated=True), 200





@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    print(username, password)
    return jsonify(message="Login successful"), 200

@auth_bp.route('/logout')
@login_required
def logout():
    logout_user()
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route('/protected')
@login_required
def protected():
    return jsonify({"message": f"Hello, {current_user.username}"}), 200
