from .parser import parse_command_with_gemini
from schema.student import Student
from .students import create_student, read_student, update_student, delete_student, all_students
from fastapi import HTTPException


def _match(student: dict, filters: dict) -> bool:
    for key, val in filters.items():
        student_val = student.get(key)
        if isinstance(val, str):
            if str(student_val).lower() != val.lower():
                return False
        elif isinstance(val, int):
            try:
                if int(student_val) != val:
                    return False
            except (ValueError, TypeError):
                return False
        else:
            if student_val != val:
                return False
    return True


def _filter_students(filters: dict):
    students = all_students()
    if not isinstance(students, list):
        return students
    return [s for s in students if _match(s, filters)]


def _process_single_action(action):
    func_name = action.get("function")
    args = action.get("args", {})

    if func_name == "create_student":
        result = create_student(Student(**args))
        message = result.get("message") if isinstance(result, dict) else "Student created"
        return _ok(func_name, message, {"path": "/students"}, result, args)

    elif func_name == "read_student":
        if "student_id" not in args:
            raise HTTPException(status_code=400, detail="student_id required for read_student")
        result = read_student(args["student_id"])
        sid = args.get("student_id")
        if isinstance(result, dict) and "message" in result and "id" not in result:
            return _fail(func_name, result.get("message"), result, args)
        return _ok(func_name, f"Student {sid} found", {"path": f"/read/{sid}"}, result, args)

    elif func_name == "update_student":
        student_id = args.get("id")
        if not student_id:
            raise HTTPException(status_code=400, detail="id required for update_student")
        existing = read_student(student_id)
        if isinstance(existing, dict) and "message" in existing and "id" not in existing:
            raise HTTPException(status_code=404, detail=f"Student {student_id} not found")
        merged = {
            "id": student_id,
            "roll_no": args.get("roll_no") if args.get("roll_no") is not None else existing.get("roll_no"),
            "name":    args.get("name")    if args.get("name")    is not None else existing.get("name"),
            "age":     args.get("age")     if args.get("age")     is not None else existing.get("age"),
            "grade":   args.get("grade")   if args.get("grade")   is not None else existing.get("grade"),
            "address": args.get("address") if args.get("address") is not None else existing.get("address"),
        }
        result = update_student(Student(**merged))
        message = result.get("message") if isinstance(result, dict) else f"Student {student_id} updated"
        return _ok(func_name, message, None, result, merged)

    elif func_name == "delete_student":
        if "student_id" not in args:
            raise HTTPException(status_code=400, detail="student_id required for delete_student")
        result = delete_student(args["student_id"])
        message = result.get("message") if isinstance(result, dict) else f"Student {args['student_id']} deleted"
        return _ok(func_name, message, None, result, args)

    elif func_name == "all_students":
        result = all_students()
        count = len(result) if isinstance(result, list) else 0
        return _ok(func_name, f"Fetched {count} student{'s' if count != 1 else ''}", {"path": "/students"}, result, args)

    elif func_name == "filter_students":
        if not args:
            raise HTTPException(status_code=400, detail="No filter criteria provided")
        result = _filter_students(args)
        count = len(result) if isinstance(result, list) else 0
        desc = ", ".join(f"{k}={v}" for k, v in args.items())
        return _ok(func_name, f"Found {count} student{'s' if count != 1 else ''} matching {desc}", {"path": "/students"}, result, args)

    elif func_name == "delete_all_students":
        students = all_students()
        if not isinstance(students, list):
            raise HTTPException(status_code=500, detail="Could not fetch students")
        count = 0
        for s in students:
            delete_student(s["id"])
            count += 1
        return _ok(func_name, f"Deleted all {count} student{'s' if count != 1 else ''}", {"path": "/students"}, {"deleted": count}, args)

    elif func_name == "delete_where":
        filters = args.get("filter", {})
        students = all_students()
        if not isinstance(students, list):
            raise HTTPException(status_code=500, detail="Could not fetch students")
        targets = [s for s in students if _match(s, filters)]
        if not targets:
            return _ok(func_name, "No matching students found", None, {"deleted": 0}, args)
        for s in targets:
            delete_student(s["id"])
        desc = ", ".join(f"{k}={v}" for k, v in filters.items()) if filters else "all"
        return _ok(func_name, f"Deleted {len(targets)} student{'s' if len(targets) != 1 else ''} where {desc}", {"path": "/students"}, {"deleted": len(targets), "students": targets}, args)

    elif func_name == "update_where":
        filters = args.get("filter", {})
        updates = args.get("update", {})
        if not updates:
            raise HTTPException(status_code=400, detail="No update fields provided")
        students = all_students()
        if not isinstance(students, list):
            raise HTTPException(status_code=500, detail="Could not fetch students")
        targets = [s for s in students if _match(s, filters)]
        if not targets:
            return _ok(func_name, "No matching students found", None, {"updated": 0}, args)
        updated = []
        for s in targets:
            merged = {**s, **updates, "id": s["id"]}
            update_student(Student(**merged))
            updated.append(merged)
        filter_desc = ", ".join(f"{k}={v}" for k, v in filters.items()) if filters else "all students"
        update_desc = ", ".join(f"{k}→{v}" for k, v in updates.items())
        return _ok(func_name, f"Updated {len(updated)} student{'s' if len(updated) != 1 else ''} ({filter_desc}): set {update_desc}", {"path": "/students"}, {"updated": len(updated), "students": updated}, args)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown function: {func_name}")



def _ok(func_name, message, navigate, result, args):
    return {"function": func_name, "success": True, "message": message, "navigate": navigate, "result": result, "args": args}

def _fail(func_name, message, result, args):
    return {"function": func_name, "success": False, "message": message, "navigate": None, "result": result, "args": args}



def handle_command(command: str):
    parsed = parse_command_with_gemini(command)
    actions = parsed if isinstance(parsed, list) else [parsed]

    if not actions:
        raise HTTPException(status_code=400, detail="No actions found in command")

    results = [_process_single_action(action) for action in actions]
    success = all(item["success"] for item in results)

    if len(results) == 1:
        return {
            "success": results[0]["success"],
            "message": results[0]["message"],
            "navigate": results[0]["navigate"],
            "details": results,
        }

    succeeded = sum(1 for r in results if r["success"])
    failed = len(results) - succeeded
    summary = f"{succeeded}/{len(results)} operations succeeded"
    if failed:
        summary += f" ({failed} failed)"

    return {
        "success": success,
        "message": summary,
        "navigate": None,
        "details": results,
    }