// This component is deprecated and has been refactored into:
// - src/core/ui/widgets/CreateTaskFormWidget.tsx
// - src/core/ui/widgets/TaskListWidget.tsx
// This file can be safely deleted.

import React from 'react';

const DeprecatedSelfOrganisationPanel: React.FC = () => {
    return (
        <div style={{ padding: '1rem', color: '#ff8080' }}>
            <p><strong>This component is deprecated.</strong></p>
            <p>Its functionality has been moved to separate, reusable widgets.</p>
        </div>
    );
};

export default DeprecatedSelfOrganisationPanel;
