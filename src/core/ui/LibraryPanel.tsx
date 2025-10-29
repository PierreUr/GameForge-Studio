import React, { useState, useEffect, useMemo } from 'react';
import ComponentCard from './ComponentCard';
import { EventBus } from '../ecs/EventBus';

interface LibraryPanelProps {}

interface ManifestItem {
    id: string;
    name: string;
    description: string;
    category: string;
}

const LibraryPanel: React.FC<LibraryPanelProps> = () => {
    const [templates, setTemplates] = useState<ManifestItem[]>([]);
    const [widgets, setWidgets] = useState<ManifestItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchManifests = async () => {
            try {
                const [templateRes, widgetRes] = await Promise.all([
                    fetch('./src/core/assets/template-manifest.json'),
                    fetch('./src/core/assets/ui-widget-manifest.json')
                ]);
                if (!templateRes.ok || !widgetRes.ok) {
                    throw new Error(`Failed to fetch manifests`);
                }
                const templateData = await templateRes.json();
                const widgetData = await widgetRes.json();
                // Add category to templates for consistency if missing
                setTemplates(templateData.templates.map((t: any) => ({ ...t, category: t.category || 'Entity' })));
                setWidgets(widgetData.widgets);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManifests();

        const handleDeselect = () => {
             if (selectedItemId) {
                setSelectedItemId(null);
            }
        };

        EventBus.getInstance().subscribe('entity:selected', handleDeselect);

        return () => {
             EventBus.getInstance().unsubscribe('entity:selected', handleDeselect);
        }
    }, [selectedItemId]);
    
    const handleSelectItem = (itemId: string, itemType: 'widget' | 'template') => {
        setSelectedItemId(prevId => {
            const newSelectedId = prevId === itemId ? null : itemId;
            
            if (newSelectedId) {
                if(itemType === 'template') {
                    EventBus.getInstance().publish('preview:template', { templateId: newSelectedId });
                }
            } else {
                EventBus.getInstance().publish('preview:clear');
            }

            return newSelectedId;
        });
    };

    const handleCategoryChange = (widgetId: string, newCategory: string) => {
        setWidgets(prevWidgets => prevWidgets.map(w => w.id === widgetId ? { ...w, category: newCategory } : w));
    };

    const filteredWidgets = useMemo(() => {
        return widgets.filter(w => w.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [widgets, searchTerm]);

    const groupedWidgets = useMemo(() => {
        return filteredWidgets.reduce((acc, widget) => {
            const category = widget.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(widget);
            return acc;
        }, {} as Record<string, ManifestItem[]>);
    }, [filteredWidgets]);

    const allCategories = useMemo(() => [...new Set(widgets.map(w => w.category || 'Uncategorized'))], [widgets]);

    return (
        <div style={styles.panelContainer}>
            <div style={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search library..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            {isLoading && <p>Loading library...</p>}
            {error && <p style={styles.errorText}>Error: {error}</p>}
            {!isLoading && !error && (
                <>
                    <h5 style={styles.groupHeader}>UI Widgets</h5>
                    {Object.entries(groupedWidgets).sort(([a], [b]) => a.localeCompare(b)).map(([category, items]) => (
                        <div key={category}>
                            <h6 style={styles.categoryHeader}>{category}</h6>
                            <div style={styles.grid}>
                                {items.map(widget => (
                                    <ComponentCard 
                                        key={widget.id}
                                        templateId={widget.id}
                                        name={widget.name} 
                                        description={widget.description}
                                        isSelected={selectedItemId === widget.id}
                                        onClick={() => handleSelectItem(widget.id, 'widget')}
                                        categories={allCategories}
                                        currentCategory={widget.category}
                                        onCategoryChange={(newCat) => handleCategoryChange(widget.id, newCat)}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}

                    <h5 style={styles.groupHeader}>Entity Templates</h5>
                    <div style={styles.grid}>
                        {templates.map(template => (
                            <ComponentCard 
                                key={template.id}
                                templateId={template.id}
                                name={template.name} 
                                description={template.description}
                                isSelected={selectedItemId === template.id}
                                onClick={() => handleSelectItem(template.id, 'template')}
                            />
                        ))}
                    </div>
                </>
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
    searchContainer: {
        marginBottom: '1rem',
    },
    searchInput: {
        width: '100%',
        padding: '0.5rem',
        backgroundColor: '#2a2a2a',
        border: '1px solid #555',
        borderRadius: '4px',
        color: '#eee',
        boxSizing: 'border-box'
    },
    errorText: {
        color: '#ff8080',
    },
    groupHeader: {
        color: '#ccc',
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        marginTop: '1.5rem',
        marginBottom: '1rem',
    },
    categoryHeader: {
        color: '#aaa',
        fontSize: '0.7rem',
        fontWeight: 'normal',
        textTransform: 'uppercase',
        marginBottom: '0.5rem',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
    }
};

export default LibraryPanel;