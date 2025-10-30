import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

interface InspectorHelpTooltipProps {
    text: string;
}

const TooltipPortal: React.FC<{ text: string, rect: DOMRect | null }> = ({ text, rect }) => {
    if (!rect) return null;

    const style: React.CSSProperties = {
        position: 'fixed',
        top: `${rect.top - 10}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translate(-50%, -100%)',
        backgroundColor: 'rgba(20, 20, 20, 0.95)',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        zIndex: 10001, // Higher than other UI elements
        pointerEvents: 'none',
        boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
        border: '1px solid #555',
        width: 'max-content',
        maxWidth: '250px',
        whiteSpace: 'normal',
    };

    return createPortal(<div style={style}>{text}</div>, document.body);
};


const InspectorHelpTooltip: React.FC<InspectorHelpTooltipProps> = ({ text }) => {
    const [isHovered, setIsHovered] = useState(false);
    const iconRef = useRef<HTMLDivElement>(null);
    const [rect, setRect] = useState<DOMRect | null>(null);

    const handleMouseEnter = useCallback(() => {
        if (iconRef.current) {
            setRect(iconRef.current.getBoundingClientRect());
            setIsHovered(true);
        }
    }, []);

    const handleMouseLeave = useCallback(() => {
        setIsHovered(false);
    }, []);

    return (
        <div 
            ref={iconRef}
            style={styles.iconContainer}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            aria-label={`Help: ${text}`}
        >
            <span style={styles.icon}>ⓘ</span>
            {isHovered && <TooltipPortal text={text} rect={rect} />}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    iconContainer: {
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: '14px',
        cursor: 'help',
        color: 'rgba(170, 170, 170, 0.7)',
        userSelect: 'none',
    }
};

export default InspectorHelpTooltip;