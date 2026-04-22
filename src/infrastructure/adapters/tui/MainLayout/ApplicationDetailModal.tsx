import React from 'react';
import { Box, Text } from 'ink';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';
import { ViewApplication } from './application-view-model.js';

interface ApplicationDetailModalProps {
    application: ViewApplication | null;
    isActive: boolean;
    width: number;
    height: number;
    onConfirmDelete: () => void;
    onCancel: () => void;
}

export const ApplicationDetailModal = ({
    application,
    isActive,
    width,
    height,
    onConfirmDelete,
    onCancel,
}: ApplicationDetailModalProps) => {
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
                paddingY={0}
            >
                <Box justifyContent="space-between">
                    <Text underline color={isActive ? 'red' : 'white'}>
                        Detalle de Postulación
                    </Text>
                    <Text color="gray">
                        {application ? `ID: ${application.value}` : ''}
                    </Text>
                </Box>

                <Box flexDirection="column" flexGrow={1} marginY={1}>
                    {application ? (
                        <>
                            <Text bold>Puesto: <Text color="cyan">{application.title}</Text></Text>
                            <Text>Empresa: {application.company}</Text>
                            <Text>Fuente: {application.source}</Text>
                            <Text>Fecha postulación: {application.appliedAt}</Text>
                            <Text>Estado: <Text color="yellow">{application.status}</Text></Text>
                            <Text>Notas: {application.notes || '(sin notas)'}</Text>
                            <Text color="cyan" wrap="truncate-end">
                                Link: {application.link}
                            </Text>
                        </>
                    ) : (
                        <Text color="gray">No hay postulación seleccionada.</Text>
                    )}
                </Box>

                <Box backgroundColor="white" paddingX={1} width="100%">
                    <ShortcutBar
                        items={[
                            { keyLabel: 'Esc', description: 'Cancelar' },
                            { keyLabel: 'D', description: 'Eliminar' },
                        ]}
                    />
                </Box>

                <Box justifyContent="flex-end" marginTop={0}>
                    <Text color={isActive ? 'red' : 'gray'} italic>
                        Presiona D para eliminar esta postulación.
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};