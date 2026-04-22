export type PanelKey = 'jobs' | 'detail' | 'applications';

interface PanelFrameOptions {
    isActive: boolean;
    accentColor: string;
}

export const getPanelFrameProps = ({ isActive, accentColor }: PanelFrameOptions) => ({
    borderStyle: isActive ? ('double' as const) : ('round' as const),
    borderColor: isActive ? accentColor : 'gray',
});
