/**
 * @interface IManifest
 * @description Defines the structure of the component manifest file.
 */
interface IManifest {
    components: {
        name: string;
        properties: {
            name: string;
            type: string;
        }[];
    }[];
}

/**
 * @class ComponentValidator
 * @description Validates component data structures against a schema defined in a manifest.
 * This ensures data integrity when loading projects or adding components.
 */
export class ComponentValidator {
    private schema: IManifest;
    private componentSchemas: Map<string, Map<string, string>> = new Map();

    /**
     * Initializes a new instance of the ComponentValidator.
     * @param {IManifest} manifest - The loaded component manifest JSON object.
     */
    constructor(manifest: IManifest) {
        this.schema = manifest;
        this.preprocessSchema();
    }

    /**
     * Pre-processes the manifest into a more efficient Map structure for quick lookups.
     * @private
     */
    private preprocessSchema(): void {
        try {
            for (const component of this.schema.components) {
                const propertiesMap = new Map<string, string>();
                for (const prop of component.properties) {
                    propertiesMap.set(prop.name, prop.type);
                }
                this.componentSchemas.set(component.name, propertiesMap);
            }
        } catch (error) {
            console.error('[ComponentValidator] Failed to preprocess component schema manifest:', error);
            throw new Error('Invalid manifest structure.');
        }
    }

    /**
     * Validates a data object against the schema for a given component name.
     * @param {string} componentName - The name of the component to validate against (e.g., "PositionComponent").
     * @param {any} data - The data object to validate.
     * @returns {boolean} True if the data is valid according to the schema, otherwise false.
     */
    public validate(componentName: string, data: any): boolean {
        const schema = this.componentSchemas.get(componentName);

        if (!schema) {
            return false;
        }

        if (typeof data !== 'object' || data === null) {
            return false;
        }

        // Check if all properties in the data object match the schema's types and exist in the schema.
        for (const propName in data) {
            // The 'isActive' property is on ComponentBase and not in the manifest, so we allow it.
            if (propName === 'isActive') continue;

            if (!schema.has(propName)) {
                return false;
            }
            const expectedType = schema.get(propName);
            const actualType = Array.isArray(data[propName]) ? 'array' : typeof data[propName];

            if (actualType !== expectedType) {
                return false;
            }
        }

        // Check if all required properties from the schema exist in the data object.
        for (const requiredProp of schema.keys()) {
            if (!(requiredProp in data)) {
                return false;
            }
        }

        return true;
    }
}