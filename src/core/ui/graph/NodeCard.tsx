import React from 'react';

interface NodeCardProps {
    type: string;
    name: string;
    description: string;
    isSelected: boolean;
    onClick: () => void;
}

const NodeCard: React.FC<NodeCardProps> = ({ type, name, description, isSelected, onClick }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', type);
        e.dataTransfer.effectAllowed = 'copy';
    };

    const cardStyle = isSelected ? { ...styles.card, ...styles.selectedCard } : styles.card;

    return (
        <div 
            style={cardStyle}
            draggable="true"
            onDragStart={handleDragStart}
            onClick={onClick}
            title={description}
        >
            <h5 style={styles.name}>{name}</h5>
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
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'background-color 0.2s, border-color 0.2s, box-shadow 0.2s',
    },
    selectedCard: {
        borderColor: '#007acc',
        boxShadow: '0 0 5px rgba(0, 122, 204, 0.7)',
        cursor: 'pointer',
    },
    name: {
        margin: 0,
        fontSize: '0.9rem',
        color: '#eee',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
    }
};

export default NodeCard;