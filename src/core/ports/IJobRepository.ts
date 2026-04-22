import { Job, AppliedJob } from '../entities/Job.js';

export interface IJobRepository {
  // Para jobs.json
  saveScannedJobs(jobs: Job[]): Promise<void>;
  getLastScannedJobs(): Promise<Job[]>;
  
  // Para applyJobs.json
  applyToJob(job: Job, notes?: string): Promise<void>;
  getAppliedJobs(): Promise<AppliedJob[]>;
  deleteApplication(link: string): Promise<void>;
}
