import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';

export const JobList = ({ items, onHighlight }: any) => (
  <Box borderStyle="round" flexBasis="60%" flexDirection="column" paddingX={1}>
    <Text underline color="green">Avisos Capturados</Text>
    <SelectInput items={items} onHighlight={onHighlight} />
  </Box>
);
