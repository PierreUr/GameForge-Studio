import React from 'react';
import { GridConfig } from '../rendering/Renderer';
import NumberInput from './inputs/NumberInput';
import ColorPicker from './inputs/ColorPicker';
import BooleanCheckbox from './inputs/BooleanCheckbox';

interface SettingsPanelProps {
    isOpen: boolean;
    onClose: () => void;
    config: GridConfig;
    onConfigChange: (newConfig: Partial<GridConfig>) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose, config, onConfigChange }) => {
    if (!isOpen) return null;

    const handleValueChange = (key: keyof GridConfig, value: any) => {
        onConfigChange({ [key]: value });
    };

    const numberToHex = (num: number) => '#' + ('000000' + num.toString(16)).slice(-6);
    const hexToNumber = (hex: string) => parseInt(hex.replace('#', ''), 16);

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h3 style={styles.header}>Settings</h3>
                <div style={styles.content}>
                    <div style={styles.settingGroup}>
                        <h4 style={styles.groupHeader}>Canvas Grid</h4>
                        <div style={styles.settingItem}>
                            <BooleanCheckbox 
                                label="Show Grid" 
                                value={config.isVisible} 
                                onChange={(val) => handleValueChange('isVisible', val)} 
                            />
                        </div>
                        <div style={styles.settingItem}>
                            <NumberInput 
                                label="Tile Size" 
                                value={config.size} 
                                onChange={(val) => handleValueChange('size', val)} 
                            />
                        </div>
                         <div style={styles.settingItem}>
                            <ColorPicker 
                                label="Color 1" 
                                value={numberToHex(config.color1)}
                                onChange={(val) => handleValueChange('color1', hexToNumber(val))} 
                            />
                        </div>
                         <div style={styles.settingItem}>
                            <ColorPicker 
                                label="Color 2" 
                                value={numberToHex(config.color2)}
                                onChange={(val) => handleValueChange('color2', hexToNumber(val))} 
                            />
                        </div>
                    </div>
                </div>
                <div style={styles.footer}>
                    <button onClick={onClose} style={styles.button}>Close</button>
                </div>
            </div>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modal: {
        backgroundColor: '#2a2a2a',
        padding: '2rem',
        borderRadius: '8px',
        border: '1px solid #444',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    },
    header: {
        marginTop: 0,
        borderBottom: '1px solid #444',
        paddingBottom: '1rem',
        color: '#eee',
    },
    content: {
        flex: 1,
        overflowY: 'auto',
        padding: '1rem 0',
    },
    settingGroup: {
        marginBottom: '1.5rem',
    },
    groupHeader: {
        margin: '0 0 1rem 0',
        color: '#ccc',
        fontSize: '1rem',
    },
    settingItem: {
        marginBottom: '1rem',
        padding: '0.5rem',
        backgroundColor: '#333',
        borderRadius: '4px',
    },
    footer: {
        marginTop: '1.5rem',
        display: 'flex',
        justifyContent: 'flex-end',
        flexShrink: 0,
    },
    button: {
        backgroundColor: '#555',
        color: '#eee',
        border: '1px solid #666',
        padding: '0.5rem 1rem',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'background-color 0.2s',
    },
};

export default SettingsPanel;