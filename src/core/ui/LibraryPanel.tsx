import React, { useState, useEffect } from 'react';
import ComponentCard from './ComponentCard';
import { EventBus } from '../ecs/EventBus';

interface TemplateManifest {
    id: string;
    name: string;
    description: string;
}

const LibraryPanel: React.FC = () => {
    const [templates, setTemplates] = useState<TemplateManifest[]>([]);
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchManifest = async () => {
            try {
                const response = await fetch('./src/core/assets/template-manifest.json');
                if (!response.ok) {
                    throw new Error(`Failed to fetch manifest: ${response.statusText}`);
                }
                const data = await response.json();
                setTemplates(data.templates);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManifest();
    }, []);

    const handleSelectTemplate = (templateId: string) => {
        setSelectedTemplateId(prevId => {
            const newSelectedId = prevId === templateId ? null : templateId;
            
            if (newSelectedId) {
                EventBus.getInstance().publish('preview:template', { templateId: newSelectedId });
            } else {
                EventBus.getInstance().publish('preview:clear');
            }

            return newSelectedId;
        });
    };

    return (
        <div style={styles.panelContainer}>
            {isLoading && <p>Loading library...</p>}
            {error && <p style={styles.errorText}>Error: {error}</p>}
            {!isLoading && !error && (
                <div style={styles.grid}>
                    {templates.map(template => (
                        <ComponentCard 
                            key={template.id}
                            templateId={template.id}
                            name={template.name} 
                            description={template.description}
                            isSelected={selectedTemplateId === template.id}
                            onClick={() => handleSelectTemplate(template.id)}
                        />
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