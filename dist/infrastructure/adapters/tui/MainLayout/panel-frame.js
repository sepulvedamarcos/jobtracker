export const getPanelFrameProps = ({ isActive, accentColor }) => ({
    borderStyle: isActive ? 'double' : 'round',
    borderColor: isActive ? accentColor : 'gray',
});
