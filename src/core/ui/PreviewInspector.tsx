import React from 'react';

interface PreviewInspectorProps {
    item: any;
    type: 'template' | 'node';
}

const PreviewInspector: React.FC<PreviewInspectorProps> = ({ item, type }) => {
    if (!item) return null;

    const headerText = type === 'template' ? 'Template Preview' : 'Node Preview';

    return (
        <div style={styles.container}>
            <h5 style={styles.header}>{headerText}: {item.name}</h5>
            <div style={styles.content}>
                <p style={styles.description}>{item.description}</p>
                {type === 'node' && item.category && (
                    <div style={styles.propertyItem}>
                        <span style={styles.propertyName}>Category:</span>
                        <span style={styles.propertyValue}>{item.category}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        color: '#ccc',
    },
    header: {
        margin: '0 0 1rem 0',
        color: '#eee',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        fontSize: '1rem'
    },
    content: {
        backgroundColor: '#3a3a3a',
        borderRadius: '4px',
        padding: '1rem',
        border: '1px solid #4a4a4a',
    },
    description: {
        margin: '0 0 1rem 0',
        fontSize: '0.9rem',
        color: '#bbb',
        fontStyle: 'italic',
    },
    propertyItem: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '0.85rem',
        backgroundColor: '#4a4a4a',
        padding: '0.5rem',
        borderRadius: '3px',
    },
    propertyName: {
        color: '#ccc',
        fontWeight: 'bold',
    },
    propertyValue: {
        color: '#eee',
        fontFamily: 'monospace',
    }
};

export default PreviewInspector;
