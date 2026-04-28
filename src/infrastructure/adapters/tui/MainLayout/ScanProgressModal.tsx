import React, { useMemo } from 'react';
import { Box, Text } from 'ink';

interface ScanProgressModalProps {
    isActive: boolean;
    keywords: string[];
    plugins: string[];
    currentPlugin: string;
    currentKeyword: string;
    message: string;
    progress: number; // 0-100
    width: number;
    height: number;
    onCancel: () => void;
    pluginResults?: { pluginId: string; count: number; error?: string }[];
}

export const ScanProgressModal = ({
    isActive,
    keywords,
    plugins,
    currentPlugin,
    currentKeyword,
    message,
    progress,
    width,
    height,
    pluginResults = [],
}: ScanProgressModalProps) => {
    if (!isActive) return null;

    // Barra de progreso proporcional al ancho disponible
    const barWidth = width - 4;
    const filledWidth = Math.floor((progress / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    
    const progressBar = useMemo(() => {
        return '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
    }, [filledWidth, emptyWidth]);

// Total de jobs encontrados en este scan
    const totalJobsThisScan = pluginResults.reduce((sum, r) => sum + (r.count || 0), 0);

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
                borderColor="green"
            >
                <Text bold color="green">
                    {'\u{1F50D} Escaneo en Progreso'}
                </Text>

                <Box flexDirection="column" marginY={1}>
                    <Text color="cyan">
                        Plugins: {plugins.join(', ')}
                    </Text>
                    <Text color="cyan">
                        Keyword actual: <Text bold color="white">{currentKeyword || '...'}</Text>
                    </Text>
                    <Text color="cyan">
                        Total keywords: {keywords.length}
                    </Text>
                    <Text color="yellow">
                        Plugin actual: {currentPlugin || 'Iniciando...'}
                    </Text>
                </Box>

                {/* Barra de progreso */}
                <Box marginTop={1}>
                    <Text>Progreso: {progress}%</Text>
                </Box>
                <Box width={barWidth}>
                    <Text backgroundColor="green">{progressBar}</Text>
                </Box>

                <Box marginTop={1}>
                    <Text color="gray">{message}</Text>
                </Box>

                {/* Resultados parciales por plugin */}
                {pluginResults.length > 0 && (
                    <Box flexDirection="column" marginTop={1}>
                        <Text bold color="green">Resultados:</Text>
                        {pluginResults.map((r) => (
                            <Text key={r.pluginId} color={r.error ? 'red' : 'white'}>
                                {'  \u{2022} '}{r.pluginId}{'}: '}
                                {r.error ? r.error : `${r.count} empleos`}
                            </Text>
                        ))}
                    </Box>
                )}

                <Box backgroundColor="white" paddingX={1} width="100%" marginTop={1}>
                    <Text>Presiona Esc para cancelar</Text>
                </Box>
            </Box>
        </Box>
    );
};