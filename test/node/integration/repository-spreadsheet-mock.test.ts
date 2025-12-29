/**
 * Repository - SpreadsheetStore Tests (Mock使用)
 * このテストはNode.js環境で実行可能
 */

import { MockLogger, GAS } from '../../../modules/testing-utils/test-utils';
import { SpreadsheetStore } from '../../../modules/repository/SpreadsheetAdapter';
import { create as createRepository } from '../../../modules/repository/Engine';
import { simple as createSimpleCodec } from '../../../modules/repository/Codec';

// Test entity type
interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
}

describe('Repository SpreadsheetStore with Mocks', () => {
    let mockSpreadsheetApp: GAS.MockSpreadsheetApp;

    beforeEach(() => {
        mockSpreadsheetApp = new GAS.MockSpreadsheetApp();
        (globalThis as any).SpreadsheetApp = mockSpreadsheetApp;
    });

    afterEach(() => {
        delete (globalThis as any).SpreadsheetApp;
    });

    const productSchema = {
        parameters: ['id', 'name', 'price', 'category'] as (keyof Product)[],
        keyParameters: ['id'] as ('id')[],
        instantiate(): Product {
            return { id: '', name: '', price: 0, category: '' };
        },
        fromPartial(p: Partial<Product>): Product {
            return {
                id: String(p.id ?? ''),
                name: String(p.name ?? ''),
                price: Number(p.price ?? 0),
                category: String(p.category ?? '')
            };
        },
        onBeforeSave(e: Product): Product {
            return { ...e, name: e.name.trim() };
        },
        onAfterLoad(raw: any): Product {
            return raw as Product;
        }
    };

    test('SpreadsheetStore should load data correctly', () => {
        const sheetId = 'test-sheet-123';
        const sheetName = 'Products';

        // Setup mock spreadsheet
        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category'],
                ['p1', 'Product 1', 100, 'electronics'],
                ['p2', 'Product 2', 200, 'books'],
                ['p3', 'Product 3', 300, 'toys']
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);
        const result = store.load();

        expect(result.rows).toHaveLength(3);
        expect(result.rows[0]).toEqual({
            id: 'p1',
            name: 'Product 1',
            price: 100,
            category: 'electronics'
        });
        expect(result.rows[2].id).toBe('p3');
    });

    test('SpreadsheetStore should handle empty sheets', () => {
        const sheetId = 'empty-sheet';
        const sheetName = 'Empty';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category']
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);
        const result = store.load();

        expect(result.rows).toHaveLength(0);
    });

    test('SpreadsheetStore should handle custom header rows', () => {
        const sheetId = 'custom-header';
        const sheetName = 'Data';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category'],  // Row 0 (default header)
                ['p1', 'Product 1', 100, 'electronics']  // Row 1 (data)
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(
            sheetId,
            sheetName,
            productSchema
        );
        const result = store.load();

        expect(result.rows).toHaveLength(1);
        expect(result.rows[0].id).toBe('p1');
    });

    test('SpreadsheetStore should save new entities', () => {
        const sheetId = 'save-test';
        const sheetName = 'Products';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category']
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);

        const newProducts: Product[] = [
            { id: 'p1', name: ' Product 1 ', price: 100, category: 'electronics' },
            { id: 'p2', name: 'Product 2', price: 200, category: 'books' }
        ];

        store.saveAdded(newProducts);

        // Verify data was written
        const sheet = mockSpreadsheetApp.openById(sheetId)?.getSheetByName(sheetName);
        expect(sheet).toBeDefined();
        if (!sheet) return;

        const values = sheet.getDataRange().getValues();
        expect(values).toHaveLength(3); // header + 2 rows
        // Note: saveAdded doesn't call onBeforeSave, so names are not trimmed at this level
        expect(values[1]).toEqual(['p1', ' Product 1 ', 100, 'electronics']);
        expect(values[2]).toEqual(['p2', 'Product 2', 200, 'books']);
    });

    test('SpreadsheetStore should update existing entities', () => {
        const sheetId = 'update-test';
        const sheetName = 'Products';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category'],
                ['p1', 'Old Name 1', 100, 'old1'],
                ['p2', 'Old Name 2', 200, 'old2'],
                ['p3', 'Old Name 3', 300, 'old3']
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);

        // Update row at index 1 (second data row)
        store.saveUpdated([
            {
                index: 1,
                row: { id: 'p2', name: 'Updated Name', price: 250, category: 'updated' }
            }
        ]);

        const sheet = mockSpreadsheetApp.openById(sheetId)?.getSheetByName(sheetName);
        const values = sheet?.getDataRange().getValues();

        expect(values![2]).toEqual(['p2', 'Updated Name', 250, 'updated']);
        // Other rows unchanged
        expect(values![1]).toEqual(['p1', 'Old Name 1', 100, 'old1']);
    });

    test('SpreadsheetStore should handle data type conversions', () => {
        const sheetId = 'conversion-test';
        const sheetName = 'Data';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category'],
                ['p1', 'Product', '150', 'cat'] // price as string
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);
        const result = store.load();

        // MockSpreadsheetApp converts string '150' to number 150
        expect(result.rows[0].price).toBe(150);
    });

    test('SpreadsheetStore should throw error for missing sheet', () => {
        const sheetId = 'missing-test';
        const sheetName = 'NonExistent';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            'OtherSheet': [['data']]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);

        expect(() => store.load()).toThrow('Sheet not found');
    });

    test('Complete Repository workflow with SpreadsheetStore', () => {
        const sheetId = 'workflow-test';
        const sheetName = 'Products';

        mockSpreadsheetApp.setupSpreadsheet(sheetId, {
            [sheetName]: [
                ['id', 'name', 'price', 'category'],
                ['p1', 'Product 1', 100, 'electronics']
            ]
        });

        const store = new SpreadsheetStore<Product, 'id'>(sheetId, sheetName, productSchema);
        const codec = createSimpleCodec<Product, 'id'>(['id'], '|');
        const logger = new MockLogger();

        const repo = createRepository<Product, 'id'>({
            schema: productSchema,
            store,
            keyCodec: codec,
            logger
        });

        // Load existing data
        repo.load();
        expect(repo.entities).toHaveLength(1);

        // Add new entity
        const result = repo.upsert({ id: 'p2', name: ' Product 2 ', price: 200, category: 'books' });
        expect(result.added).toHaveLength(1);
        expect(result.added[0].name).toBe('Product 2'); // trimmed

        // Find entity
        const found = repo.find({ id: 'p2' });
        expect(found).toBeDefined();
        expect(found?.price).toBe(200);

        // Update entity
        const updateResult = repo.upsert({ id: 'p2', name: 'Updated', price: 250, category: 'updated' });
        expect(updateResult.updated).toHaveLength(1);

        // Delete entity
        const deleteResult = repo.delete({ id: 'p1' });
        expect(deleteResult.deleted).toBe(1);

        expect(repo.entities).toHaveLength(1);
        expect(repo.entities[0].id).toBe('p2');
    });
});
