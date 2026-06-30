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

SYSTEM_PROMPT = """You parse student-management commands into JSON. Return ONLY valid JSON — no markdown, no explanation.

## OUTPUT SHAPE
Single op  → object   {"function":"<name>","args":{...}}
Multi op   → array    [{"function":"<name>","args":{...}}, ...]

## FUNCTIONS & ARG SHAPES

### CREATE / READ / UPDATE / DELETE (by ID)
add          {"roll_no":"A101","name":"Laksh","age":20,"grade":"A","address":"Mumbai"}
get          {"student_id":1}
edit         {"id":1, ...only changed fields...}
remove       {"student_id":1}

### LIST / FILTER / SORT / PAGE
all          {}
filter       {field:value, ...}
search       {"query":"lak"}
byroll       {"roll_no":"A101"}
exists       {"roll_no":"A101"}
duplicates   {"field":"name"}                      ← field: name | roll_no
sort         {"sort_by":"age","order":"asc"}       ← order: asc | desc
page         {"page":1,"page_size":10}
advfilter    {"filters":[{"field":"grade","op":"eq","value":"A"},{"field":"age","op":"gt","value":18}],"logic":"AND"}
             ops: eq | ne | gt | lt | gte | lte | contains

### ANALYTICS
count        {}
avgage       {}                                    ← optionally {"filter":{"grade":"A"}}
grades       {}
oldest       {"filter":{"grade":"A"},"conditions":[{"field":"age","op":"gt","value":22}]}   ← both optional
youngest     {"filter":{"grade":"A"},"conditions":[{"field":"age","op":"gt","value":22}]}   ← both optional
bycity       {}
top          {"min_grade":"B"}                     ← grades: A > B > C > D > F
summary      {}

### BULK WRITE
addmany      {"students":[{"roll_no":"A102","name":"Riya","age":21,"grade":"B","address":"Pune"},...]}
editwhere    {"filter":{"grade":"B"},"update":{"grade":"A"}}
deletewhere  {"filter":{"grade":"F"}}
deleteall    {}
promote      {"from_grade":"B","to_grade":"A"}
addyear      {"filter":{"grade":"A"}}
setfield     {"field":"address","value":"Delhi","filter":{"grade":"A"}}
swapgrade    {"student_id_1":1,"student_id_2":2}
archive      {"student_id":1}

### HELP
help         {}

### CHITCHAT
chitchat     {"reply":"<short friendly reply>"}   ← greetings, thanks, small talk, or anything unrelated to student data

## KEY EXAMPLES

"read students 1,2,3" → [{"function":"get","args":{"student_id":1}},{"function":"get","args":{"student_id":2}},{"function":"get","args":{"student_id":3}}]
"delete all grade-F students" → {"function":"deletewhere","args":{"filter":{"grade":"F"}}}
"update everyone's city to Delhi" → {"function":"editwhere","args":{"filter":{},"update":{"address":"Delhi"}}}
"update Laksh grade to A" → {"function":"editwhere","args":{"filter":{"name":"Laksh"},"update":{"grade":"A"}}}
"average age of grade A students" → {"function":"avgage","args":{"filter":{"grade":"A"}}}
"show grade breakdown" → {"function":"grades","args":{}}
"youngest grade A student" → {"function":"youngest","args":{"filter":{"grade":"A"}}}
"youngest grade A student older than 22" → {"function":"youngest","args":{"filter":{"grade":"A"},"conditions":[{"field":"age","op":"gt","value":22}]}}
"oldest student with age below 25" → {"function":"oldest","args":{"conditions":[{"field":"age","op":"lt","value":25}]}}
"add Riya then show all" → [{"function":"add","args":{...}},{"function":"all","args":{}}]
"what can you do" → {"function":"help","args":{}}
"help" → {"function":"help","args":{}}
"hello" → {"function":"chitchat","args":{"reply":"Hey! I can help you manage students — try asking me to show, add, or search students."}}
"thanks" → {"function":"chitchat","args":{"reply":"You're welcome! Anything else you need?"}}
"who won the world cup" → {"function":"chitchat","args":{"reply":"I'm only set up to help with student records, not general questions. Try asking about students!"}}

## RULES
- Specific IDs → array of individual ops
- By name/grade/address → editwhere / deletewhere / filter
- "all students" no filter → deleteall or all
- oldest/youngest with simple grade/name filter → use "filter"
- oldest/youngest with gt/lt/gte/lte age conditions → use "conditions" array
- oldest/youngest with both → use both "filter" and "conditions"
- promote: "promote all B to A"
- addyear: "add a year", "birthday update", "increment age"
- archive: "soft delete", "deactivate", "archive student"
- swapgrade: "exchange/swap grades between student X and Y"
- setfield: "set <field> to <value> for <filter>"
- duplicates: "find duplicates", "check repeats"
- summary: "export", "download summary", "generate report"
- help: "what can you do", "help", "features", "commands", "how to use", "show features"
- Function names must match exactly as listed above.
- chitchat: greetings, thanks, farewells, or off-topic questions unrelated to students — reply briefly and steer back to student commands
"""


def _extract_json_text(text: str) -> str:
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
    prompt = f"{SYSTEM_PROMPT}\n\nCommand: {command}"
    response = client.models.generate_content(
        model="gemini-2.5-flash",
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
        raise HTTPException(status_code=400, detail=f"Gemini parsing failed: {str(e)}")