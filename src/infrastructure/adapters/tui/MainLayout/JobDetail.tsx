import React from 'react';
import { Box, Text } from 'ink';
import { ViewJob } from './view-model.js';
import { getPanelFrameProps } from './panel-frame.js';

interface JobDetailProps {
  job: ViewJob | null;
  isActive: boolean;
  flexBasis?: string;
  flexGrow?: number;
  height?: number;
}

export const JobDetail = ({ job, isActive, flexBasis, flexGrow, height }: JobDetailProps) => (
  <Box
    {...getPanelFrameProps({ isActive, accentColor: 'magenta' })}
    flexDirection="column"
    flexBasis={flexBasis ?? '40%'}
    flexGrow={flexGrow}
    height={height}
    paddingX={1}
  >
    <Text underline color={isActive ? 'magenta' : 'white'}>Detalle</Text>
    <Box flexGrow={1} flexDirection="column">
      {job ? (
        <>
          <Text>Descripción: {job.description}</Text>
          <Text>Empresa: {job.company}</Text>
          <Text>Fecha: {job.date}</Text>
          <Text>Fuente: {job.source}</Text>
          <Text>Keyword: {job.keyword}</Text>
          <Text color={job.applicationLabel ? 'red' : 'gray'}>
            Postulación: {job.applicationLabel || ''}
          </Text>
          <Text color="cyan">Link: {job.link}</Text>
        </>
      ) : (
        <Text color="gray">Selecciona un aviso...</Text>
      )}
    </Box>
    <Box justifyContent="flex-end">
      <Text color={isActive ? 'yellow' : 'gray'} italic>
        Enter abre el navegador
      </Text>
    </Box>
  </Box>
);
