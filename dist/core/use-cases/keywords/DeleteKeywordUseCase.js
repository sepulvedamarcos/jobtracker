// src/core/use-cases/keywords/DeleteKeywordUseCase.ts
import { readKeywords, saveKeywords } from '../../../services/keywords.js';
export const deleteKeywordUseCase = async (index) => {
    try {
        const currentKeywords = await readKeywords();
        if (index < 0 || index >= currentKeywords.length) {
            return { success: false, message: 'Índice fuera de rango.' };
        }
        const deleted = currentKeywords[index];
        const nextKeywords = currentKeywords.filter((_, i) => i !== index);
        await saveKeywords(nextKeywords);
        return {
            success: true,
            message: `Keyword "${deleted}" eliminada.`
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, message: msg };
    }
};
