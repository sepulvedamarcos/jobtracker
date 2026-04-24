import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';

// Inline types para evitar problemas de importación
interface PluginMetadata {
  pluginId: string;
  name: string;
  pluginVersion: string;
  author: string;
  enabled: boolean;
  capabilities?: {
    supportsKeywordSearch?: boolean;
    supportsPagination?: boolean;
    requiresAuth?: boolean;
    sources?: string[];
  };
}

interface PluginsModalProps {
    plugins: PluginMetadata[];
    selectedPlugin: string | null;
    isActive: boolean;
    isInstallMode: boolean;
    draftPath: string;
    listLimit: number;
    revision: number;
    width: number;
    height: number;
    onSelectPlugin: (pluginId: string) => void;
    message?: string;
}

export const PluginsModal = ({
    plugins,
    selectedPlugin,
    isActive,
    isInstallMode,
    draftPath,
    listLimit,
    revision,
    width,
    height,
    onSelectPlugin,
    message,
}: PluginsModalProps) => {
    const items = plugins.map((plugin) => ({
        label: `${plugin.name} (${plugin.pluginId})`,
        value: plugin.pluginId,
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
                        Plugins
                    </Text>
                    <Text color="gray">
                        {plugins.length} instalados {selectedPlugin ? `| Seleccionado: ${selectedPlugin}` : ''}
                    </Text>
                </Box>

                <Box flexDirection="column" flexGrow={1}>
                    <Box flexGrow={1}>
                        {isInstallMode ? (
                            <Box justifyContent="center" alignItems="center" flexGrow={1}>
                                <Box flexDirection="column">
                                    <Text color="cyan" bold>
                                        Ruta del plugin:
                                    </Text>
                                    <Box marginTop={1}>
                                        <Box borderStyle="round" borderColor="cyan" paddingX={1}>
                                            <Text color="white">
                                                {draftPath || <Text color="gray">.scrapper/mi-plugin</Text>}
                                            </Text>
                                        </Box>
                                    </Box>
                                    <Box marginTop={1}>
                                        <Text color="gray" dimColor>
                                            Escribe la ruta y presiona Enter
                                        </Text>
                                    </Box>
                                </Box>
                            </Box>
                        ) : items.length > 0 ? (
                            <SelectInput
                                key={revision}
                                items={items}
                                isFocused={isActive}
                                limit={listLimit}
                                initialIndex={Math.max(
                                    0,
                                    plugins.findIndex(
                                        (p) => p.pluginId.toLowerCase() === (selectedPlugin ?? '').toLowerCase(),
                                    ),
                                )}
                                onHighlight={(item) => onSelectPlugin(item.value as string)}
                            />
                        ) : (
                            <Text color="gray">No hay plugins instalados.</Text>
                        )}
                    </Box>

                    <Box marginTop={1} flexDirection="column">
                        {isInstallMode ? (
                            <Text color="yellow">Ruta .scrapper: {draftPath || ' '}</Text>
                        ) : (
                            <Text color="gray" dimColor>
                                ↑/↓ navegar | A agregar | E eliminar
                            </Text>
                        )}
                    </Box>
                </Box>

                <Box backgroundColor="white" paddingX={1} width="100%">
                    <ShortcutBar
                        items={isInstallMode ? [
                            { keyLabel: 'Enter', description: 'Instalar' },
                            { keyLabel: 'Esc', description: 'Cancelar' },
                        ] : [
                            { keyLabel: 'Esc', description: 'Salir' },
                            { keyLabel: 'A', description: 'Agregar' },
                            { keyLabel: 'E', description: 'Eliminar' },
                        ]}
                    />
                </Box>

                <Box justifyContent="flex-end" marginTop={0}>
                    {message ? (
                        <Text color="red" italic>
                            {message}
                        </Text>
                    ) : (
                        <Text color={isInstallMode ? 'yellow' : 'gray'} italic>
                            {isInstallMode
                                ? 'Escribe la ruta del plugin y presiona Enter.'
                                : 'A abre diálogo de instalación.'}
                        </Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
};