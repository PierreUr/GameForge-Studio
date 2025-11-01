import React from 'react';

interface ImageWidgetProps {
    src?: string;
    alt?: string;
    objectFit?: React.CSSProperties['objectFit'];
    styles?: {
        spacing?: {
            padding?: string;
            margin?: string;
        };
        border?: {
            borderRadius?: number;
        };
        dimensions?: {
            width?: string;
            height?: string;
        };
    };
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ 
    src = "https://picsum.photos/200/300", 
    alt = "Placeholder image",
    objectFit = 'cover',
    styles
}) => {
    
    // The wrapper div in Column.tsx handles the sizing via the 'dimensions' style group.
    // This widget's internal container should fill that wrapper.
    const containerStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        display: 'flex',
    };
    
    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: objectFit,
        borderRadius: styles?.border?.borderRadius ? `${styles.border.borderRadius}px` : undefined,
    };

    return (
        <div style={containerStyle}>
            <img 
                src={src} 
                alt={alt} 
                style={imageStyle} 
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x300?text=Invalid+Image'; }}
            />
        </div>
    );
};

export default ImageWidget;