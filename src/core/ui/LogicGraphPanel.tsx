import React, { useState } from 'react';
import { Graph } from '../graph/Graph';
import { NodeBase } from '../graph/NodeBase';
import Node from './graph/Node';
import { OnCollisionEventNode } from '../graph/nodes/OnCollisionEventNode';
import { OnKeyPressEventNode } from '../graph/nodes/OnKeyPressEventNode';
import { ModifyHealthActionNode } from '../graph/nodes/ModifyHealthActionNode';
import { CreateEntityActionNode } from '../graph/nodes/CreateEntityActionNode';
import { DestroyEntityActionNode } from '../graph/nodes/DestroyEntityActionNode';
import { GetComponentValueNode } from '../graph/nodes/GetComponentValueNode';
import { SetComponentValueNode } from '../graph/nodes/SetComponentValueNode';
import { IfElseNode } from '../graph/nodes/IfElseNode';
import { AddNode } from '../graph/nodes/AddNode';

const LogicGraphPanel: React.FC = () => {
    const [graph] = useState(() => {
        const newGraph = new Graph();
        
        newGraph.addNode(new OnKeyPressEventNode(50, 50));
        newGraph.addNode(new CreateEntityActionNode(400, 50));
        newGraph.addNode(new OnCollisionEventNode(50, 200));
        newGraph.addNode(new ModifyHealthActionNode(400, 200));
        newGraph.addNode(new DestroyEntityActionNode(50, 350));
        newGraph.addNode(new GetComponentValueNode(400, 350));
        newGraph.addNode(new SetComponentValueNode(50, 500));
        newGraph.addNode(new IfElseNode(400, 500));
        newGraph.addNode(new AddNode(50, 650));
        
        return newGraph;
    });

    const nodes: NodeBase[] = Array.from(graph.nodes.values());

    return (
        <div style={styles.panelContainer}>
            <svg width="100%" height="100%" style={styles.svgCanvas}>
                {nodes.map((node: NodeBase) => (
                    <Node key={node.id} node={node} />
                ))}
            </svg>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    panelContainer: {
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#1c1c1c',
        color: '#ccc',
    },
    svgCanvas: {
        backgroundColor: '#252526',
        cursor: 'default',
    }
};

export default LogicGraphPanel;