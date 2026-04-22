import React, { useEffect } from 'react';
import { Box, Text } from 'ink';
import BigText from 'ink-big-text';
import Gradient from 'ink-gradient';

interface Props {
  onFinish: () => void;
}

export const Splash = ({ onFinish }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onFinish, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <Box 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="center" 
        flexGrow={1}
        width="100%"
        borderStyle="round" 
        borderColor="cyan"
        paddingBottom={2}
    >
        <Gradient name="summer"  >
          <BigText text="Job Tracker" font="chrome" />
        </Gradient>
        
        <Text italic color="cyan">Iniciando motor de scraping...</Text>

    </Box>
  );
};
