import React, { useState } from 'react';
import DebugIdTooltip from './dev/DebugIdTooltip';

interface ComponentCardProps {
    templateId: string;
    name: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
    categories?: string[];
    currentCategory?: string;
    onCategoryChange?: (newCategory: string) => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ templateId, name, description, isSelected, onClick, categories, currentCategory, onCategoryChange }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        // Prevent drag if menu is open or was just clicked
        if (e.target !== e.currentTarget) return;
        e.dataTransfer.setData('text/plain', templateId);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleMenuClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card selection when clicking menu
        setIsMenuOpen(!isMenuOpen);
    };

    const handleCategorySelect = (e: React.MouseEvent, category: string) => {
        e.stopPropagation();
        if (onCategoryChange) {
            onCategoryChange(category);
        }
        setIsMenuOpen(false);
    };

    const cardId = `library-card-${templateId.toLowerCase()}`;
    const cardStyle = isSelected ? { ...styles.card, ...styles.selectedCard } : styles.card;

    return (
        <div 
            style={cardStyle}
            draggable="true"
            onDragStart={handleDragStart}
            onClick={onClick}
        >
            <DebugIdTooltip debugId={cardId}>
                <div style={styles.contentWrapper}>
                    {onCategoryChange && categories && (
                        <div style={styles.menuContainer}>
                            <button style={styles.menuButton} onClick={handleMenuClick}>⋮</button>
                            {isMenuOpen && (
                                <div style={styles.dropdownMenu}>
                                    {categories.map(cat => (
                                        <div 
                                            key={cat} 
                                            style={cat === currentCategory ? {...styles.dropdownItem, ...styles.activeItem} : styles.dropdownItem}
                                            onClick={(e) => handleCategorySelect(e, cat)}
                                        >
                                            {cat}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    <div style={styles.iconPlaceholder}></div>
                    <h5 style={styles.name}>{name}</h5>
                    <p style={styles.description}>{description}</p>
                </div>
            </DebugIdTooltip>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    card: {
        backgroundColor: '#3a3a3a',
        padding: '0.75rem',
        borderRadius: '4px',
        border: '1px solid #555',
        textAlign: 'center',
        cursor: 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
        position: 'relative',
    },
    selectedCard: {
        borderColor: '#007acc',
        boxShadow: '0 0 5px rgba(0, 122, 204, 0.7)',
    },
    contentWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
        height: '100%'
    },
    menuContainer: {
        position: 'absolute',
        top: '2px',
        right: '2px',
        zIndex: 1,
    },
    menuButton: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '16px',
        lineHeight: 1,
        padding: '2px 4px',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '18px',
        right: 0,
        backgroundColor: '#252526',
        border: '1px solid #555',
        borderRadius: '4px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
        minWidth: '120px',
    },
    dropdownItem: {
        padding: '8px 12px',
        textAlign: 'left',
        fontSize: '12px',
        color: '#ccc',
        cursor: 'pointer',
    },
    activeItem: {
        backgroundColor: '#007acc',
        color: 'white',
    },
    iconPlaceholder: {
        width: '32px',
        height: '32px',
        backgroundColor: '#555',
        borderRadius: '4px',
    },
    name: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#eee',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
    },
    description: {
        margin: 0,
        fontSize: '0.75rem',
        color: '#aaa',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        minHeight: '2.2em', // Reserve space for 2 lines
    }
};

export default ComponentCard;