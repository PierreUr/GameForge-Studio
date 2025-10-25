import React, { useState, useEffect } from 'react';
import ComponentCard from './ComponentCard';

interface ComponentManifest {
    name: string;
    description: string;
    properties: any[];
}

const LibraryPanel: React.FC = () => {
    const [components, setComponents] = useState<ComponentManifest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const response = await fetch('./src/core/assets/component-manifest.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch manifest: ${response.statusText}`);
                }
                const data = await response.json();
                setComponents(data.components);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManifest();
    }, []);

    return (
        <div style={styles.panelContainer}>
            {isLoading && <p>Loading library...</p>}
            {error && <p style={styles.errorText}>Error: {error}</p>}
            {!isLoading && !error && (
                <div style={styles.grid}>
                    {components.map(comp => (
                        <ComponentCard key={comp.name} name={comp.name} description={comp.description} />
                    ))}
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    panelContainer: {
        padding: '1rem',
        height: '100%',
        overflowY: 'auto',
    },
    errorText: {
        color: '#ff8080',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1rem',
    }
};

export default LibraryPanel;
