import React, { useState, useEffect, useMemo } from 'react';
import ComponentCard from './ComponentCard';
import { EventBus } from '../ecs/EventBus';

interface LibraryPanelProps {}

interface ManifestItem {
    id: string;
    name: string;
    description: string;
    category: string;
    type: 'widget' | 'template';
}

const LibraryPanel: React.FC<LibraryPanelProps> = () => {
    const [libraryItems, setLibraryItems] = useState<ManifestItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const fetchManifests = async () => {
            try {
                setIsLoading(true);
                const [templateRes, widgetRes] = await Promise.all([
                    fetch('./src/core/assets/template-manifest.json'),
                    fetch('./src/core/assets/ui-widget-manifest.json')
                ]);
                if (!templateRes.ok || !widgetRes.ok) {
                    throw new Error(`Failed to fetch manifests`);
                }
                const templateData = await templateRes.json();
                const widgetData = await widgetRes.json();

                const processedTemplates: ManifestItem[] = templateData.templates.map((t: any) => ({
                    ...t,
                    category: t.category || 'Entity Templates',
                    type: 'template' as 'template',
                }));

                const processedWidgets: ManifestItem[] = widgetData.widgets.map((w: any) => ({
                    ...w,
                    type: 'widget' as 'widget',
                }));

                setLibraryItems([...processedWidgets, ...processedTemplates]);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchManifests();
    }, []);

    useEffect(() => {
        const handleDeselect = () => {
            if (selectedItemId) {
                setSelectedItemId(null);
                EventBus.getInstance().publish('preview:clear');
            }
        };

        EventBus.getInstance().subscribe('entity:selected', handleDeselect);
        EventBus.getInstance().subscribe('ui-widget:selected', handleDeselect);

        return () => {
            EventBus.getInstance().unsubscribe('entity:selected', handleDeselect);
            EventBus.getInstance().unsubscribe('ui-widget:selected', handleDeselect);
        };
    }, [selectedItemId]);
    
    const handleSelectItem = (item: ManifestItem) => {
        setSelectedItemId(prevId => {
            const newSelectedId = prevId === item.id ? null : item.id;
            
            if (newSelectedId) {
                if (item.type === 'template') {
                    EventBus.getInstance().publish('preview:template', { templateId: newSelectedId });
                } else {
                    EventBus.getInstance().publish('preview:clear');
                }
            } else {
                EventBus.getInstance().publish('preview:clear');
            }

            return newSelectedId;
        });
    };

    const handleCategoryChange = (widgetId: string, newCategory: string) => {
        setLibraryItems(prevItems => prevItems.map(item => 
            item.id === widgetId ? { ...item, category: newCategory } : item
        ));
    };

    const toggleCategory = (category: string) => {
        setExpandedCategories(prev => ({
            ...prev,
            [category]: !prev[category]
        }));
    };

    const filteredItems = useMemo(() => {
        if (!searchTerm) return libraryItems;
        return libraryItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            item.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [libraryItems, searchTerm]);

    const groupedItems = useMemo(() => {
        return filteredItems.reduce((acc, item) => {
            const category = item.category || 'Uncategorized';
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(item);
            return acc;
        }, {} as Record<string, ManifestItem[]>);
    }, [filteredItems]);

    const allCategories = useMemo(() => [...new Set(libraryItems.filter(item => item.type === 'widget').map(w => w.category || 'Uncategorized'))], [libraryItems]);

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
            
            {!isLoading && !error && Object.entries(groupedItems).sort(([a], [b]) => {
                const order = ['Layout', 'Entity Templates'];
                const aIndex = order.indexOf(a);
                const bIndex = order.indexOf(b);
                if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
                if (aIndex !== -1) return -1;
                if (bIndex !== -1) return 1;
                return a.localeCompare(b);
            }).map(([category, items]) => {
                const isExpanded = !!expandedCategories[category];
                return (
                    <div key={category}>
                        <h5 style={styles.groupHeader} onClick={() => toggleCategory(category)}>
                             <span style={{ ...styles.arrow, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}>►</span>
                            {category}
                        </h5>
                        {isExpanded && (
                            <div style={styles.grid}>
                                {/* FIX: Cast `items` to ManifestItem[] to resolve type inference issue where it was being treated as `unknown`. */}
                                {(items as ManifestItem[]).map(item => (
                                    <ComponentCard 
                                        key={item.id}
                                        templateId={item.id}
                                        name={item.name} 
                                        description={item.description}
                                        isSelected={selectedItemId === item.id}
                                        onClick={() => handleSelectItem(item)}
                                        categories={item.type === 'widget' ? allCategories : undefined}
                                        currentCategory={item.type === 'widget' ? item.category : undefined}
                                        onCategoryChange={item.type === 'widget' ? (newCat) => handleCategoryChange(item.id, newCat) : undefined}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
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
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
    },
    arrow: {
        display: 'inline-block',
        marginRight: '0.5rem',
        transition: 'transform 0.2s',
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
        gap: '1rem',
    }
};

export default LibraryPanel;