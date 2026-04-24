import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';
export const PluginsModal = ({ plugins, selectedPlugin, isActive, isInstallMode, draftPath, listLimit, revision, width, height, onSelectPlugin, message, }) => {
    const items = plugins.map((plugin) => ({
        label: `${plugin.name} (${plugin.pluginId})`,
        value: plugin.pluginId,
    }));
    return (_jsx(Box, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black", children: _jsxs(Box, { ...getPanelFrameProps({ isActive, accentColor: 'cyan' }), flexDirection: "column", width: width, height: height, backgroundColor: "black", paddingX: 1, paddingY: 0, children: [_jsxs(Box, { justifyContent: "space-between", children: [_jsx(Text, { underline: true, color: isActive ? 'cyan' : 'white', children: "Plugins" }), _jsxs(Text, { color: "gray", children: [plugins.length, " instalados ", selectedPlugin ? `| Seleccionado: ${selectedPlugin}` : ''] })] }), _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsx(Box, { flexGrow: 1, children: isInstallMode ? (_jsx(Box, { justifyContent: "center", alignItems: "center", flexGrow: 1, children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { color: "cyan", bold: true, children: "Ruta del plugin:" }), _jsx(Box, { marginTop: 1, children: _jsx(Box, { borderStyle: "round", borderColor: "cyan", paddingX: 1, children: _jsx(Text, { color: "white", children: draftPath || _jsx(Text, { color: "gray", children: ".scrapper/mi-plugin" }) }) }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", dimColor: true, children: "Escribe la ruta y presiona Enter" }) })] }) })) : items.length > 0 ? (_jsx(SelectInput, { items: items, isFocused: isActive, limit: listLimit, initialIndex: Math.max(0, plugins.findIndex((p) => p.pluginId.toLowerCase() === (selectedPlugin ?? '').toLowerCase())), onHighlight: (item) => onSelectPlugin(item.value) }, revision)) : (_jsx(Text, { color: "gray", children: "No hay plugins instalados." })) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: isInstallMode ? (_jsxs(Text, { color: "yellow", children: ["Ruta .scrapper: ", draftPath || ' '] })) : (_jsx(Text, { color: "gray", dimColor: true, children: "\u2191/\u2193 navegar | A agregar | E eliminar" })) })] }), _jsx(Box, { backgroundColor: "white", paddingX: 1, width: "100%", children: _jsx(ShortcutBar, { items: isInstallMode ? [
                            { keyLabel: 'Enter', description: 'Instalar' },
                            { keyLabel: 'Esc', description: 'Cancelar' },
                        ] : [
                            { keyLabel: 'Esc', description: 'Salir' },
                            { keyLabel: 'A', description: 'Agregar' },
                            { keyLabel: 'E', description: 'Eliminar' },
                        ] }) }), _jsx(Box, { justifyContent: "flex-end", marginTop: 0, children: message ? (_jsx(Text, { color: "red", italic: true, children: message })) : (_jsx(Text, { color: isInstallMode ? 'yellow' : 'gray', italic: true, children: isInstallMode
                            ? 'Escribe la ruta del plugin y presiona Enter.'
                            : 'A abre diálogo de instalación.' })) })] }) }));
};
