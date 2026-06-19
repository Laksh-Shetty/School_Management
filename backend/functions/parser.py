import json
import os

from dotenv import load_dotenv
from fastapi import HTTPException
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise Exception("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = """
You are an API command parser.

Convert the user's command into valid JSON.

Supported functions:

1. create_student

{
    "function": "create_student",
    "args": {
        "id": 1,
        "name": "Laksh",
        "age": 20,
        "grade": "A",
        "address": "Mumbai"
    }
}

2. read_student

{
    "function": "read_student",
    "args": {
        "student_id": 1
    }
}

3. update_student

{
    "function": "update_student",
    "args": {
        "id": 1,
        "name": "Laksh",
        "age": 21,
        "grade": "A",
        "address": "Mumbai"
    }
}

4. delete_student

{
    "function": "delete_student",
    "args": {
        "student_id": 1
    }
}

5. all_students

{
    "function": "all_students",
    "args": {}
}

Rules:
- Return ONLY valid JSON.
- No markdown.
- No explanation.
- No code blocks.
- Function name must exactly match one of the supported functions.
"""

def parse_command_with_gemini(command: str):
    try:

        prompt = f"""
{SYSTEM_PROMPT}

User Command:
{command}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        text = response.text.strip()

        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        parsed = json.loads(text)

        return parsed

    except Exception as e:
        print("GEMINI ERROR:", str(e))

        raise HTTPException(
            status_code=400,
            detail=f"Gemini parsing failed: {str(e)}"
        )