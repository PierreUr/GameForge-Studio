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
import { SectionData, ColumnData, WidgetData } from './UIEditorPanel';
import SectionInspector from './SectionInspector';
import ColumnInspector from './ColumnInspector';

interface RightSidebarProps {
    world: World | null;
    frameConfig: FrameConfig;
    onFrameConfigChange: (newConfig: Partial<FrameConfig>) => void;
    isInspectorHelpVisible: boolean;
    onToggleInspectorHelp: () => void;
}

interface SelectedElement {
    type: 'entity' | 'template' | 'node' | 'widget' | 'section' | 'column';
    data: any;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ 
    world, 
    frameConfig, 
    onFrameConfigChange, 
    isInspectorHelpVisible,
    onToggleInspectorHelp,
}) => {
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);
    const [templates, setTemplates] = useState<any[]>([]);
    const [nodes, setNodes] = useState<any[]>([]);

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
            setSelectedElement({ type: 'entity', data: { id: entityId, components }});
        }
    }, [world]);

    useEffect(() => {
        const eventBus = EventBus.getInstance();

        const handleEntitySelection = (payload: { entityId: number }) => {
            if (payload && typeof payload.entityId === 'number') {
                updateComponents(payload.entityId);
            }
        };
        
        const handleCommandExecuted = () => {
            if (selectedElement?.type === 'entity') {
                updateComponents(selectedElement.data.id);
            }
        };

        const handlePreviewTemplate = (payload: { templateId: string }) => {
            const item = templates.find(t => t.id === payload.templateId);
            if (item) setSelectedElement({ type: 'template', data: item });
        };

        const handlePreviewNode = (payload: { nodeType: string }) => {
            const item = nodes.find(n => n.type === payload.nodeType);
            if (item) setSelectedElement({ type: 'node', data: item });
        };
        
        const handleUiElementSelected = (payload: { type: 'widget' | 'section' | 'column', data: any }) => {
            setSelectedElement({ type: payload.type, data: payload.data });
        };
        
        const handleDeselection = () => {
            setSelectedElement(null);
        };
        
        // This handles updates from property changes
        const handleUiPropUpdate = (payload: { widgetId?: string, sectionId?: string, columnId?: string, propName: string, value: any }) => {
            setSelectedElement(prev => {
                if (!prev) return null;

                let idMatch = false;
                switch (prev.type) {
                    case 'widget': idMatch = prev.data.widgetData.id === payload.widgetId; break;
                    case 'section': idMatch = prev.data.id === payload.sectionId; break;
                    case 'column': idMatch = prev.data.id === payload.columnId; break;
                }
                
                if (idMatch) {
                    let newData = { ...prev.data };
                    // Special handling for nested data like styles or props
                    if (payload.propName === 'styles') {
                        newData.styles = payload.value;
                    } else if (prev.type === 'widget') {
                         newData.widgetData = { ...newData.widgetData, [payload.propName]: payload.value };
                    } else {
                        newData = { ...newData, [payload.propName]: payload.value };
                    }
                    return { ...prev, data: newData };
                }
                return prev;
            });
        };

        eventBus.subscribe('entity:selected', handleEntitySelection);
        eventBus.subscribe('command:executed', handleCommandExecuted);
        eventBus.subscribe('preview:template', handlePreviewTemplate);
        eventBus.subscribe('preview:node', handlePreviewNode);
        eventBus.subscribe('ui-element:selected', handleUiElementSelected);
        
        // Listen to multiple deselect events
        eventBus.subscribe('entity:deselected', handleDeselection);
        eventBus.subscribe('preview:clear', handleDeselection);
        eventBus.subscribe('ui-element:deselected', handleDeselection);
        
        // Listen to property updates to keep inspector in sync without full re-renders
        eventBus.subscribe('ui-widget:update-prop', handleUiPropUpdate);
        eventBus.subscribe('ui-section:update-prop', handleUiPropUpdate);
        eventBus.subscribe('ui-column:update-prop', handleUiPropUpdate);

        return () => {
            eventBus.unsubscribe('entity:selected', handleEntitySelection);
            eventBus.unsubscribe('command:executed', handleCommandExecuted);
            eventBus.unsubscribe('preview:template', handlePreviewTemplate);
            eventBus.unsubscribe('preview:node', handlePreviewNode);
            eventBus.unsubscribe('ui-element:selected', handleUiElementSelected);
            
            eventBus.unsubscribe('entity:deselected', handleDeselection);
            eventBus.unsubscribe('preview:clear', handleDeselection);
            eventBus.unsubscribe('ui-element:deselected', handleDeselection);
            
            eventBus.unsubscribe('ui-widget:update-prop', handleUiPropUpdate);
            eventBus.unsubscribe('ui-section:update-prop', handleUiPropUpdate);
            eventBus.unsubscribe('ui-column:update-prop', handleUiPropUpdate);
        };
    }, [world, updateComponents, templates, nodes]);

    const handleComponentUpdate = (componentName: string, propertyKey: string, value: any) => {
        if (world && selectedElement?.type === 'entity') {
            const entityId = selectedElement.data.id;
            const componentTuple = selectedElement.data.components.find(([name]: [string]) => name === componentName);
            if (componentTuple) {
                const oldValue = (componentTuple[1] as any)[propertyKey];
                if (oldValue === value) return;
                const command = new UpdateComponentCommand(world, entityId, componentName, propertyKey, oldValue, value);
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

    if (selectedElement) {
        switch(selectedElement.type) {
            case 'section':
                inspectorContent = <SectionInspector sectionData={selectedElement.data} isHelpVisible={isInspectorHelpVisible} />;
                break;
            case 'column':
                inspectorContent = <ColumnInspector columnData={selectedElement.data} isHelpVisible={isInspectorHelpVisible} />;
                break;
            case 'widget':
                 inspectorContent = (
                    <WidgetInspector 
                        widgetData={selectedElement.data.widgetData} 
                        widgetDefinition={selectedElement.data.widgetDefinition} 
                        isHelpVisible={isInspectorHelpVisible}
                        onSelectParentColumn={() => {
                            EventBus.getInstance().publish('ui-element:request-selection', { type: 'column', id: selectedElement.data.columnId });
                        }}
                    />
                );
                break;
            case 'entity':
                 inspectorContent = (
                    <div>
                        <h5 style={styles.entityHeader}>Entity: {selectedElement.data.id}</h5>
                        {selectedElement.data.components.map(([name, data]: [string, IComponent]) => (
                            <ComponentInspector key={name} componentName={name} componentData={data} onDataChange={handleComponentUpdate} />
                        ))}
                    </div>
                );
                break;
            case 'template':
            case 'node':
                inspectorContent = <PreviewInspector item={selectedElement.data} type={selectedElement.type} />;
                break;
            default:
                inspectorContent = <p>Select an item on the canvas or in a library to inspect its properties.</p>;
        }
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
        overflowY: 'auto',
        height: '100%'
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