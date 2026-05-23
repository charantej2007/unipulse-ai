import google.generativeai as genai
genai.configure(api_key='AIzaSyALVQKrwUPgowghuKOZZBOBsEt5hD-gPe0')
try:
    print('Testing gemini-2.0-flash-lite again...')
    model = genai.GenerativeModel('gemini-2.0-flash-lite')
    response = model.generate_content('Say simply yes.')
    print('SUCCESS:', response.text)
except Exception as e:
    print('ERROR:', e)
