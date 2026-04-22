// src/infrastructure/storage/JsonJobRepository.ts
import fs from 'fs/promises';
import { IJobRepository } from '../../core/ports/IJobRepository.js';
import { AppliedJob, Job } from '../../core/entities/Job.js';
import { APP_PATHS } from '../config/paths.js';

type UnknownJobRecord = Record<string, unknown>;

const asString = (value: unknown): string => (typeof value === 'string' ? value : '');

const getField = (record: UnknownJobRecord, ...keys: string[]): unknown => {
  for (const key of keys) {
    if (key in record) {
      return record[key];
    }
  }

  const lowerCaseEntries = Object.entries(record).reduce<UnknownJobRecord>((acc, [key, value]) => {
    acc[key.toLowerCase()] = value;
    return acc;
  }, {});

  for (const key of keys) {
    const normalizedKey = key.toLowerCase();
    if (normalizedKey in lowerCaseEntries) {
      return lowerCaseEntries[normalizedKey];
    }
  }

  return undefined;
};

const normalizeStoredJob = (item: unknown): Job | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as UnknownJobRecord;
  const link = asString(getField(record, 'link', 'url', 'value', 'Link', 'URL'));
  const title = asString(getField(record, 'title', 'label', 'Title'));
  const company = asString(getField(record, 'company', 'empresa', 'Company'));
  const date = asString(getField(record, 'date', 'fecha', 'Date'));
  const keyword = asString(getField(record, 'keyword', 'Keyword'));
  const source = asString(getField(record, 'source', 'Source'));
  const scannedAt = asString(getField(record, 'scannedAt', 'ScannedAt')) || new Date().toISOString();

  if (!link && !title && !company) {
    return null;
  }

  return {
    id: asString(getField(record, 'id', 'Id')) || link || `${title}-${company}`,
    keyword,
    title: title || link || 'Untitled job',
    company: company || 'Unknown company',
    date,
    link: link || '',
    source,
    scannedAt,
  };
};

export class JsonJobRepository implements IJobRepository {
  applyToJob(job: Job, notes?: string): Promise<void> {
      throw new Error('Method not implemented.');
  }
  getAppliedJobs(): Promise<AppliedJob[]> {
      throw new Error('Method not implemented.');
  }
  deleteApplication(link: string): Promise<void> {
      throw new Error('Method not implemented.');
  }
  async getLastScannedJobs(): Promise<Job[]> {
    try {
      // Usamos la ruta centralizada de APP_PATHS
      const data = await fs.readFile(APP_PATHS.jobs, 'utf-8');
      const parsed = JSON.parse(data);

      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .map(normalizeStoredJob)
        .filter((job): job is Job => job !== null);
    } catch (error) {
      // Si el archivo no existe (primer inicio), devolvemos array vacío
      return [];
    }
  }

  async saveScannedJobs(jobs: Job[]): Promise<void> {
    await fs.writeFile(APP_PATHS.jobs, JSON.stringify(jobs, null, 2));
  }
}
