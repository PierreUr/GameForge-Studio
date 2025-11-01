import React, { ReactNode } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
    title?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
    if (!isOpen) {
        return null;
    }

    const handleOverlayClick = () => {
        onClose();
    };

    const handleModalContentClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent closing when clicking inside the modal
    };

    return (
        <div style={styles.overlay} onClick={handleOverlayClick}>
            <div style={styles.modal} onClick={handleModalContentClick}>
                <div style={styles.header}>
                    <h3 style={styles.title}>{title || 'Modal Window'}</h3>
                    <button onClick={onClose} style={styles.closeButton} aria-label="Close modal">
                        &times;
                    </button>
                </div>
                <div style={styles.content}>
                    {children}
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
        padding: '0', // No padding on the main container
        borderRadius: '8px',
        border: '1px solid #444',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 1.5rem',
        borderBottom: '1px solid #444',
    },
    title: {
        margin: 0,
        color: '#eee',
        fontSize: '1.25rem',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        color: '#aaa',
        cursor: 'pointer',
        fontSize: '1.75rem',
        lineHeight: 1,
        padding: '0 0.5rem',
    },
    content: {
        padding: '1.5rem',
        overflowY: 'auto',
        color: '#ccc',
    }
};

export default Modal;
