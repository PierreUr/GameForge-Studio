import React from 'react';

interface ComponentCardProps {
    name: string;
    description: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ name, description }) => {
    
    const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
        e.dataTransfer.setData('text/plain', name);
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div 
            style={styles.card}
            draggable="true"
            onDragStart={handleDragStart}
        >
            <div style={styles.iconPlaceholder}></div>
            <h5 style={styles.name}>{name.replace('Component', '')}</h5>
            <p style={styles.description}>{description}</p>
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
        gap: '0.5rem',
        transition: 'background-color 0.2s, border-color 0.2s',
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