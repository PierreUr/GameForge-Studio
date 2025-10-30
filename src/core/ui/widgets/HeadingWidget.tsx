import React from 'react';

interface HeadingWidgetProps {
    text?: string;
    level?: number;
    styles?: {
        typography?: React.CSSProperties;
    };
}

const HeadingWidget: React.FC<HeadingWidgetProps> = ({ text = 'Default Heading', level = 1, styles }) => {
    const Tag = `h${level > 0 && level < 7 ? level : 1}`;

    const headingStyle: React.CSSProperties = {
        ...defaultStyles.heading,
        ...styles?.typography,
    };

    return (
        <div style={defaultStyles.container}>
            {React.createElement(Tag, { style: headingStyle }, text)}
        </div>
    );
};

const defaultStyles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '0', // Padding is now controlled by the wrapper
    },
    heading: {
        margin: 0,
        color: '#eee',
    }
};

export default HeadingWidget;