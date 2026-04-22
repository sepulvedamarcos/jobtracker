import { AppliedJob } from '../entities/Job.js';
import { IJobRepository } from '../ports/IJobRepository.js';

export class ApplicationService {
  constructor(private jobRepository: IJobRepository) {}

  async fetchAppliedJobs(): Promise<AppliedJob[]> {
    const applications = await this.jobRepository.getAppliedJobs();

    return applications.sort(
      (a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime(),
    );
  }

  async deleteApplication(link: string): Promise<void> {
    await this.jobRepository.deleteApplication(link);
  }
}
