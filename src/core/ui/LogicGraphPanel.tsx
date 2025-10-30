import React, { useState, useRef, useCallback } from 'react';
import { Graph } from '../graph/Graph';
import { NodeBase } from '../graph/NodeBase';
import Node from './graph/Node';
import { createNode } from '../graph/nodeFactory';
import DebugIdTooltip from './dev/DebugIdTooltip';

const LogicGraphPanel: React.FC = () => {
    // The graph instance is stable, we just need to trigger re-renders when it's mutated.
    const [graph] = useState(() => new Graph());
    const [nodeCount, setNodeCount] = useState(0); // State to trigger re-renders
    const svgRef = useRef<SVGSVGElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const nodeType = e.dataTransfer.getData('text/plain');
        if (!nodeType || !svgRef.current) return;

        // Convert mouse coordinates to SVG coordinates
        const svgPoint = svgRef.current.createSVGPoint();
        svgPoint.x = e.clientX;
        svgPoint.y = e.clientY;
        const transformedPoint = svgPoint.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
        
        const newNode = createNode(nodeType, transformedPoint.x, transformedPoint.y);
        if (newNode) {
            graph.addNode(newNode);
            setNodeCount(graph.nodes.size); // Force re-render
        }
    }, [graph]);


    const nodes: NodeBase[] = Array.from(graph.nodes.values());

    return (
        <DebugIdTooltip debugId="logic-graph-canvas">
            <div 
                style={styles.graphEditor}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            >
                <svg ref={svgRef} width="100%" height="100%" style={styles.svgCanvas}>
                    {/* Render connections here in the future */}
                    {nodes.map((node: NodeBase) => (
                        <Node key={node.id} node={node} />
                    ))}
                </svg>
            </div>
        </DebugIdTooltip>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    graphEditor: {
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#1c1c1c',
        color: '#ccc',
        position: 'relative', 
    },
    svgCanvas: {
        backgroundColor: '#252526',
        cursor: 'default',
        width: '100%',
        height: '100%',
    }
};

export default LogicGraphPanel;