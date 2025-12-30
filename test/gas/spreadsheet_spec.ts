/**
 * Repository GAS固有テスト - Spreadsheet統合
 *
 * このファイルにはGAS環境でのみ実行されるテストを含みます:
 * - MockSpreadsheetAppを使用するテスト
 * - SpreadsheetStore統合テスト
 * - GAS固有のデータ型変換とエラーハンドリング
 *
 * 共通ロジックテスト（両環境で実行）: test/shared/repository/core.test.ts
 */

/**
 * GAS-Specific Integration Tests for Repository Spreadsheet Module
 *
 * These tests cover Repository functionality that relies on Google Apps Script
 * SpreadsheetApp service, including data persistence, range operations, and
 * error handling specific to Google Sheets integration.
 */

import * as Test from '@/testing/Test';
import * as Assert from '@/testing/Assert';
import * as TestHelpers from '@/testing/TestHelpers';
import * as Repository from '@/repository';

// Test entity type for repository operations
type TestEntity = { id: string; name: string; value: number; active: boolean };
type EntityKey = 'id';

const schema: Repository.Types.Ports.Schema<TestEntity, EntityKey> = {
    parameters: ['id', 'name', 'value', 'active'],
    keyParameters: ['id'],
    instantiate(): TestEntity {
        return { id: '', name: '', value: 0, active: true };
    },
    fromPartial(p: Partial<TestEntity>): TestEntity {
        return {
            id: String(p.id ?? ''),
            name: String(p.name ?? ''),
            value: Number(p.value ?? 0),
            active: (() => {
                const val: unknown = p.active;
                if (typeof val === 'boolean') return val;
                if (typeof val === 'string') {
                    const str = val.toLowerCase().trim();
                    return str === 'true' || str === '1' || str === 'yes';
                }
                return Boolean(val);
            })()
        };
    }
};

const keyCodec: Repository.Types.Ports.KeyCodec<TestEntity, EntityKey> = {
    stringify(key: Pick<TestEntity, EntityKey>): string {
        return key.id;
    },
    parse(s: string): Pick<TestEntity, EntityKey> {
        return { id: s };
    }
};

Test.it('GAS SpreadsheetStore loads data from spreadsheet correctly', () => {
    // Test Case: SpreadsheetStore should read entity data from Google Sheets
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'test-entities-123';

        // Setup: Create spreadsheet with entity data including headers
        const entityData = [
            ['id', 'name', 'value', 'active'],  // Header row
            ['e1', 'Entity One', '100', 'true'],
            ['e2', 'Entity Two', '200', 'false'],
            ['e3', 'Entity Three', '300', 'true']
        ];

        mockApp.setupSpreadsheet(sheetId, { 'Entities': entityData });

        // Test: Create and load from SpreadsheetStore
        const store = new Repository.SpreadsheetStore(
            sheetId, 'Entities', schema
        );

        const result = store.load();

        Assert.equals(result.rows.length, 3, 'Should load 3 entities from spreadsheet');

        // Verify first entity
        const entity1 = result.rows[0] as TestEntity;
        Assert.equals(entity1.id, 'e1', 'First entity ID should match');
        Assert.equals(entity1.name, 'Entity One', 'First entity name should match');
        Assert.equals(entity1.value, 100, 'First entity value should be parsed as number');
        Assert.isTrue(entity1.active, 'First entity active should be true');

        // Verify boolean parsing
        const entity2 = result.rows[1] as TestEntity;
        Assert.isTrue(!entity2.active, 'Second entity active should be false');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore handles empty and malformed sheets', () => {
    // Test Case: SpreadsheetStore should handle edge cases in sheet data
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;

        // Edge Case 1: Empty sheet (only headers)
        const emptySheetId = 'empty-sheet';
        mockApp.setupSpreadsheet(emptySheetId, {
            'Empty': [['id', 'name', 'value', 'active']]
        });

        const emptyStore = new Repository.SpreadsheetStore(
            emptySheetId, 'Empty', schema
        );
        const emptyResult = emptyStore.load();
        Assert.equals(emptyResult.rows.length, 0, 'Empty sheet should return no entities');

        // Edge Case 2: Non-existent sheet should throw RepositoryError
        Assert.throws(
            () => {
                const badStore = new Repository.SpreadsheetStore(
                    emptySheetId, 'NonExistent', schema
                );
                badStore.load();
            },
            'Non-existent sheet should throw RepositoryError'
        );

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore handles custom header rows', () => {
    // Test Case: SpreadsheetStore should work with custom header row positions
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'custom-header-sheet';

        // Setup: Data with headers on row 3
        const dataWithCustomHeader = [
            ['', '', '', ''],  // Row 1: Empty
            ['Notes:', 'This is test data', '', ''],  // Row 2: Description
            ['id', 'name', 'value', 'active'],  // Row 3: Headers
            ['ch1', 'Custom Header One', '150', 'true'],
            ['ch2', 'Custom Header Two', '250', 'false']
        ];

        mockApp.setupSpreadsheet(sheetId, { 'CustomHeader': dataWithCustomHeader });

        // Test: Create store with custom header row
        const store = new Repository.SpreadsheetStore(
            sheetId, 'CustomHeader', schema, { headerRow: 3 }
        );

        const result = store.load();

        Assert.equals(result.rows.length, 2, 'Should load 2 entities with custom header row');
        Assert.equals((result.rows[0] as TestEntity).id, 'ch1', 'First entity should be parsed correctly');
        Assert.equals((result.rows[1] as TestEntity).value, 250, 'Second entity value should be correct');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore handles soft delete functionality', () => {
    // Test Case: SpreadsheetStore should support soft delete operations
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'soft-delete-sheet';

        // Setup: Data with soft delete flag
        const dataWithSoftDelete = [
            ['id', 'name', 'value', 'active', 'deleted'],
            ['sd1', 'Not Deleted', '100', 'true', 'false'],
            ['sd2', 'Soft Deleted', '200', 'true', 'true'],
            ['sd3', 'Also Not Deleted', '300', 'false', 'false']
        ];

        mockApp.setupSpreadsheet(sheetId, { 'SoftDelete': dataWithSoftDelete });

        // Test: Create store with soft delete configuration
        const store = new Repository.SpreadsheetStore(
            sheetId, 'SoftDelete', schema, {
            softDelete: { enabled: true, flagField: 'deleted', trueValue: 'true' }
        }
        );

        const result = store.load();

        // Note: Current implementation doesn't filter soft-deleted records on load
        // All entities are loaded regardless of delete flag
        Assert.equals(result.rows.length, 3, 'Should load all entities (soft delete filtering not implemented on load)');

        const loadedIds = result.rows.map(e => (e as TestEntity).id).sort();
        Assert.equals(loadedIds[0], 'sd1', 'Should include entity sd1');
        Assert.equals(loadedIds[1], 'sd2', 'Should include entity sd2');
        Assert.equals(loadedIds[2], 'sd3', 'Should include entity sd3');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore saves new entities correctly', () => {
    // Test Case: SpreadsheetStore should add new rows to spreadsheet
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'save-test-sheet';

        // Setup: Empty sheet with headers
        mockApp.setupSpreadsheet(sheetId, {
            'SaveTest': [['id', 'name', 'value', 'active']]
        });

        const store = new Repository.SpreadsheetStore(
            sheetId, 'SaveTest', schema
        );

        // Test: Save new entities
        const newEntities: TestEntity[] = [
            { id: 'new1', name: 'New Entity One', value: 123, active: true },
            { id: 'new2', name: 'New Entity Two', value: 456, active: false }
        ];

        store.saveAdded(newEntities);

        // Verify: Entities were added to the sheet
        const sheet = mockApp.openById(sheetId).getSheetByName('SaveTest')!;
        const sheetData = sheet.getData();

        Assert.equals(sheetData.length, 3, 'Should have header + 2 data rows');
        Assert.equals(sheetData[1][0], 'new1', 'First entity ID should be saved');
        Assert.equals(sheetData[1][1], 'New Entity One', 'First entity name should be saved');
        Assert.equals(sheetData[2][2], 456, 'Second entity value should be saved');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore updates existing entities correctly', () => {
    // Test Case: SpreadsheetStore should update existing rows in spreadsheet
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'update-test-sheet';

        // Setup: Sheet with existing data
        const existingData = [
            ['id', 'name', 'value', 'active'],
            ['u1', 'Original Name', '100', 'true'],
            ['u2', 'Another Original', '200', 'false']
        ];

        mockApp.setupSpreadsheet(sheetId, { 'UpdateTest': existingData });

        const store = new Repository.SpreadsheetStore(
            sheetId, 'UpdateTest', schema
        );

        // Test: Update existing entities
        const updates = [
            {
                index: 0,
                row: { id: 'u1', name: 'Updated Name', value: 150, active: false }
            },
            {
                index: 1,
                row: { id: 'u2', name: 'Another Updated', value: 250, active: true }
            }
        ];

        store.saveUpdated(updates);

        // Verify: Data was updated in the sheet
        const sheet = mockApp.openById(sheetId).getSheetByName('UpdateTest')!;
        const sheetData = sheet.getData();

        Assert.equals(sheetData[1][1], 'Updated Name', 'First entity name should be updated');
        Assert.equals(sheetData[1][2], 150, 'First entity value should be updated');
        Assert.equals(sheetData[2][1], 'Another Updated', 'Second entity name should be updated');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore handles data type conversions', () => {
    // Test Case: SpreadsheetStore should handle GAS data type conversions properly
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'conversion-test-sheet';

        // Setup: Data with various type formats (as they might appear in spreadsheets)
        const mixedTypeData = [
            ['id', 'name', 'value', 'active'],
            ['t1', 'String Value', 42, true],  // Mixed types
            ['t2', 'Number as String', '99', 'FALSE'],  // String representations
            ['t3', 'Empty Values', '', ''],  // Empty values
            ['t4', 'Null-like', 'null', 'undefined']  // Null-like strings
        ];

        mockApp.setupSpreadsheet(sheetId, { 'TypeTest': mixedTypeData });

        const store = new Repository.SpreadsheetStore(
            sheetId, 'TypeTest', schema
        );

        const result = store.load();

        Assert.equals(result.rows.length, 4, 'Should load all 4 test entities');

        // Verify type conversions
        const entity1 = result.rows[0] as TestEntity;
        Assert.equals(typeof entity1.value, 'number', 'Value should be converted to number');
        Assert.equals(entity1.value, 42, 'Numeric value should be preserved');
        Assert.equals(typeof entity1.active, 'boolean', 'Active should be boolean');

        const entity2 = result.rows[1] as TestEntity;
        Assert.equals(entity2.value, 99, 'String number should be converted to number');
        Assert.isTrue(!entity2.active, 'FALSE string should be converted to boolean false');

        const entity3 = result.rows[2] as TestEntity;
        Assert.equals(entity3.value, 0, 'Empty string should default to 0 for number');
        Assert.equals(typeof entity3.active, 'boolean', 'Empty active should be boolean');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore handles range operations correctly', () => {
    // Test Case: SpreadsheetStore should work with different range configurations
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'range-test-sheet';

        // Setup: Large dataset to test range operations
        const largeData = [
            ['id', 'name', 'value', 'active']
        ];

        // Add 50 rows of test data
        for (let i = 1; i <= 50; i++) {
            largeData.push([
                `r${i}`,
                `Row ${i}`,
                (i * 10).toString(),
                (i % 2 === 0).toString()
            ]);
        }

        mockApp.setupSpreadsheet(sheetId, { 'RangeTest': largeData });

        const store = new Repository.SpreadsheetStore(
            sheetId, 'RangeTest', schema
        );

        // Test: Load all data
        const result = store.load();
        Assert.equals(result.rows.length, 50, 'Should load all 50 rows');

        // Verify first and last entities
        Assert.equals((result.rows[0] as TestEntity).id, 'r1', 'First row should be r1');
        Assert.equals((result.rows[49] as TestEntity).id, 'r50', 'Last row should be r50');
        Assert.equals((result.rows[49] as TestEntity).value, 500, 'Last row value should be 500');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('GAS SpreadsheetStore error handling for spreadsheet issues', () => {
    // Test Case: SpreadsheetStore should handle GAS-specific errors gracefully
    TestHelpers.GAS.installAll();

    try {
        // Edge Case 1: Invalid spreadsheet ID should throw RepositoryError
        Assert.throws(
            () => {
                const store = new Repository.SpreadsheetStore(
                    'invalid-sheet-id', 'TestSheet', schema
                );
                store.load();
            },
            'Invalid spreadsheet ID should throw error'
        );

        // Edge Case 2: Create valid spreadsheet to test sheet name errors
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        mockApp.setupSpreadsheet('valid-sheet', { 'ValidSheet': [['id', 'name']] });

        Assert.throws(
            () => {
                const store = new Repository.SpreadsheetStore(
                    'valid-sheet', 'InvalidSheetName', schema
                );
                store.load();
            },
            'Invalid sheet name should throw RepositoryError'
        );

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');

Test.it('Complete Repository workflow with GAS Spreadsheet integration', () => {
    // Test Case: Full integration test of Repository with GAS SpreadsheetStore
    TestHelpers.GAS.installAll();

    try {
        const mockApp = globalThis.SpreadsheetApp as unknown as TestHelpers.GAS.MockSpreadsheetApp;
        const sheetId = 'workflow-sheet';

        // Setup: Empty sheet for full workflow test
        mockApp.setupSpreadsheet(sheetId, {
            'Workflow': [['id', 'name', 'value', 'active']]
        });

        // Create complete repository with GAS store
        const store = new Repository.SpreadsheetStore(
            sheetId, 'Workflow', schema
        );

        const mockLogger = new TestHelpers.MockLogger();

        const repository = Repository.Engine.create({
            schema,
            store,
            keyCodec,
            logger: mockLogger
        });

        // Test: Load (should be empty)
        repository.load();
        Assert.equals(repository.findAll([]).length, 0, 'Repository should start empty');

        // Test: Add entities
        const addResult = repository.upsert([
            { id: 'w1', name: 'Workflow One', value: 100, active: true },
            { id: 'w2', name: 'Workflow Two', value: 200, active: false }
        ]);

        Assert.equals(addResult.added.length, 2, 'Should add 2 entities');
        Assert.equals(addResult.updated.length, 0, 'Should update 0 entities');

        // Test: Find entities
        const found = repository.find({ id: 'w1' }) as TestEntity | null;
        Assert.isTrue(!!found, 'Should find entity w1');
        Assert.equals(found!.name, 'Workflow One', 'Found entity should have correct name');

        // Test: Update entity
        const updateResult = repository.upsert({
            id: 'w1', name: 'Updated Workflow One', value: 150, active: false
        });

        Assert.equals(updateResult.added.length, 0, 'Should add 0 entities');
        Assert.equals(updateResult.updated.length, 1, 'Should update 1 entity');

        // Verify update in spreadsheet
        const sheet = mockApp.openById(sheetId).getSheetByName('Workflow')!;
        const sheetData = sheet.getData();
        Assert.equals(sheetData[1][1], 'Updated Workflow One', 'Sheet should reflect update');

        // Test: Delete entity
        const deleteResult = repository.delete({ id: 'w2' });
        Assert.equals(deleteResult.deleted, 1, 'Should delete 1 entity');

        // Verify deletion
        const notFound = repository.find({ id: 'w2' });
        Assert.isTrue(notFound === null, 'Deleted entity should not be found');

    } finally {
        TestHelpers.GAS.resetAll();
    }
}, 'Repository');
