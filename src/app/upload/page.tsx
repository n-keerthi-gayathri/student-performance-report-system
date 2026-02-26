"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import ExcelJS from "exceljs";
import { useExcel } from "@/app/context/ExcelContext"; 
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { excelData, setExcelData } = useExcel(); // ✅ use context

  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [showModal, setShowModal] = useState(false);

  /* ================= FILE PROCESSING ================= */

  const processFile = async (file: File) => {
    if (!file.name.endsWith(".xlsx")) {
      setError("Only Excel (.xlsx) files are allowed.");
      setSelectedFile(null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be under 5MB.");
      return;
    }

    setError("");
    setSelectedFile(file);

    try {
      const workbook = new ExcelJS.Workbook();
      const arrayBuffer = await file.arrayBuffer();
      await workbook.xlsx.load(arrayBuffer);

      const worksheet = workbook.worksheets[0];
      const rows: any[][] = [];

      worksheet.eachRow((row) => {
        if (Array.isArray(row.values)) {
          rows.push(row.values.slice(1));
        }
      });

      setExcelData(rows); // ✅ store globally
    } catch (err) {
      console.error(err);
      setError("Failed to read Excel file.");
      setSelectedFile(null);
    }
  };

  /* ================= INPUT CHANGE ================= */

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processFile(file);
  };

  /* ================= DRAG & DROP ================= */

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  /* ================= REMOVE ================= */

  const removeFile = () => {
    setSelectedFile(null);
    setExcelData([]); // clear global data
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col justify-between min-h-screen bg-white px-8 py-6">
      
      {/* Title */}
      <div className="flex flex-col items-center gap-6 mb-10">
        <Image src="/logo.png" alt="Logo" width={150} height={50} />
        <h1 className="text-3xl md:text-4xl font-bold text-blue-700 tracking-wide">
          UPLOAD EXCEL SHEET
        </h1>
      </div>

      {/* Upload Box */}
      <div className="flex justify-center">
        <div
          onClick={() => {
            if (!selectedFile) {
              fileInputRef.current?.click();
            } else if (excelData.length > 0) {
              setShowModal(true);
            }
          }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`w-full max-w-3xl h-72 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition p-6
            ${
              isDragging
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-gray-50 hover:border-blue-500"
            }
          `}
        >
          {!selectedFile ? (
            <>
              <Image src="/upload.svg" alt="Upload" width={100} height={80} />
              <p className="text-blue-700 font-medium mt-4">
                {isDragging
                  ? "Drop Excel file here"
                  : "Click or drag & drop Excel file"}
              </p>
              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </>
          ) : (
            <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md text-center relative hover:shadow-lg transition">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="absolute top-2 right-3 text-red-500 font-bold text-lg"
              >
                ✕
              </button>

              <div className="text-5xl mb-4">📊</div>

              <p className="font-semibold text-blue-700 truncate">
                {selectedFile.name}
              </p>

              <p className="text-gray-500 text-sm mt-1">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>

              <p className="text-xs text-gray-400 mt-3">
                Click to preview file
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="text-blue-600 font-medium">
          ← Main Menu
        </Link>

        <button
          disabled={!selectedFile}
          onClick={() => router.push("/students")} // ✅ navigate
          className={`px-6 py-2 rounded-full font-medium transition ${
            selectedFile
              ? "bg-orange-500 hover:bg-orange-600 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Continue
        </button>
      </div>

      {/* Excel Preview Modal */}
      {showModal && excelData.length > 0 && (
  <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
    
    <div className="bg-white rounded-xl p-6 w-4/5 max-h-[85vh] shadow-xl flex flex-col">
      
      {/* 🔹 Sticky Modal Header */}
      <div className="sticky top-0 bg-white z-20 flex justify-between items-center px-6 py-4 border-b rounded-t-xl">
        <h2 className="text-lg font-semibold text-blue-700 truncate max-w-[90%]">
          {selectedFile?.name} Preview
        </h2>

        <button
          onClick={() => setShowModal(false)}
          className="text-red-500 font-bold text-xl flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* 🔹 Scrollable Table Area */}
      <div className="overflow-auto flex-1">

        <table className="w-full border border-gray-300 text-sm text-gray-800">
          
          {/* Sticky Table Header */}
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              {excelData[0].map((cell, i) => (
                <th
                  key={i}
                  className="border px-3 py-2 font-semibold text-gray-900"
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {excelData.slice(1, 51).map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="border px-3 py-2"
                  >
                    {cell?.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

      </div>

      {/* Footer Info */}
      <div className="px-6 py-3 border-t text-xs text-gray-400 bg-white rounded-b-xl">
        Showing first 50 rows only
      </div>

    </div>
  </div>
)}

    </div>
  );
}
