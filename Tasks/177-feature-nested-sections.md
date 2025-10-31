# Task: Verschachtelte Sektionen ermöglichen

**ID:** 177 (Feature)
**Ziel:** Ermöglichen, dass `Section`-Komponenten in die Spalten (`Column`) von anderen `Section`-Komponenten eingefügt werden können, um komplexe und verschachtelte Layouts zu erstellen.

## Anforderungen

1.  **Drag & Drop Logik:**
    *   **Anforderung:** Die Drag-and-Drop-Logik muss so erweitert werden, dass eine `Section` aus der Bibliothek nicht nur auf die leere Leinwand, sondern auch direkt in eine `Column`-Komponente gezogen werden kann.
2.  **Datenstruktur-Anpassung:**
    *   **Anforderung:** Die Datenstruktur, die das Layout repräsentiert, muss rekursive Strukturen unterstützen. Das `items`-Array (oder `widgets`-Array) in einer `ColumnData` muss in der Lage sein, sowohl `WidgetData` als auch `SectionData`-Objekte zu enthalten.
3.  **Rendering-Anpassung:**
    *   **Anforderung:** Die `Column.tsx`-Komponente muss in der Lage sein, ihre `items` zu durchlaufen und basierend auf dem Typ des Elements entweder eine Widget-Komponente oder eine vollständige `Section`-Komponente (rekursiv) zu rendern.
4.  **Funktionalität der inneren Sektion:**
    *   **Anforderung:** Eine verschachtelte Sektion muss sich genau wie eine Sektion der obersten Ebene verhalten. Sie muss eigene Spalten, Widgets und Eigenschaften haben und ebenfalls als Drop-Zone fungieren.

## Checkliste der atomaren Schritte

- [ ] **Schritt 1:** Anpassung der Daten-Interfaces (`ColumnData`), um eine Mischung aus Widgets und Sektionen zu ermöglichen.
- [ ] **Schritt 2:** Überarbeitung der `Column.tsx`-Komponente, um rekursiv entweder Widgets oder Sektionen zu rendern.
- [ ] **Schritt 3:** Erweiterung der Drop-Logik in `Column.tsx`, um das Hinzufügen von neuen Sektionen zu handhaben.
- [ ] **Schritt 4:** Anpassung der Suchfunktionen im `RightSidebar.tsx` (z.B. `findWidgetData`), um auch in verschachtelten Sektionen nach Elementen suchen zu können.