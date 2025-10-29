import React from 'react';

interface SpacerWidgetProps {
    height?: number;
}

const SpacerWidget: React.FC<SpacerWidgetProps> = ({ height = 20 }) => {
    return (
        <div style={{ height: `${height}px`, width: '100%', flexShrink: 0 }} />
    );
};

export default SpacerWidget;
