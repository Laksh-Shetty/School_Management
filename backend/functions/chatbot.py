from .parser import parse_command_with_gemini
from schema.student import Student
from .students import create_student, read_student, update_student, delete_student, all_students
from fastapi import HTTPException

def handle_command(command: str):

    parsed = parse_command_with_gemini(command)

    func_name = parsed["function"]
    args = parsed.get("args", {})

    if func_name == "create_student":
        result = create_student(Student(**args))

    elif func_name == "update_student":
        student_id = args.get("id")
        if not student_id:
            raise HTTPException(status_code=400, detail="Student ID required for update")
        
        existing = read_student(student_id)
        if isinstance(existing, dict) and "message" in existing:
            raise HTTPException(status_code=404, detail="Student not found")
        
        merged = {
            "id": student_id,
            "name": args.get("name") if args.get("name") is not None else existing.get("name"),
            "age": args.get("age") if args.get("age") is not None else existing.get("age"),
            "grade": args.get("grade") if args.get("grade") is not None else existing.get("grade"),
            "address": args.get("address") if args.get("address") is not None else existing.get("address"),
        }
        result = update_student(Student(**merged))
        args = merged

    elif func_name == "read_student":
        result = read_student(args["student_id"])

    elif func_name == "delete_student":
        result = delete_student(args["student_id"])

    elif func_name == "all_students":
        result = all_students()

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown function {func_name}"
        )

    navigate = None
    if func_name == "all_students":
        navigate = {"path": "/students"}
    elif func_name == "read_student":
        sid = args.get("student_id") or args.get("id")
        if sid is not None:
            navigate = {"path": f"/read/{sid}"}
    elif func_name == "create_student":
        navigate = {"path": "/students"}

    success = True
    message = None

    if func_name in ("create_student", "update_student", "delete_student"):
        if isinstance(result, dict) and result.get("message"):
            message = result.get("message")
        else:
            message = f"{func_name} completed"

    elif func_name == "read_student":
        if isinstance(result, dict) and result.get("message"):
            success = False
            message = result.get("message")
            navigate = None
        else:
            message = "Student found"

    elif func_name == "all_students":
        try:
            count = len(result) if result is not None else 0
            message = f"Fetched {count} students"
        except Exception:
            message = "Fetched students"

    if message is None:
        message = "Operation completed"

    return {
        "success": success,
        "message": message,
        "navigate": navigate,
    }