import React, { useState, useEffect, useCallback } from 'react';
import TabSystem from './TabSystem';
import { EventBus } from '../ecs/EventBus';
import { World } from '../ecs/World';
import { IComponent } from '../ecs/Component';
import ComponentInspector from './ComponentInspector';
import { CommandManager } from '../commands/CommandManager';
import { UpdateComponentCommand } from '../commands/UpdateComponentCommand';

interface RightSidebarProps {
    world: World | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ world }) => {
    const [selectedEntityId, setSelectedEntityId] = useState<number | null>(null);
    const [entityComponents, setEntityComponents] = useState<[string, IComponent][]>([]);

    const updateComponents = useCallback((entityId: number) => {
        if (world) {
            const components = world.getComponentsForEntity(entityId);
            setEntityComponents(components);
        }
    }, [world]);

    useEffect(() => {
        const eventBus = EventBus.getInstance();

        const handleEntitySelection = (payload: { entityId: number }) => {
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

        eventBus.subscribe('entity:selected', handleEntitySelection);
        eventBus.subscribe('entity:deselected', handleEntityDeselection);
        eventBus.subscribe('command:executed', handleCommandExecuted);

        // Cleanup function to unsubscribe when the component unmounts
        return () => {
            eventBus.unsubscribe('entity:selected', handleEntitySelection);
            eventBus.unsubscribe('entity:deselected', handleEntityDeselection);
            eventBus.unsubscribe('command:executed', handleCommandExecuted);
        };
    }, [world, updateComponents, selectedEntityId]);

    const handleComponentUpdate = (componentName: string, propertyKey: string, value: any) => {
        if (world && selectedEntityId !== null) {
            const componentTuple = entityComponents.find(([name]) => name === componentName);
            if (componentTuple) {
                const componentData = componentTuple[1];
                const oldValue = (componentData as any)[propertyKey];

                if (oldValue === value) {
                    return; // No change, do not create a command
                }

                const command = new UpdateComponentCommand(
                    world,
                    selectedEntityId,
                    componentName,
                    propertyKey,
                    oldValue,
                    value
                );
                CommandManager.getInstance().executeCommand(command);
            }
        }
    };

    const inspectorContent = (
        <div style={styles.panelContent}>
            {selectedEntityId !== null ? (
                <div>
                    <h5 style={styles.entityHeader}>Entity: {selectedEntityId}</h5>
                     {entityComponents.length > 0 ? (
                        entityComponents.map(([name, data]) => (
                            <ComponentInspector
                                key={name}
                                componentName={name}
                                componentData={data}
                                onDataChange={handleComponentUpdate}
                            />
                        ))
                    ) : (
                        <p>This entity has no components.</p>
                    )}
                </div>
            ) : (
                <p>No entity selected. Click on the canvas to select an entity.</p>
            )}
        </div>
    );
    
    const tabs = [
        {
            label: 'Inspector',
            content: inspectorContent
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
        height: '100%',
        overflowY: 'auto'
    },
    entityHeader: {
        margin: '0 0 1rem 0',
        color: '#eee',
        borderBottom: '1px solid #444',
        paddingBottom: '0.5rem',
        fontSize: '1rem'
    }
};

export default RightSidebar;