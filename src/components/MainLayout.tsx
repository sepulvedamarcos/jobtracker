import React, { useState } from 'react';
import { Box } from 'ink';
import { Header } from './MainLayout/Header.js';
import { JobList } from './MainLayout/JobList.js';
import { JobDetail } from './MainLayout/JobDetail.js';
import { Footer } from './MainLayout/Footer.js';

interface Job {
  label: string;      // Título que se ve en la lista
  value: string;      // ID único (ej: la URL o un hash)
  empresa: string;
  fecha: string;
  url: string;
  postulado: boolean;
  salario?: string;
}


export const MainLayout = () => {

  const [jobsData, setJobsData] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState(null);

  const [plugins, setPlugins] = useState(['Linkedin', 'Indeed']); // Lista de nombres de plugins
  const [status, setStatus] = useState('Esperando...');
  const [keywords, setKeywords] = useState(['desarrollador', 'node']); // Lista de palabras

  // Ejemplo de cómo se llenaría al escanear
  const handleScan = () => {
    setStatus('Escaneando...');
    // Aquí llamarías a tu lógica de scraping
    const resultados: Job[] = [
      {
        label: 'Node.js Developer',
        value: 'url-1',
        empresa: 'Tech Corp',
        fecha: 'Hoy',
        url: 'https://ejemplo.com',
        postulado: false
      }
    ];
    setJobsData(resultados);
    setStatus('Listo');
  };

  return (
    <Box flexDirection="column" height={20}>
      <Header
        pluginsCount={plugins.length}
        keywordsCount={keywords.length}
        status={status}
      />

      <Box flexDirection="row" flexGrow={1}>
        <JobList items={jobsData} onHighlight={setSelectedJob} />
        <JobDetail job={selectedJob} />
      </Box>

      <Footer />
    </Box>
  );
};
