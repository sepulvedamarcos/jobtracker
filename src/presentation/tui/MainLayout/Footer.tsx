import React from 'react';
import { Box, Text } from 'ink';

export const Footer = () => {
  return (
    <Box backgroundColor="white" paddingX={1} width="100%">
      <Box marginRight={2}>
        <Text color="black" bold> F2</Text>
        <Text color="black"> Scan</Text>
      </Box>
      <Box marginRight={2}>
        <Text color="black" bold> F3</Text>
        <Text color="black"> Keywords</Text>
      </Box>
      <Box marginRight={2}>
        <Text color="black" bold> F4</Text>
        <Text color="black"> Plugins</Text>
      </Box>
      <Box marginRight={2}>
        <Text color="black" bold> Space</Text>
        <Text color="black"> Browser</Text>
      </Box>
      <Box marginRight={2}>
        <Text color="black" bold> Enter</Text>
        <Text color="black"> Postular</Text>
      </Box>
      <Box marginRight={2}>
        <Text color="black" bold> Del</Text>
        <Text color="black"> Eliminar</Text>
      </Box>
      <Box flexGrow={1} justifyContent="flex-end">
        <Text color="black" bold> Q</Text>
        <Text color="black"> Salir</Text>
      </Box>
    </Box>
  );
};
