"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [editedStudent, setEditedStudent] = useState({
    roll_no: "",
    name: "",
    grade: "",
    age: "",
    address: "",
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
          roll_no: data.roll_no || "",
          name: data.name,
          grade: data.grade,
          age: data.age,
          address: data.address || "",
        });
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    if (id) fetchStudent();
  }, [id]);

  const handleUpdate = async () => {
    try {
      const payload = {
        id: parseInt(id),
        roll_no: editedStudent.roll_no,
        name: editedStudent.name,
        grade: editedStudent.grade,
        age: parseInt(editedStudent.age),
        address: editedStudent.address,
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
      }
    } catch (error) {
      console.error("Error updating student:", error);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      const response = await fetch(
        `http://localhost:8000/delete?student_id=${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        router.push("/students");
      }
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-black text-xl">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <button
          onClick={() => router.push("/students")}
          className="border border-black px-5 py-2 rounded-xl hover:bg-black hover:text-white transition-all duration-300 mb-10"
        >
          ← Back to Students
        </button>

        <div className="grid lg:grid-cols-2 gap-10">
          <div className="bg-black text-white rounded-3xl p-10">
            <p className="uppercase tracking-[0.3em] text-zinc-400 text-sm">
              Student Profile
            </p>

            <h1 className="text-5xl md:text-6xl font-black mt-4">
              {student.name}
            </h1>

            <div className="mt-10 space-y-8">
              <div>
                <p className="text-zinc-500 text-sm">Student ID</p>
                <h3 className="text-3xl font-bold">{student.id}</h3>
              </div>

                <div>
                  <p className="text-zinc-500 text-sm">Roll Number</p>
                  <h3 className="text-3xl font-bold">{student.roll_no || "—"}</h3>
                </div>

              <div>
                <p className="text-zinc-500 text-sm">Age</p>
                <h3 className="text-3xl font-bold">{student.age}</h3>
              </div>

              <div>
                <p className="text-zinc-500 text-sm">Address</p>
                <h3 className="text-2xl font-semibold">
                  {student.address || "Not Provided"}
                </h3>
              </div>
            </div>
          </div>

          <div className="border border-zinc-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-4xl font-bold mb-8">
              {isEditing ? "Edit Student" : "Student Information"}
            </h2>

            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <label className="text-sm text-zinc-500">Roll Number</label>
                  <input
                    type="text"
                    value={editedStudent.roll_no}
                    onChange={(e) =>
                      setEditedStudent({
                        ...editedStudent,
                        roll_no: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-500">Name</label>
                  <input
                    type="text"
                    value={editedStudent.name}
                    onChange={(e) =>
                      setEditedStudent({
                        ...editedStudent,
                        name: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-500">Grade</label>
                  <input
                    type="text"
                    value={editedStudent.grade}
                    onChange={(e) =>
                      setEditedStudent({
                        ...editedStudent,
                        grade: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-500">Age</label>
                  <input
                    type="number"
                    value={editedStudent.age}
                    onChange={(e) =>
                      setEditedStudent({
                        ...editedStudent,
                        age: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="text-sm text-zinc-500">Address</label>
                  <input
                    type="text"
                    value={editedStudent.address}
                    onChange={(e) =>
                      setEditedStudent({
                        ...editedStudent,
                        address: e.target.value,
                      })
                    }
                    className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleUpdate}
                    className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-zinc-800 transition"
                  >
                    Save Changes
                  </button>

                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 border border-zinc-300 py-3 rounded-xl hover:bg-zinc-100 transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="border-b pb-5">
                  <p className="text-zinc-500 mb-1">Name</p>
                  <h3 className="text-2xl font-semibold">{student.name}</h3>
                </div>

                <div className="border-b pb-5">
                  <p className="text-zinc-500 mb-1">Grade</p>
                  <h3 className="text-2xl font-semibold">{student.grade}</h3>
                </div>

                <div className="border-b pb-5">
                  <p className="text-zinc-500 mb-1">Age</p>
                  <h3 className="text-2xl font-semibold">{student.age}</h3>
                </div>

                <div className="border-b pb-5">
                  <p className="text-zinc-500 mb-1">Address</p>
                  <h3 className="text-2xl font-semibold">
                    {student.address || "Not Provided"}
                  </h3>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-zinc-800 transition"
                  >
                    Update Student
                  </button>

                  <button
                    onClick={handleDelete}
                    className="flex-1 border border-black py-3 rounded-xl hover:bg-black hover:text-white transition"
                  >
                    Delete Student
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}