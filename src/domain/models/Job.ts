export interface Job {
  id: string;
  title: string;
  company: string;
  date: string;
  url: string;
}

export const createJob = (overrides?: Partial<Job>): Job => ({
  id: overrides?.id ?? String(Date.now()),
  title: overrides?.title ?? 'Untitled',
  company: overrides?.company ?? 'Unknown',
  date: overrides?.date ?? new Date().toISOString(),
  url: overrides?.url ?? '',
});
