import { RequestHandler } from "express";
import { seedDatabase } from "../lib/seed";

export const executeSeed: RequestHandler = async (req, res) => {
  try {
    console.log('🌱 Executando seed do banco de dados...');
    const result = await seedDatabase();
    
    res.json({
      success: true,
      message: 'Banco de dados populado com sucesso!',
      data: result
    });
  } catch (error) {
    console.error('Erro ao executar seed:', error);
    res.status(500).json({ 
      success: false,
      error: 'Erro ao popular banco de dados',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
