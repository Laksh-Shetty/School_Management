from .parser import parse_command_with_gemini
from schema.student import Student
from .students import create_student, read_student, update_student, delete_student, all_students
from fastapi import HTTPException


GRADE_ORDER = ["A", "B", "C", "D", "F"]  


def _ok(func_name, message, navigate, result, args):
    return {"function": func_name, "success": True, "message": message, "navigate": navigate, "result": result, "args": args}


def _fail(func_name, message, result, args):
    return {"function": func_name, "success": False, "message": message, "navigate": None, "result": result, "args": args}


def _match(student: dict, filters: dict) -> bool:
    for key, val in filters.items():
        sv = student.get(key)
        if isinstance(val, str):
            if str(sv).lower() != val.lower():
                return False
        elif isinstance(val, int):
            try:
                if int(sv) != val:
                    return False
            except (ValueError, TypeError):
                return False
        else:
            if sv != val:
                return False
    return True


def _apply_op(student_val, op: str, value) -> bool:
    try:
        if op == "eq":       return str(student_val).lower() == str(value).lower()
        if op == "ne":       return str(student_val).lower() != str(value).lower()
        if op == "contains": return str(value).lower() in str(student_val).lower()
        sv_n, v_n = float(student_val), float(value)
        if op == "gt":  return sv_n > v_n
        if op == "lt":  return sv_n < v_n
        if op == "gte": return sv_n >= v_n
        if op == "lte": return sv_n <= v_n
    except (ValueError, TypeError):
        return False
    return False


def _all() -> list:
    students = all_students()
    if not isinstance(students, list):
        raise HTTPException(status_code=500, detail="Could not fetch students")
    return students


def _filtered(filters: dict) -> list:
    return [s for s in _all() if _match(s, filters)]


def _grade_idx(grade: str) -> int:
    try:
        return GRADE_ORDER.index(grade.upper())
    except ValueError:
        return len(GRADE_ORDER)


def _n(count: int) -> str:
    return f"{count} student{'s' if count != 1 else ''}"


def _read_or_404(sid):
    s = read_student(sid)
    if isinstance(s, dict) and "message" in s and "id" not in s:
        raise HTTPException(status_code=404, detail=f"Student {sid} not found")
    return s


def _process(action: dict) -> dict: 
    fn   = action.get("function")
    args = action.get("args", {})

    if fn == "add":
        result = create_student(Student(**args))
        msg = result.get("message", "Student created") if isinstance(result, dict) else "Student created"
        return _ok(fn, msg, {"path": "/students"}, result, args)

    elif fn == "get":
        sid = args.get("student_id")
        if sid is None:
            raise HTTPException(status_code=400, detail="student_id required")
        result = read_student(sid)
        if isinstance(result, dict) and "message" in result and "id" not in result:
            return _fail(fn, result.get("message"), result, args)
        return _ok(fn, f"Student {sid} found", {"path": f"/read/{sid}"}, result, args)

    elif fn == "edit":
        sid = args.get("id")
        if not sid:
            raise HTTPException(status_code=400, detail="id required")
        existing = _read_or_404(sid)
        merged = {
            "id":      sid,
            "roll_no": args.get("roll_no") if args.get("roll_no") is not None else existing.get("roll_no"),
            "name":    args.get("name")    if args.get("name")    is not None else existing.get("name"),
            "age":     args.get("age")     if args.get("age")     is not None else existing.get("age"),
            "grade":   args.get("grade")   if args.get("grade")   is not None else existing.get("grade"),
            "address": args.get("address") if args.get("address") is not None else existing.get("address"),
        }
        result = update_student(Student(**merged))
        msg = result.get("message", f"Student {sid} updated") if isinstance(result, dict) else f"Student {sid} updated"
        return _ok(fn, msg, None, result, merged)

    elif fn == "remove":
        sid = args.get("student_id")
        if sid is None:
            raise HTTPException(status_code=400, detail="student_id required")
        result = delete_student(sid)
        msg = result.get("message", f"Student {sid} deleted") if isinstance(result, dict) else f"Student {sid} deleted"
        return _ok(fn, msg, None, result, args)

    elif fn == "all":
        result = _all()
        return _ok(fn, f"Fetched {_n(len(result))}", {"path": "/students"}, result, args)

    elif fn == "filter":
        if not args:
            raise HTTPException(status_code=400, detail="No filter criteria provided")
        result = _filtered(args)
        desc = ", ".join(f"{k}={v}" for k, v in args.items())
        return _ok(fn, f"Found {_n(len(result))} matching {desc}", {"path": "/students"}, result, args)

    elif fn == "search":
        query = str(args.get("query", "")).lower()
        if not query:
            raise HTTPException(status_code=400, detail="query required")
        result = [s for s in _all() if query in str(s.get("name", "")).lower()]
        return _ok(fn, f"Found {_n(len(result))} matching '{query}'", {"path": "/students"}, result, args)

    elif fn == "byroll":
        roll = args.get("roll_no")
        if not roll:
            raise HTTPException(status_code=400, detail="roll_no required")
        result = [s for s in _all() if str(s.get("roll_no", "")).lower() == str(roll).lower()]
        if not result:
            return _fail(fn, f"No student with roll_no {roll}", {}, args)
        return _ok(fn, f"Found student with roll_no {roll}", None, result[0], args)

    elif fn == "exists":
        students = _all()
        if "student_id" in args:
            found = any(s.get("id") == args["student_id"] for s in students)
        elif "roll_no" in args:
            found = any(str(s.get("roll_no", "")).lower() == str(args["roll_no"]).lower() for s in students)
        else:
            raise HTTPException(status_code=400, detail="student_id or roll_no required")
        return _ok(fn, f"Student {'exists' if found else 'does not exist'}", None, {"exists": found}, args)

    elif fn == "duplicates":
        field = args.get("field", "name")
        seen: dict = {}
        for s in _all():
            val = str(s.get(field, "")).lower()
            seen.setdefault(val, []).append(s)
        dupes = {k: v for k, v in seen.items() if len(v) > 1}
        total = sum(len(v) for v in dupes.values())
        return _ok(fn, f"Found {len(dupes)} duplicate {field} value(s) across {_n(total)}", None, dupes, args)

    elif fn == "sort":
        by    = args.get("sort_by", "name")
        order = args.get("order", "asc").lower()
        students = _all()
        if by == "grade":
            result = sorted(students, key=lambda s: _grade_idx(s.get("grade", "F")), reverse=(order == "desc"))
        else:
            result = sorted(students, key=lambda s: s.get(by, ""), reverse=(order == "desc"))
        return _ok(fn, f"Sorted {_n(len(result))} by {by} ({order})", {"path": "/students"}, result, args)

    elif fn == "page":
        p    = args.get("page", 1)
        size = args.get("page_size", 10)
        students = _all()
        start = (p - 1) * size
        chunk = students[start:start + size]
        total_pages = max(1, -(-len(students) // size))
        result = {"page": p, "page_size": size, "total": len(students), "total_pages": total_pages, "students": chunk}
        return _ok(fn, f"Page {p}/{total_pages} — {_n(len(chunk))} returned", {"path": "/students"}, result, args)

    elif fn == "advfilter":
        filters = args.get("filters", [])
        logic   = args.get("logic", "AND").upper()
        if not filters:
            raise HTTPException(status_code=400, detail="filters array required")
        def passes(s):
            bools = [_apply_op(s.get(f["field"]), f["op"], f["value"]) for f in filters]
            return all(bools) if logic == "AND" else any(bools)
        result = [s for s in _all() if passes(s)]
        return _ok(fn, f"Found {_n(len(result))} matching filters ({logic})", {"path": "/students"}, result, args)

    elif fn == "count":
        c = len(_all())
        return _ok(fn, f"Total students: {c}", {"path": "/students"}, {"count": c}, args)

    elif fn == "avgage":
        f = args.get("filter", {})
        students = _filtered(f) if f else _all()
        ages = [s["age"] for s in students if s.get("age") is not None]
        avg  = round(sum(ages) / len(ages), 2) if ages else None
        label = f" (grade {f.get('grade', '')})" if f else ""
        return _ok(fn, f"Average age{label}: {avg}", None, {"average_age": avg, "sample_size": len(ages)}, args)

    elif fn == "grades":
        students = _all()
        dist: dict = {}
        for s in students:
            g = s.get("grade", "Unknown")
            dist[g] = dist.get(g, 0) + 1
        ordered = {g: dist[g] for g in GRADE_ORDER if g in dist}
        ordered.update({k: v for k, v in dist.items() if k not in GRADE_ORDER})
        return _ok(fn, f"Grade distribution across {_n(len(students))}", None, ordered, args)

    elif fn == "oldest":
        filters     = args.get("filter", {})
        conditions  = args.get("conditions", [])
        students    = _filtered(filters) if filters else _all()
        if conditions:
            students = [s for s in students if all(
            _apply_op(s.get(c["field"]), c["op"], c["value"]) for c in conditions
        )]
        if not students:
            return _fail(fn, "No matching students found", {}, args)
        result = max(students, key=lambda s: s.get("age", 0))
        desc = f" ({', '.join(f'{k}={v}' for k, v in filters.items())})" if filters else ""
        return _ok(fn, f"Oldest{desc}: {result.get('name')} (age {result.get('age')})", None, result, args)

    elif fn == "youngest":
        filters     = args.get("filter", {})
        conditions  = args.get("conditions", [])
        students    = _filtered(filters) if filters else _all()
        if conditions:
            students = [s for s in students if all(
            _apply_op(s.get(c["field"]), c["op"], c["value"]) for c in conditions
        )]
        if not students:
            return _fail(fn, "No matching students found", {}, args)
        result = min(students, key=lambda s: s.get("age", 9999))
        desc = f" ({', '.join(f'{k}={v}' for k, v in filters.items())})" if filters else ""
        return _ok(fn, f"Youngest{desc}: {result.get('name')} (age {result.get('age')})", None, result, args)

    elif fn == "bycity":
        students = _all()
        grouped: dict = {}
        for s in students:
            city = s.get("address", "Unknown")
            grouped.setdefault(city, []).append(s)
        return _ok(fn, f"Grouped {_n(len(students))} across {len(grouped)} city/cities", None, grouped, args)

    elif fn == "top":
        min_grade = args.get("min_grade", "B").upper()
        threshold = _grade_idx(min_grade)
        if threshold >= len(GRADE_ORDER):
            raise HTTPException(status_code=400, detail=f"Unknown grade: {min_grade}")
        result = [s for s in _all() if _grade_idx(s.get("grade", "F")) <= threshold]
        return _ok(fn, f"Found {_n(len(result))} with grade {min_grade} or better", None, result, args)

    elif fn == "summary":
        students = _all()
        dist: dict = {}
        ages = []
        for s in students:
            g = s.get("grade", "Unknown")
            dist[g] = dist.get(g, 0) + 1
            if s.get("age") is not None:
                ages.append(s["age"])
        result = {
            "total_students":    len(students),
            "grade_distribution": dist,
            "average_age":       round(sum(ages) / len(ages), 2) if ages else None,
            "oldest_age":        max(ages) if ages else None,
            "youngest_age":      min(ages) if ages else None,
            "students":          students,
        }
        return _ok(fn, f"Summary for {_n(len(students))}", {"path": "/students"}, result, args)

    elif fn == "addmany":
        new_list = args.get("students", [])
        if not new_list:
            raise HTTPException(status_code=400, detail="students array required")
        created, failed = [], []
        for s_data in new_list:
            try:
                created.append(create_student(Student(**s_data)))
            except Exception as e:
                failed.append({"data": s_data, "error": str(e)})
        msg = f"Bulk created {_n(len(created))}"
        if failed:
            msg += f"; {len(failed)} failed"
        return _ok(fn, msg, {"path": "/students"}, {"created": created, "failed": failed}, args)

    elif fn == "editwhere":
        filters = args.get("filter", {})
        updates = args.get("update", {})
        if not updates:
            raise HTTPException(status_code=400, detail="update fields required")
        targets = _filtered(filters)
        if not targets:
            return _ok(fn, "No matching students found", None, {"updated": 0}, args)
        updated = []
        for s in targets:
            merged = {**s, **updates, "id": s["id"]}
            update_student(Student(**merged))
            updated.append(merged)
        filter_desc = ", ".join(f"{k}={v}" for k, v in filters.items()) if filters else "all"
        update_desc = ", ".join(f"{k}→{v}" for k, v in updates.items())
        return _ok(fn, f"Updated {_n(len(updated))} ({filter_desc}): set {update_desc}", {"path": "/students"}, {"updated": len(updated), "students": updated}, args)

    elif fn == "deletewhere":
        filters = args.get("filter", {})
        targets = _filtered(filters)
        if not targets:
            return _ok(fn, "No matching students found", None, {"deleted": 0}, args)
        for s in targets:
            delete_student(s["id"])
        desc = ", ".join(f"{k}={v}" for k, v in filters.items()) if filters else "all"
        return _ok(fn, f"Deleted {_n(len(targets))} where {desc}", {"path": "/students"}, {"deleted": len(targets), "students": targets}, args)

    elif fn == "deleteall":
        students = _all()
        for s in students:
            delete_student(s["id"])
        return _ok(fn, f"Deleted all {_n(len(students))}", {"path": "/students"}, {"deleted": len(students)}, args)

    elif fn == "promote":
        from_g = args.get("from_grade", "").upper()
        to_g   = args.get("to_grade", "").upper()
        if from_g not in GRADE_ORDER or to_g not in GRADE_ORDER:
            raise HTTPException(status_code=400, detail=f"Invalid grade(s): {from_g}, {to_g}")
        if _grade_idx(to_g) >= _grade_idx(from_g):
            raise HTTPException(status_code=400, detail="to_grade must be better than from_grade")
        targets = [s for s in _all() if str(s.get("grade", "")).upper() == from_g]
        for s in targets:
            update_student(Student(**{**s, "grade": to_g, "id": s["id"]}))
        return _ok(fn, f"Promoted {_n(len(targets))} from {from_g} to {to_g}", {"path": "/students"}, {"promoted": len(targets)}, args)

    elif fn == "addyear":
        filters  = args.get("filter", {})
        targets  = _filtered(filters) if filters else _all()
        for s in targets:
            update_student(Student(**{**s, "age": (s.get("age") or 0) + 1, "id": s["id"]}))
        desc = ", ".join(f"{k}={v}" for k, v in filters.items()) if filters else "all"
        return _ok(fn, f"Incremented age for {_n(len(targets))} ({desc})", {"path": "/students"}, {"updated": len(targets)}, args)

    elif fn == "setfield":
        field   = args.get("field")
        value   = args.get("value")
        filters = args.get("filter", {})
        if not field or value is None:
            raise HTTPException(status_code=400, detail="field and value required")
        targets = _filtered(filters) if filters else _all()
        for s in targets:
            update_student(Student(**{**s, field: value, "id": s["id"]}))
        desc = ", ".join(f"{k}={v}" for k, v in filters.items()) if filters else "all"
        return _ok(fn, f"Set {field}={value} for {_n(len(targets))} ({desc})", {"path": "/students"}, {"updated": len(targets)}, args)

    elif fn == "swapgrade":
        id1 = args.get("student_id_1")
        id2 = args.get("student_id_2")
        if not id1 or not id2:
            raise HTTPException(status_code=400, detail="student_id_1 and student_id_2 required")
        s1 = _read_or_404(id1)
        s2 = _read_or_404(id2)
        g1, g2 = s1.get("grade"), s2.get("grade")
        update_student(Student(**{**s1, "grade": g2, "id": id1}))
        update_student(Student(**{**s2, "grade": g1, "id": id2}))
        return _ok(fn, f"Swapped grades: student {id1} now {g2}, student {id2} now {g1}", None,
                   {"student_1": {**s1, "grade": g2}, "student_2": {**s2, "grade": g1}}, args)

    elif fn == "archive":
        sid = args.get("student_id")
        if sid is None:
            raise HTTPException(status_code=400, detail="student_id required")
        existing = _read_or_404(sid)
        update_student(Student(**{**existing, "grade": "ARCHIVED", "id": sid}))
        return _ok(fn, f"Student {sid} archived (soft-deleted)", None, {"archived_id": sid}, args)
    
    elif fn == "help":
        result = {
        "categories": [
            {
                "name": "Student CRUD",
                "commands": [
                    "add student roll A101 name Laksh age 20 grade A address Mumbai",
                    "get student 1",
                    "update student 1 grade to A",
                    "delete student 1",
                ]
            },
            {
                "name": "List & Filter",
                "commands": [
                    "show all students",
                    "show students with grade A",
                    "search students named ri",
                    "find student with roll number A101",
                    "show students where grade is A and age is greater than 18",
                    "sort students by age descending",
                    "show page 1 with 5 students",
                ]
            },
            {
                "name": "Analytics",
                "commands": [
                    "how many students are there",
                    "what is the average age",
                    "show grade breakdown",
                    "who is the oldest student",
                    "who is the youngest student",
                    "group students by city",
                    "show top students with grade B or better",
                    "generate summary report",
                    "find duplicate names",
                    "does student with roll A101 exist",
                ]
            },
            {
                "name": "Bulk Operations",
                "commands": [
                    "update all grade B students to grade A",
                    "set address to Delhi for all grade A students",
                    "promote all C grade students to B",
                    "add a year to all students age",
                    "delete all students with grade F",
                    "delete all students",
                    "swap grades between student 1 and student 2",
                    "archive student 1",
                ]
            },
        ]
    }
        return _ok(fn, "Here's what I can do", None, result, args)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown function: {fn}")



def handle_command(command: str) -> dict:
    parsed  = parse_command_with_gemini(command)
    actions = parsed if isinstance(parsed, list) else [parsed]

    if not actions:
        raise HTTPException(status_code=400, detail="No actions found in command")

    results = [_process(action) for action in actions]

    if len(results) == 1:
        return {
            "success":  results[0]["success"],
            "message":  results[0]["message"],
            "navigate": results[0]["navigate"],
            "details":  results,
        }

    succeeded = sum(1 for r in results if r["success"])
    failed    = len(results) - succeeded
    summary   = f"{succeeded}/{len(results)} operations succeeded"
    if failed:
        summary += f" ({failed} failed)"

    return {
        "success":  all(r["success"] for r in results),
        "message":  summary,
        "navigate": None,
        "details":  results,
    }