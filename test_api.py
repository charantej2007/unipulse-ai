import requests
payload = {
    'skills': ['Python', 'SQL', 'Machine Learning'],
    'interests': ['Data Science'],
    'careerGoal': 'Data Scientist',
    'educationLevel': 'Bachelors',
    'difficulty': 'Intermediate'
}
response = requests.post('http://127.0.0.1:8000/api/recommend', json=payload)
print(f"Status Code: {response.status_code}")
print(f"Response: {response.text}")
