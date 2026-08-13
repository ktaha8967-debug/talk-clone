import requests
import json

# Register user
try:
    r = requests.post("http://localhost:8000/api/auth/register", 
                       json={"username":"admin","email":"admin@voicestudio.ai","password":"admin123"})
    print(f"Register Status: {r.status_code}")
    print(f"Register Response: {r.text}")
except Exception as e:
    print(f"Register Error: {e}")

# Try login
try:
    r2 = requests.post("http://localhost:8000/api/auth/login",
                        json={"email":"admin@voicestudio.ai","password":"admin123"})
    print(f"Login Status: {r2.status_code}")
    print(f"Login Response: {r2.text}")
except Exception as e:
    print(f"Login Error: {e}")
