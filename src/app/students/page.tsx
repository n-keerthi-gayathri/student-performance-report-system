"use client";

import Image from "next/image";
import Link from "next/link";
import { useExcel } from "@/app/context/ExcelContext";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StudentsPage() {
  const {
    excelData,
    setSelectedStudent,
    selectedStudent,
    selectedCharts,
    setSelectedCharts,
  } = useExcel();

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  // const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  // const [selectedCharts, setSelectedCharts] = useState<string[]>([]);
  const chartOptions = ["Bar Graph", "Pie Chart", "Radar Chart"];

  const router = useRouter();

  if (excelData.length === 0) {
    return (
      <div className="p-10 text-center">
        No data found. Please upload Excel file first.
      </div>
    );
  }

  const headers = excelData[1]; // second row as header
  const rows = excelData.slice(2); // data starts from row 3

  // Pagination logic
  const totalPages = Math.ceil(rows.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentRows = rows.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="min-h-screen bg-white px-10 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Link href="/upload" className="text-blue-600">
          ← Go Back
        </Link>
        <h1 className="text-4xl font-bold text-blue-700 text-center mb-10">
          STUDENT LIST
        </h1>
        <Image src="/logo.png" alt="Logo" width={120} height={40} />
      </div>

      {/* Table */}
      <div className="flex justify-center">
        <table className="border border-gray-400 text-sm min-w-[400px] text-gray-800">
          <thead>
            <tr>
              {headers.slice(0, 2).map((header, i) => (
                <th
                  key={i}
                  className="border px-6 py-3 bg-gray-100 font-semibold"
                >
                  {header}
                </th>
              ))}
              <th className="border px-6 py-3 bg-gray-100">Generate Report</th>
            </tr>
          </thead>

          <tbody>
            {currentRows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.slice(0, 2).map((cell, cellIndex) => (
                  <td key={cellIndex} className="border px-6 py-3 text-center">
                    {cell}
                  </td>
                ))}

                <td className="border px-6 py-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedStudent(row);
                      setShowReportModal(true);
                    }}
                    className="bg-blue-500 hover:bg-orange-600 text-white px-4 py-1 rounded-full text-xs"
                  >
                    Generate Report
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-4 mt-8">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className={`px-4 py-1 rounded ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Previous
        </button>

        <span className="font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className={`px-4 py-1 rounded ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
      {showReportModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-[#2b2b2b] text-white rounded-2xl w-[50%] p-10 relative shadow-2xl">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedCharts([]);
                setShowReportModal(false);
              }}
              className="absolute top-4 right-6 text-red-500 text-2xl"
            >
              ✕
            </button>

            <h2 className="text-3xl font-semibold text-center text-blue-300">
              Select type of Charts:
            </h2>

            <p className="text-center mt-2 text-blue-200 italic">
              Student Number: {selectedStudent[0]}
              <br></br> Name: {selectedStudent[1]}
            </p>

            {/* Chart Options */}
            <div className="grid grid-cols-2 gap-12 mt-12 px-20">
              {chartOptions.map((chart, index) => (
                <label
                  key={index}
                  className="flex items-center gap-4 cursor-pointer text-xl"
                >
                  <input
                    type="checkbox"
                    checked={selectedCharts.includes(chart)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedCharts([...selectedCharts, chart]);
                      } else {
                        setSelectedCharts(
                          selectedCharts.filter((item) => item !== chart),
                        );
                      }
                    }}
                    className="w-6 h-6 accent-blue-500"
                  />
                  {chart}
                </label>
              ))}
            </div>
            <div className="flex justify-center mt-12">
              <button
                disabled={selectedCharts.length === 0}
                onClick={() => {
                  setSelectedStudent(selectedStudent);
                  console.log("student: Selected Student:", selectedStudent);
                  router.push("/remarks");
                }}
                className={`px-6 py-2 rounded-full text-lg transition ${
                  selectedCharts.length === 0
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
