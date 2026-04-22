import fs from 'fs/promises';
import { APP_PATHS } from '../infrastructure/config/paths.js';

type UnknownKeywordRecord = Record<string, unknown>;

const asString = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

const normalizeKeywordEntry = (item: unknown): string => {
    if (typeof item === 'string') {
        return item.trim();
    }

    if (!item || typeof item !== 'object') {
        return '';
    }

    const record = item as UnknownKeywordRecord;
    return (
        asString(record.keyword) ||
        asString(record.Keyword) ||
        asString(record.label) ||
        asString(record.Label) ||
        asString(record.value) ||
        asString(record.Value) ||
        ''
    );
};

const normalizeKeywordList = (keywords: string[]): string[] =>
    keywords.map((keyword) => keyword.trim()).filter(Boolean);

const dedupeKeywordList = (keywords: string[]): string[] => {
    const seen = new Set<string>();

    return keywords.filter((keyword) => {
        const normalized = keyword.toLowerCase();

        if (seen.has(normalized)) {
            return false;
        }

        seen.add(normalized);
        return true;
    });
};

export const readKeywords = async (): Promise<string[]> => {
    try {
        const data = await fs.readFile(APP_PATHS.keywords, 'utf-8');
        const parsed = JSON.parse(data);

        if (Array.isArray(parsed)) {
            return dedupeKeywordList(normalizeKeywordList(parsed.map(normalizeKeywordEntry)));
        }

        if (parsed && typeof parsed === 'object') {
            const record = parsed as UnknownKeywordRecord;

            if (Array.isArray(record.keywords)) {
                return dedupeKeywordList(normalizeKeywordList(record.keywords.map(normalizeKeywordEntry)));
            }
        }

        return [];
    } catch {
        return [];
    }
};

export const fetchKeywords = readKeywords;

export const saveKeywords = async (keywords: string[]): Promise<void> => {
    const normalized = dedupeKeywordList(normalizeKeywordList(keywords));
    await fs.writeFile(APP_PATHS.keywords, JSON.stringify(normalized, null, 2));
};

export const addKeyword = async (keyword: string): Promise<string[]> => {
    const currentKeywords = await readKeywords();
    const nextKeyword = keyword.trim();

    if (!nextKeyword) {
        return currentKeywords;
    }

    const alreadyExists = currentKeywords.some(
        (existingKeyword) => existingKeyword.toLowerCase() === nextKeyword.toLowerCase(),
    );

    if (!alreadyExists) {
        currentKeywords.push(nextKeyword);
        await saveKeywords(currentKeywords);
    }

    return currentKeywords;
};

export const deleteKeyword = async (index: number): Promise<string[]> => {
    const currentKeywords = await readKeywords();

    if (index < 0 || index >= currentKeywords.length) {
        return currentKeywords;
    }

    currentKeywords.splice(index, 1);
    await saveKeywords(currentKeywords);

    return currentKeywords;
};

export const removeKeyword = async (keyword: string): Promise<string[]> => {
    const currentKeywords = await readKeywords();
    const normalizedKeyword = keyword.trim().toLowerCase();

    if (!normalizedKeyword) {
        return currentKeywords;
    }

    const nextKeywords = currentKeywords.filter(
        (existingKeyword) => existingKeyword.trim().toLowerCase() !== normalizedKeyword,
    );

    if (nextKeywords.length !== currentKeywords.length) {
        await saveKeywords(nextKeywords);
    }

    return nextKeywords;
};
