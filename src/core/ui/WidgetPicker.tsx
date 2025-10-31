import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface WidgetPickerProps {
    widgetManifest: any;
    anchorEl: HTMLElement;
    onSelect: (widgetType: string) => void;
    onClose: () => void;
}

const WidgetPicker: React.FC<WidgetPickerProps> = ({ widgetManifest, anchorEl, onSelect, onClose }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const pickerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Auto-focus the search input when the picker opens
        searchInputRef.current?.focus();

        const handleClickOutside = (event: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const filteredWidgets = widgetManifest.widgets.filter((widget: any) =>
        widget.name.toLowerCase().includes(searchTerm.toLowerCase()) && widget.id !== 'layout-section'
    );
    
    const rect = anchorEl.getBoundingClientRect();
    const pickerStyle: React.CSSProperties = {
        position: 'fixed',
        top: `${rect.bottom + 8}px`,
        left: `${rect.left + rect.width / 2}px`,
        transform: 'translateX(-50%)',
    };

    return createPortal(
        <div ref={pickerRef} style={{...styles.container, ...pickerStyle}} onClick={(e) => e.stopPropagation()}>
            <div style={styles.searchContainer}>
                <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search widgets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>
            <ul style={styles.list}>
                {filteredWidgets.map((widget: any) => (
                    <li key={widget.id} style={styles.listItem} onClick={() => onSelect(widget.id)}>
                        <span style={styles.widgetName}>{widget.name}</span>
                        <span style={styles.widgetDesc}>{widget.description}</span>
                    </li>
                ))}
            </ul>
        </div>,
        document.body
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '300px',
        maxHeight: '400px',
        backgroundColor: '#252526',
        border: '1px solid #555',
        borderRadius: '8px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
        zIndex: 10002,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    },
    searchContainer: {
        padding: '0.75rem',
        borderBottom: '1px solid #444',
    },
    searchInput: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#1e1e1e',
        border: '1px solid #555',
        borderRadius: '4px',
        color: '#eee',
        boxSizing: 'border-box',
    },
    list: {
        listStyle: 'none',
        padding: 0,
        margin: 0,
        overflowY: 'auto',
    },
    listItem: {
        padding: '0.75rem 1rem',
        cursor: 'pointer',
        borderBottom: '1px solid #333',
    },
    widgetName: {
        display: 'block',
        color: '#eee',
        fontWeight: 'bold',
        fontSize: '0.9rem',
    },
    widgetDesc: {
        display: 'block',
        color: '#999',
        fontSize: '0.8rem',
        marginTop: '4px',
    }
};

export default WidgetPicker;