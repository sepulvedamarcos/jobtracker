import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';

interface ConfirmScanModalProps {
    isActive: boolean;
    keywords: string[];
    width: number;
    height: number;
    onConfirm: () => void;
    onCancel: () => void;
}

export const ConfirmScanModal = ({
    isActive,
    keywords,
    width,
    height,
    onConfirm,
    onCancel,
}: ConfirmScanModalProps) => {
    const items = [
        { label: 'Sí', value: 'yes' },
        { label: 'No', value: 'no' },
    ];

    const handleSelect = (item: { value: string }) => {
        if (item.value === 'yes') {
            onConfirm();
        } else {
            onCancel();
        }
    };

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
                {...getPanelFrameProps({ isActive, accentColor: 'red' })}
                flexDirection="column"
                width={width}
                height={height}
                backgroundColor="black"
                paddingX={1}
            >
                <Text bold color="red">
                    ⚠️ Confirmar Escaneo
                </Text>

                <Box flexDirection="column" marginY={1}>
                    <Text>
                        Al ejecutar el scan se limpiara el archivo actual
                        y se mostraran solo los resultados de esta busqueda.
                    </Text>
                </Box>

                <Text color="cyan">
                    Keywords a buscar: {keywords.join(', ')}
                </Text>

                <Box marginY={1}>
                    <Text>Estas seguro?</Text>
                </Box>

                <Box backgroundColor="white" paddingX={1} width="100%">
                    <ShortcutBar
                        items={[
                            { keyLabel: 'Enter', description: 'Confirmar' },
                            { keyLabel: 'Esc', description: 'Cancelar' },
                        ]}
                    />
                </Box>
            </Box>
        </Box>
    );
};