import React from 'react';
import { NodeBase } from '../../graph/NodeBase';
import { INodeInput, INodeOutput } from '../../graph/types';

interface NodeProps {
    node: NodeBase;
}

const PORT_RADIUS = 8;
const PORT_MARGIN_Y = 20;
const HEADER_HEIGHT = 30;

const Node: React.FC<NodeProps> = ({ node }) => {
    // FIX: Explicitly cast array from map iterator to resolve potential 'unknown[]' type inference issue.
    const inputsArray: INodeInput[] = Array.from(node.inputs.values()) as INodeInput[];
    const outputsArray: INodeOutput[] = Array.from(node.outputs.values()) as INodeOutput[];

    const nodeHeight = HEADER_HEIGHT + Math.max(inputsArray.length, outputsArray.length) * (PORT_RADIUS * 2 + PORT_MARGIN_Y);
    const nodeWidth = 200;

    return (
        <g transform={`translate(${node.x}, ${node.y})`}>
            {/* Node Body */}
            <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={8}
                ry={8}
                fill="#3a3a3a"
                stroke="#555"
                strokeWidth="2"
            />
            {/* Header */}
            <rect
                width={nodeWidth}
                height={HEADER_HEIGHT}
                rx={8}
                ry={8}
                fill="#4a4a4a"
                style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }}
            />
            <text
                x={nodeWidth / 2}
                y={HEADER_HEIGHT / 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#eee"
                style={{ fontSize: '0.9rem', fontWeight: 'bold' }}
            >
                {node.constructor.name.replace('Node', '')}
            </text>

            {/* Input Ports */}
            {inputsArray.map((input, index) => (
                <g key={input.id} transform={`translate(0, ${HEADER_HEIGHT + PORT_MARGIN_Y + index * (PORT_RADIUS * 2 + PORT_MARGIN_Y)})`}>
                    <circle
                        cx={0}
                        cy={0}
                        r={PORT_RADIUS}
                        fill="#007acc"
                        stroke="#eee"
                        strokeWidth="2"
                    />
                    <text x={PORT_RADIUS + 10} y={0} dominantBaseline="middle" fill="#ccc">{input.name}</text>
                </g>
            ))}

            {/* Output Ports */}
            {outputsArray.map((output, index) => (
                <g key={output.id} transform={`translate(${nodeWidth}, ${HEADER_HEIGHT + PORT_MARGIN_Y + index * (PORT_RADIUS * 2 + PORT_MARGIN_Y)})`}>
                     <circle
                        cx={0}
                        cy={0}
                        r={PORT_RADIUS}
                        fill="#4CAF50"
                        stroke="#eee"
                        strokeWidth="2"
                    />
                    <text x={-(PORT_RADIUS + 10)} y={0} textAnchor="end" dominantBaseline="middle" fill="#ccc">{output.name}</text>
                </g>
            ))}
        </g>
    );
};

export default Node;