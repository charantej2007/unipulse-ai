import google.generativeai as genai
genai.configure(api_key='AIzaSyALVQKrwUPgowghuKOZZBOBsEt5hD-gPe0')
for m in ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-2.0-flash-lite', 'gemini-pro']:
    try:
        print(f'Testing {m}...')
        response = genai.GenerativeModel(m).generate_content('hello')
        print(f'SUCCESS {m}')
    except Exception as e:
        print(f'ERROR {m}:', e)
