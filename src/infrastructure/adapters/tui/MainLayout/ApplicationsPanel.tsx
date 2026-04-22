import React from 'react';
import type { PaginationResult } from '../../../../services/pagination.types.js';
import { ApplicationList } from './ApplicationList.js';
import { ViewApplication } from './application-view-model.js';

interface ApplicationsPanelProps {
    items: PaginationResult<ViewApplication>['items'];
    onHighlight: (item: ViewApplication) => void;
    pageLabel: string;
    isActive: boolean;
    isFocused: boolean;
    accentColor: string;
    availableWidth: number;
    itemLimit: number;
    flexGrow?: number;
}

export const ApplicationsPanel = ({
    items,
    onHighlight,
    pageLabel,
    isActive,
    isFocused,
    accentColor,
    availableWidth,
    itemLimit,
    flexGrow,
}: ApplicationsPanelProps) => (
    <ApplicationList
        items={items}
        onHighlight={onHighlight}
        pageLabel={pageLabel}
        isActive={isActive}
        isFocused={isFocused}
        accentColor={accentColor}
        availableWidth={availableWidth}
        itemLimit={itemLimit}
        flexGrow={flexGrow}
    />
);
