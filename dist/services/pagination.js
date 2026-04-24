const truncateText = (value, maxLength) => {
    if (value.length <= maxLength) {
        return value;
    }
    if (maxLength <= 1) {
        return value.slice(0, maxLength);
    }
    return `${value.slice(0, maxLength - 1).trimEnd()}…`;
};
export const paginateWithLabels = (items, pageIndex, pageSize, getLabel, maxLabelLength = 66, itemNoun = 'avisos', getSuffix = () => '') => {
    const totalItems = items.length;
    const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / pageSize);
    const currentPage = totalPages === 0 ? 0 : Math.min(pageIndex, totalPages - 1);
    const startIndex = currentPage * pageSize;
    const endIndex = Math.min(startIndex + pageSize, totalItems);
    const pageItems = items.slice(startIndex, endIndex);
    const lineNumberWidth = Math.max(2, String(totalItems).length);
    const pagedItems = pageItems.map((item, index) => {
        const lineNumber = String(startIndex + index + 1).padStart(lineNumberWidth, '0');
        const rawLabel = getLabel(item);
        const safeLabel = truncateText(rawLabel, maxLabelLength);
        return {
            ...item,
            lineNumber,
            label: `${lineNumber}. ${safeLabel}${getSuffix(item)}`,
        };
    });
    const pageLabel = totalItems === 0
        ? `Pagina 0/0 | Mostrando 0 de 0 ${itemNoun}`
        : `Pagina ${currentPage + 1}/${totalPages} | Mostrando ${startIndex + 1}-${endIndex} de ${totalItems} ${itemNoun}`;
    return {
        items: pagedItems,
        currentPage,
        totalPages,
        startIndex,
        endIndex,
        pageLabel,
    };
};
