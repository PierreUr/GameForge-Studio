import React from 'react';
import { FrameConfig } from '../rendering/Renderer';
import { devicePresets } from './SettingsPanel';

interface ViewportControlsProps {
    frameConfig: FrameConfig;
    onFrameConfigChange: (newConfig: Partial<FrameConfig>) => void;
}

const ViewportControls: React.FC<ViewportControlsProps> = ({ frameConfig, onFrameConfigChange }) => {
    
    const handleFrameValueChange = (key: keyof FrameConfig, value: any) => {
        onFrameConfigChange({ [key]: value });
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const presetName = e.target.value;
        const selectedPreset = devicePresets.find(p => p.name === presetName);

        if (selectedPreset) {
            onFrameConfigChange({
                isVisible: true,
                width: selectedPreset.width,
                height: selectedPreset.height,
            });
        } else {
             onFrameConfigChange({ isVisible: false });
        }
    };
    
    const handleOrientationToggle = () => {
        const newOrientation = frameConfig.orientation === 'landscape' ? 'portrait' : 'landscape';
        handleFrameValueChange('orientation', newOrientation);
    };

    const currentPreset = devicePresets.find(p => 
        (p.width === frameConfig.width && p.height === frameConfig.height) ||
        (p.height === frameConfig.width && p.width === frameConfig.height)
    );
    const selectedValue = frameConfig.isVisible && currentPreset ? currentPreset.name : "";

    return (
        <div style={styles.container}>
            <div style={styles.controlGroup}>
                <label htmlFor="preset-select" style={styles.label}>Device:</label>
                <select id="preset-select" onChange={handlePresetChange} value={selectedValue} style={styles.select}>
                    <option value="">None</option>
                    {devicePresets.map((preset) => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>
            </div>
            {frameConfig.isVisible && (
                 <div style={styles.controlGroup}>
                    <label style={styles.label}>Orientation:</label>
                    <button onClick={handleOrientationToggle} style={styles.toggleButton}>
                        {frameConfig.orientation}
                    </button>
                </div>
            )}
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        alignItems: 'center',
        padding: '0.5rem 1rem',
        backgroundColor: '#333',
        borderBottom: '1px solid #444',
        gap: '1.5rem',
        flexShrink: 0,
    },
    controlGroup: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    label: {
        color: '#ccc',
        fontSize: '0.85rem',
    },
    select: {
        backgroundColor: '#333',
        color: '#eee',
        border: '1px solid #555',
        borderRadius: '3px',
        padding: '0.2rem 0.4rem',
        fontSize: '0.8rem',
    },
    toggleButton: {
        backgroundColor: '#4a4a4a',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.2rem 0.8rem',
        borderRadius: '3px',
        cursor: 'pointer',
        textTransform: 'capitalize',
    }
};

export default ViewportControls;