import React from 'react';
import { ViewJob } from './view-model.js';
import { JobDetail } from './JobDetail.js';

interface DetailPanelProps {
    job: ViewJob | null;
    isActive: boolean;
    flexBasis?: string;
    flexGrow?: number;
    height?: number;
}

export const DetailPanel = ({ job, isActive, flexBasis, flexGrow, height }: DetailPanelProps) => (
    <JobDetail job={job} isActive={isActive} flexBasis={flexBasis} flexGrow={flexGrow} height={height} />
);

