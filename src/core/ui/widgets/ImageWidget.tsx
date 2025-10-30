import React from 'react';

interface ImageWidgetProps {
    src?: string;
    alt?: string;
    objectFit?: React.CSSProperties['objectFit'];
    styles?: {
        spacing?: {
            padding?: string;
            margin?: string;
        }
    }
}

const ImageWidget: React.FC<ImageWidgetProps> = ({ 
    src = "https://picsum.photos/200/300", 
    alt = "Placeholder image",
    objectFit = 'cover',
    styles
}) => {
    
    const containerStyle: React.CSSProperties = {
        width: '100%',
        aspectRatio: '16 / 9', // Default aspect ratio
        overflow: 'hidden',
        ...styles?.spacing,
    };
    
    const imageStyle: React.CSSProperties = {
        width: '100%',
        height: '100%',
        objectFit: objectFit,
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
