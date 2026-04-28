import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import Gradient from 'ink-gradient';
import { getVersion } from '../../../../services/version.js';
export const Header = ({ pluginsCount, keywordsCount, status }) => {
    return (_jsxs(Box, { borderStyle: "single", borderColor: "cyan", paddingX: 1, justifyContent: "space-between", children: [_jsxs(Box, { children: [_jsx(Gradient, { name: "summer", children: _jsx(Text, { bold: true, children: "JOB TRACKER" }) }), _jsxs(Text, { color: "gray", children: [" v", getVersion()] })] }), _jsx(Box, { children: _jsxs(Text, { children: ["Plugins: ", _jsx(Text, { color: "green", children: pluginsCount }), ' | ', "Keywords: ", _jsx(Text, { color: "green", children: keywordsCount }), ' | ', "Estado: ", _jsx(Text, { color: "yellow", children: status })] }) })] }));
};
