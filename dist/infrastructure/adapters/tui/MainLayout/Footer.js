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
                ] }), _jsx(Box, { flexGrow: 1, paddingRight: 2, justifyContent: "flex-end", flexWrap: "nowrap", width: "auto", children: _jsx(Text, { color: "black", children: "Q Salir  " }) })] }));
};
