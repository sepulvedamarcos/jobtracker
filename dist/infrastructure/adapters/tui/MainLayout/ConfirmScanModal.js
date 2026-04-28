import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { getPanelFrameProps } from './panel-frame.js';
import { ShortcutBar } from './ShortcutBar.js';
export const ConfirmScanModal = ({ isActive, keywords, width, height, onConfirm, onCancel, }) => {
    const items = [
        { label: 'Sí', value: 'yes' },
        { label: 'No', value: 'no' },
    ];
    const handleSelect = (item) => {
        if (item.value === 'yes') {
            onConfirm();
        }
        else {
            onCancel();
        }
    };
    if (!isActive)
        return null;
    return (_jsx(Box, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black", children: _jsxs(Box, { ...getPanelFrameProps({ isActive, accentColor: 'red' }), flexDirection: "column", width: width, height: height, backgroundColor: "black", paddingX: 1, children: [_jsx(Text, { bold: true, color: "red", children: "\u26A0\uFE0F Confirmar Escaneo" }), _jsx(Box, { flexDirection: "column", marginY: 1, children: _jsx(Text, { children: "Al ejecutar el scan se limpiara el archivo actual y se mostraran solo los resultados de esta busqueda." }) }), _jsxs(Text, { color: "cyan", children: ["Keywords a buscar: ", keywords.join(', ')] }), _jsx(Box, { marginY: 1, children: _jsx(Text, { children: "Estas seguro?" }) }), _jsx(Box, { backgroundColor: "white", paddingX: 1, width: "100%", children: _jsx(ShortcutBar, { items: [
                            { keyLabel: 'Enter', description: 'Confirmar' },
                            { keyLabel: 'Esc', description: 'Cancelar' },
                        ] }) })] }) }));
};
