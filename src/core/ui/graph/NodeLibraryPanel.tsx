import React, { useState, useEffect } from 'react';
import NodeCard from './NodeCard';
import { EventBus } from '../../ecs/EventBus';

interface NodeManifest {
    type: string;
    name: string;
    category: string;
    description: string;
}

interface GroupedNodes {
    [category: string]: NodeManifest[];
}

const NodeLibraryPanel: React.FC = () => {
    const [groupedNodes, setGroupedNodes] = useState<GroupedNodes>({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedNodeType, setSelectedNodeType] = useState<string | null>(null);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const response = await fetch('./src/core/graph/node-manifest.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch node manifest: ${response.statusText}`);
                }
                const data = await response.json();
                
                const groups: GroupedNodes = {};
                for (const node of data.nodes) {
                    if (!groups[node.category]) {
                        groups[node.category] = [];
                    }
                    groups[node.category].push(node);
                }
                setGroupedNodes(groups);

            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManifest();
    }, []);

    const handleNodeSelect = (nodeType: string) => {
        setSelectedNodeType(prevType => {
            const newSelectedType = prevType === nodeType ? null : nodeType;
            if (newSelectedType) {
                EventBus.getInstance().publish('preview:node', { nodeType: newSelectedType });
            } else {
                EventBus.getInstance().publish('preview:clear');
            }
            return newSelectedType;
        });
    };

    return (
        <div style={styles.panelContainer}>
            {isLoading && <p>Loading nodes...</p>}
            {error && <p style={styles.errorText}>Error: {error}</p>}
            {!isLoading && !error && (
                Object.entries(groupedNodes).map(([category, nodes]) => (
                    <div key={category} style={styles.categoryGroup}>
                        <h6 style={styles.categoryHeader}>{category}</h6>
                        <div style={styles.grid}>
                            {nodes.map(node => (
                                <NodeCard 
                                    key={node.type}
                                    type={node.type}
                                    name={node.name}
                                    description={node.description}
                                    isSelected={selectedNodeType === node.type}
                                    onClick={() => handleNodeSelect(node.type)}
                                />
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    panelContainer: {
        width: '250px',
        height: '100%',
        backgroundColor: '#2d2d2d',
        borderRight: '1px solid #444',
        padding: '1rem',
        overflowY: 'auto',
    },
    errorText: {
        color: '#ff8080',
    },
    categoryGroup: {
        marginBottom: '1.5rem',
    },
    categoryHeader: {
        margin: '0 0 0.75rem 0',
        color: '#ccc',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '0.5rem',
    }
};

export default NodeLibraryPanel;