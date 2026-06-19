"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const data = {
        id: parseInt(formData.get("id")),
      name: formData.get("name"),
      grade: formData.get("grade"),
      age: parseInt(formData.get("age")),
      address: formData.get("address"),
    };

    fetch("http://localhost:8000/create", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
})
  .then(async (response) => {
    const result = await response.json();

    if (response.status === 400) {
      alert("Student with this ID already exists!");
      return;
    }

    if (!response.ok) {
      alert("Failed to create student.");
      return;
    }

    console.log("Student created:", result);
    router.push("/students");
  })
  .catch((error) => {
    console.error("Error creating student:", error);
    alert("Something went wrong.");
  });
  }

  return (
    <div className="container mx-auto py-10 w-[90vw]">

        <div>
        <button
          onClick={() => router.push("/students")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition mb-6 justify-self-end"
        >
          Back to Students List
        </button>
      </div>
      
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
        Create New Student
      </h1>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-gray-700">ID</label>
          <input
            type="number"
            name="id"
            className="mt-1 block w-full rounded-md border p-2 text-black"
            placeholder="Enter student ID"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border p-2 text-black"
            placeholder="Enter student name"
            name="name"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Grade
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border p-2 text-black"
            placeholder="Enter student grade"
            name="grade"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Age</label>
          <input
            type="number"
            className="mt-1 block w-full rounded-md border p-2 text-black"
            placeholder="Enter student age"
            name="age"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border p-2 text-black"
            placeholder="Enter student address"
            name="address"
            required
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Create Student
        </button>
      </form>
    </div>
  );
}
