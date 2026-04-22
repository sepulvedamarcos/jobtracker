import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';

interface KeywordsModalProps {
    keywords: string[];
    selectedKeyword: string | null;
    isActive: boolean;
    isInsertMode: boolean;
    draftKeyword: string;
    listLimit: number;
    revision: number;
    width: number;
    height: number;
    onSelectKeyword: (keyword: string) => void;
}

export const KeywordsModal = ({
    keywords,
    selectedKeyword,
    isActive,
    isInsertMode,
    draftKeyword,
    listLimit,
    revision,
    width,
    height,
    onSelectKeyword,
}: KeywordsModalProps) => {
    const items = keywords.map((keyword) => ({
        label: keyword,
        value: keyword,
    }));

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
                {...getPanelFrameProps({ isActive, accentColor: 'cyan' })}
                flexDirection="column"
                width={width}
                height={height}
                backgroundColor="black"
                paddingX={1}
                paddingY={0}
            >
                <Box justifyContent="space-between">
                    <Text underline color={isActive ? 'cyan' : 'white'}>
                        Keywords
                    </Text>
                    <Text color="gray">
                        {keywords.length} palabras {selectedKeyword ? `| Seleccionada: ${selectedKeyword}` : ''}
                    </Text>
                </Box>

                <Box flexDirection="column" flexGrow={1}>
                    <Box flexGrow={1}>
                        {items.length > 0 ? (
                            <SelectInput
                                key={revision}
                                items={items}
                                isFocused={isActive && !isInsertMode}
                                limit={listLimit}
                                initialIndex={Math.max(
                                    0,
                                    keywords.findIndex(
                                        (keyword) => keyword.toLowerCase() === (selectedKeyword ?? '').toLowerCase(),
                                    ),
                                )}
                                onHighlight={(item) => onSelectKeyword(item.value as string)}
                            />
                        ) : (
                            <Text color="gray">No hay keywords cargadas.</Text>
                        )}
                    </Box>

                    <Box marginTop={1} flexDirection="column">
                        {isInsertMode ? (
                            <Text color="yellow">Nueva keyword: {draftKeyword || ' '}</Text>
                        ) : (
                            <Text color="gray" dimColor>
                                Usa ↑/↓ para navegar.
                            </Text>
                        )}
                    </Box>
                </Box>

                <Box backgroundColor="white" paddingX={1} width="100%">
                    <ShortcutBar
                        items={[
                            { keyLabel: 'Esc', description: 'Salir' },
                            { keyLabel: 'I', description: 'Insertar' },
                            { keyLabel: 'Supr', description: 'Eliminar' },
                            { keyLabel: 'Enter', description: 'Guardar' },
                        ]}
                    />
                </Box>

                <Box justifyContent="flex-end" marginTop={0}>
                    <Text color={isInsertMode ? 'yellow' : 'gray'} italic>
                        {isInsertMode
                            ? 'Escribe la nueva palabra y presiona Enter.'
                            : 'I agrega una keyword nueva en el final.'}
                    </Text>
                </Box>
            </Box>
        </Box>
    );
};
