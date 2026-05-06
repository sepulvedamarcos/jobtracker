import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';
import { logger } from '../../../../infrastructure/logger/Logger.js';

// Tipos para comparación de plugins
interface PluginCompareInfo {
    pluginId: string;
    name: string;
    localVersion?: string;
    remoteVersion?: string;
    status: 'installed-up-to-date' | 'installed-outdated' | 'available-not-installed';
    message: string;
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
    pluginCompareInfo?: PluginCompareInfo[];
    pluginAvailableInfo?: PluginCompareInfo[];
    onDownloadPlugin?: (pluginId: string) => void;
    onSyncPlugins?: () => void;
}

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
    pluginCompareInfo?: PluginCompareInfo[];
    onSyncPlugins?: () => void;
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
    pluginCompareInfo = [],
    pluginAvailableInfo = [],
    onDownloadPlugin,
    onSyncPlugins,
}: PluginsModalProps) => {
    // Función para obtener info de comparación de un plugin
    const getPluginCompare = (pluginId: string): PluginCompareInfo | undefined => {
        return pluginCompareInfo.find(p => p.pluginId === pluginId);
    };
    
    // Plugins instalados
    const installedItems = plugins.map((plugin) => {
        const compare = getPluginCompare(plugin.pluginId);
        let statusIcon = '✓';
        let versionLabel = `v${plugin.pluginVersion}`;
        
        if (compare) {
            if (compare.status === 'installed-outdated') {
                statusIcon = '🔄';
                versionLabel = `v${compare.localVersion} → v${compare.remoteVersion}`;
            } else if (compare.status === 'installed-up-to-date') {
                versionLabel = `v${compare.localVersion}`;
            }
        }
        
        const isSelected = selectedPlugin === plugin.pluginId;
        const selectIcon = isSelected ? '▸ ' : '  ';
        
        return {
            label: `${selectIcon}${statusIcon} ${plugin.name} (${versionLabel})`,
            value: plugin.pluginId,
        };
    });

    // Plugins disponibles en repo (no instalados)
    const availableItems = pluginAvailableInfo.map((plugin) => {
        const isSelected = selectedPlugin === plugin.pluginId;
        const selectIcon = isSelected ? '▸ ' : '  ';
        
        return {
            label: `${selectIcon}✨ ${plugin.name} v${plugin.remoteVersion}`,
            value: plugin.pluginId,
        };
    });

    // Combinar ambos con separador
    const items = [
        ...installedItems,
        ...(availableItems.length > 0 ? [{ label: '--- disponibles ---', value: '__divider__' }] : []),
        ...availableItems,
    ];

    const outdatedCount = pluginCompareInfo.filter(p => p.status === 'installed-outdated').length;

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
                        Plugins ▸ = seleccionado
                    </Text>
                    <Text color="gray">
                        {plugins.length} inst
                        {outdatedCount > 0 && <Text color="yellow"> ({outdatedCount} acts)</Text>}
                        {pluginAvailableInfo.length > 0 && <Text color="cyan"> ({pluginAvailableInfo.length} disp)</Text>}
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
                                onHighlight={(item) => {
                                    if (item.value === '__divider__') return;
                                    const pluginId = item.value as string;
                                    const isInstalled = plugins.some(p => p.pluginId === pluginId);
                                    logger.debug('TUI: Plugin highlighted', { pluginId, isInstalled });
                                }}
                                onSelect={(item) => {
                                    if (item.value === '__divider__') return;
                                    const pluginId = item.value as string;
                                    onSelectPlugin(pluginId);
                                }}
                            />
                        ) : (
                            <Text color="gray">No hay plugins instalados.</Text>
                        )}
                    </Box>

                    <Box marginTop={1} flexDirection="column">
                        {isInstallMode ? (
                            <Text color="yellow">Ruta .scrapper: {draftPath || ' '}</Text>
                        ) : null}
                    </Box>
                </Box>

                <Box backgroundColor="white" paddingX={1} width="100%">
                    <ShortcutBar
                        items={isInstallMode ? [
                            { keyLabel: 'Enter', description: 'Instalar' },
                            { keyLabel: 'Esc', description: 'Cancelar' },
                        ] : [
                            { keyLabel: 'Enter', description: 'Seleccionar' },
                            { keyLabel: 'Esc', description: 'Salir' },
                            { keyLabel: 'A', description: 'Agregar local' },
                            { keyLabel: 'D', description: 'Descargar' },
                            { keyLabel: 'E', description: 'Eliminar' },
                            { keyLabel: 'S', description: 'Sync actualizados' },
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
                                : '↑/↓ navegar | Enter seleccionar | D descargar | S sync'}
                        </Text>
                    )}
                </Box>
            </Box>
        </Box>
    );
};