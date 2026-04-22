import React from 'react';
import { Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import type { PaginationResult } from '../../../../services/pagination.types.js';
import { buildApplicationListHeader } from '../../../../services/list-labels.js';
import { ViewApplication } from './application-view-model.js';
import { getPanelFrameProps } from './panel-frame.js';

interface ApplicationListProps {
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

export const ApplicationList = ({
  items,
  onHighlight,
  pageLabel,
  isActive,
  isFocused,
  accentColor,
  availableWidth,
  itemLimit,
  flexGrow,
}: ApplicationListProps) => (
  <Box
    {...getPanelFrameProps({ isActive, accentColor })}
    flexDirection="column"
    paddingX={1}
    flexGrow={flexGrow}
  >
    <Text underline color={isActive ? accentColor : 'white'} wrap="truncate-end">
      Postulaciones
    </Text>
    <Text color={isActive ? accentColor : 'white'} dimColor wrap="truncate-end">
      {buildApplicationListHeader({
        sourceLabel: 'Fuente',
        appliedAtLabel: 'Fecha',
        primaryLabel: 'Título',
        secondaryLabel: 'Empresa',
        availableWidth,
      })}
    </Text>
    <Box flexGrow={1}>
      {items.length > 0 ? (
        <SelectInput
          items={items}
          isFocused={isFocused}
          limit={itemLimit}
          onHighlight={(item) => onHighlight(item as ViewApplication)}
        />
      ) : (
        <Text color="gray">No hay postulaciones guardadas.</Text>
      )}
    </Box>
    <Box justifyContent="flex-end" alignItems="flex-end">
      <Text color={isActive ? accentColor : 'gray'} wrap="truncate-end">
        {pageLabel}
      </Text>
    </Box>
  </Box>
);
