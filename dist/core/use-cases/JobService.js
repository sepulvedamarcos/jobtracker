export class JobService {
    jobRepository;
    // Recibe cualquier objeto que cumpla con la interfaz IJobRepository
    constructor(jobRepository) {
        this.jobRepository = jobRepository;
    }
    async fetchLastJobs() {
        // Aquí podrías agregar lógica de negocio (ej. filtrar por fecha)
        const jobs = await this.jobRepository.getLastScannedJobs();
        // Ejemplo de lógica DRY: Ordenar siempre por fecha de escaneo
        return jobs.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
    }
    async applyToJob(job, notes) {
        await this.jobRepository.applyToJob(job, notes);
    }
    async saveScannedJobs(jobs) {
        await this.jobRepository.saveScannedJobs(jobs);
    }
}
