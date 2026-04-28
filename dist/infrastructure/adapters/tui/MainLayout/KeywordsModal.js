import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';
export const KeywordsModal = ({ keywords, selectedKeyword, isActive, isInsertMode, draftKeyword, listLimit, revision, width, height, onSelectKeyword, }) => {
    const items = keywords.map((keyword) => ({
        label: keyword,
        value: keyword,
    }));
    return (_jsx(Box, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black", children: _jsxs(Box, { ...getPanelFrameProps({ isActive, accentColor: 'cyan' }), flexDirection: "column", width: width, height: height, backgroundColor: "black", paddingX: 1, paddingY: 0, children: [_jsxs(Box, { justifyContent: "space-between", children: [_jsx(Text, { underline: true, color: isActive ? 'cyan' : 'white', children: "Keywords" }), _jsxs(Text, { color: "gray", children: [keywords.length, " palabras ", selectedKeyword ? `| Seleccionada: ${selectedKeyword}` : ''] })] }), _jsxs(Box, { flexDirection: "column", flexGrow: 1, children: [_jsx(Box, { flexGrow: 1, children: items.length > 0 ? (_jsx(SelectInput, { items: items, isFocused: isActive && !isInsertMode, limit: listLimit, initialIndex: Math.max(0, keywords.findIndex((keyword) => keyword.toLowerCase() === (selectedKeyword ?? '').toLowerCase())), onHighlight: (item) => onSelectKeyword(item.value) }, revision)) : (_jsx(Text, { color: "gray", children: "No hay keywords cargadas." })) }), _jsx(Box, { marginTop: 1, flexDirection: "column", children: isInsertMode ? (_jsxs(Text, { color: "yellow", children: ["Nueva keyword: ", draftKeyword || ' '] })) : (_jsx(Text, { color: "gray", dimColor: true, children: "Usa \u2191/\u2193 para navegar." })) })] }), _jsx(Box, { backgroundColor: "white", paddingX: 1, width: "100%", children: _jsx(ShortcutBar, { items: [
                            { keyLabel: 'Esc', description: 'Salir' },
                            { keyLabel: 'I', description: 'Insertar' },
                            { keyLabel: 'Supr', description: 'Eliminar' },
                            { keyLabel: 'Enter', description: 'Guardar' },
                        ] }) }), _jsx(Box, { justifyContent: "flex-end", marginTop: 0, children: _jsx(Text, { color: isInsertMode ? 'yellow' : 'gray', italic: true, children: isInsertMode
                            ? 'Escribe la nueva palabra y presiona Enter.'
                            : 'I agrega una keyword nueva en el final.' }) })] }) }));
};
