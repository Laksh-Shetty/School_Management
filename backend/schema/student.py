from typing import Optional

from pydantic import BaseModel

class Student(BaseModel):
    id: Optional[int] = None
    roll_no: str
    name: str
    age: int
    grade: str
    address: str