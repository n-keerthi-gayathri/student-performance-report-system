"use client";

import { createContext, useContext, useState } from "react";

type ExcelContextType = {
  excelData: any[][];
  setExcelData: React.Dispatch<React.SetStateAction<any[][]>>;
  selectedStudent: any | null;
  setSelectedStudent: React.Dispatch<React.SetStateAction<any | null>>;
  selectedCharts: string[];
  setSelectedCharts: React.Dispatch<React.SetStateAction<string[]>>;
};

const ExcelContext = createContext<ExcelContextType | null>(null);

export const ExcelProvider = ({ children }: { children: React.ReactNode }) => {
  const [excelData, setExcelData] = useState<any[][]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [selectedCharts, setSelectedCharts] = useState<string[]>([]);

  return (
    <ExcelContext.Provider
      value={{
        excelData,
        setExcelData,
        selectedStudent,
        setSelectedStudent,
        selectedCharts,
        setSelectedCharts,
      }}
    >
      {children}
    </ExcelContext.Provider>
  );
};

export const useExcel = () => {
  const context = useContext(ExcelContext);
  if (!context) throw new Error("useExcel must be used inside provider");
  return context;
};
