import React from 'react';
import { Box, Text } from 'ink';

export const JobDetail = ({ job }: any) => (
	<Box flexDirection="column" flexBasis="40%">
		<Box borderStyle="round" flexDirection="column" paddingX={1} flexGrow={1}>
			<Text underline color="magenta">Detalle</Text>
			{job ? (
				<>
					<Text>Empresa: {job.empresa}</Text>
					<Text>Fecha: {job.fecha}</Text>
				</>
			) : (
				<Text color="gray">Selecciona un aviso...</Text>
			)}
		</Box>
		{/* Panel inferior de URL */}
		<Box borderStyle="round" paddingX={1}>
			<Text color="blue">URL: {job?.url || '---'}</Text>
		</Box>
	</Box>
);
