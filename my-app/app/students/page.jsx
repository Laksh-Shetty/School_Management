"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const Page = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");

  const [message, setMessage] = useState("");
  const [chatResponse, setChatResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const fetchStudents = async () => {
    try {
      const response = await fetch("http://localhost:8000/students");
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleChat = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command: message,
        }),
      });

      const data = await response.json();

      setChatResponse(data);

      await fetchStudents();

      if (data?.navigate?.path) {
        router.push(data.navigate.path);
      } else if (data?.function === "read_student") {
        const sid = data?.arguments?.student_id || data?.arguments?.id;
        if (sid) router.push(`/read/${sid}`);
      }

      setMessage("");
    } catch (error) {
      console.error("Chat Error:", error);

      setChatResponse({
        error: "Failed to connect to backend",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.name?.toLowerCase().includes(search.toLowerCase()) ||
      student.grade?.toLowerCase().includes(search.toLowerCase()) ||
      student.id?.toString().includes(search),
  );

  return (
    <div className="container mx-auto py-10">
      <div>
        <button
          onClick={() => router.push("/")}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-md transition mb-6 mx-[5vw] block"
        >
          Back to Home
        </button>
      </div>

      <h1 className="text-5xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-center">
        Student Management System
      </h1>

      <div className="flex justify-center mb-6">
        <button
          onClick={() => router.push("/create")}
          className="px-4 py-3 bg-green-500 text-white rounded hover:bg-green-600 transition-colors font-semibold"
        >
          Add Student
        </button>
      </div>

      <div className="w-[90vw] mx-auto mb-10">
        <div className="rounded-2xl border shadow-lg p-6 bg-white">
          <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            AI Assistant
          </h2>

          <p className="text-gray-600 mb-4">Examples:</p>

          <div className="grid md:grid-cols-2 gap-2 mb-6 text-sm">
            <div className="bg-gray-100 rounded p-2">
              Create student Laksh age 20 grade A address Mumbai id 1
            </div>

            <div className="bg-gray-100 rounded p-2">Show student id 1</div>

            <div className="bg-gray-100 rounded p-2">
              Update student 1 age 21 grade A address Pune
            </div>

            <div className="bg-gray-100 rounded p-2">Delete student 1</div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleChat();
                }
              }}
              placeholder="Ask the AI to create, update, delete, or find students..."
              className="flex-1 border rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <button
              onClick={handleChat}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>

          {chatResponse && (
            <div className="mt-6">
              <div className="bg-green-100 border border-green-300 rounded-xl p-4">
                <p className="font-semibold">{chatResponse.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <input
          type="text"
          placeholder="Search by ID, Name, or Grade..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[90vw] max-w-md border rounded-lg px-4 py-3 text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="rounded-xl border shadow-lg overflow-hidden w-[90vw] mx-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-lg font-bold text-blue-600">
                ID
              </TableHead>

              <TableHead className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Name
              </TableHead>

              <TableHead className="text-lg font-bold text-blue-600">
                Grade
              </TableHead>

              <TableHead className="text-lg font-bold text-purple-600">
                Age
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredStudents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="text-center py-6 text-gray-500"
                >
                  No students found
                </TableCell>
              </TableRow>
            ) : (
              filteredStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>{student.id}</TableCell>

                  <TableCell
                    onClick={() => router.push(`/read/${student.id}`)}
                    className="text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
                  >
                    {student.name}
                  </TableCell>

                  <TableCell>{student.grade}</TableCell>

                  <TableCell>{student.age}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
