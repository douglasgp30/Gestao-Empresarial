import { RequestHandler } from "express";
import { migrateToUnifiedDescriptions, checkMigrationNeeded } from "../lib/migrate-to-unified-descriptions";

export const runMigration: RequestHandler = async (req, res) => {
  try {
    console.log("[MIGRATION] Iniciando migração para sistema unificado...");
    
    const result = await migrateToUnifiedDescriptions();
    
    res.json({
      success: true,
      message: "Migração concluída com sucesso!",
      result
    });
  } catch (error) {
    console.error("[MIGRATION] Erro na migração:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
};

export const checkMigration: RequestHandler = async (req, res) => {
  try {
    const status = await checkMigrationNeeded();
    
    res.json({
      success: true,
      migrationNeeded: status.needed,
      details: status
    });
  } catch (error) {
    console.error("[MIGRATION] Erro ao verificar migração:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Erro desconhecido"
    });
  }
};
