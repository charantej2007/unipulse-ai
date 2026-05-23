import google.generativeai as genai
genai.configure(api_key='AIzaSyALVQKrwUPgowghuKOZZBOBsEt5hD-gPe0')
for m in ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.0-flash-lite']:
    try:
        model = genai.GenerativeModel(m)
        response = model.generate_content('Say simply yes or no')
        print(f'SUCCESS {m}')
    except Exception as e:
        print(f'ERROR {m}:', e)
