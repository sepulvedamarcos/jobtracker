import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
export const ShortcutBar = ({ items, alignRight = false }) => (_jsx(Box, { width: "100%", justifyContent: alignRight ? 'flex-end' : 'flex-start', flexWrap: "nowrap", children: items.map((item) => (_jsxs(Box, { marginRight: 1, paddingX: 1, backgroundColor: "white", children: [_jsx(Text, { color: "black", bold: true, children: item.keyLabel }), _jsxs(Text, { color: "black", children: [" ", item.description] })] }, `${item.keyLabel}-${item.description}`))) }));
