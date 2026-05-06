import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';
import { logger } from '../../../../infrastructure/logger/Logger.js';
export const PluginsModal = ({ plugins, selectedPlugin, isActive, isInstallMode, draftPath, listLimit, revision, width, height, onSelectPlugin, message, pluginCompareInfo = [], pluginAvailableInfo = [], onDownloadPlugin, onSyncPlugins, }) => {
    // Función para obtener info de comparación de un plugin
    const getPluginCompare = (pluginId) => {
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
            }
            else if (compare.status === 'installed-up-to-date') {
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
    return (_jsx(Box, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black", children: _jsxs(Box, { ...getPanelFrameProps({ isActive, accentColor: 'cyan' }), flexDirection: "column", width: width, height: height, backgroundColor: "black", paddingX: 1, paddingY: 0, children: [_jsxs(Box, { justifyContent: "space-between", children: [_jsx(Text, { underline: true, color: isActive ? 'cyan' : 'white', children: "Plugins \u25B8 = seleccionado" }), _jsxs(Text, { color: "gray", children: [plugins.length, " inst", outdatedCount > 0 && _jsxs(Text, { color: "yellow", children: [" (", outdatedCount, " acts)"] }), pluginAvailableInfo.length > 0 && _jsxs(Text, { color: "cyan", children: [" (", pluginAvailableInfo.length, " disp)"] })] })] }), _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsx(Box, { flexGrow: 1, children: isInstallMode ? (_jsx(Box, { justifyContent: "center", alignItems: "center", flexGrow: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "Ruta del plugin:" }), _jsx(Box, { marginTop: 1, children: _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 1, children: _jsx(Text, { color: "white", children: draftPath || _jsx(Text, { color: "gray", children: ".scrapper/mi-plugin" }) }) }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Escribe la ruta y presiona Enter" }) })] }) })) : items.length > 0 ? (_jsx(SelectInput, { items: items, isFocused: isActive, limit: listLimit, initialIndex: Math.max(0, plugins.findIndex((p) => p.pluginId.toLowerCase() === (selectedPlugin ?? '').toLowerCase())), onHighlight: (item) => {
                                    if (item.value === '__divider__')
                                        return;
                                    const pluginId = item.value;
                                    const isInstalled = plugins.some(p => p.pluginId === pluginId);
                                    logger.debug('TUI: Plugin highlighted', { pluginId, isInstalled });
                                }, onSelect: (item) => {
                                    if (item.value === '__divider__')
                                        return;
                                    const pluginId = item.value;
                                    onSelectPlugin(pluginId);
                                } }, revision)) : (_jsx(Text, { color: "gray", children: "No hay plugins instalados." })) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: isInstallMode ? (_jsxs(Text, { color: "yellow", children: ["Ruta .scrapper: ", draftPath || ' '] })) : null })] }), _jsx(Box, { backgroundColor: "white", paddingX: 1, width: "100%", children: _jsx(ShortcutBar, { items: isInstallMode ? [
                            { keyLabel: 'Enter', description: 'Instalar' },
                            { keyLabel: 'Esc', description: 'Cancelar' },
                        ] : [
                            { keyLabel: 'Enter', description: 'Seleccionar' },
                            { keyLabel: 'Esc', description: 'Salir' },
                            { keyLabel: 'A', description: 'Agregar local' },
                            { keyLabel: 'D', description: 'Descargar' },
                            { keyLabel: 'E', description: 'Eliminar' },
                            { keyLabel: 'S', description: 'Sync actualizados' },
                        ] }) }), _jsx(Box, { justifyContent: "flex-end", marginTop: 0, children: message ? (_jsx(Text, { color: "red", italic: true, children: message })) : (_jsx(Text, { color: isInstallMode ? 'yellow' : 'gray', italic: true, children: isInstallMode
                            ? 'Escribe la ruta del plugin y presiona Enter.'
                            : '↑/↓ navegar | Enter seleccionar | D descargar | S sync' })) })] }) }));
};
