import google.generativeai as genai

api_key="AIzaSyALVQKrwUPgowghuKOZZBOBsEt5hD-gPe0"
genai.configure(api_key=api_key)
with open('valid_models.txt', 'w') as f:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            f.write(m.name + '\n')
