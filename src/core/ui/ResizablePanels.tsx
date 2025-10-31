import React, { useState, useRef, useEffect, useCallback, ReactNode } from 'react';

interface ResizablePanelsProps {
    children: ReactNode[];
}

/**
 * A reusable React component for creating a 3-panel layout with resizable dividers.
 * @param {ResizablePanelsProps} props - The component props.
 * @param {ReactNode[]} props.children - Must contain exactly three child elements for the three panels.
 */
const ResizablePanels: React.FC<ResizablePanelsProps> = ({ children }) => {
    if (React.Children.count(children) !== 3) {
        console.error("ResizablePanels expects exactly three children elements for left, middle, and right panels.");
        return null;
    }

    const [leftPanelWidth, setLeftPanelWidth] = useState(20); // Initial width in percentage
    const [rightPanelWidth, setRightPanelWidth] = useState(20); // Initial width in percentage

    const containerRef = useRef<HTMLDivElement>(null);
    const isResizing = useRef<'left' | 'right' | null>(null);

    // Load widths from localStorage on initial render
    useEffect(() => {
        try {
            const savedLeftWidth = localStorage.getItem('gameforge-left-panel-width');
            const savedRightWidth = localStorage.getItem('gameforge-right-panel-width');

            if (savedLeftWidth) {
                setLeftPanelWidth(parseFloat(savedLeftWidth));
            }
            if (savedRightWidth) {
                setRightPanelWidth(parseFloat(savedRightWidth));
            }
        } catch (error) {
            console.error("Failed to load panel widths from localStorage:", error);
        }
    }, []);

    // Save widths to localStorage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('gameforge-left-panel-width', String(leftPanelWidth));
            localStorage.setItem('gameforge-right-panel-width', String(rightPanelWidth));
        } catch (error) {
            console.error("Failed to save panel widths to localStorage:", error);
        }
    }, [leftPanelWidth, rightPanelWidth]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isResizing.current || !containerRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        
        if (isResizing.current === 'left') {
            const newLeftWidth = e.clientX - containerRect.left;
            const newLeftWidthPercent = (newLeftWidth / containerRect.width) * 100;
            if (newLeftWidthPercent > 10 && newLeftWidthPercent < 50) {
                 setLeftPanelWidth(newLeftWidthPercent);
            }
        } else if (isResizing.current === 'right') {
            const newRightWidth = containerRect.right - e.clientX;
            const newRightWidthPercent = (newRightWidth / containerRect.width) * 100;
            if (newRightWidthPercent > 10 && newRightWidthPercent < 50) {
                setRightPanelWidth(newRightWidthPercent);
            }
        }
    }, []);

    const handleMouseUp = useCallback(() => {
        isResizing.current = null;
        document.body.style.cursor = 'default';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseMove]);
    
    useEffect(() => {
        // Cleanup function to remove listeners on component unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

    const handleMouseDown = (resizer: 'left' | 'right') => (e: React.MouseEvent) => {
        e.preventDefault();
        isResizing.current = resizer;
        document.body.style.cursor = 'col-resize';
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const [left, middle, right] = React.Children.toArray(children);

    return (
        <div ref={containerRef} style={styles.resizableContainer}>
            <div style={{ width: `${leftPanelWidth}%`, ...styles.panel }}>
                {left}
            </div>
            <div
                style={styles.resizer}
                onMouseDown={handleMouseDown('left')}
                role="separator"
                aria-label="Resize left panel"
                aria-orientation="vertical"
                tabIndex={0}
            />
            <div style={{ flex: 1, ...styles.panel, minWidth: 0 }}>
                {middle}
            </div>
            <div
                style={styles.resizer}
                onMouseDown={handleMouseDown('right')}
                role="separator"
                aria-label="Resize right panel"
                aria-orientation="vertical"
                tabIndex={0}
            />
            <div style={{ width: `${rightPanelWidth}%`, ...styles.panel }}>
                {right}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    resizableContainer: {
        display: 'flex',
        flex: 1,
        width: '100%',
        overflow: 'hidden', // Keep this to prevent horizontal page scroll from rounding errors
    },
    panel: {
        display: 'flex',
        flexDirection: 'column',
        minWidth: '10%', // Minimum width for side panels
        position: 'relative', // Create stacking context
        minHeight: 0, // CRITICAL FIX: Allows flex items to shrink below their content size.
    },
    resizer: {
        flexShrink: 0,
        width: '5px',
        cursor: 'col-resize',
        backgroundColor: '#333333',
        userSelect: 'none',
        zIndex: 30, // Resizer should be on top of everything
    }
};

export default ResizablePanels;