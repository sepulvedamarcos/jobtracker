// src/core/use-cases/keywords/ListKeywordsUseCase.ts
import { readKeywords } from '../../../services/keywords.js';

export interface ListKeywordsResult {
  success: boolean;
  keywords: string[];
  message?: string;
}

export const listKeywordsUseCase = async (): Promise<ListKeywordsResult> => {
  try {
    const keywords = await readKeywords();
    
    return { 
      success: true, 
      keywords,
      message: keywords.length > 0 
        ? `${keywords.length} keywords cargadas.`
        : 'No hay keywords configuradas.'
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error desconocido';
    return { success: false, keywords: [], message: msg };
  }
};