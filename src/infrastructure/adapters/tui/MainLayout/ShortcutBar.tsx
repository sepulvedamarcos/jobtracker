import React from 'react';
import { Box, Text } from 'ink';

export interface ShortcutBarItem {
    keyLabel: string;
    description: string;
}

interface ShortcutBarProps {
    items: ShortcutBarItem[];
    alignRight?: boolean;
}

export const ShortcutBar = ({ items, alignRight = false }: ShortcutBarProps) => (
    <Box width="100%" justifyContent={alignRight ? 'flex-end' : 'flex-start'} flexWrap="nowrap">
        {items.map((item) => (
            <Box key={`${item.keyLabel}-${item.description}`} marginRight={1} paddingX={1} backgroundColor="white">
                <Text color="black" bold>
                    {item.keyLabel}
                </Text>
                <Text color="black"> {item.description}</Text>
            </Box>
        ))}
    </Box>
);

