import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { PaginationResult } from '../../../../services/pagination.types.js';
import { ViewJob } from './view-model.js';

interface JobListProps {
  items: PaginationResult<ViewJob>['items'];
  onHighlight: (item: ViewJob) => void;
  pageLabel: string;
  flexGrow?: number;
}

export const JobList = ({ items, onHighlight, pageLabel, flexGrow }: JobListProps) => (
  <Box borderStyle="round" flexBasis="60%" flexDirection="column" paddingX={1} flexGrow={flexGrow}>
    <Text underline color="green">Avisos Capturados</Text>
    <Box flexGrow={1}>
      {items.length > 0 ? (
        <SelectInput items={items} onHighlight={(item) => onHighlight(item as ViewJob)} />
      ) : (
        <Text color="gray">No hay avisos locales cargados.</Text>
      )}
    </Box>
    <Box justifyContent="flex-end" alignItems="flex-end">
      <Text color="gray">{pageLabel}</Text>
    </Box>
  </Box>
);
