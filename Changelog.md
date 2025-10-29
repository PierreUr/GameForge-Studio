# Changelog - GameForge Studio

## [1.24.0]
- **[TASK-174]** [FEAT] Implemented Phase 2 of the UI Builder. Widgets dropped on the canvas can now be selected. The Inspector panel (right sidebar) dynamically displays editable properties for the selected widget. Implemented zoom (CTRL+Mousewheel) and pan (Middle Mouse Button) functionality in the UI Editor.

## [1.23.0]
- **[TASK-173]** [FEAT] Implemented the foundational layout system for the UI Builder. The `UIEditorPanel` was completely refactored to support a hierarchical structure of 'Sections' and 'Columns', replacing the previous absolute positioning system. Users can now drag 'Sections' onto the canvas and drop widgets into the resulting columns.

## [1.22.0]
- **[TASK-172]** [REFACTOR] Refactored the monolithic `SelfOrganisationPanel` into two atomic, reusable widgets: `TaskListWidget` and `CreateTaskFormWidget`. Created a new `ui-widget-manifest.json` to register these components for the upcoming UI builder.

## [1.21.0]
- **[TASK-172]** [REFACTOR] Refactored the monolithic `SelfOrganisationPanel` into two atomic, reusable widgets: `TaskListWidget` and `CreateTaskFormWidget`. Created a new `ui-widget-manifest.json` to register these components for the upcoming UI builder.

## [1.20.0]
- **[TASK-019]** [FEAT] Implemented the initial user interface for Task Management in the Admin Dashboard. Users can now create, view, and delete tasks through a new "Tasks" tab.

## [1.19.0]
- **[TASK-018]** [FEAT] Implemented the simulated CRUD API for the extended Task schema. A new `TasksService` handles the creation and updating of tasks, including their new properties like priority, assignees, and tags, within the in-memory database.

## [1.18.0]
- **[TASK-017]** [SCHEMA] Extended the database schema for tasks. This includes new interfaces for `Task` and `Tag`, and updates to the in-memory database simulation to support hierarchy, dependencies, assignees, and other advanced fields. Documented the target TypeORM schema.

## [1.17.0]
- **[TASK-016]** [FEAT] Implemented a simulated API endpoint to retrieve module-specific configurations. A new method allows fetching the configuration for a module by its name, protected by authentication.

## [1.16.0]
- **[TASK-015]** [FEAT] Implemented the Module Management panel in the Admin Dashboard. SUPER_ADMIN users can now create, view, toggle activation, and delete system modules. The UI is integrated as a new tab and is protected by role-based access control.
- **[TASK-014]** [FEAT] Implemented the simulated Module Registry API. This includes a new `ModulesService` for CRUD operations on system modules and a corresponding client-side wrapper. A `SUPER_ADMIN` role and user were added to the simulation to support future protected routes.
- **[TASK-013]** [SCHEMA] Defined the database schema for system modules. In the current simulation phase, this includes a `Module` type definition and an in-memory data store. The official TypeORM entity was documented for future backend integration.
- **[TASK-012]** [FEAT] Implemented a new Admin Dashboard for user and role management. The new view is protected and only accessible to users with the 'ADMIN' role via a dedicated tab in the left sidebar. It includes panels for viewing users, creating roles, and running system tests.
- **[FIX]** Resolved a layout crash where the main content panel would not render. The `ResizablePanels` component now correctly handles conditional child views.

## [1.15.0]
- **[TASK-011]** [FEAT] Implemented the client-side authentication logic. The application now requires users to log in. A new `AuthContext` manages the global user state, a `LoginPage` component handles user input, and the session is persisted in `localStorage`. A logout button was added to the main toolbar.

## [1.14.0]
- **[TASK-010]** [DOCS] Implemented and documented the API authorization guards. The `DOC_SETUP_BACKEND_AUTH_ROLES.md` guide was updated to include full code examples for the `JwtAuthGuard`, a custom `Roles` decorator, and the `RolesGuard`, providing a complete, real-world implementation guide.

## [1.13.0]
- **[TASK-009]** [FEAT] Implemented the simulated Roles Management API. This includes a `RolesService` for CRUD operations on roles and a `UsersService` for assigning roles to users. These services use in-memory data structures, continuing the simulation-first approach established in the authentication setup.

## [1.12.0]
- **[TASK-008]** [FEAT] Implemented the simulated Registration & Login API endpoints. This includes the foundational `AuthService` and `UsersService` using in-memory data structures instead of a database, adhering to the project's simulation-first approach.

## [1.11.0]
- **[FEAT]** Implemented a device-specific layout saving system. The project file now stores separate scene layouts for Desktop, Tablet, and Mobile views. Selecting a device preset in the settings now automatically loads the corresponding layout.
- **[FEAT]** Added a visual feedback label to the top-left corner of the canvas that displays the current device preview settings (e.g., "Landscape (1920x1080)") when a frame is active.
- **[CHORE]** Refactored the changelog process. Changelogs are now archived with developer comments upon task completion.

## [1.10.0]
- **[FEAT]** Implemented a device preview frame in the canvas. Users can now select device presets (Desktop, Tablet, Mobile) and orientation from the Settings panel to visualize different screen sizes.

## [1.9.0]
- **[TASK-089]** [FEAT] Implemented the "Live Preview" functionality. Clicking the button now opens a new tab containing a standalone version of the current project, ready for a future game runner.
- **[TASK-102]** [CHORE] Marked the grid overlay feature as complete in the project's ToDo list, as it was already implemented and functional.

## [1.8.0]
- **[TASK-169]** [FEAT] Added a new "Admin Panel" accessible from the toolbar. This panel allows developers to manually trigger the full suite of system self-tests and view the results, replacing the automatic execution on startup.
- **[TASK-170]** [FIX] Resolved a critical CSS layout bug that caused the central panel (containing the Canvas or Logic Graph) to collapse and become invisible.

## [1.7.0]
- **[TASK-167]** [FIX] Repositioned the UI debug info icons to the top-right corner of components to prevent them from being hidden in tall or scrollable panels.
- **[TASK-168]** [FEAT] Added a global "Toggle Debug IDs" button to the main toolbar, allowing developers to show or hide all debug icons at once.

## [1.6.0]
- **[TASK-165]** Refactored the main application layout. The Logic Graph editor now opens in the central workspace area instead of the left sidebar, providing significantly more space for editing complex graphs.
- **[TASK-166]** [FIX] Added the missing debug info icon to the Logic Graph editor's canvas to ensure UI consistency.

## [1.5.0]
- **[TASK-162]** Majorly refactored the Library panel. It now displays draggable, predefined entity templates (e.g., "Player", "Enemy") from a new `template-manifest.json` instead of individual components. This fixes the drag-and-drop workflow and improves usability.
- **[FEAT]** The currently selected template in the Library is now visually highlighted.

## [1.4.0]
- **[TASK-161]** Implemented an interactive Node Library for the Logic Graph Editor. Users can now drag-and-drop nodes from a side panel onto the editor canvas to build logic flows.
- **[FIX]** Added a missing