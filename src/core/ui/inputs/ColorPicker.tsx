import React, { useState, useEffect, useCallback } from 'react';
import InspectorHelpTooltip from '../InspectorHelpTooltip';

// Helper function to convert hex to an RGB object
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
};

// Helper function to parse various color strings
const parseColor = (color: string): { hex: string; alpha: number } => {
    if (!color || typeof color !== 'string') return { hex: '#000000', alpha: 1 };

    const trimmedColor = color.trim();

    // Handle transparent keyword
    if (trimmedColor.toLowerCase() === 'transparent') {
        return { hex: '#000000', alpha: 0 };
    }

    // Handle hex
    if (trimmedColor.startsWith('#')) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        const fullHex = trimmedColor.replace(shorthandRegex, (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);
        return { hex: fullHex, alpha: 1 };
    }

    // Handle rgba
    const rgbaMatch = trimmedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
    if (rgbaMatch) {
        const r = parseInt(rgbaMatch[1], 10).toString(16).padStart(2, '0');
        const g = parseInt(rgbaMatch[2], 10).toString(16).padStart(2, '0');
        const b = parseInt(rgbaMatch[3], 10).toString(16).padStart(2, '0');
        const alpha = rgbaMatch[4] !== undefined ? parseFloat(rgbaMatch[4]) : 1;
        return { hex: `#${r}${g}${b}`, alpha };
    }
    
    // Fallback for named colors or other invalid formats.
    return { hex: '#000000', alpha: 1 };
};


interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (newValue: string) => void;
    isHelpVisible?: boolean;
    helpText?: string;
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, isHelpVisible, helpText }) => {
    const [hexColor, setHexColor] = useState('#000000');
    const [alpha, setAlpha] = useState(1);

    // Update internal state if the parent's value changes
    useEffect(() => {
        const { hex, alpha } = parseColor(value);
        setHexColor(hex);
        setAlpha(alpha);
    }, [value]);

    const triggerOnChange = useCallback((hex: string, alphaValue: number) => {
        if (alphaValue >= 1) {
            onChange(hex);
        } else {
            const rgb = hexToRgb(hex);
            if (rgb) {
                // Round alpha to 2 decimal places for cleaner output
                const roundedAlpha = Math.round(alphaValue * 100) / 100;
                onChange(`rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${roundedAlpha})`);
            } else {
                onChange(hex); // Fallback if hex conversion fails
            }
        }
    }, [onChange]);
    
    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newHex = e.target.value;
        setHexColor(newHex);
        triggerOnChange(newHex, alpha);
    };

    const handleAlphaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAlpha = parseFloat(e.target.value);
        setAlpha(newAlpha);
        triggerOnChange(hexColor, newAlpha);
    };

    const finalHelpText = `${helpText || ''} Set the color and transparency.`.trim();
    
    const previewColorRgb = hexToRgb(hexColor);
    const previewColor = previewColorRgb ? `rgba(${previewColorRgb.r}, ${previewColorRgb.g}, ${previewColorRgb.b}, ${alpha})` : hexColor;

    return (
        <div style={styles.container}>
            <div style={styles.labelContainer}>
                <label style={styles.label}>{label}</label>
                {isHelpVisible && <InspectorHelpTooltip text={finalHelpText} />}
            </div>
            <div style={styles.inputWrapper}>
                <div style={styles.colorPreviewContainer}>
                    <div style={{ ...styles.colorPreview, backgroundColor: previewColor }} />
                </div>
                <input
                    type="color"
                    value={hexColor}
                    onChange={handleHexChange}
                    style={styles.colorInput}
                />
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={alpha}
                    onChange={handleAlphaChange}
                    style={styles.rangeInput}
                />
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
    },
    labelContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    label: {
        color: '#ccc',
        fontSize: '0.95rem',
        textTransform: 'capitalize',
    },
    inputWrapper: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '2px 4px',
        backgroundColor: '#2a2a2a',
    },
    colorPreviewContainer: {
        width: '18px',
        height: '18px',
        borderRadius: '2px',
        backgroundImage: `
            linear-gradient(45deg, #808080 25%, transparent 25%), 
            linear-gradient(-45deg, #808080 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, #808080 75%),
            linear-gradient(-45deg, transparent 75%, #808080 75%)`,
        backgroundSize: '8px 8px',
        backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
        position: 'relative',
        border: '1px solid #1e1e1e',
    },
     colorPreview: {
        width: '100%',
        height: '100%',
    },
    colorInput: {
        width: '24px',
        height: '24px',
        border: 'none',
        padding: 0,
        backgroundColor: 'transparent',
        cursor: 'pointer',
    },
    rangeInput: {
        width: '70px',
    }
};

export default ColorPicker;