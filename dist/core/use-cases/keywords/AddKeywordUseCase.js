// src/core/use-cases/keywords/AddKeywordUseCase.ts
import { readKeywords, saveKeywords } from '../../../services/keywords.js';
export const addKeywordUseCase = async (keyword) => {
    const trimmed = keyword.trim();
    if (!trimmed) {
        return { success: false, message: 'La keyword no puede estar vacía.' };
    }
    try {
        const currentKeywords = await readKeywords();
        // Check duplicates
        const alreadyExists = currentKeywords.some((k) => k.toLowerCase() === trimmed.toLowerCase());
        if (alreadyExists) {
            return { success: false, message: 'La keyword ya existe.' };
        }
        const nextKeywords = [...currentKeywords, trimmed];
        await saveKeywords(nextKeywords);
        return {
            success: true,
            message: `Keyword "${trimmed}" agregada.`
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        return { success: false, message: msg };
    }
};
