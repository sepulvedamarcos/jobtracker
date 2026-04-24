const truncateText = (value, maxLength) => {
    if (value.length <= maxLength) {
        return value;
    }
    if (maxLength <= 1) {
        return value.slice(0, maxLength);
    }
    return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};
export const buildListItemLabel = ({ source, primaryText, secondaryText, availableWidth, }) => {
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    let sourceWidth = clamp(Math.floor(availableWidth * 0.18), 8, 12);
    let secondaryWidth = clamp(Math.floor(availableWidth * 0.22), 10, 16);
    const separatorsWidth = 6;
    let primaryWidth = availableWidth - sourceWidth - secondaryWidth - separatorsWidth;
    if (primaryWidth < 8) {
        const targetWidth = 8;
        const shortage = targetWidth - primaryWidth;
        const secondaryReduction = Math.min(shortage, secondaryWidth - 10);
        secondaryWidth -= secondaryReduction;
        const remainingShortage = shortage - secondaryReduction;
        sourceWidth -= Math.min(remainingShortage, sourceWidth - 8);
        primaryWidth = Math.max(1, availableWidth - sourceWidth - secondaryWidth - separatorsWidth);
    }
    const sourceCell = truncateText(source, sourceWidth).padEnd(sourceWidth);
    return `${sourceCell} | ${truncateText(primaryText, primaryWidth)} — ${truncateText(secondaryText, secondaryWidth)}`;
};
export const buildListHeader = ({ sourceLabel, primaryLabel, secondaryLabel, availableWidth, }) => {
    const separatorWidth = 3;
    const sourceWidth = 10;
    const secondaryWidth = 16;
    const primaryWidth = Math.max(10, availableWidth - sourceWidth - secondaryWidth - separatorWidth);
    return `${truncateText(sourceLabel, sourceWidth).padEnd(sourceWidth)} | ${truncateText(primaryLabel, primaryWidth)} — ${truncateText(secondaryLabel, secondaryWidth)}`;
};
const formatAppliedAt = (value) => {
    if (!value) {
        return '';
    }
    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }
    const day = String(parsedDate.getDate()).padStart(2, '0');
    const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
    const year = String(parsedDate.getFullYear()).slice(-2);
    return `${day}/${month}/${year}`;
};
export const buildApplicationListItemLabel = ({ source, appliedAt, primaryText, secondaryText, availableWidth, }) => {
    const clamp = (value, minimum, maximum) => Math.max(minimum, Math.min(maximum, value));
    const sourceWidth = clamp(Math.floor(availableWidth * 0.16), 8, 12);
    const appliedAtWidth = clamp(Math.floor(availableWidth * 0.18), 8, 12);
    const companyWidth = clamp(Math.floor(availableWidth * 0.22), 10, 16);
    const separatorsWidth = 9;
    const titleWidth = Math.max(8, availableWidth - sourceWidth - appliedAtWidth - companyWidth - separatorsWidth);
    return [
        truncateText(source, sourceWidth).padEnd(sourceWidth),
        truncateText(formatAppliedAt(appliedAt), appliedAtWidth).padEnd(appliedAtWidth),
        truncateText(primaryText, titleWidth),
        truncateText(secondaryText, companyWidth),
    ].join(' | ');
};
export const buildApplicationListHeader = ({ sourceLabel, appliedAtLabel, primaryLabel, secondaryLabel, availableWidth, }) => {
    const sourceWidth = 10;
    const appliedAtWidth = 10;
    const companyWidth = 14;
    const separatorsWidth = 9;
    const titleWidth = Math.max(8, availableWidth - sourceWidth - appliedAtWidth - companyWidth - separatorsWidth);
    return [
        truncateText(sourceLabel, sourceWidth).padEnd(sourceWidth),
        truncateText(appliedAtLabel, appliedAtWidth).padEnd(appliedAtWidth),
        truncateText(primaryLabel, titleWidth),
        truncateText(secondaryLabel, companyWidth),
    ].join(' | ');
};
