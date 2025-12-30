/**
 * Repository 共通テストケース
 * このファイルは GAS と Node.js 両方で実行される
 */

import * as Test from '@/testing/Test';
import * as Assert from '@/testing/Assert';
import * as Repository from '@/repository';

type User = { id: string; org: string; name: string; age: number | null };
type Key = 'id' | 'org';

const createTestSchema = (): Repository.Types.Ports.Schema<User, Key> => ({
  parameters: ['id', 'org', 'name', 'age'],
  keyParameters: ['id', 'org'],
  instantiate() { return { id: '', org: '', name: '', age: null }; },
  fromPartial(p: Partial<User>) {
    return {
      id: String(p.id ?? ''),
      org: String(p.org ?? ''),
      name: String(p.name ?? ''),
      age: (p.age == null ? null : Number(p.age))
    };
  },
  onBeforeSave(e) { return { ...e, name: e.name.trim() }; },
  onAfterLoad(raw) { return raw as User; },
  schemaVersion: 1
});

const createTestCodec = (): Repository.Types.Ports.KeyCodec<User, Key> => {
  return {
    stringify(key: Pick<User, Key>): string {
      return [key.id, key.org].map(v => (v == null ? '' : String(v))).join(',');
    },
    parse(s: string): Pick<User, Key> {
      const parts = s.split(',');
      return { id: parts[0], org: parts[1] } as Pick<User, Key>;
    }
  };
};

const createTestLogger = () => ({
  info(_: string) { },
  error(_: string) { }
});

Test.it('upsert: 新規追加', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  const result = repo.upsert({ id: 'u1', org: 'o1', name: ' Alice ', age: 20 });
  Assert.equals(result.added.length, 1, '1件追加');
  Assert.equals(result.updated.length, 0, '更新0件');
}, 'Repository');

Test.it('upsert: 既存の更新', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  repo.upsert({ id: 'u1', org: 'o1', name: 'Alice', age: 20 });
  const result = repo.upsert({ id: 'u1', org: 'o1', name: 'Alice A', age: 21 });

  Assert.equals(result.added.length, 0, '追加0件');
  Assert.equals(result.updated.length, 1, '1件更新');
}, 'Repository');

Test.it('upsert: バッチ操作（追加と更新）', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  repo.upsert({ id: 'u1', org: 'o1', name: 'Alice', age: 20 });

  const result = repo.upsert([
    { id: 'u2', org: 'o1', name: 'Bob', age: null },
    { id: 'u1', org: 'o1', name: 'Alice A', age: 21 }
  ]);

  Assert.equals(result.added.length, 1, '1件追加');
  Assert.equals(result.updated.length, 1, '1件更新');
}, 'Repository');

Test.it('find: 複合キーによる検索', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  repo.upsert({ id: 'u1', org: 'o1', name: 'Alice', age: 20 });
  const found = repo.find({ id: 'u1', org: 'o1' });

  Assert.isTrue(!!found && found.name === 'Alice' && found.age === 20, 'findで取得できる');
}, 'Repository');

Test.it('findAll: フィルター条件による検索', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  repo.upsert([
    { id: 'u1', org: 'o1', name: 'Alice', age: 20 },
    { id: 'u2', org: 'o1', name: 'Bob', age: 25 },
    { id: 'u3', org: 'o2', name: 'Carol', age: 30 }
  ]);

  const results = repo.entities.filter((u: User) => u.org === 'o1');
  Assert.equals(results.length, 2, 'org=o1のレコードが2件');
}, 'Repository');

Test.it('delete: キーによる削除', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  repo.upsert({ id: 'u1', org: 'o1', name: 'Alice', age: 20 });
  const deleted = repo.delete({ id: 'u1', org: 'o1' });
  const found = repo.find({ id: 'u1', org: 'o1' });

  Assert.isTrue(deleted.deleted === 1, '1件削除');
  Assert.isTrue(found === null, '削除後は見つからない');
}, 'Repository');

Test.it('onBeforeSave: 保存前処理', () => {
  const store = new Repository.Adapters.Memory.Store<User>();
  const repo = Repository.Engine.create<User, Key>({
    schema: createTestSchema(),
    store,
    keyCodec: createTestCodec(),
    logger: createTestLogger()
  });
  repo.load();

  repo.upsert({ id: 'u1', org: 'o1', name: '  Alice  ', age: 20 });
  const found = repo.find({ id: 'u1', org: 'o1' });

  Assert.equals(found?.name, 'Alice', 'trimが適用される');
}, 'Repository');

Test.it('keyCodec: キーのエンコード/デコード', () => {
  const codec = createTestCodec();
  const key = { id: 'u1', org: 'o1' };
  const encoded = codec.stringify(key);
  const decoded = codec.parse(encoded);

  Assert.equals(encoded, 'u1,o1', 'エンコード結果');
  Assert.equals(decoded.id, 'u1', 'デコード結果: id');
  Assert.equals(decoded.org, 'o1', 'デコード結果: org');
}, 'Repository');
