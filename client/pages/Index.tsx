import { DemoResponse } from "@shared/api";
import { useEffect, useState } from "react";

export default function Index() {
  const [exampleFromServer, setExampleFromServer] = useState("");
  // Fetch users on component mount
  useEffect(() => {
    fetchDemo();
  }, []);

  // Example of how to fetch data from the server (if needed)
  const fetchDemo = async () => {
    try {
      const response = await fetch("/api/demo");
      const data = (await response.json()) as DemoResponse;
      setExampleFromServer(data.message);
    } catch (error) {
      console.error("Error fetching hello:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-2 sm:p-6">
      <div className="w-full max-w-2xl mx-auto bg-white/80 rounded-2xl shadow-lg p-6 sm:p-10 flex flex-col items-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2 text-center">Bem-vindo ao Sistema de Gestão Empresarial</h1>
        <p className="text-base sm:text-lg text-gray-700 text-center mb-6">Gerencie suas operações, finanças, agendamentos e muito mais de forma simples e eficiente.</p>
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div className="bg-blue-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-blue-700 font-semibold">Acesse o menu lateral</span>
            <span className="text-sm text-blue-600 mt-1 text-center">Utilize o menu para navegar entre os módulos do sistema.</span>
          </div>
          <div className="bg-green-50 rounded-lg p-4 flex flex-col items-center">
            <span className="text-green-700 font-semibold">Totalmente responsivo</span>
            <span className="text-sm text-green-600 mt-1 text-center">Funciona perfeitamente em computadores, tablets e celulares.</span>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-gray-400">{exampleFromServer}</div>
      </div>
    </div>
  );
}
