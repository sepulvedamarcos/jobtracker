import React from 'react';
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { getVersion } from '../../../../services/version.js';

interface HeaderProps {
  pluginsCount: number;
  keywordsCount: number;
  status: string;
}

export const Header = ({ pluginsCount, keywordsCount, status }: HeaderProps) => {
  return (
    <Box 
      borderStyle="single" 
      borderColor="cyan" 
      paddingX={1} 
      justifyContent="space-between"
    >
      <Box>
        <Gradient name="summer">
          <Text bold>JOB TRACKER</Text>
        </Gradient>
        <Text color="gray"> v{getVersion()}</Text>
      </Box>

      <Box>
        <Text>
          Plugins: <Text color="green">{pluginsCount}</Text>
          {' | '}
          Keywords: <Text color="green">{keywordsCount}</Text>
          {' | '}
          Estado: <Text color="yellow">{status}</Text>
        </Text>
      </Box>
    </Box>
  );
};
