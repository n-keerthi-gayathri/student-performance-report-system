"use client";

import Image from "next/image";
import Link from "next/link";
import { useExcel } from "@/app/context/ExcelContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { PieChart, Pie, Cell, Legend } from "recharts";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { useRef, useState } from "react";
import { usePDF } from "react-to-pdf";
import jsPDF from "jspdf";
import { toPng } from "html-to-image";
import { useRouter } from "next/navigation";

export default function RemarksPage() {
  // ===== STANDARD REMARK DEFINITIONS =====

  const disciplineRemarks = {
    excellent:
      "Demonstrates exceptional discipline with strong adherence to schedule and academic commitments.",
    good: "Maintains good discipline and generally follows instructions and routines effectively.",
    moderate:
      "Shows moderate discipline but needs consistency in maintaining structured study habits.",
    low: "Requires improvement in maintaining discipline and following structured routines regularly.",
  };

  const consistencyRemarks = {
    excellent:
      "Displays remarkable consistency in study effort and performance stability.",
    good: "Shows good consistency with steady academic engagement.",
    moderate:
      "Consistency fluctuates at times and requires improved regularity.",
    low: "Needs to develop stable and consistent study habits.",
  };

  const selfMotivationRemarks = {
    excellent: "Highly self-driven and proactive in academic preparation.",
    good: "Shows good initiative and willingness to take responsibility for learning.",
    moderate: "Requires occasional external push to maintain motivation.",
    low: "Needs to develop stronger self-motivation and independent learning habits.",
  };

  const accountabilityRemarks = {
    excellent:
      "Demonstrates strong ownership of responsibilities and timely responses.",
    good: "Maintains reasonable accountability with minor scope for improvement.",
    moderate: "Needs to improve response time and responsibility handling.",
    low: "Requires significant improvement in accountability and follow-through.",
  };

  const stressRemarks = {
    excellent:
      "Handles academic pressure exceptionally well and maintains composure.",
    good: "Manages stress effectively with good emotional balance.",
    moderate:
      "Shows moderate stress management but may struggle during pressure situations.",
    low: "Needs to improve emotional regulation and stress handling skills.",
  };
  const getRemark = (score: number, remarkSet: any) => {
    if (score >= 8) return remarkSet.excellent;
    if (score >= 6.5) return remarkSet.good;
    if (score >= 5) return remarkSet.moderate;
    return remarkSet.low;
  };
  const chartRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const [remarks, setRemarks] = useState("");
  const { selectedStudent, selectedCharts } = useExcel();

  if (!selectedStudent) {
    return <div className="p-10 text-center">No student selected.</div>;
  }

  const studentNumber = selectedStudent[0];
  const studentName = selectedStudent[1];
  const { toPDF, targetRef } = usePDF({
    filename: `${studentName}_Report.pdf`,
  });

  // Example static data (later we can map from Excel)
  // const chartData = [
  //   { subject: "Math", score: 85 },
  //   { subject: "Science", score: 78 },
  //   { subject: "English", score: 70 },
  //   { subject: "History", score: 92 },
  //   { subject: "Art", score: 88 },
  // ];
  const { excelData } = useExcel();
  const headers = excelData[0];

  // const chartData = headers.slice(2).map((subject, index) => ({
  //   subject: subject,
  //   score: Number(selectedStudent[index + 2]) || 0,
  // }));

  const isBarSelected = selectedCharts.includes("Bar Graph");
  const gradeToScore = (grade: string) => {
    switch (grade?.toLowerCase()) {
      case "high":
        return 8;
      case "moderate":
        return 6;
      case "low":
        return 4;
      default:
        return 0;
    }
  };
  const calculateCategoryAverage = (startIndex: number) => {
    const scores = [
      gradeToScore(selectedStudent[startIndex]),
      gradeToScore(selectedStudent[startIndex + 1]),
      gradeToScore(selectedStudent[startIndex + 2]),
    ];

    const total = scores.reduce((a, b) => a + b, 0);
    return (total / 3).toFixed(2);
  };
  // Ensure scores are always numbers
  const disciplineScore = Number(calculateCategoryAverage(2));
  const consistencyScore = Number(calculateCategoryAverage(5));
  const selfMotivationScore = Number(calculateCategoryAverage(8));
  const accountabilityScore = Number(calculateCategoryAverage(11));
  const stressHandlingScore = Number(calculateCategoryAverage(14));

  const parameterRemarks = [
    {
      parameter: "Discipline",
      score: disciplineScore,
      remark: getRemark(disciplineScore, disciplineRemarks),
    },
    {
      parameter: "Consistency",
      score: consistencyScore,
      remark: getRemark(consistencyScore, consistencyRemarks),
    },
    {
      parameter: "Self-Motivation",
      score: selfMotivationScore,
      remark: getRemark(selfMotivationScore, selfMotivationRemarks),
    },
    {
      parameter: "Accountability",
      score: accountabilityScore,
      remark: getRemark(accountabilityScore, accountabilityRemarks),
    },
    {
      parameter: "Stress Handling",
      score: stressHandlingScore,
      remark: getRemark(stressHandlingScore, stressRemarks),
    },
  ];
  const radarData = [
    { parameter: "Discipline", score: disciplineScore },
    { parameter: "Consistency", score: consistencyScore },
    { parameter: "Self-Motivation", score: selfMotivationScore },
    { parameter: "Accountability", score: accountabilityScore },
    { parameter: "Stress Handling", score: stressHandlingScore },
  ];
  const overallScore = (
    (Number(disciplineScore) +
      Number(consistencyScore) +
      Number(selfMotivationScore) +
      Number(accountabilityScore) +
      Number(stressHandlingScore)) /
    5
  ).toFixed(2);

  const chartData = [
    { parameter: "Discipline", score: Number(disciplineScore) },
    { parameter: "Consistency", score: Number(consistencyScore) },
    { parameter: "Self-Motivation", score: Number(selfMotivationScore) },
    { parameter: "Accountability", score: Number(accountabilityScore) },
    { parameter: "Stress Handling", score: Number(stressHandlingScore) },
  ];
  const pieData = chartData.map((item) => ({
    name: item.parameter,
    value: item.score,
  }));
  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const handleDownload = async () => {
    const pdf = new jsPDF("p", "mm", "a4");

    let currentY = 20;

    // ===== Title =====
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.text("Student Test Report", 105, currentY, { align: "center" });

    currentY += 20;

    // ===== Student Info =====
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(12);
    pdf.text(`Student Name: ${studentName}`, 20, currentY);
    currentY += 10;
    pdf.text(`Student Number: ${studentNumber}`, 20, currentY);

    currentY += 15;

    // ===== Insert Bar Chart =====
    if (selectedCharts.includes("Bar Graph") && barChartRef.current) {
      const barImage = await toPng(barChartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      pdf.addImage(barImage, "PNG", 20, currentY, 170, 90);
      currentY += 100;
    }

    // ===== Insert Pie Chart =====
    if (selectedCharts.includes("Pie Chart") && pieChartRef.current) {
      const pieImage = await toPng(pieChartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      pdf.addImage(pieImage, "PNG", 20, currentY, 170, 90);
      currentY += 100;
    }
    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }
    // ===== Insert Radar Chart =====
    if (selectedCharts.includes("Radar Chart") && radarChartRef.current) {
      const radarImage = await toPng(radarChartRef.current, {
        cacheBust: true,
        pixelRatio: 2,
      });

      pdf.addImage(radarImage, "PNG", 20, currentY, 170, 90);
      currentY += 100;
    }

    // If content exceeds page height, add new page
    if (currentY > 250) {
      pdf.addPage();
      currentY = 20;
    }

    // ===== Parameter Score Breakdown =====
    pdf.setFont("helvetica", "bold");
    pdf.text("Parameter Scores:", 20, currentY);
    currentY += 10;

    pdf.setFont("helvetica", "bold");
    pdf.text("Detailed Evaluation:", 20, currentY);
    currentY += 10;

    pdf.setFont("helvetica", "normal");

    parameterRemarks.forEach((item) => {
      const text = `${item.parameter}: ${item.remark}`;
      const splitText = pdf.splitTextToSize(text, 170);
      pdf.text(splitText, 20, currentY);
      currentY += splitText.length * 7 + 5;
    });
    currentY += 10;

    pdf.setFont("helvetica", "normal");

    chartData.forEach((item) => {
      pdf.text(
        `${item.parameter}: ${item.score.toFixed(2)} / 10`,
        25,
        currentY,
      );
      currentY += 8;
    });

    currentY += 5;

    // ===== Overall Score =====
    pdf.setFont("helvetica", "bold");
    pdf.text(`Overall Rating: ${overallScore} / 10`, 20, currentY);

    currentY += 15;

    // ===== Remarks =====
    if (remarks) {
      pdf.setFont("helvetica", "bold");
      pdf.text("Remarks:", 20, currentY);
      currentY += 10;

      pdf.setFont("helvetica", "normal");
      pdf.text(remarks, 20, currentY, { maxWidth: 170 });
    }

    // ===== Save =====
    pdf.save(`${studentName}_Report.pdf`);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-300 rounded-lg shadow-md p-3">
          <p className="font-semibold text-gray-800">{label}</p>
          <p className="text-blue-600 font-medium">Score: {payload[0].value}</p>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-white px-10 py-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <button onClick={() => router.back()} className="text-blue-600">
          ← Go Back
        </button>

        <h1 className="text-4xl font-bold text-blue-700 text-center mb-10">
          Report Preview
        </h1>
        <Image src="/logo.png" alt="Logo" width={120} height={40} />
      </div>

      {/* Report Card */}
      <div className="flex justify-center">
        <div
          ref={targetRef}
          className="w-[800px] bg-gray-100 rounded-3xl p-8 shadow-xl"
        >
          <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">
            Student Report
          </h3>

          <p className="mb-6 text-center text-gray-800">
            <strong>{studentName}</strong> | Student No: {studentNumber}
          </p>

          {isBarSelected && (
            <div ref={barChartRef} className="bg-white rounded-xl p-6 shadow">
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                Subject Scores
              </h4>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="parameter" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                    <LabelList
                      dataKey="score"
                      position="top"
                      formatter={(value) =>
                        typeof value === "number" ? value.toFixed(2) : value
                      }
                      style={{ fontWeight: 600, fill: "#1f2937" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {selectedCharts.includes("Pie Chart") && (
            <div
              ref={pieChartRef}
              className="bg-white rounded-xl p-6 shadow mt-8"
            >
              <h4 className="text-lg font-semibold mb-4 text-gray-800">
                Parameter Distribution
              </h4>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry) =>
                      `${entry.name}: ${entry.value.toFixed(2)}`
                    }
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
          {selectedCharts.includes("Radar Chart") && (
            <div
              ref={radarChartRef}
              className="bg-white p-6 rounded-xl shadow mt-8"
            >
              <h3 className="text-lg font-semibold mb-4 text-gray-800">
                Performance Overview
              </h3>

              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="parameter" />
                    <PolarRadiusAxis domain={[0, 10]} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                    />
                    <Tooltip content={<CustomTooltip />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          <div className="mt-8 bg-white p-6 rounded-xl shadow">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              Detailed Evaluation
            </h3>

            {parameterRemarks.map((item, index) => (
              <div key={index} className="mb-4">
                <p className="font-semibold text-blue-700">{item.parameter}</p>
                <p className="text-gray-700 text-sm mt-1">{item.remark}</p>
              </div>
            ))}
          </div>
          <h3 className="text-xl font-bold mt-6 text-gray-800">
            Overall Rating: {overallScore} / 10
          </h3>
          {remarks && (
            <div className="mt-8 bg-white p-4 rounded-xl">
              <h4 className="font-semibold mb-2 text-gray-800">Remarks:</h4>
              <p className="text-gray-800">{remarks}</p>
            </div>
          )}
        </div>
      </div>

      {/* Remarks Section */}
      <div className="flex justify-center mt-8">
        <textarea
          placeholder="Add Remarks(Optional)"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-[800px] border-2 border-blue-400 rounded-xl p-4 text-gray-800"
          rows={4}
        />
      </div>

      <div className="flex justify-center mt-6">
        <button
          onClick={handleDownload}
          className="bg-blue-500 text-white px-6 py-2 rounded-full"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
