# Changelog - GameForge Studio

## [1.27.0]
- **[TASK-177]** [FEAT] Implemented a responsive layout system. Users can now switch between Desktop, Tablet, and Mobile views in the UI Editor. Each view saves its own unique layout, allowing for device-specific designs.
- **[TASK-177]** [REFACTOR] Overhauled the project saving and loading mechanism to correctly handle and persist both the UI layout structure and the underlying ECS entity state for each responsive view.
- **[TASK-177]** [FIX] Fixed a bug that only allowed adding new sections to the top of the layout. New sections can now be correctly dropped between or after existing sections.
- **[TASK-177]** [FIX] Resolved an issue where a double scrollbar would appear in the Library Panel when categories were expanded.
- **[TASK-177]** [VERIFY] Verified that the widget deletion functionality via the Inspector and context menu is working as intended.
- **[TASK-177]** [FIX] Corrected a bug where Inspector settings for nested sections (sections within other sections) could not be changed. The property update logic is now fully recursive.
- **[TASK-177]** [FIX] Fixed a bug where properties for columns within nested sections could not be edited. The column property update logic is now recursive and the inspector has been updated with more styling options.
- **[TASK-177]** [FIX] Removed all default spacing (padding, margin, gaps) from Sections and Columns to provide a 'clean slate' layout experience, fixing issues with unwanted space between nested elements.
- **[TASK-177]** [FEAT] Implemented nested sections, allowing `Section` components to be placed inside the columns of other sections to create complex layouts.
- **[TASK-177]** [FEAT] The `WidgetInspector` now dynamically renders generic style groups (e.g., Spacing, Border, Background) based on definitions in the `ui-widget-manifest.json`, allowing for consistent styling options across all widgets.
- **[TASK-177]** [FIX] Fixed an issue where image widget borders and border-radius were not applied correctly. The widget wrapper now properly clips its content.
- **[TASK-177]** [FIX] Fixed a bug where the 'Add Widget' button was missing in empty columns, making it difficult to add the first widget.