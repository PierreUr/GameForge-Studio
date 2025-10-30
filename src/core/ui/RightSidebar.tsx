import React, { useState, useEffect, useCallback } from 'react';
import TabSystem, { Tab } from './TabSystem';
import { EventBus } from '../ecs/EventBus';
import { World } from '../ecs/World';
import { IComponent } from '../ecs/Component';
import ComponentInspector from './ComponentInspector';
import { CommandManager } from '../commands/CommandManager';
import { UpdateComponentCommand } from '../commands/UpdateComponentCommand';
import PreviewInspector from './PreviewInspector';
import { FrameConfig } from '../rendering/Renderer';
import BooleanCheckbox from './inputs/BooleanCheckbox';
import NumberInput from './inputs/NumberInput';
import WidgetInspector from './WidgetInspector';
import { SectionData, ColumnData } from './UIEditorPanel';
import SectionInspector from './SectionInspector';
import ColumnInspector from './ColumnInspector';

interface RightSidebarProps {
    world: World | null;
    frameConfig: FrameConfig;
    onFrameConfigChange: (newConfig: Partial<FrameConfig>) => void;
    uiLayout: SectionData[];
    selectedWidgetId: string | null;
    selectedSectionId: string | null;
    onSectionPropertyChange: (sectionId: string, propName: string, value: any) => void;
    selectedColumnId: string | null;
    onColumnPropertyChange: (columnId: string, propName: string, value: any) => void;
    onColumnSelect: (columnId: string | null) => void;
    isInspectorHelpVisible: boolean;
    onToggleInspectorHelp: () => void;
}

interface SelectedWidgetInfo {
    widgetId: string;
    widgetDefinition: any;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
    world, 
    frameConfig, 
    onFrameConfigChange, 
    uiLayout, 
    selectedWidgetId, 
    selectedSectionId, 
    onSectionPropertyChange,
    selectedColumnId,
    onColumnPropertyChange,
    onColumnSelect,
    isInspectorHelpVisible,
    onToggleInspectorHelp
}) => {
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [entityComponents, setEntityComponents] = useState<[string, IComponent][]>([]);
    const [previewData, setPreviewData] = useState<{ type: 'template' | 'node', data: any } | null>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [nodes, setNodes] = useState<any[]>([]);
    const [selectedWidgetInfo, setSelectedWidgetInfo] = useState<SelectedWidgetInfo | null>(null);

    useEffect(() => {
        const fetchManifests = async () => {
            try {
                const [templateRes, nodeRes] = await Promise.all([
                    fetch('./src/core/assets/template-manifest.json'),
                    fetch('./src/core/graph/node-manifest.json')
                ]);
                const templateData = await templateRes.json();
                const nodeData = await nodeRes.json();
                setTemplates(templateData.templates);
                setNodes(nodeData.nodes);
            } catch (error) {
                console.error("Failed to fetch manifests for inspector preview:", error);
            }
        };
        fetchManifests();
    }, []);

    const updateComponents = useCallback((entityId: number) => {
        if (world) {
            const components = world.getComponentsForEntity(entityId);
            setEntityComponents(components);
        }
    }, [world]);

    useEffect(() => {
        const eventBus = EventBus.getInstance();

        const handleEntitySelection = (payload: { entityId: number }) => {
            setSelectedWidgetInfo(null);
            setPreviewData(null);
            if (payload && typeof payload.entityId === 'number') {
                setSelectedEntityId(payload.entityId);
                updateComponents(payload.entityId);
            }
        };
        
        const handleEntityDeselection = () => {
            setSelectedEntityId(null);
            setEntityComponents([]);
        };

        const handleCommandExecuted = () => {
            if (selectedEntityId !== null) {
                updateComponents(selectedEntityId);
            }
        };

        const handlePreviewTemplate = (payload: { templateId: string }) => {
            const item = templates.find(t => t.id === payload.templateId);
            if (item) {
                setPreviewData({ type: 'template', data: item });
                setSelectedEntityId(null);
                setSelectedWidgetInfo(null);
            }
        };

        const handlePreviewNode = (payload: { nodeType: string }) => {
            const item = nodes.find(n => n.type === payload.nodeType);
            if (item) {
                setPreviewData({ type: 'node', data: item });
                setSelectedEntityId(null);
                setSelectedWidgetInfo(null);
            }
        };
        
        const handlePreviewClear = () => setPreviewData(null);

        const handleWidgetSelection = (payload: SelectedWidgetInfo) => {
            setSelectedEntityId(null);
            setPreviewData(null);
            setSelectedWidgetInfo(payload);
        };

        eventBus.subscribe('entity:selected', handleEntitySelection);
        eventBus.subscribe('entity:deselected', handleEntityDeselection);
        eventBus.subscribe('command:executed', handleCommandExecuted);
        eventBus.subscribe('preview:template', handlePreviewTemplate);
        eventBus.subscribe('preview:node', handlePreviewNode);
        eventBus.subscribe('preview:clear', handlePreviewClear);
        eventBus.subscribe('ui-widget:selected', handleWidgetSelection);

        return () => {
            eventBus.unsubscribe('entity:selected', handleEntitySelection);
            eventBus.unsubscribe('entity:deselected', handleEntityDeselection);
            eventBus.unsubscribe('command:executed', handleCommandExecuted);
            eventBus.unsubscribe('preview:template', handlePreviewTemplate);
            eventBus.unsubscribe('preview:node', handlePreviewNode);
            eventBus.unsubscribe('preview:clear', handlePreviewClear);
            eventBus.unsubscribe('ui-widget:selected', handleWidgetSelection);
        };
    }, [world, updateComponents, selectedEntityId, templates, nodes]);

    const handleComponentUpdate = (componentName: string, propertyKey: string, value: any) => {
        if (world && selectedEntityId !== null) {
            const componentTuple = entityComponents.find(([name]) => name === componentName);
            if (componentTuple) {
                const oldValue = (componentTuple[1] as any)[propertyKey];
                if (oldValue === value) return;
                const command = new UpdateComponentCommand(world, selectedEntityId, componentName, propertyKey, oldValue, value);
                CommandManager.getInstance().executeCommand(command);
            }
        }
    };
    
    const LayoutSettingsPanel = () => (
        <div style={styles.layoutSettingsContainer}>
            <h5 style={styles.entityHeader}>Layout Settings</h5>
             <div style={styles.settingItem}>
                <BooleanCheckbox label="Auto Height" value={frameConfig.autoHeight || false} onChange={(val) => onFrameConfigChange({ autoHeight: val })} />
            </div>
            <div style={styles.settingItem}>
                <NumberInput label="Height (px)" value={frameConfig.height} onChange={(val) => onFrameConfigChange({ height: val })} disabled={frameConfig.autoHeight} />
            </div>
        </div>
    );

    let inspectorContent;

    const findWidgetData = (layout: SectionData[], widgetId: string | null) => {
        if (!widgetId) return null;
        for (const section of layout) {
            for (const column of section.columns) {
                const widget = column.widgets.find(w => w.id === widgetId);
                if (widget) return { widget, columnId: column.id };
            }
        }
        return null;
    };

    const findColumnData = (layout: SectionData[], columnId: string | null): ColumnData | null => {
        if (!columnId) return null;
        for (const section of layout) {
            const column = section.columns.find(c => c.id === columnId);
            if (column) return column;
        }
        return null;
    };

    const widgetInfo = findWidgetData(uiLayout, selectedWidgetId);
    const currentSectionData = uiLayout.find(s => s.id === selectedSectionId);
    const currentColumnData = findColumnData(uiLayout, selectedColumnId);

    const handleSelectParentColumn = (columnId: string | null) => {
        onColumnSelect(columnId);
    };

    if (widgetInfo && selectedWidgetInfo) {
        inspectorContent = (
            <WidgetInspector 
                widgetData={widgetInfo.widget} 
                widgetDefinition={selectedWidgetInfo.widgetDefinition} 
                isHelpVisible={isInspectorHelpVisible}
                onSelectParentColumn={() => handleSelectParentColumn(widgetInfo.columnId)}
            />
        );
    } else if (currentSectionData) {
        inspectorContent = <SectionInspector sectionData={currentSectionData} onPropertyChange={onSectionPropertyChange} isHelpVisible={isInspectorHelpVisible} />;
    } else if (currentColumnData) {
        inspectorContent = <ColumnInspector columnData={currentColumnData} onPropertyChange={onColumnPropertyChange} isHelpVisible={isInspectorHelpVisible} />;
    } else if (selectedEntityId !== null) {
        inspectorContent = (
            <div>
                <h5 style={styles.entityHeader}>Entity: {selectedEntityId}</h5>
                 {entityComponents.map(([name, data]) => (
                    <ComponentInspector key={name} componentName={name} componentData={data} onDataChange={handleComponentUpdate} />
                 ))}
            </div>
        );
    } else if (previewData) {
        inspectorContent = <PreviewInspector item={previewData.data} type={previewData.type} />;
    } else {
        inspectorContent = <p>Select an item on the canvas or in a library to inspect its properties.</p>;
    }
    
    const tabs: Tab[] = [
        {
            id: 'inspector',
            label: (
                <div style={styles.inspectorTabHeader}>
                    <span>Inspector</span>
                    <button onClick={onToggleInspectorHelp} style={styles.helpToggle} title="Toggle help tooltips">
                        ⓘ
                    </button>
                </div>
            ),
            content: <div style={styles.panelContent}>
                {frameConfig.isVisible && <LayoutSettingsPanel />}
                {inspectorContent}
            </div>
        }
    ];
    
    return (
        <div style={styles.sidebarContainer}>
            <TabSystem tabs={tabs} />
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    sidebarContainer: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#252526',
    },
    panelContent: {
        padding: '1rem',
        fontSize: '0.9rem',
        color: '#ccc',
    },
    inspectorTabHeader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    helpToggle: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '1.2rem',
        lineHeight: 1,
        padding: '0 4px',
    },
    entityHeader: {
        margin: '0 0 1rem 0',
        color: '#eee',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        fontSize: '1rem'
    },
    layoutSettingsContainer: {
        marginBottom: '1.5rem'
    },
    settingItem: {
        marginBottom: '0.5rem',
        padding: '0.5rem',
        backgroundColor: '#333',
        borderRadius: '4px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    }
};

export default RightSidebar;