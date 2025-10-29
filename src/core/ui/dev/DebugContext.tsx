import React, { createContext, useState, useContext, ReactNode } from 'react';

interface DebugContextType {
    isDebugVisible: boolean;
    toggleDebugVisibility: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export const DebugProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isDebugVisible, setIsDebugVisible] = useState(false);

    const toggleDebugVisibility = () => {
        setIsDebugVisible(prev => !prev);
    };

    return (
        <DebugContext.Provider value={{ isDebugVisible, toggleDebugVisibility }}>
            {children}
        </DebugContext.Provider>
    );
};

export const useDebugContext = () => {
    const context = useContext(DebugContext);
    if (context === undefined) {
        throw new Error('useDebugContext must be used within a DebugProvider');
    }
    return context;
};