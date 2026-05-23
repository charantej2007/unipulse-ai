import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv(override=True)
api_key = os.getenv("GEMINI_API_KEY")

print(f"API Key Starts With: {api_key[:5] if api_key else 'None'}...")

try:
    genai.configure(api_key=api_key)
    # List available models to verify the key works
    models = list(genai.list_models())
    print("\nAPI Key VALID! Successfully authenticated.")
    
    # Check specifically for gemini 2.5 flash
    has_flash = any('gemini-2.5-flash' in m.name for m in models)
    if has_flash:
        print("Success: Key has access to gemini-2.5-flash")
    else:
        print("Warning: Key authenticated but gemini-2.5-flash is missing from valid models. This will break app.py.")
        
    # Let's try to actually generate a response to ensure we aren't rate limited
    model = genai.GenerativeModel('gemini-2.5-flash')
    response = model.generate_content("Respond with exactly the word 'OK'.")
    print(f"\nGenerative Response Test: {response.text.strip()}")
    
except Exception as e:
    print(f"\nAPI Error: {e}")
