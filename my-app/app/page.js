import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-black">
      <section className="max-w-7xl mx-auto px-6 lg:px-12 min-h-screen flex items-center">
        <div className="grid lg:grid-cols-2 gap-20 items-center w-full">
          <div>
            

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-none tracking-tight">
              Manage
              <br />
              Students
              <br />
              Smarter.
            </h1>

            <p className="mt-8 text-lg md:text-xl text-zinc-600 max-w-2xl leading-relaxed">
              A centralized platform for managing student records, tracking
              academic performance, organizing enrollment data, and maintaining
              educational information with efficiency and accuracy.
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href="/students">
                <button className="bg-black text-white px-8 py-4 rounded-xl font-semibold hover:scale-105 transition-all duration-300">
                  View Students
                </button>
              </Link>

              <button className="border border-zinc-300 px-8 py-4 rounded-xl font-semibold hover:bg-zinc-100 transition-all duration-300">
                Learn More
              </button>
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16">
              <div>
                <h3 className="text-4xl font-bold">500+</h3>
                <p className="text-zinc-500 mt-2">Students</p>
              </div>

              <div>
                <h3 className="text-4xl font-bold">50+</h3>
                <p className="text-zinc-500 mt-2">Classes</p>
              </div>

              <div>
                <h3 className="text-4xl font-bold">100%</h3>
                <p className="text-zinc-500 mt-2">Digital Records</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-xl bg-black text-white rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Dashboard</h2>

                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                  <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <p className="text-zinc-400 text-sm">Total Students</p>
                  <h3 className="text-5xl font-bold mt-3">526</h3>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <p className="text-zinc-400 text-sm">Active Classes</p>
                    <h3 className="text-3xl font-bold mt-3">48</h3>
                  </div>

                  <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                    <p className="text-zinc-400 text-sm">Average Grade</p>
                    <h3 className="text-3xl font-bold mt-3">A-</h3>
                  </div>
                </div>

                <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">
                  <p className="text-zinc-400 text-sm mb-4">
                    Student Record Activity
                  </p>

                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>New Admissions</span>
                      <span className="font-semibold">+24</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Updated Records</span>
                      <span className="font-semibold">132</span>
                    </div>

                    <div className="flex justify-between">
                      <span>Graduated Students</span>
                      <span className="font-semibold">18</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <section className="border-t border-zinc-200 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <h2 className="text-5xl font-bold text-center mb-16">
            Everything You Need
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="border border-zinc-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-4">
                Student Records
              </h3>

              <p className="text-zinc-600 leading-relaxed">
                Store and manage student information including personal,
                academic, and enrollment details in one place.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-4">
                Academic Tracking
              </h3>

              <p className="text-zinc-600 leading-relaxed">
                Monitor grades, performance metrics, attendance, and academic
                progress with ease.
              </p>
            </div>

            <div className="border border-zinc-200 rounded-3xl p-8">
              <h3 className="text-2xl font-bold mb-4">
                Secure Management
              </h3>

              <p className="text-zinc-600 leading-relaxed">
                Maintain accurate and organized records through a secure and
                scalable management system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}