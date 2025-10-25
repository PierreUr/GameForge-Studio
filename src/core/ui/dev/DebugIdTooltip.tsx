import React, { useState } from 'react';
import { useDebugContext } from './DebugContext';

interface DebugIdTooltipProps {
    debugId: string;
    children: React.ReactNode;
}

const DebugIdTooltip: React.FC<DebugIdTooltipProps> = ({ debugId, children }) => {
    const [isHovered, setIsHovered] = useState(false);
    const { isDebugVisible } = useDebugContext();

    // If debug mode is off, just render the children without any wrapper or icon.
    if (!isDebugVisible) {
        return <>{children}</>;
    }
    
    return (
        <div style={styles.wrapper}>
            {children}
            <div 
                style={styles.icon}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                aria-label={`Debug ID: ${debugId}`}
            >
                &#x2139;
                {isHovered && (
                    <div style={styles.tooltip}>
                        {debugId}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    wrapper: {
        position: 'relative',
        width: '100%',
        height: '100%',
    },
    icon: {
        position: 'absolute',
        top: '2px',
        right: '2px',
        fontSize: '10px',
        cursor: 'help',
        zIndex: 9999,
        padding: '2px',
        lineHeight: '1',
        userSelect: 'none',
        color: 'rgba(255, 255, 255, 0.5)',
    },
    tooltip: {
        position: 'absolute',
        top: '18px',
        right: '0px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        color: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        whiteSpace: 'nowrap',
        zIndex: 10000,
        pointerEvents: 'none',
        boxShadow: '0 2px 4px rgba(0,0,0,0.5)',
    }
};

export default DebugIdTooltip;