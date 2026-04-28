import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import { buildApplicationListHeader } from '../../../../services/list-labels.js';
import { getPanelFrameProps } from './panel-frame.js';
export const ApplicationList = ({ items, onHighlight, pageLabel, isActive, isFocused, accentColor, availableWidth, itemLimit, flexGrow, }) => (_jsxs(Box, { ...getPanelFrameProps({ isActive, accentColor }), flexDirection: "column", paddingX: 1, flexGrow: flexGrow, children: [_jsx(Text, { underline: true, color: isActive ? accentColor : 'white', wrap: "truncate-end", children: "Postulaciones" }), _jsx(Text, { color: isActive ? accentColor : 'white', dimColor: true, wrap: "truncate-end", children: buildApplicationListHeader({
                sourceLabel: 'Fuente',
                appliedAtLabel: 'Fecha',
                primaryLabel: 'Título',
                secondaryLabel: 'Empresa',
                availableWidth,
            }) }), _jsx(Box, { flexGrow: 1, children: items.length > 0 ? (_jsx(SelectInput, { items: items, isFocused: isFocused, limit: itemLimit, onHighlight: (item) => onHighlight(item) })) : (_jsx(Text, { color: "gray", children: "No hay postulaciones guardadas." })) }), _jsx(Box, { justifyContent: "flex-end", alignItems: "flex-end", children: _jsx(Text, { color: isActive ? accentColor : 'gray', wrap: "truncate-end", children: pageLabel }) })] }));
