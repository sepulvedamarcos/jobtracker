export interface Job {
  id: string;
  keyword: string;
  title: string;
  company: string;
  date: string; // "Hace 4 días"
  link: string;
  source: string;
  scannedAt: string; // ISO Date string
}

export interface JobWithApplication extends Job {
  applicationLabel: string;
}

export enum ApplicationStatus {
  Interested = 0,
  Applied = 1,
  Interviewing = 2,
  Rejected = 3
}

export interface AppliedJob {
  link: string;
  title: string;
  company: string;
  keyword: string;
  source: string;
  sourceDateText: string;
  sourceScannedAt: string;
  status: ApplicationStatus;
  appliedAt: string;
  notes: string;
  lastUpdate: string;
}
