import React from 'react';
import DebugIdTooltip from './dev/DebugIdTooltip';

interface ComponentCardProps {
    templateId: string;
    name: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ templateId, name, description, isSelected, onClick }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', templateId);
        e.dataTransfer.effectAllowed = 'copy';
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
        position: 'relative', // Parent for the tooltip wrapper
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