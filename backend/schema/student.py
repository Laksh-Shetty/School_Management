from pydantic import BaseModel

class Student(BaseModel):
    id: int
    name: str
    age: int
    grade: str
    address: str