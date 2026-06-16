import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()

print(os.getenv("DATABASE_PASSWORD"))

conn = mysql.connector.connect(
    host="localhost",
    user="Laksh",
    password=os.getenv("DATABASE_PASSWORD"),
    database="school_management"
)

cursor = conn.cursor(dictionary=True)