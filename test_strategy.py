import requests

payload = {
    "subject": "Machine Learning",
    "days_remaining": 14,
    "difficulty": "Intermediate (Good Grade)"
}

try:
    response = requests.post("http://localhost:8000/api/exam-strategy", json=payload)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print("Error:", e)
