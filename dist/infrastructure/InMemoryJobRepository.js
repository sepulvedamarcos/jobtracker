export class InMemoryJobRepository {
    saveScannedJobs(jobs) {
        throw new Error('Method not implemented.');
    }
    getLastScannedJobs() {
        throw new Error('Method not implemented.');
    }
    applyToJob(job, notes) {
        throw new Error('Method not implemented.');
    }
    getAppliedJobs() {
        throw new Error('Method not implemented.');
    }
    deleteApplication(link) {
        throw new Error('Method not implemented.');
    }
    items = [];
    async findAll() {
        return this.items;
    }
    async findById(id) {
        return this.items.find((i) => i.id === id) ?? null;
    }
    async save(job) {
        const idx = this.items.findIndex((i) => i.id === job.id);
        if (idx >= 0)
            this.items[idx] = job;
        else
            this.items.push(job);
    }
    async delete(id) {
        this.items = this.items.filter((i) => i.id !== id);
    }
}
