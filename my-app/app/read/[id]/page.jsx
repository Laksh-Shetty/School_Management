"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [editedStudent, setEditedStudent] = useState({ 
    name: "", 
    grade: "", 
    age: "",
    address: "" 
  });

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/read?student_id=${id}`
        );
        const data = await response.json();
        setStudent(data);
        
        setEditedStudent({ 
          name: data.name, 
          grade: data.grade, 
          age: data.age,
          address: data.address || "" 
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    if (id) {
      fetchStudent();
    }
  }, [id]);

  const handleUpdate = async () => {
    try {
      const payload = {
        id: parseInt(id), 
        name: editedStudent.name,
        grade: editedStudent.grade,
        age: parseInt(editedStudent.age), 
        address: editedStudent.address 
      };

      const response = await fetch(`http://localhost:8000/update`, {
        method: "PUT", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setStudent({ id: student.id, ...editedStudent });
        setIsEditing(false);
        alert("Student updated successfully!");
      } else {
        alert("Failed to update student.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(`http://localhost:8000/delete?student_id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Student deleted successfully!");
        router.push("/students"); 
      } else {
        alert("Failed to delete student.");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  if (!student) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-lg">

      <div>
        <button
          onClick={() => router.push("/students")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition mb-6 justify-self-end"
        >
          Back to Students List
        </button>
      </div>
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Student Details
      </h1>

      <div className="rounded-xl border p-6 shadow-lg bg-white space-y-4">
        <p>
          <strong>ID:</strong> {student.id}
        </p>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border p-2 text-black"
                value={editedStudent.name}
                onChange={(e) => setEditedStudent({ ...editedStudent, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Grade</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border p-2 text-black"
                value={editedStudent.grade}
                onChange={(e) => setEditedStudent({ ...editedStudent, grade: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Age</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border p-2 text-black"
                value={editedStudent.age}
                onChange={(e) => setEditedStudent({ ...editedStudent, age: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border p-2 text-black"
                value={editedStudent.address}
                onChange={(e) => setEditedStudent({ ...editedStudent, address: e.target.value })}
                required
              />
            </div>
          </div>
        ) : (
          <>
            <p>
              <strong>Name:</strong> {student.name}
            </p>
            <p>
              <strong>Grade:</strong> {student.grade}
            </p>
            <p>
              <strong>Age:</strong> {student.age}
            </p>
            <p>
              <strong>Address:</strong> {student.address || "No address provided"}
            </p>
          </>
        )}

        <div className="flex space-x-3 pt-4 border-t">
          {isEditing ? (
            <>
              <button
                onClick={handleUpdate}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Update
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}