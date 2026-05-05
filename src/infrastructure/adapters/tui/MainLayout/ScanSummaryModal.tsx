// src/infrastructure/adapters/tui/MainLayout/ScanSummaryModal.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { ScanResult } from '../../../../core/use-cases/plugins/RunScanUseCase.js';

interface ScanSummaryModalProps {
    isActive: boolean;
    result: ScanResult;
    onClose: () => void;
    width: number;
    height: number;
}

export const ScanSummaryModal = ({ isActive, result, onClose, width, height }: ScanSummaryModalProps) => {
    if (!isActive) return null;

    return (
        <Box 
            position="absolute" 
            top={0} 
            left={0} 
            width="100%" 
            height="100%" 
            justifyContent="center" 
            alignItems="center" 
            backgroundColor="black"
        >
            <Box 
                flexDirection="column" 
                width={width} 
                height={height} 
                backgroundColor="black" 
                paddingX={2} 
                borderStyle="bold" 
                borderColor="cyan"
            >
                <Text bold color="cyan">📊 Resumen del Escaneo</Text>
                
                <Box flexDirection="column" marginY={1}>
                    {result.pluginResults.map(r => (
                        <Text key={r.pluginId} color={r.error ? 'red' : 'white'}>
                            {`  • ${r.pluginId.padEnd(15)}: ${r.error ? r.error : `${r.count} avisos`}`}
                        </Text>
                    ))}
                </Box>

                <Box borderStyle="single" borderColor="gray" paddingX={1} marginY={1}>
                    <Box flexDirection="column">
                        <Text color="yellow">{`Total Bruto: ${result.totalFound}`}</Text>
                        <Text color="green">{`Total Únicos: ${result.jobs.length}`}</Text>
                    </Box>
                </Box>

                <Box marginTop={1}>
                    <Text color="gray">Presiona Esc para continuar</Text>
                </Box>
            </Box>
        </Box>
    );
};
