import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import { ShortcutBar } from './ShortcutBar.js';
export const Footer = () => {
    return (_jsxs(Box, { backgroundColor: "white", paddingX: 1, width: "100%", children: [_jsx(ShortcutBar, { items: [
                    { keyLabel: 'S', description: 'Scan' },
                    { keyLabel: 'K', description: 'Keywords' },
                    { keyLabel: 'P', description: 'Plugins' },
                    { keyLabel: 'Tab', description: 'Panel' },
                    { keyLabel: 'PgUp/PgDn', description: 'Page' },
                    { keyLabel: 'Enter', description: 'Abrir' },
                ] }), _jsxs(Box, { flexGrow: 1, paddingRight: 1, justifyContent: "flex-end", children: [_jsx(Text, { color: "black", bold: true, children: " Q" }), _jsx(Text, { color: "black", children: " Salir" }), _jsx(Text, { color: "black", children: " / Ctrl+C" })] })] }));
};
