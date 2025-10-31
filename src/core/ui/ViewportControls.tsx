import React, { useState } from 'react';
import { FrameConfig } from '../rendering/Renderer';
import { devicePresets } from './SettingsPanel';

interface ViewportControlsProps {
    frameConfig: FrameConfig;
    onFrameConfigChange: (newConfig: Partial<FrameConfig>) => void;
    activeLayoutKey: string;
    onLayoutSwitch: (layoutKey: string) => void;
    onSave: () => void;
}

const presetToLayoutKey: Record<string, string> = {
    'Desktop': 'desktop',
    'Tablet': 'tablet',
    'Mobile': 'mobile',
};

const layoutKeyToPresetName: Record<string, string> = {
    'desktop': 'Desktop',
    'tablet': 'Tablet',
    'mobile': 'Mobile',
    'default': 'Desktop',
};


const ViewportControls: React.FC<ViewportControlsProps> = ({ frameConfig, onFrameConfigChange, activeLayoutKey, onLayoutSwitch, onSave }) => {
    const [favoriteLayout, setFavoriteLayout] = useState(() => localStorage.getItem('gameforge-favorite-layout'));
    
    const handleSetFavorite = () => {
        localStorage.setItem('gameforge-favorite-layout', activeLayoutKey);
        setFavoriteLayout(activeLayoutKey);
    };
    
    const isFavorite = activeLayoutKey === favoriteLayout;

    const handleFrameValueChange = (key: keyof FrameConfig, value: any) => {
        onFrameConfigChange({ [key]: value });
    };

    const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const presetName = e.target.value;
        const layoutKey = presetToLayoutKey[presetName] || 'desktop';
        onLayoutSwitch(layoutKey);

        const selectedPreset = devicePresets.find(p => p.name === presetName);
        if (selectedPreset) {
            onFrameConfigChange({
                isVisible: true,
                width: selectedPreset.width,
                height: selectedPreset.height,
                orientation: selectedPreset.width > selectedPreset.height ? 'landscape' : 'portrait'
            });
        } else {
             onFrameConfigChange({ isVisible: false });
        }
    };
    
    const handleOrientationToggle = () => {
        const newOrientation = frameConfig.orientation === 'landscape' ? 'portrait' : 'landscape';
        handleFrameValueChange('orientation', newOrientation);
    };

    const selectedValue = layoutKeyToPresetName[activeLayoutKey] || 'Desktop';

    return (
        <div style={styles.container}>
            <div style={styles.controlGroup}>
                <label htmlFor="preset-select" style={styles.label}>Device:</label>
                <select id="preset-select" onChange={handlePresetChange} value={selectedValue} style={styles.select}>
                    {devicePresets.map((preset) => (
                        <option key={preset.name} value={preset.name}>
                            {preset.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleSetFavorite} style={isFavorite ? {...styles.favButton, ...styles.favButtonActive} : styles.favButton} aria-label="Set as favorite device">
                    {isFavorite ? '★' : '☆'}
                </button>
            </div>
            {frameConfig.isVisible && (
                 <div style={styles.controlGroup}>
                    <label style={styles.label}>Orientation:</label>
                    <button onClick={handleOrientationToggle} style={styles.toggleButton}>
                        {frameConfig.orientation}
                    </button>
                </div>
            )}
            <div style={styles.divider}></div>
            <button onClick={onSave} style={styles.iconButton} aria-label="Save Project As...">
                💾
            </button>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        display: 'flex',
        alignItems: 'center',
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
    favButton: {
        background: 'none',
        border: 'none',
        color: '#999',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '0 8px',
        lineHeight: 1,
    },
    favButtonActive: {
        color: '#ffc107',
    },
    toggleButton: {
        backgroundColor: '#4a4a4a',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.2rem 0.8rem',
        borderRadius: '3px',
        cursor: 'pointer',
        textTransform: 'capitalize',
    },
    divider: {
        width: '1px',
        height: '24px',
        backgroundColor: '#444',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
    },
    iconButton: {
        backgroundColor: 'rgba(45, 45, 45, 0.75)',
        border: 'none',
        color: '#eee',
        cursor: 'pointer',
        borderRadius: '4px',
        fontSize: '1.2rem',
        width: '36px',
        height: '36px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        transition: 'background-color 0.2s'
    }
};

export default ViewportControls;