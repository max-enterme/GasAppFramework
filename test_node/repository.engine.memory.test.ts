/**
 * Repository Engine Memory Tests
 * Tests for Repository.Engine.create with Memory store adapter
 */

import { expect, test, describe } from '@jest/globals';

// Import the repository proxy that exposes Repository.Engine.create
import { RepositoryProxy as Repository } from './repository-module';

type User = { id: string; name: string };

describe('Repository.Engine (Memory)', () => {
    test('upsert/add/find/update/delete/entities', () => {
        // Create the repository using Repository.Engine.create (via proxy)
        const repo = Repository.Engine.create({
            schema: {
                parameters: ['id', 'name'],
                keyParameters: ['id'],
                instantiate: () => ({ id: '', name: '' }),
                fromPartial: (p: Partial<User>) => ({ 
                    id: String(p.id ?? ''), 
                    name: String(p.name ?? '') 
                })
            },
            store: new Repository.Adapters.Memory.Store<User>(),
            keyCodec: Repository.Codec.simple<User, 'id'>()
        });

        // Load the repository
        repo.load();

        // 新規追加
        repo.upsert({ id: '1', name: 'Alice' });
        expect(repo.find({ id: '1' })).toEqual({ id: '1', name: 'Alice' });

        // 更新
        repo.upsert({ id: '1', name: 'Bob' });
        expect(repo.find({ id: '1' })).toEqual({ id: '1', name: 'Bob' });

        // 追加
        repo.upsert({ id: '2', name: 'Carol' });
        expect(repo.entities.length).toBe(2);

        // 削除
        repo.delete({ id: '1' });
        expect(repo.find({ id: '1' })).toBeNull();
        expect(repo.entities.length).toBe(1);
    });
});