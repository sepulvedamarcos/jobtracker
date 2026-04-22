import React from 'react';
import { Box, Text } from 'ink';
import { ViewJob } from './view-model.js';

interface JobDetailProps {
  job: ViewJob | null;
  flexBasis?: string;
}

export const JobDetail = ({ job, flexBasis }: JobDetailProps) => (
  <Box flexDirection="column" flexBasis={flexBasis ?? '40%'}>
    <Box borderStyle="round" flexDirection="column" paddingX={1} flexGrow={1}>
      <Text underline color="magenta">Detalle</Text>
      {job ? (
        <>
          <Text>Descripción: {job.description}</Text>
          <Text>Empresa: {job.company}</Text>
          <Text>Fecha: {job.date}</Text>
          <Text>Fuente: {job.source}</Text>
          <Text>Keyword: {job.keyword}</Text>
          <Text>Link: {job.link}</Text>
        </>
      ) : (
        <Text color="gray">Selecciona un aviso...</Text>
      )}
    </Box>
    <Box borderStyle="round" paddingX={1}>
      <Text color="blue">URL: {job?.link || '---'}</Text>
    </Box>
  </Box>
);
