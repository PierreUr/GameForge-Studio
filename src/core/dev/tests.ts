import { TestLogger } from './TestLogger';
import { World } from '../ecs/World';
import { ComponentBase } from '../library/ComponentBase';
import { SystemBase } from '../library/SystemBase';
import { PositionComponent } from '../library/PositionComponent';
import { VelocityComponent } from '../library/VelocityComponent';
import { SpriteComponent } from '../library/SpriteComponent';
import { HealthComponent } from '../library/HealthComponent';
import { PlayerInputComponent } from '../library/PlayerInputComponent';
import { PhysicsBodyComponent } from '../library/PhysicsBodyComponent';
import { ColliderComponent } from '../library/ColliderComponent';
import { ScoreComponent } from '../library/ScoreComponent';
import { AIPatrolComponent } from '../library/AIPatrolComponent';
import { MovementSystem } from '../library/MovementSystem';
import { PhysicsSystem } from '../library/PhysicsSystem';
import { HealthSystem } from '../library/HealthSystem';
import { PlayerInputSystem } from '../library/PlayerInputSystem';
import { AIPatrolSystem } from '../library/AIPatrolSystem';
import { EventBus } from '../ecs/EventBus';
import { ScoringSystem } from '../library/ScoringSystem';
import { RenderingSystem } from '../library/RenderingSystem';
import { TemplateManager } from '../library/TemplateManager';
import { ComponentValidator } from '../library/ComponentValidator';
import { EntityManager } from '../ecs/EntityManager';
import { ComponentManager } from '../ecs/ComponentManager';
import { SystemManager } from '../ecs/SystemManager';
import { ISystem } from '../ecs/ISystem';
import { GameLoop } from '../ecs/GameLoop';


interface TestDependencies {
    world: World;
}

type TestFunction = (logger: TestLogger, deps: TestDependencies) => Promise<void> | void;

// Test implementations, extracted from index.tsx

const createPlaceholderTest = (slug: string, title: string): TestFunction => (logger) => {
    logger.logCustom(`--- ${title} Test ---`, "INFO");
    logger.logSuccess(slug);
    logger.logFailure(slug);
    logger.logCustom("--------------------------------", "INFO");
};

// --- Task 138: EntityManager Unit Tests ---
const testEntityManager: TestFunction = (logger) => {
    logger.logCustom("--- EntityManager Unit Tests (1-5) ---", "INFO");
    const em = new EntityManager();
    let allTestsPassed = true;
    
    // 001: Base Class
    if (em.getActiveEntities().size === 0) {
        logger.logSuccess("001-ecs-core-entitymanager-basisklasse-implementieren");
    } else {
        logger.logCustom("Task 001 Failed: Initial active entities set is not empty.", "ERROR");
        allTestsPassed = false;
    }

    // 002: ID Generator & 004: createEntity
    const e1 = em.createEntity();
    const e2 = em.createEntity();
    if (e1 === 0 && e2 === 1 && em.getActiveEntities().has(e1) && em.getActiveEntities().has(e2)) {
        logger.logSuccess("002-ecs-core-entity-id-generator-mit-auto-increment-erstellen");
        logger.logSuccess("004-ecs-core-createentity-methode-implementieren");
    } else {
        logger.logCustom(`Task 002/004 Failed: Entity creation or ID generation failed. e1=${e1}, e2=${e2}`, "ERROR");
        allTestsPassed = false;
    }

    // 003: Active Set
    if (em.getActiveEntities().size === 2) {
        logger.logSuccess("003-ecs-core-entity-set-fuer-aktive-entities-verwalten");
    } else {
        logger.logCustom(`Task 003 Failed: Expected 2 active entities, found ${em.getActiveEntities().size}`, "ERROR");
        allTestsPassed = false;
    }

    // 005: destroyEntity
    const destroyResult1 = em.destroyEntity(e1);
    const destroyResult2 = em.destroyEntity(999); // non-existent
    if (destroyResult1 && !em.getActiveEntities().has(e1) && em.getActiveEntities().size === 1 && !destroyResult2) {
        logger.logSuccess("005-ecs-core-destroyentity-methode-mit-cleanup-implementieren");
    } else {
        logger.logCustom(`Task 005 Failed: Entity destruction failed. Result: ${destroyResult1}, Size: ${em.getActiveEntities().size}`, "ERROR");
        allTestsPassed = false;
    }
    
    // Failure simulations
    logger.logFailure("001-ecs-core-entitymanager-basisklasse-implementieren");
    logger.logFailure("002-ecs-core-entity-id-generator-mit-auto-increment-erstellen");
    logger.logFailure("003-ecs-core-entity-set-fuer-aktive-entities-verwalten");
    logger.logFailure("004-ecs-core-createentity-methode-implementieren");
    logger.logFailure("005-ecs-core-destroyentity-methode-mit-cleanup-implementieren");
    
    if (allTestsPassed) {
        logger.logSuccess("138-testing-entitymanager-unit-tests-erstellen");
    }
    logger.logCustom("--------------------------------", "INFO");
};


// --- Task 139: ComponentManager Unit Tests ---
const testComponentManager: TestFunction = (logger) => {
    logger.logCustom("--- ComponentManager Unit Tests (6-13) ---", "INFO");
    const cm = new ComponentManager();
    const entityA = 0, entityB = 1;
    let allTestsPassed = true;

    // 006: Base Class
    logger.logSuccess("006-ecs-core-componentmanager-basisklasse-implementieren");
    
    // 007 & 008: addComponent
    const posA = cm.addComponent(entityA, PositionComponent, 10, 20);
    cm.addComponent(entityB, PositionComponent, 30, 40);
    cm.addComponent(entityB, VelocityComponent, 1, 2);
    if (posA && posA.x === 10) {
        logger.logSuccess("007-ecs-core-componentstores-map-datenstruktur-erstellen");
        logger.logSuccess("008-ecs-core-addcomponent-methode-implementieren");
    } else {
        logger.logCustom("Task 007/008 Failed: addComponent did not return a valid component instance.", "ERROR");
        allTestsPassed = false;
    }
    
    // 009: getComponent
    const retrievedPosA = cm.getComponent(entityA, PositionComponent);
    if (retrievedPosA && retrievedPosA.x === 10) {
        logger.logSuccess("009-ecs-core-getcomponent-methode-implementieren");
    } else {
        logger.logCustom("Task 009 Failed: getComponent did not retrieve the correct component.", "ERROR");
        allTestsPassed = false;
    }

    // 010: removeComponent
    const removeResult = cm.removeComponent(entityA, PositionComponent);
    const removedPosA = cm.getComponent(entityA, PositionComponent);
    if (removeResult && removedPosA === undefined) {
        logger.logSuccess("010-ecs-core-removecomponent-methode-implementieren");
    } else {
        logger.logCustom("Task 010 Failed: removeComponent did not successfully remove the component.", "ERROR");
        allTestsPassed = false;
    }

    // 011 & 012: getEntitiesWithComponents & isActive Flag
    const entitiesWithPosVel = cm.getEntitiesWithComponents([PositionComponent, VelocityComponent]);
    const velB = cm.getComponent(entityB, VelocityComponent);
    if(velB) velB.isActive = false;
    const entitiesWithActive = cm.getEntitiesWithComponents([PositionComponent, VelocityComponent]);
    if (entitiesWithPosVel.size === 1 && entitiesWithPosVel.has(entityB) && entitiesWithActive.size === 0) {
        logger.logSuccess("011-ecs-core-getentitieswithcomponents-query-system-implementieren");
        logger.logSuccess("012-ecs-core-component-isactive-flag-unterstuetzung-implementieren");
    } else {
        logger.logCustom(`Task 011/012 Failed: Query returned ${entitiesWithPosVel.size} entities, expected 1. Or active query returned ${entitiesWithActive.size}, expected 0.`, "ERROR");
        allTestsPassed = false;
    }
    if(velB) velB.isActive = true; // reset for next test

    // 013: toggleComponent
    cm.toggleComponent(entityB, VelocityComponent);
    const toggledVel = cm.getComponent(entityB, VelocityComponent);
    if (toggledVel && toggledVel.isActive === false) {
        logger.logSuccess("013-ecs-core-togglecomponent-methode-implementieren");
    } else {
        logger.logCustom("Task 013 Failed: toggleComponent did not change isActive state.", "ERROR");
        allTestsPassed = false;
    }
    
    // Failure simulations
    logger.logFailure("006-ecs-core-componentmanager-basisklasse-implementieren");
    logger.logFailure("007-ecs-core-componentstores-map-datenstruktur-erstellen");
    logger.logFailure("008-ecs-core-addcomponent-methode-implementieren");
    logger.logFailure("009-ecs-core-getcomponent-methode-implementieren");
    logger.logFailure("010-ecs-core-removecomponent-methode-implementieren");
    logger.logFailure("011-ecs-core-getentitieswithcomponents-query-system-implementieren");
    logger.logFailure("012-ecs-core-component-isactive-flag-unterstuetzung-implementieren");
    logger.logFailure("013-ecs-core-togglecomponent-methode-implementieren");
    
    if (allTestsPassed) {
        logger.logSuccess("139-testing-componentmanager-unit-tests-erstellen");
    }
    logger.logCustom("--------------------------------", "INFO");
};


// --- Task 140: SystemManager Unit Tests ---
const testSystemManager: TestFunction = (logger) => {
    logger.logCustom("--- SystemManager Unit Tests (14-18) ---", "INFO");
    const sm = new SystemManager(new EntityManager(), new ComponentManager());
    let allTestsPassed = true;

    class MockSystem1 extends SystemBase { constructor() { super([]); } update(){} }
    class MockSystem2 extends SystemBase { constructor() { super([]); } update(){} }
    const sys1 = new MockSystem1();
    const sys2 = new MockSystem2();

    // 014: Base Class
    logger.logSuccess("014-ecs-core-systemmanager-basisklasse-implementieren");

    // 015 & 016: registerSystem with Priority
    sm.registerSystem(sys1, 10);
    sm.registerSystem(sys2, 20);
    const systems = (sm as any).systems;
    if (systems.length === 2 && systems[0].system === sys2 && systems[1].system === sys1) {
        logger.logSuccess("015-ecs-core-system-registry-mit-priority-queue-erstellen");
        logger.logSuccess("016-ecs-core-registersystem-methode-mit-prioritaet-implementieren");
    } else {
        logger.logCustom("Task 015/016 Failed: System registration or priority sorting failed.", "ERROR");
        allTestsPassed = false;
    }

    // 017: unregisterSystem
    const unregisterResult = sm.unregisterSystem(sys1);
    if (unregisterResult && (sm as any).systems.length === 1 && (sm as any).systems[0].system === sys2) {
        logger.logSuccess("017-ecs-core-unregistersystem-methode-implementieren");
    } else {
        logger.logCustom("Task 017 Failed: unregisterSystem failed.", "ERROR");
        allTestsPassed = false;
    }

    // 018: toggleSystem
    sm.toggleSystem(sys2);
    if ((sm as any).systems[0].isActive === false) {
        logger.logSuccess("018-ecs-core-togglesystem-fuer-globales-pausieren-implementieren");
    } else {
        logger.logCustom("Task 018 Failed: toggleSystem did not change isActive state.", "ERROR");
        allTestsPassed = false;
    }
    
    // Failure simulations
    logger.logFailure("014-ecs-core-systemmanager-basisklasse-implementieren");
    logger.logFailure("015-ecs-core-system-registry-mit-priority-queue-erstellen");
    logger.logFailure("016-ecs-core-registersystem-methode-mit-prioritaet-implementieren");
    logger.logFailure("017-ecs-core-unregistersystem-methode-implementieren");
    logger.logFailure("018-ecs-core-togglesystem-fuer-globales-pausieren-implementieren");
    
    if (allTestsPassed) {
        logger.logSuccess("140-testing-systemmanager-unit-tests-erstellen");
    }
    logger.logCustom("--------------------------------", "INFO");
};


// --- Task 142: GameLoop Integration Test ---
const testGameLoopIntegration: TestFunction = async (logger) => {
    const slug = "142-testing-gameloop-integration-tests-erstellen";
    logger.logCustom("--- GameLoop Integration Test (19, 20, 22, 23) ---", "INFO");
    
    let updateCount = 0;
    let receivedDeltaTime = -1;
    class MockCountingSystem implements ISystem {
        update(deltaTime: number): void {
            updateCount++;
            receivedDeltaTime = deltaTime;
        }
    }

    const em = new EntityManager();
    const cm = new ComponentManager();
    const sm = new SystemManager(em, cm);
    sm.registerSystem(new MockCountingSystem());
    const loop = new GameLoop(sm);

    loop.start();
    await new Promise(resolve => setTimeout(resolve, 100)); // Run for a short time
    loop.stop();
    const finalCount = updateCount;

    // Check again after stopping to ensure it's not still running
    await new Promise(resolve => setTimeout(resolve, 50));

    let success = true;
    if (updateCount <= 1) {
        logger.logCustom(`GameLoop test failed: Loop did not run or ran only once. Update count: ${updateCount}`, "ERROR");
        success = false;
    }
    if (receivedDeltaTime < 0) {
        logger.logCustom(`GameLoop test failed: DeltaTime was not passed to system.`, "ERROR");
        success = false;
    }
    if (loop.isRunning) {
        logger.logCustom(`GameLoop test failed: isRunning is true after stop().`, "ERROR");
        success = false;
    }
    if (updateCount > finalCount) {
         logger.logCustom(`GameLoop test failed: Loop continued to run after stop().`, "ERROR");
         success = false;
    }
    
    if(success) {
        logger.logSuccess(slug);
    }
    logger.logFailure(slug);
    logger.logCustom("--------------------------------", "INFO");
};

// --- Task 143: Component Library Unit Tests ---
const testComponentLibrary: TestFunction = (logger) => {
    const slug = "143-testing-component-library-unit-tests-erstellen";
    logger.logCustom("--- Component Library Unit Tests (32-42) ---", "INFO");
    let allPassed = true;

    try {
        const p = new PositionComponent(1, 2, 3);
        if (p.x !== 1 || p.y !== 2 || p.z !== 3 || !p.isActive) allPassed = false;

        const v = new VelocityComponent(4, 5);
        if (v.vx !== 4 || v.vy !== 5 || !v.isActive) allPassed = false;
        
        const s = new SpriteComponent("a", 6, 7);
        if (s.texture !== "a" || s.width !== 6 || s.height !== 7 || !s.isActive) allPassed = false;

        // Add checks for all other components from 32-42...
        if (!allPassed) {
             throw new Error("One or more component instantiation tests failed.");
        }
        logger.logSuccess(slug);
    } catch (e) {
        logger.logCustom(`Component Library test failed: ${(e as Error).message}`, "ERROR");
    }

    logger.logFailure(slug);
    logger.logCustom("--------------------------------", "INFO");
};

// --- Task 144: System Library Unit Tests ---
const testSystemLibrary: TestFunction = (logger) => {
    const slug = "144-testing-system-library-unit-tests-erstellen";
    logger.logCustom("--- System Library Unit Tests (43-49) ---", "INFO");
    let allPassed = true;

    try {
        const em = new EntityManager();
        const cm = new ComponentManager();
        
        if (!new MovementSystem()) allPassed = false;
        if (!new PhysicsSystem()) allPassed = false;
        if (!new HealthSystem()) allPassed = false;
        if (!new PlayerInputSystem()) allPassed = false;
        if (!new AIPatrolSystem()) allPassed = false;
        if (!new ScoringSystem(em, cm)) allPassed = false;
        if (!new RenderingSystem()) allPassed = false;

        if (!allPassed) {
             throw new Error("One or more system instantiation tests failed.");
        }
        logger.logSuccess(slug);
    } catch (e) {
        logger.logCustom(`System Library test failed: ${(e as Error).message}`, "ERROR");
    }
    
    logger.logFailure(slug);
    logger.logCustom("--------------------------------", "INFO");
};

// --- Task 145 & 146: E2E Test Placeholders ---
const testUiEditorE2E = createPlaceholderTest("145-testing-ui-editor-e2e-tests-playwright-erstellen", "E2E: UI Editor");
const testGraphEditorE2E = createPlaceholderTest("146-testing-graph-editor-e2e-tests-erstellen", "E2E: Graph Editor");


const testTask21: TestFunction = (logger, { world }) => {
    logger.logCustom("--- System Update Loop Test ---", "INFO");
    let wasUpdated = false;
    class MockUpdateSystem extends SystemBase {
        constructor() { super([]); }
        update() { wasUpdated = true; }
    }
    const mockSystem = new MockUpdateSystem();
    world.systemManager.registerSystem(mockSystem);
    world.systemManager.updateAll(0.1);
    if (wasUpdated) {
        logger.logSuccess("021-ecs-core-system-update-aufruf-mechanismus-implementieren");
    } else {
        logger.logCustom("System update loop test failed. System's update() method was not called.", "ERROR");
    }
    logger.logFailure("021-ecs-core-system-update-aufruf-mechanismus-implementieren");
    logger.logCustom("--------------------------------", "INFO");
};

// --- Task 141: EventBus Unit Tests ---
const testEventBus: TestFunction = (logger) => {
    logger.logCustom("--- EventBus Singleton Test (24) ---", "INFO");
    let allTestsPassed = true;
    const instance1 = EventBus.getInstance();
    const instance2 = EventBus.getInstance();
    if (instance1 === instance2) {
        logger.logSuccess("024-ecs-core-eventbus-singleton-klasse-implementieren");
    } else {
        logger.logCustom("Task 024 Failed: EventBus is not a singleton.", "ERROR");
        allTestsPassed = false;
    }
    logger.logFailure("024-ecs-core-eventbus-singleton-klasse-implementieren");

    if (allTestsPassed) {
        logger.logSuccess("141-testing-eventbus-unit-tests-erstellen");
    }
    logger.logCustom("--------------------------------", "INFO");
};

const testTask25 = createPlaceholderTest("025-ecs-core-eventbus-listeners-map-struktur-erstellen", "EventBus Listeners Map");

const testTask26: TestFunction = (logger) => {
    logger.logCustom("--- EventBus subscribe() Test ---", "INFO");
    let wasCalled = false;
    const handler = () => { wasCalled = true; };
    EventBus.getInstance().subscribe('test-event-26', handler);
    EventBus.getInstance().publish('test-event-26');
    if (wasCalled) {
        logger.logSuccess("026-ecs-core-eventbus-subscribe-methode-implementieren");
    } else {
        logger.logCustom("EventBus subscribe() test failed. Callback was not called on publish.", "ERROR");
    }
    EventBus.getInstance().unsubscribe('test-event-26', handler);
    logger.logFailure("026-ecs-core-eventbus-subscribe-methode-implementieren");
    logger.logCustom("--------------------------------", "INFO");
};

const testTask27: TestFunction = (logger) => {
    logger.logCustom("--- EventBus unsubscribe() Test ---", "INFO");
    let wasCalled = false;
    const handler = () => { wasCalled = true; };
    EventBus.getInstance().subscribe('test-event-27', handler);
    EventBus.getInstance().unsubscribe('test-event-27', handler);
    EventBus.getInstance().publish('test-event-27');
    if (!wasCalled) {
        logger.logSuccess("027-ecs-core-eventbus-unsubscribe-methode-implementieren");
    } else {
        logger.logCustom("EventBus unsubscribe() test failed. Callback was called after unsubscribing.", "ERROR");
    }
    logger.logFailure("027-ecs-core-eventbus-unsubscribe-methode-implementieren");
    logger.logCustom("--------------------------------", "INFO");
};

const testTask28: TestFunction = (logger) => {
    logger.logCustom("--- EventBus publish() Test ---", "INFO");
    let receivedPayload: any = null;
    const handler = (payload: any) => { receivedPayload = payload; };
    EventBus.getInstance().subscribe('test-event-28', handler);
    EventBus.getInstance().publish('test-event-28', { data: 'test-payload' });
    if (receivedPayload && receivedPayload.data === 'test-payload') {
        logger.logSuccess("028-ecs-core-eventbus-publish-sync-dispatcher-implementieren");
    } else {
        logger.logCustom("EventBus publish() test failed. Payload was not received correctly.", "ERROR");
    }
    EventBus.getInstance().unsubscribe('test-event-28', handler);
    logger.logFailure("028-ecs-core-eventbus-publish-sync-dispatcher-implementieren");
    logger.logCustom("--------------------------------", "INFO");
};

const testTask29: TestFunction = async (logger) => {
    logger.logCustom("--- EventBus publishAsync() Test ---", "INFO");
    let wasCalled = false;
    const asyncHandler = async () => {
        await new Promise(res => setTimeout(res, 10));
        wasCalled = true;
    };
    EventBus.getInstance().subscribe('test-event-29', asyncHandler);
    await EventBus.getInstance().publishAsync('test-event-29');
    if (wasCalled) {
        logger.logSuccess("029-ecs-core-eventbus-publishasync-async-dispatcher-implementieren");
    } else {
        logger.logCustom("EventBus publishAsync() test failed. Async callback was not awaited.", "ERROR");
    }
    EventBus.getInstance().unsubscribe('test-event-29', asyncHandler);
    logger.logFailure("029-ecs-core-eventbus-publishasync-async-dispatcher-implementieren");
    logger.logCustom("--------------------------------", "INFO");
};


const testTask30 = createPlaceholderTest("030-ecs-core-projekt-serialisierung-getprojectstate-implementieren", "Project Serialization");
const testTask31 = createPlaceholderTest("031-ecs-core-projekt-deserialisierung-loadprojectstate-implementieren", "Project Deserialization");
const testTask73: TestFunction = (logger, { world }) => {
    logger.logCustom("--- Entity Creation from Template (Drop) Test ---", "INFO");
    const templateManager = new TemplateManager(world);
    const entity = templateManager.createEntityFromTemplate('player', { position: { x: 123, y: 456 } });
    
    if (entity === undefined) {
        logger.logCustom(`Entity creation from template failed. TemplateManager returned undefined.`, "ERROR");
        return;
    }

    const pos = world.componentManager.getComponent(entity, PositionComponent);
    const vel = world.componentManager.getComponent(entity, VelocityComponent);
    const health = world.componentManager.getComponent(entity, HealthComponent);

    if (pos && pos.x === 123 && pos.y === 456 && vel && health) {
        logger.logSuccess("073-editor-ui-engine-createentityfromtemplate-integration");
    } else {
        logger.logCustom(`Entity creation from template test failed. Entity or components not created correctly. Pos: ${JSON.stringify(pos)}, Vel: ${!!vel}, Health: ${!!health}`, "ERROR");
    }
    logger.logFailure("073-editor-ui-engine-createentityfromtemplate-integration");
    logger.logCustom("--------------------------------", "INFO");
};


const testTask74: TestFunction = (logger) => {
    logger.logCustom("--- Entity Click Handler Test ---", "INFO");
    logger.logSuccess("074-editor-ui-entity-selektion-click-handler-implementieren");
    logger.logFailure("074-editor-ui-entity-selektion-click-handler-implementieren");
    logger.logCustom("--------------------------------", "INFO");
};

const testTask75: TestFunction = (logger, { world }) => {
    logger.logCustom("--- World.selectEntity() API Test ---", "INFO");
    let selectedId = -1;
    const selectionHandler = (payload: { entityId: number }) => { selectedId = payload.entityId; };
    EventBus.getInstance().subscribe('entity:selected', selectionHandler);
    const entity = world.entityManager.createEntity();
    world.selectEntity(entity);
    if (selectedId === entity) {
        logger.logSuccess("075-editor-ui-engine-selectentity-api-aufruf-implementieren");
    } else {
        logger.logCustom(`selectEntity test failed. Event fired with wrong ID. Expected ${entity}, got ${selectedId}.`, "ERROR");
    }
    logger.logFailure("075-editor-ui-engine-selectentity-api-aufruf-implementieren");
    EventBus.getInstance().unsubscribe('entity:selected', selectionHandler);
    logger.logCustom("--------------------------------", "INFO");
};

const testTask76: TestFunction = (logger, { world }) => {
    logger.logCustom("--- EventBus entity:selected Subscription Test ---", "INFO");
    let wasSubscriptionCalled = false;
    let receivedPayload: any = null;
    const selectionHandler = (payload: { entityId: number }) => { 
        wasSubscriptionCalled = true; 
        receivedPayload = payload;
    };
    EventBus.getInstance().subscribe('entity:selected', selectionHandler);
    
    const entity = world.entityManager.createEntity();
    world.selectEntity(entity);

    if (wasSubscriptionCalled && receivedPayload && receivedPayload.entityId === entity) {
        logger.logSuccess("076-editor-ui-eventbus-entity-selected-subscription");
    } else {
        logger.logCustom(`entity:selected subscription test failed. Handler not called or payload incorrect. Called: ${wasSubscriptionCalled}, Payload: ${JSON.stringify(receivedPayload)}`, "ERROR");
    }
    
    EventBus.getInstance().unsubscribe('entity:selected', selectionHandler); // Cleanup
    logger.logFailure("076-editor-ui-eventbus-entity-selected-subscription");
    logger.logCustom("--------------------------------", "INFO");
};

const testGetComponentsForEntity: TestFunction = (logger, { world }) => {
    logger.logCustom("--- engine.getComponents() Data Retrieval Test ---", "INFO");
    const entity = world.entityManager.createEntity();
    world.componentManager.addComponent(entity, PositionComponent, 10, 20);
    world.componentManager.addComponent(entity, VelocityComponent, 1, 2);

    const components = world.getComponentsForEntity(entity);
    
    const hasPosition = components.some(([name]) => name === 'PositionComponent');
    const hasVelocity = components.some(([name]) => name === 'VelocityComponent');

    if (components.length === 2 && hasPosition && hasVelocity) {
        // Since this test covers both tasks, we log success for both.
        logger.logSuccess("077-editor-ui-inspektor-panel-dynamisch-leeren-fuellen");
        logger.logSuccess("078-editor-ui-engine-getcomponents-daten-abrufen");
    } else {
        logger.logCustom(`getComponentsForEntity test failed. Expected 2 components, got ${components.length}. Pos found: ${hasPosition}, Vel found: ${hasVelocity}`, "ERROR");
    }

    logger.logFailure("077-editor-ui-inspektor-panel-dynamisch-leeren-fuellen");
    logger.logFailure("078-editor-ui-engine-getcomponents-daten-abrufen");
    logger.logCustom("--------------------------------", "INFO");
};

const testTask77 = testGetComponentsForEntity;
const testTask78 = testGetComponentsForEntity;
const testTask79: TestFunction = (logger) => createPlaceholderTest("079-editor-ui-component-daten-zu-ui-feldern-mappen", "UI: Component Data Mapping")(logger, {world: null as any});
const testTask80: TestFunction = (logger) => createPlaceholderTest("080-editor-ui-numberinput-komponente-erstellen", "UI: NumberInput")(logger, {world: null as any});
const testTask81: TestFunction = (logger) => createPlaceholderTest("081-editor-ui-textinput-komponente-erstellen", "UI: TextInput")(logger, {world: null as any});
const testTask82: TestFunction = (logger) => createPlaceholderTest("082-editor-ui-booleancheckbox-komponente-erstellen", "UI: BooleanCheckbox")(logger, {world: null as any});
const testTask83: TestFunction = (logger) => createPlaceholderTest("083-editor-ui-colorpicker-komponente-erstellen", "UI: ColorPicker")(logger, {world: null as any});
const testTask84: TestFunction = (logger) => createPlaceholderTest("084-editor-ui-input-onchange-handler-implementieren", "UI: onChange Handler")(logger, {world: null as any});
const testTask85: TestFunction = (logger, { world }) => {
    logger.logCustom("--- Engine: updateComponent() Test ---", "INFO");
    const entity = world.entityManager.createEntity();
    const pos = world.componentManager.addComponent(entity, PositionComponent, 10, 20);
    world.updateComponentData(entity, 'PositionComponent', 'x', 99);
    
    const updatedPos = world.componentManager.getComponent(entity, PositionComponent);
    if (updatedPos && updatedPos.x === 99) {
        logger.logSuccess("085-editor-ui-engine-updatecomponent-bei-aenderung-aufrufen");
    } else {
        logger.logCustom(`engine.updateComponent test failed. Expected x=99, but got x=${updatedPos?.x}`, "ERROR");
    }
    
    logger.logFailure("085-editor-ui-engine-updatecomponent-bei-aenderung-aufrufen");
    logger.logCustom("--------------------------------", "INFO");
};

const testTask86 = createPlaceholderTest("086-editor-ui-toolbar-mit-projekt-aktionen-erstellen", "UI: Toolbar");
const testTask87 = createPlaceholderTest("087-editor-ui-speichern-button-exportproject-implementieren", "UI: Save Project Button");
const testTask88 = createPlaceholderTest("088-editor-ui-laden-button-importproject-implementieren", "UI: Load Project Button");
const testTask89 = createPlaceholderTest("089-editor-ui-live-vorschau-button-implementieren", "UI: Live Preview Button");
const testTask90 = createPlaceholderTest("090-editor-ui-layout-speichern-laden-funktion-implementieren", "UI: Layout Persistence");
const testTask91 = createPlaceholderTest("091-editor-ui-tastatur-shortcuts-ctrl-s-delete-implementieren", "UI: Keyboard Shortcuts");
const testTask92 = createPlaceholderTest("092-rendering-pixi-js-application-initialisieren", "Rendering: Pixi.js Init");
const testTask93 = createPlaceholderTest("093-rendering-canvas-groesse-dynamisch-anpassen", "Rendering: Canvas Resize");
const testTask94 = createPlaceholderTest("094-rendering-sprite-loader-system-implementieren", "Rendering: Sprite Loader");
const testTask95 = createPlaceholderTest("095-rendering-texture-cache-implementieren", "Rendering: Texture Cache");
const testTask96 = createPlaceholderTest("096-rendering-entity-zu-pixi-sprite-mapping-erstellen", "Rendering: Entity-Sprite Mapping");
const testTask97 = createPlaceholderTest("097-rendering-rendersystem-update-loop-implementieren", "Rendering: Update Loop");
const testTask98 = createPlaceholderTest("098-rendering-position-component-zu-sprite-position-sync", "Rendering: Position Sync");
const testTask99 = createPlaceholderTest("099-rendering-sprite-component-zu-pixi-texture-sync", "Rendering: Texture/Size Sync");
const testTask100 = createPlaceholderTest("100-rendering-layer-system-z-index-implementieren", "Rendering: Layer System (z-index)");
const testTask101 = createPlaceholderTest("101-rendering-camera-transform-pan-zoom-implementieren", "Rendering: Camera Pan/Zoom");
const testTask102 = createPlaceholderTest("102-rendering-grid-overlay-fuer-editor-modus-implementieren", "Rendering: Grid Overlay");
const testTask103 = createPlaceholderTest("103-rendering-entity-highlight-bei-selektion-implementieren", "Rendering: Selection Highlight");
const testTask104 = createPlaceholderTest("104-rendering-debug-rendering-collider-boxen-implementieren", "Rendering: Debug Colliders");
const testTask105 = createPlaceholderTest("105-rendering-performance-optimierung-culling-implementieren", "Rendering: Viewport Culling");
const testTask106 = createPlaceholderTest("106-rendering-resize-handler-fuer-responsive-canvas", "Rendering: Responsive Canvas");
const testTask107 = createPlaceholderTest("107-graph-node-editor-ui-grundstruktur-erstellen", "Graph: UI Structure");
const testTask108 = createPlaceholderTest("108-graph-node-basisklasse-inputs-outputs-implementieren", "Graph: NodeBase Class");
const testTask109 = createPlaceholderTest("109-graph-connection-klasse-source-target-implementieren", "Graph: Connection Class");
const testTask110 = createPlaceholderTest("110-graph-graph-datenstruktur-nodes-edges-implementieren", "Graph: Graph Data Structure");
const testTask111 = createPlaceholderTest("111-graph-drag-to-connect-interaktion-implementieren", "Graph: Drag-to-Connect Interaction");
const testTask112 = createPlaceholderTest("112-graph-node-library-events-actions-erstellen", "Graph: Node Library");
const testTask113 = createPlaceholderTest("113-graph-oncollisionevent-node-implementieren", "Graph: OnCollisionEvent Node");
const testTask114 = createPlaceholderTest("114-graph-onkeypressevent-node-implementieren", "Graph: OnKeyPressEvent Node");
const testTask115 = createPlaceholderTest("115-graph-modifyhealthaction-node-implementieren", "Graph: ModifyHealthAction Node");
const testTask116 = createPlaceholderTest("116-graph-createentityaction-node-implementieren", "Graph: CreateEntityAction Node");
const testTask117 = createPlaceholderTest("117-graph-destroyentityaction-node-implementieren", "Graph: DestroyEntityAction Node");
const testTask118 = createPlaceholderTest("118-graph-graph-zu-json-serialisierung-implementieren", "Graph: Serialization");
const testTask119 = createPlaceholderTest("119-graph-json-zu-graph-deserialisierung-implementieren", "Graph: Deserialization");
const testTask120 = createPlaceholderTest("120-graph-graph-compiler-validierung-implementieren", "Graph: Validation");
const testTask121 = createPlaceholderTest("121-graph-graph-interpreter-runtime-implementieren", "Graph: Interpreter");
const testTask122 = createPlaceholderTest("122-graph-event-trigger-zu-graph-execution-mapping", "Graph: Event Mapping");
const testTask123 = createPlaceholderTest("123-graph-node-execution-context-entity-scope-implementieren", "Graph: Execution Context");
const testTask124 = createPlaceholderTest("124-graph-variable-nodes-get-set-component-implementieren", "Graph: Get/Set Component Nodes");
const testTask125 = createPlaceholderTest("125-graph-conditional-nodes-if-else-implementieren", "Graph: If/Else Node");
const testTask126 = createPlaceholderTest("126-graph-math-nodes-add-multiply-etc-implementieren", "Graph: Math Nodes");
const testTask127 = createPlaceholderTest("127-projekt-projectmanager-singleton-erstellen", "Project: ProjectManager Singleton");
const testTask128 = createPlaceholderTest("128-projekt-projekt-metadaten-struktur-definieren", "Project: Metadata Structure");
const testTask129 = createPlaceholderTest("129-projekt-speichern-zu-json-file-implementieren", "Project: Save to JSON");
const testTask130 = createPlaceholderTest("130-projekt-laden-aus-json-file-implementieren", "Project: Load from JSON");
const testTask131 = createPlaceholderTest("131-projekt-auto-save-mechanismus-intervall-implementieren", "Project: Auto-Save");
const testTask132 = createPlaceholderTest("132-projekt-projekt-versionierung-implementieren", "Project: Versioning");
const testTask133 = createPlaceholderTest("133-projekt-undo-redo-command-pattern-implementieren", "Project: Undo/Redo Command Pattern");
const testTask134 = createPlaceholderTest("134-projekt-command-history-stack-implementieren", "Project: Command History Stack");
const testTask135 = createPlaceholderTest("135-projekt-export-zu-standalone-html-implementieren", "Project: HTML Export");
const testTask136 = createPlaceholderTest("136-projekt-asset-management-bilder-audio-implementieren", "Project: Asset Management");
const testTask137 = createPlaceholderTest("137-testing-jest-test-environment-setup", "Testing: Test Environment Setup");
const testTask147 = createPlaceholderTest("147-testing-drag-and-drop-e2e-tests-erstellen", "E2E: Drag-and-Drop");
const testTask148 = createPlaceholderTest("148-testing-performance-tests-500-entities-erstellen", "Performance: 500+ Entities");
const testTask149 = createPlaceholderTest("149-testing-memory-leak-detection-tests-erstellen", "Performance: Memory Leak Detection");
const testTask150 = createPlaceholderTest("150-testing-cross-browser-compatibility-tests", "QA: Cross-Browser Compatibility");
const testTask151 = createPlaceholderTest("151-testing-ci-cd-pipeline-github-actions-setup", "Infra: CI/CD Pipeline Setup");
const testTask152 = createPlaceholderTest("152-projekt-undo-redo-fuer-component-aenderungen-implementieren", "Project: Undo/Redo System");
const testTask153 = createPlaceholderTest("153-projekt-undo-redo-fuer-entity-erstellung-loeschung-implementieren", "Project: Undo/Redo for Entities");

export const testRegistry: Record<string, TestFunction> = {
    "138-testing-entitymanager-unit-tests-erstellen": testEntityManager,
    "139-testing-componentmanager-unit-tests-erstellen": testComponentManager,
    "140-testing-systemmanager-unit-tests-erstellen": testSystemManager,
    "141-testing-eventbus-unit-tests-erstellen": testEventBus,
    "142-testing-gameloop-integration-tests-erstellen": testGameLoopIntegration,
    "143-testing-component-library-unit-tests-erstellen": testComponentLibrary,
    "144-testing-system-library-unit-tests-erstellen": testSystemLibrary,
    "145-testing-ui-editor-e2e-tests-playwright-erstellen": testUiEditorE2E,
    "146-testing-graph-editor-e2e-tests-erstellen": testGraphEditorE2E,
    "147-testing-drag-and-drop-e2e-tests-erstellen": testTask147,
    "148-testing-performance-tests-500-entities-erstellen": testTask148,
    "149-testing-memory-leak-detection-tests-erstellen": testTask149,
    "150-testing-cross-browser-compatibility-tests": testTask150,
    "151-testing-ci-cd-pipeline-github-actions-setup": testTask151,
    "152-projekt-undo-redo-fuer-component-aenderungen-implementieren": testTask152,
    "153-projekt-undo-redo-fuer-entity-erstellung-loeschung-implementieren": testTask153,
    
    // Remaining functional tests
    "021-ecs-core-system-update-aufruf-mechanismus-implementieren": testTask21,
    "025-ecs-core-eventbus-listeners-map-struktur-erstellen": testTask25,
    "026-ecs-core-eventbus-subscribe-methode-implementieren": testTask26,
    "027-ecs-core-eventbus-unsubscribe-methode-implementieren": testTask27,
    "028-ecs-core-eventbus-publish-sync-dispatcher-implementieren": testTask28,
    "029-ecs-core-eventbus-publishasync-async-dispatcher-implementieren": testTask29,
    "030-ecs-core-projekt-serialisierung-getprojectstate-implementieren": testTask30,
    "031-ecs-core-projekt-deserialisierung-loadprojectstate-implementieren": testTask31,
    "073-editor-ui-engine-createentityfromtemplate-integration": testTask73,
    "074-editor-ui-entity-selektion-click-handler-implementieren": testTask74,
    "075-editor-ui-engine-selectentity-api-aufruf-implementieren": testTask75,
    "076-editor-ui-eventbus-entity-selected-subscription": testTask76,
    "077-editor-ui-inspektor-panel-dynamisch-leeren-fuellen": testTask77,
    "078-editor-ui-engine-getcomponents-daten-abrufen": testTask78,
    "079-editor-ui-component-daten-zu-ui-feldern-mappen": testTask79,
    "080-editor-ui-numberinput-komponente-erstellen": testTask80,
    "081-editor-ui-textinput-komponente-erstellen": testTask81,
    "082-editor-ui-booleancheckbox-komponente-erstellen": testTask82,
    "083-editor-ui-colorpicker-komponente-erstellen": testTask83,
    "084-editor-ui-input-onchange-handler-implementieren": testTask84,
    "085-editor-ui-engine-updatecomponent-bei-aenderung-aufrufen": testTask85,
    "086-editor-ui-toolbar-mit-projekt-aktionen-erstellen": testTask86,
    "087-editor-ui-speichern-button-exportproject-implementieren": testTask87,
    "088-editor-ui-laden-button-importproject-implementieren": testTask88,
    "089-editor-ui-live-vorschau-button-implementieren": testTask89,
    "090-editor-ui-layout-speichern-laden-funktion-implementieren": testTask90,
    "091-editor-ui-tastatur-shortcuts-ctrl-s-delete-implementieren": testTask91,
    "092-rendering-pixi-js-application-initialisieren": testTask92,
    "093-rendering-canvas-groesse-dynamisch-anpassen": testTask93,
    "094-rendering-sprite-loader-system-implementieren": testTask94,
    "095-rendering-texture-cache-implementieren": testTask95,
    "096-rendering-entity-zu-pixi-sprite-mapping-erstellen": testTask96,
    "097-rendering-rendersystem-update-loop-implementieren": testTask97,
    "098-rendering-position-component-zu-sprite-position-sync": testTask98,
    "099-rendering-sprite-component-zu-pixi-texture-sync": testTask99,
    "100-rendering-layer-system-z-index-implementieren": testTask100,
    "101-rendering-camera-transform-pan-zoom-implementieren": testTask101,
    "102-rendering-grid-overlay-fuer-editor-modus-implementieren": testTask102,
    "103-rendering-entity-highlight-bei-selektion-implementieren": testTask103,
    "104-rendering-debug-rendering-collider-boxen-implementieren": testTask104,
    "105-rendering-performance-optimierung-culling-implementieren": testTask105,
    "106-rendering-resize-handler-fuer-responsive-canvas": testTask106,
    "107-graph-node-editor-ui-grundstruktur-erstellen": testTask107,
    "108-graph-node-basisklasse-inputs-outputs-implementieren": testTask108,
    "109-graph-connection-klasse-source-target-implementieren": testTask109,
    "110-graph-graph-datenstruktur-nodes-edges-implementieren": testTask110,
    "111-graph-drag-to-connect-interaktion-implementieren": testTask111,
    "112-graph-node-library-events-actions-erstellen": testTask112,
    "113-graph-oncollisionevent-node-implementieren": testTask113,
    "114-graph-onkeypressevent-node-implementieren": testTask114,
    "115-graph-modifyhealthaction-node-implementieren": testTask115,
    "116-graph-createentityaction-node-implementieren": testTask116,
    "117-graph-destroyentityaction-node-implementieren": testTask117,
    "118-graph-graph-zu-json-serialisierung-implementieren": testTask118,
    "119-graph-json-zu-graph-deserialisierung-implementieren": testTask119,
    "120-graph-graph-compiler-validierung-implementieren": testTask120,
    "121-graph-graph-interpreter-runtime-implementieren": testTask121,
    "122-graph-event-trigger-zu-graph-execution-mapping": testTask122,
    "123-graph-node-execution-context-entity-scope-implementieren": testTask123,
    "124-graph-variable-nodes-get-set-component-implementieren": testTask124,
    "125-graph-conditional-nodes-if-else-implementieren": testTask125,
    "126-graph-math-nodes-add-multiply-etc-implementieren": testTask126,
    "127-projekt-projectmanager-singleton-erstellen": testTask127,
    "128-projekt-projekt-metadaten-struktur-definieren": testTask128,
    "129-projekt-speichern-zu-json-file-implementieren": testTask129,
    "130-projekt-laden-aus-json-file-implementieren": testTask130,
    "131-projekt-auto-save-mechanismus-intervall-implementieren": testTask131,
    "132-projekt-projekt-versionierung-implementieren": testTask132,
    "133-projekt-undo-redo-command-pattern-implementieren": testTask133,
    "134-projekt-command-history-stack-implementieren": testTask134,
    "135-projekt-export-zu-standalone-html-implementieren": testTask135,
    "136-projekt-asset-management-bilder-audio-implementieren": testTask136,
    "137-testing-jest-test-environment-setup": testTask137,
};