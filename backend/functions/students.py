from schema.student import Student
from database import conn, cursor
from fastapi import HTTPException
import mysql.connector

def create_student(student):
    try:
        query = """
        INSERT INTO students(roll_no, name, age, grade, address)
        VALUES (%s, %s, %s, %s, %s)
        """

        values = (
            student.roll_no,
            student.name,
            student.age,
            student.grade,
            student.address
        )

        cursor.execute(query, values)
        conn.commit()

        return {"message": "Student created successfully"}

    except mysql.connector.IntegrityError:
        raise HTTPException(
            status_code=400,
            detail=f"Student with roll number {student.roll_no} already exists"
        )

def read_student(student_id):
    query = "SELECT * FROM students WHERE id = %s"
    cursor.execute(query, (student_id,))
    student = cursor.fetchone()

    if student:
        return student
    else:
        return {"message": "Student not found"}

def update_student(student):
    query = """
    UPDATE students
    SET roll_no = %s, name = %s, age = %s, grade = %s, address = %s
    WHERE id = %s
    """

    values = (
        student.roll_no,
        student.name,
        student.age,
        student.grade,
        student.address,
        student.id
    )

    cursor.execute(query, values)
    conn.commit()

    return {"message": "Student updated successfully"}

def delete_student(student_id):
    query = "DELETE FROM students WHERE id = %s"
    cursor.execute(query, (student_id,))
    conn.commit()

    return {"message": "Student deleted successfully"}

def all_students():
    query = "SELECT * FROM students"
    cursor.execute(query)
    students = cursor.fetchall()

    return students