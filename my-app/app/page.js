import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen py-2 bg-gray-100">
      <h1 className="text-6xl font-bold text-center pt-8 bg-gradient-to-r from-purple-700 via-blue-500 to-green-500 bg-clip-text text-transparent">
        Student Management Portal
      </h1>

<div className="min-h-screen flex items-center justify-center px-4 ">
  <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl flex flex-col md:flex-row w-full max-w-6xl overflow-hidden">

    <div className="w-full md:w-3/5 p-8 md:p-12 flex flex-col justify-center">
      <div className="text-left font-bold text-xl mb-8">
        <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
          Student
        </span>{" "}
        Management
      </div>

      <div>
        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight text-gray-800 mb-4">
          Welcome to the
          <br />
          <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
            Student Management Portal
          </span>
        </h2>

        <div className="w-16 h-1 bg-gradient-to-r from-blue-600 to-indigo-500 rounded-full mb-5"></div>

        <p className="text-gray-500 text-base md:text-lg leading-relaxed max-w-lg">
          Manage student records, track academic information, and organize data
          efficiently with a modern and powerful platform built for seamless
          administration.
        </p>
      </div>
    </div>

    <div
      className="
        w-full md:w-2/5
        bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600
        text-white
        flex flex-col justify-center
        px-8 md:px-12
        py-12 md:py-20
      "
    >
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Get Started
      </h2>

      <div className="w-16 h-1 bg-white rounded-full mb-5"></div>

      <p className="text-blue-100 text-base md:text-lg mb-10 leading-relaxed">
        Start managing student records with ease and keep everything organized
        in one secure and centralized place.
      </p>

      <Link href="/students" className="w-fit">
      <button
        className="
          bg-white text-blue-600 font-bold
          py-3 px-8 rounded-full
          shadow-lg
          hover:scale-105
          hover:shadow-xl
          transition-all duration-300
          w-fit
        "
      >
        Start Now →
      </button>
      </Link>
    </div>

  </div>
</div>
    </div>
  );
}
