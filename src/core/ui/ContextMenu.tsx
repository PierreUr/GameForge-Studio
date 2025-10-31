import React, { useRef, useEffect } from 'react';

interface MenuItem {
    label: string;
    onClick: () => void;
}

interface ContextMenuProps {
    x: number;
    y: number;
    items: MenuItem[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleItemClick = (onClick: () => void) => {
        onClick();
        onClose();
    };

    return (
        <div ref={menuRef} style={{ ...styles.menu, top: y, left: x }}>
            {items.map((item, index) => (
                <button
                    key={index}
                    style={styles.item}
                    onClick={() => handleItemClick(item.onClick)}
                >
                    {item.label}
                </button>
            ))}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    menu: {
        position: 'fixed',
        backgroundColor: '#3a3a3a',
        border: '1px solid #555',
        borderRadius: '4px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
        zIndex: 10000,
        padding: '0.5rem 0',
        minWidth: '180px',
        display: 'flex',
        flexDirection: 'column',
    },
    item: {
        backgroundColor: 'transparent',
        border: 'none',
        color: '#eee',
        padding: '0.75rem 1rem',
        width: '100%',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '0.9rem',
    },
};

export default ContextMenu;