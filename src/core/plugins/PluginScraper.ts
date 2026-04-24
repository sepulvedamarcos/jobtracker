// src/core/plugins/PluginScraper.ts
import { Job } from '../entities/Job.js';

export interface PluginScraperInput {
  keywords: string[];
  onProgress?: (message: string, progress?: number) => void;
  signal?: AbortSignal;
}

export interface PluginScraper {
  sourceName: string;
  scan(input: PluginScraperInput): Promise<Job[]>;
}