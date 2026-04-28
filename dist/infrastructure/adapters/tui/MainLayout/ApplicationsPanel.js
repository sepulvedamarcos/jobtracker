import { jsx as _jsx } from "react/jsx-runtime";
import { ApplicationList } from './ApplicationList.js';
export const ApplicationsPanel = ({ items, onHighlight, pageLabel, isActive, isFocused, accentColor, availableWidth, itemLimit, flexGrow, }) => (_jsx(ApplicationList, { items: items, onHighlight: onHighlight, pageLabel: pageLabel, isActive: isActive, isFocused: isFocused, accentColor: accentColor, availableWidth: availableWidth, itemLimit: itemLimit, flexGrow: flexGrow }));
