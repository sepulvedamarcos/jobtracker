// src/infrastructure/storage/JsonJobRepository.ts
import fs from 'fs/promises';
import path from 'path';
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

const normalizeStatus = (value: unknown): number => {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.toLowerCase();

    if (normalized === 'interested') return 0;
    if (normalized === 'applied' || normalized === 'postulado') return 1;
    if (normalized === 'interviewing') return 2;
    if (normalized === 'rejected') return 3;
  }

  return 1;
};

const normalizeStoredApplication = (item: unknown): AppliedJob | null => {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const record = item as UnknownJobRecord;
  const link = asString(getField(record, 'link', 'Link', 'url', 'URL', 'value'));
  const title = asString(getField(record, 'title', 'Title', 'label'));
  const company = asString(getField(record, 'company', 'Company', 'empresa'));
  const keyword = asString(getField(record, 'keyword', 'Keyword'));
  const source = asString(getField(record, 'source', 'Source'));
  const sourceDateText = asString(getField(record, 'sourceDateText', 'SourceDateText', 'date', 'Date', 'fecha'));
  const sourceScannedAt = asString(getField(record, 'sourceScannedAt', 'SourceScannedAt', 'scannedAt', 'ScannedAt'));
  const appliedAt = asString(getField(record, 'appliedAt', 'AppliedAt')) || new Date().toISOString();
  const notes = asString(getField(record, 'notes', 'Notes'));
  const lastUpdate = asString(getField(record, 'lastUpdate', 'LastUpdate')) || appliedAt;
  const status = normalizeStatus(getField(record, 'status', 'Status'));

  if (!link) {
    return null;
  }

  return {
    link,
    title: title || 'Untitled application',
    company: company || 'Unknown company',
    keyword,
    source,
    sourceDateText,
    sourceScannedAt,
    status,
    appliedAt,
    notes,
    lastUpdate,
  };
};

const readJsonArray = async (filePath: string): Promise<unknown[]> => {
  const data = await fs.readFile(filePath, 'utf-8');
  const parsed = JSON.parse(data);

  return Array.isArray(parsed) ? parsed : [];
};

export class JsonJobRepository implements IJobRepository {
  applyToJob(job: Job, notes?: string): Promise<void> {
      return this.saveAppliedJob(job, notes);
  }
  async getAppliedJobs(): Promise<AppliedJob[]> {
      try {
        const primaryPath = APP_PATHS.applications;
        const legacyPath = path.join(path.dirname(primaryPath), 'Apply_trabajando_jobs.json');

        let rawApplications: unknown[] = [];

        try {
          rawApplications = await readJsonArray(primaryPath);
        } catch {
          rawApplications = [];
        }

        if (rawApplications.length === 0) {
          try {
            rawApplications = await readJsonArray(legacyPath);
          } catch {
            rawApplications = [];
          }
        }

        return rawApplications
          .map(normalizeStoredApplication)
          .filter((application): application is AppliedJob => application !== null);
      } catch (error) {
        return [];
      }
  }
  deleteApplication(link: string): Promise<void> {
      return this.removeAppliedJob(link);
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
    // Borrar archivo anterior primero
    try {
      await fs.unlink(APP_PATHS.jobs);
    } catch {
      // Ignore si no existe
    }
    await fs.writeFile(APP_PATHS.jobs, JSON.stringify(jobs, null, 2));
  }

  private async saveAppliedJob(job: Job, notes?: string): Promise<void> {
    const currentApplications = await this.getAppliedJobs();
    const existingIndex = currentApplications.findIndex((application) => application.link === job.link);
    const now = new Date().toISOString();

    const nextApplication: AppliedJob = {
      link: job.link,
      title: job.title,
      company: job.company,
      keyword: job.keyword,
      source: job.source,
      sourceDateText: job.date,
      sourceScannedAt: job.scannedAt,
      status: 1,
      appliedAt: now,
      notes: notes ?? '',
      lastUpdate: now,
    };

    if (existingIndex >= 0) {
      currentApplications[existingIndex] = {
        ...currentApplications[existingIndex],
        ...nextApplication,
      };
    } else {
      currentApplications.push(nextApplication);
    }

    await fs.writeFile(APP_PATHS.applications, JSON.stringify(currentApplications, null, 2));
  }

  private async removeAppliedJob(link: string): Promise<void> {
    const currentApplications = await this.getAppliedJobs();
    const nextApplications = currentApplications.filter((application) => application.link !== link);
    await fs.writeFile(APP_PATHS.applications, JSON.stringify(nextApplications, null, 2));
  }
}
