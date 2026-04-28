export class ApplicationService {
    jobRepository;
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    async fetchAppliedJobs() {
        const applications = await this.jobRepository.getAppliedJobs();
        return applications.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
    }
    async deleteApplication(link) {
        await this.jobRepository.deleteApplication(link);
    }
}
