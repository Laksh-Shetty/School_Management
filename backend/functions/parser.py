import json
import os
import re

from dotenv import load_dotenv
from fastapi import HTTPException
from google import genai

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise Exception("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)

SYSTEM_PROMPT = """
You are an API command parser for a student management system.

Convert the user's natural language command into valid JSON.

Supported functions:

1. create_student
{"function":"create_student","args":{"roll_no":"A101","name":"Laksh","age":20,"grade":"A","address":"Mumbai"}}

2. read_student
{"function":"read_student","args":{"student_id":1}}

3. update_student
{"function":"update_student","args":{"id":1,"roll_no":"A101","grade":"A"}}
Only include fields that should change. "id" is always required.

4. delete_student
{"function":"delete_student","args":{"student_id":1}}

5. all_students
{"function":"all_students","args":{}}

6. delete_all_students
{"function":"delete_all_students","args":{}}

7. filter_students
{"function":"filter_students","args":{"grade":"A"}}
Include only the fields to filter by. Supports: grade, age, name, address.

8. update_where — update all students matching a filter
{"function":"update_where","args":{"filter":{"grade":"B"},"update":{"grade":"A"}}}

9. delete_where — delete all students matching a filter
{"function":"delete_where","args":{"filter":{"grade":"F"}}}

For MULTIPLE individual operations, return a JSON array:
[{"function":"...","args":{...}},{"function":"...","args":{...}}]

EXAMPLES — study these carefully:

"read students 1, 2 and 3"
→ [{"function":"read_student","args":{"student_id":1}},{"function":"read_student","args":{"student_id":2}},{"function":"read_student","args":{"student_id":3}}]

"delete students 4 and 5"
→ [{"function":"delete_student","args":{"student_id":4}},{"function":"delete_student","args":{"student_id":5}}]

"delete all students"
→ {"function":"delete_all_students","args":{}}

"delete all students with grade F"
→ {"function":"delete_where","args":{"filter":{"grade":"F"}}}

"delete students from Mumbai"
→ {"function":"delete_where","args":{"filter":{"address":"Mumbai"}}}

"update student 1 grade to A and student 2 age to 18"
→ [{"function":"update_student","args":{"id":1,"grade":"A"}},{"function":"update_student","args":{"id":2,"age":18}}]

"update all students with grade B to grade A"
→ {"function":"update_where","args":{"filter":{"grade":"B"},"update":{"grade":"A"}}}

"set everyone's address to Delhi"
→ {"function":"update_where","args":{"filter":{},"update":{"address":"Delhi"}}}

"update Laksh's grade to A"
→ {"function":"update_where","args":{"filter":{"name":"Laksh"},"update":{"grade":"A"}}}

"delete student named Riya"
→ {"function":"delete_where","args":{"filter":{"name":"Riya"}}}

"show all students with grade A"
→ {"function":"filter_students","args":{"grade":"A"}}

Rules:
- Return ONLY valid JSON. No markdown, no backticks, no explanation.
- Multiple individual operations on specific IDs → JSON array.
- Bulk operations (all, by name, by grade, by address) → use update_where / delete_where / delete_all_students.
- Function names must exactly match one of the 9 supported functions above.
"""


def _extract_json_text(text: str):
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"```(?:json)?", "", text).replace("```", "").strip()

    if text.startswith("{") or text.startswith("["):
        return text

    braces = [i for i in (text.find("{"), text.find("[")) if i != -1]
    if not braces:
        return text

    return text[min(braces):]


def _parse_command_text(command: str):
    prompt = f"{SYSTEM_PROMPT}\n\nUser Command:\n{command}"

    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents=prompt,
    )

    text = _extract_json_text(response.text)
    return json.loads(text)


def parse_command_with_gemini(command: str):
    try:
        parsed = _parse_command_text(command)
        return parsed if isinstance(parsed, list) else parsed
    except Exception as e:
        print("GEMINI ERROR:", str(e))
        raise HTTPException(
            status_code=400,
            detail=f"Gemini parsing failed: {str(e)}"
        )