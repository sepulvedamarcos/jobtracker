import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Box, Text } from 'ink';
export const ScanProgressModal = ({ isActive, keywords, plugins, currentPlugin, message, progress, width, height, pluginResults = [], }) => {
    if (!isActive)
        return null;
    // Barra de progreso proporcional al ancho disponible
    const barWidth = Math.max(20, width - 40);
    const filledWidth = Math.floor((progress / 100) * barWidth);
    const emptyWidth = barWidth - filledWidth;
    const progressBar = useMemo(() => {
        return '█'.repeat(filledWidth) + '░'.repeat(emptyWidth);
    }, [filledWidth, emptyWidth]);
    // Total de jobs encontrados en este scan
    const totalJobsThisScan = pluginResults.reduce((sum, r) => sum + (r.count || 0), 0);
    return (_jsx(Box, { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", justifyContent: "center", alignItems: "center", backgroundColor: "black", children: _jsxs(Box, { flexDirection: "column", width: width, height: height, backgroundColor: "black", paddingX: 2, borderStyle: "bold", borderColor: "green", children: [_jsx(Text, { bold: true, color: "green", children: '\u{1F50D} Escaneo en Progreso' }), _jsxs(Box, { flexDirection: "column", marginY: 1, children: [_jsxs(Text, { color: "cyan", children: ["Plugins: ", plugins.join(', ')] }), _jsxs(Text, { color: "cyan", children: ["Keywords: ", keywords.length, " (", keywords.join(', '), ")"] }), _jsxs(Text, { color: "yellow", children: ["Plugin actual: ", currentPlugin || 'Iniciando...'] })] }), _jsx(Box, { marginTop: 1, children: _jsxs(Text, { children: ["Progreso: ", progress, "%"] }) }), _jsx(Box, { width: barWidth, children: _jsx(Text, { backgroundColor: "green", children: progressBar }) }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { color: "gray", children: message }) }), pluginResults.length > 0 && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { bold: true, color: "green", children: "Resultados:" }), pluginResults.map((r) => (_jsxs(Text, { color: r.error ? 'red' : 'white', children: ['  \u{2022} ', r.pluginId, '}: ', r.error ? r.error : `${r.count} empleos`] }, r.pluginId)))] })), _jsx(Box, { backgroundColor: "white", paddingX: 1, width: "100%", marginTop: 1, children: _jsx(Text, { children: "Presiona Esc para cancelar" }) })] }) }));
};
