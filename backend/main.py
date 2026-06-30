from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.requests import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from functions.students import create_student, read_student, update_student, delete_student, all_students
from functions.chatbot import handle_command
from schema.student import Student
from pydantic import BaseModel
from database import cursor, conn as db


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post("/create")
async def create(student: Student):
    return create_student(student)

@app.get("/read")
async def read(student_id: int):
    return read_student(student_id)

@app.put("/update")
async def update(student: Student):
    return update_student(student)

@app.delete("/delete")
async def delete(student_id: int):
    return delete_student(student_id)

@app.get("/students")
async def get_students():
    return all_students()


async def _chat_handler(command: dict):
    if "command" not in command:
        return JSONResponse(status_code=400, content={"detail": "Missing 'command' field"})
    return handle_command(command["command"])

@app.post("/chat")
async def chat(command: dict):
    return await _chat_handler(command)

@app.post("/command")
async def command(command: dict):
    return await _chat_handler(command)

class FeedbackPayload(BaseModel):
    message_text: str = ""
    function_names: str = ""
    rating: str

@app.post("/feedback")
async def save_feedback(payload: FeedbackPayload):
    cursor.execute(
        "INSERT INTO feedback (message_text, function_names, rating) VALUES (%s, %s, %s)",
        (payload.message_text, payload.function_names, payload.rating)
    )
    db.commit()
    return {"success": True}


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": exc.body},
    )