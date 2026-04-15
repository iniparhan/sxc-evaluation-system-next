"use client";

import Image from "next/image";

export default function HRPage() {
  const data = [
    {
      no: 1,
      indicator: "Impact and Influence (IMP)",
      rows: [
        { name: "Bryant", scores: [5, "-", "-", "-", 3] },
        { name: "Rizki", scores: [5, "-", "-", "-", 3] },
      ],
    },
    {
      no: 2,
      indicator: "Developing Others",
      rows: [
        { name: "Nazhira", scores: [5, "-", "-", "-", 3] },
        { name: "Balqis", scores: [5, "-", "-", "-", 3] },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#cdcdcd] flex flex-col">
      {/* HEADER */}
      <header className="bg-gradient-to-b from-[#031b3e] to-[#0c326a] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="/grandlogo-putih-1.png"
            alt="logo"
            width={120}
            height={60}
          />
          <h1 className="text-white font-bold text-lg md:text-2xl">
            Performance Appraisal
          </h1>
        </div>

        <button className="text-white">⎋</button>
      </header>

      {/* MAIN */}
      <div className="flex flex-1">
        {/* SIDEBAR */}
        <aside className="hidden md:flex w-72 bg-white p-6 flex-col gap-6 shadow">
          <div>
            <h2 className="font-bold text-[#0b2f63] text-xl">
              StudentxCEOs <br /> East Java
            </h2>
            <p className="text-[#0b2f63]">Batch 7</p>
          </div>

          <nav className="flex flex-col gap-3 text-[#0b2f63]">
            <p>Dashboard</p>
            <p>C-Level</p>
            <p>Marketing</p>
            <p>Finance</p>
            <p>Operations</p>
            <p className="font-bold">Human Resources</p>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="flex-1 p-6 md:p-10 space-y-10">
          {/* TITLE */}
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0b2f63]">
              Human Resources
            </h1>
            <p className="text-[#0b2f63]">
              Lets go we look at this summary
            </p>
          </div>

          {/* SECTION 1 */}
          <Section title="Staff to BoD" data={data} />

          {/* DOWNLOAD */}
          <button className="bg-[#083577] text-white px-6 py-3 rounded-xl shadow">
            Download CSV
          </button>

          {/* SECTION 2 */}
          <Section title="BoD to Staff" data={data} />

          {/* DOWNLOAD */}
          <button className="bg-[#083577] text-white px-6 py-3 rounded-xl shadow">
            Download CSV
          </button>
        </main>
      </div>
    </div>
  );
}

/* ================= COMPONENT ================= */

function Section({
  title,
  data,
}: {
  title: string;
  data: any[];
}) {
  return (
    <div className="space-y-4">
      {/* TITLE */}
      <div className="bg-white border-2 border-[#0b2f63] rounded-xl py-4 text-center font-bold text-[#0b2f63] text-xl">
        {title}
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow p-4 overflow-x-auto">
        <table className="w-full text-sm text-[#0b2f63]">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">No</th>
              <th className="p-2">Indicator</th>
              <th className="p-2">Name</th>
              <th className="p-2 text-center">Scores</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item) =>
              item.rows.map((row: any, index: number) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{item.no}</td>
                  <td className="p-2">{item.indicator}</td>
                  <td className="p-2">{row.name}</td>
                  <td className="p-2 text-center">
                    {row.scores.join(" | ")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}