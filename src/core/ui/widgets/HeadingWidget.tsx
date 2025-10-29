import React from 'react';

interface HeadingWidgetProps {
    text?: string;
    level?: number;
}

const HeadingWidget: React.FC<HeadingWidgetProps> = ({ text = 'Default Heading', level = 1 }) => {
    // FIX: The original use of a capitalized string variable as a JSX component tag is not valid.
    // In JSX, capitalized tags are treated as components, but the variable held a string.
    // This is corrected by using React.createElement to dynamically construct the element.
    // This also resolves the "Cannot find namespace 'JSX'" error by removing the problematic type cast.
    const Tag = `h${level > 0 && level < 7 ? level : 1}`;

    return (
        <div style={styles.container}>
            {React.createElement(Tag, { style: styles.heading }, text)}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        padding: '1rem',
    },
    heading: {
        margin: 0,
        color: '#eee',
    }
};

export default HeadingWidget;