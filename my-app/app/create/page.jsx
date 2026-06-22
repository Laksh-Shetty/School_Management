"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

async function handleSubmit(event) {
  event.preventDefault();

  const formData = new FormData(event.target);

  const data = {
    roll_no: formData.get("roll_no"),
    name: formData.get("name"),
    grade: formData.get("grade"),
    age: parseInt(formData.get("age")),
    address: formData.get("address"),
  };

  try {
    const response = await fetch("http://localhost:8000/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    console.log("Status:", response.status);

    const result = await response.text();
    console.log("Response:", result);

    if (!response.ok) {
      alert(result);
      return;
    }

    router.push("/students");
  } catch (error) {
    console.error(error);
    alert("Something went wrong");
  }
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
              Student Registration
            </p>

            <h1 className="text-5xl md:text-6xl font-black mt-4">
              Create New
              <br />
              Student
            </h1>

            <p className="mt-8 text-zinc-400 text-lg leading-relaxed">
              Add a new student to the management system by filling out the
              required details. All information will be stored securely and made
              available throughout the portal.
            </p>

            <div className="mt-12 space-y-8">
              <div>
                <p className="text-zinc-500 text-sm">Student Records</p>
                <h3 className="text-3xl font-bold">Centralized</h3>
              </div>

              <div>
                <p className="text-zinc-500 text-sm">Data Storage</p>
                <h3 className="text-3xl font-bold">Secure</h3>
              </div>

              <div>
                <p className="text-zinc-500 text-sm">Management</p>
                <h3 className="text-3xl font-bold">Efficient</h3>
              </div>
            </div>
          </div>

          <div className="border border-zinc-200 rounded-3xl p-10 shadow-sm">
            <h2 className="text-4xl font-bold mb-8">Student Information</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="text-sm text-zinc-500">Roll Number</label>

                <input
                  type="text"
                  name="roll_no"
                  placeholder="Enter roll number"
                  required
                  className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-500">Full Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter student name"
                  required
                  className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-500">Grade</label>

                <input
                  type="text"
                  name="grade"
                  placeholder="Enter student grade"
                  required
                  className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-500">Age</label>

                <input
                  type="number"
                  name="age"
                  placeholder="Enter student age"
                  required
                  className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="text-sm text-zinc-500">Address</label>

                <input
                  type="text"
                  name="address"
                  placeholder="Enter student address"
                  required
                  className="w-full mt-2 border border-zinc-300 rounded-xl px-4 py-3 outline-none focus:border-black"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-xl font-semibold hover:bg-zinc-800 transition-all duration-300"
              >
                Create Student
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
