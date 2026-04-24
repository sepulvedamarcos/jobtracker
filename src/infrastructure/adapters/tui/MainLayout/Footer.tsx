import React from 'react';
import { Box, Text } from 'ink';
import { ShortcutBar } from './ShortcutBar.js';

export const Footer = () => {
  return (
    <Box backgroundColor="white" paddingX={1} width="100%">
      <ShortcutBar
        items={[
          { keyLabel: 'S', description: 'Scan' },
          { keyLabel: 'K', description: 'Keywords' },
          { keyLabel: 'P', description: 'Plugins' },
          { keyLabel: 'Tab', description: 'Panel' },
          { keyLabel: 'PgUp/PgDn', description: 'Page' },
          { keyLabel: 'Enter', description: 'Abrir' },
        ]}
      />
      <Box flexGrow={1} paddingRight={1} justifyContent="flex-end">
        <Text color="black" bold> Q</Text>
        <Text color="black"> Salir</Text>
        <Text color="black"> / Ctrl+C</Text>
      </Box>
    </Box>
  );
};
