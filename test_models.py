import google.generativeai as genai
import os

api_key="AIzaSyALVQKrwUPgowghuKOZZBOBsEt5hD-gPe0"
genai.configure(api_key=api_key)

try:
    models = genai.list_models()
    for m in models:
        if 'generateContent' in m.supported_generation_methods:
            print(m.name)
except Exception as e:
    print('Error listing models:', e)
