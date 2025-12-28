# GasAppFramework - Complete ES Modules Migration Plan

## 現在の状態

### ✅ 完了済み (Phase 1)
- **modules/di/** - DI Container機能（ES Modules化済み）
  - Container.ts, Context.ts, Decorators.ts, Types.ts, GenericFactory.ts
  - webpack build成功（51.6 KiB）
  - 統合テスト: 11/11 PASS
- **modules/shared/** - 共通ユーティリティ（ES Modules化済み）
  - Time.ts, Errors.ts, CommonTypes.ts
- **webpack設定** - ビルド環境構築完了

### ✅ 完了済み (Phase 2)
- **modules/locking/** - Locking Module（ES Modules化済み）
  - Engine.ts, Adapters.ts, Types.ts
  - webpack build成功
- **modules/repository/** - Repository Module（ES Modules化済み）
  - Engine.ts, MemoryAdapter.ts, SpreadsheetAdapter.ts, Codec.ts, SchemaFactory.ts, Errors.ts, Types.ts
  - webpack build成功
- **modules/routing/** - Routing Module（ES Modules化済み）
  - Engine.ts, Types.ts
  - webpack build成功
- **modules/string-helper/** - StringHelper Module（ES Modules化済み）
  - index.ts
  - webpack build成功

### 🔄 移行対象モジュール

#### Phase 2: Core Modules（高優先度）

**2-A. Locking Module** (src/core/modules/Locking/)
- [x] Engine.ts - ロックエンジン実装
- [x] Adapters.GAS.ts - GAS PropertiesStore, Clock, Logger実装
- [x] Core.Types.d.ts - 型定義
- **移行先**: modules/locking/
- **依存関係**: Shared.Types.Clock, Shared.Types.Logger
- **推定行数**: ~150行
- **✅ 完了**: webpack build成功 (51.6 KiB)

**2-B. Repository Module** (src/core/modules/Repository/)
- [x] Engine.ts - Repository Engine実装
- [x] Adapters.GAS.Spreadsheet.ts - Spreadsheet adapter
- [x] Adapters.Memory.ts - Memory adapter
- [x] Codec.Simple.ts - Simple codec
- [x] SchemaFactory.ts - Schema factory
- [x] Errors.ts - Repository errors
- [x] Core.Types.d.ts - 型定義
- **移行先**: modules/repository/
- **依存関係**: Shared.DomainError
- **推定行数**: ~500行
- **✅ 完了**: webpack build成功

**2-C. Routing Module** (src/core/modules/Routing/)
- [x] Engine.ts - Routing engine実装
- [x] Core.Types.d.ts - 型定義
- **移行先**: modules/routing/
- **依存関係**: なし
- **推定行数**: ~100行
- **✅ 完了**: webpack build成功

**2-D. StringHelper Module** (src/core/modules/StringHelper/)
- [x] StringHelper.ts - 文字列ユーティリティ
- **移行先**: modules/string-helper/
- **依存関係**: なし
- **推定行数**: ~50行
- **✅ 完了**: webpack build成功

**2-E. GasDI Module** (src/core/modules/GasDI/)
- [x] GenericFactory.ts - Generic factory (namespace版削除、modules/di/に統合)
- **移行先**: modules/di/（既存に追加）
- **依存関係**: modules/di/
- **推定行数**: ~50行
- **✅ 完了**: webpack build成功

**2-F. Shared Module** (src/core/shared/)
- [x] Time.ts - ✅ 完了（modules/shared/）
- [x] Errors.ts - ✅ 完了（modules/shared/）
- [x] CommonTypes.d.ts - 共通型定義の移行確認
- [x] ErrorTypes.d.ts - エラー型定義の移行確認
- **移行先**: modules/shared/（既存に追加）
- **✅ 完了**: CommonTypes.ts作成、webpack build成功

#### Phase 3: RestFramework（中優先度）

**3-A. RestFramework Core** (src/core/restframework/)
- [ ] executor/RouteExecutor.ts - Route executor
- [ ] controllers/ApiController.ts - API controller base
- [ ] Core.Types.d.ts - 型定義
- **移行先**: modules/rest-framework/core/
- **推定行数**: ~200行

**3-B. RestFramework Payloads**
- [ ] payloads/NormalizedRequest.ts
- [ ] payloads/NormalizedRequestMapper.ts
- [ ] payloads/SchemaRequestMapper.ts
- **移行先**: modules/rest-framework/payloads/
- **推定行数**: ~150行

**3-C. RestFramework Utilities**
- [ ] errors/ErrorHandler.ts
- [ ] logging/Logger.ts
- [ ] formatters/ApiResponseFormatter.ts
- **移行先**: modules/rest-framework/utilities/
- **推定行数**: ~150行

**3-D. RestFramework Interfaces**
- [ ] interfaces/ApiLogic.ts
- [ ] interfaces/RequestMapper.ts
- [ ] interfaces/ResponseMapper.ts
- **移行先**: modules/rest-framework/interfaces/
- **推定行数**: ~100行

**3-E. RestFramework Optional**
- [ ] optional-utilities/AuthService.ts
- [ ] optional-utilities/MiddlewareManager.ts
- [ ] optional-utilities/RequestValidator.ts
- **移行先**: modules/rest-framework/optional/
- **推定行数**: ~150行

#### Phase 4: Testing Framework（低優先度）

**4-A. Testing Common** (src/testing/common/)
- [ ] Test.ts - Test class (namespace T)
- [ ] Runner.ts - Test runner (namespace TRunner)
- [ ] Assert.ts - Assertion utilities (namespace TAssert)
- **移行先**: modules/testing/common/
- **推定行数**: ~200行

**4-B. Testing GAS** (src/testing/gas/)
- [ ] GasReporter.ts - GAS test reporter (namespace TGasReporter)
- [ ] TestHelpers.ts - Test helpers (namespace TestHelpers)
- **移行先**: modules/testing/gas/
- **推定行数**: ~100行

**4-C. Testing Node** (src/testing/node/)
- [ ] test-adapter.ts
- [ ] test-utils.ts
- **移行先**: modules/testing/node/
- **推定行数**: ~100行

#### Phase 5: doGet Test Runner（高優先度・新規機能）

**5-A. Web App Test Runner** (新規実装)
- [ ] WebTestRunner.ts - doGet経由でテストを実行するメインランナー
- [ ] HtmlReporter.ts - テスト結果をHTML形式で出力
- [ ] TestRegistry.ts - テストケースの登録・管理機構
- [ ] Types.d.ts - Web App Test Runner型定義
- **移行先**: modules/test-runner/
- **依存関係**: modules/testing/common/, modules/testing/gas/
- **推定行数**: ~300行

**5-B. Project Test Integration** (新規実装)
- [ ] ProjectTestAdapter.ts - 参照先プロジェクト（YTamaLeagueManagement等）のテスト統合アダプター
- [ ] TestDiscovery.ts - プロジェクトのテストケース自動検出機構
- [ ] ConfigLoader.ts - テスト設定の読み込み
- **移行先**: modules/test-runner/integration/
- **依存関係**: modules/test-runner/
- **推定行数**: ~200行

**設計原則**:

1. **GasAppFramework自体のテストコード分離**
   ```
   @dependencies/GasAppFramework/
   ├── modules/test-runner/        # テストランナー本体（参照先に提供）
   │   ├── WebTestRunner.ts
   │   ├── HtmlReporter.ts
   │   ├── TestRegistry.ts
   │   ├── Types.d.ts
   │   └── integration/
   │       ├── ProjectTestAdapter.ts
   │       ├── TestDiscovery.ts
   │       └── ConfigLoader.ts
   ├── test/                        # GasAppFramework自体のテスト（参照先に含めない）
   │   ├── di.test.ts
   │   ├── locking.test.ts
   │   └── ...
   └── examples/                    # 参照先プロジェクトでの使用例
       └── doGet-test-setup.ts
   ```

2. **参照先プロジェクトでの使用方法**
   ```typescript
   // YTamaLeagueManagement/src/40_infrastructure/doGet.ts
   import { WebTestRunner, TestRegistry } from 'gas-app-framework/test-runner';
   
   function doGet(e: GoogleAppsScript.Events.DoGet) {
     if (e.parameter.test) {
       // GasAppFrameworkのテストランナーを使用
       const runner = new WebTestRunner();
       
       // プロジェクト固有のテストを登録
       TestRegistry.register('MatchUseCase Tests', () => {
         // テストケース実装
       });
       
       return runner.execute();
     }
     // 通常のWeb App処理
   }
   ```

3. **テストコード分離のwebpack設定**
   - GasAppFrameworkのtest/ディレクトリはバンドルに含めない
   - modules/test-runner/のみをエクスポート
   - 参照先プロジェクトは独自のテストコードを実装

4. **機能要件**
   - [ ] doGet経由でテスト実行可能（`?test=1`パラメータ等）
   - [ ] テスト結果をブラウザで確認可能（HTML形式）
   - [ ] テストケースの動的登録機構
   - [ ] テストフィルタリング（特定テストのみ実行）
   - [ ] エラー詳細表示（スタックトレース含む）
   - [ ] 実行時間計測
   - [ ] 成功/失敗のサマリー表示
   - [ ] 参照先プロジェクトのテストコードのみ実行

5. **セキュリティ考慮事項**
   - [ ] 本番環境でのテスト実行を制限する機構（環境変数チェック等）
   - [ ] テスト実行権限の制御
   - [ ] 機密情報の出力防止

**実装例**:
```typescript
// modules/test-runner/WebTestRunner.ts
export class WebTestRunner {
  private registry: TestRegistry;
  private reporter: HtmlReporter;
  
  constructor() {
    this.registry = TestRegistry.getInstance();
    this.reporter = new HtmlReporter();
  }
  
  execute(filter?: string): GoogleAppsScript.HTML.HtmlOutput {
    const tests = this.registry.getTests(filter);
    const results = this.runTests(tests);
    return this.reporter.render(results);
  }
  
  private runTests(tests: TestCase[]): TestResult[] {
    // テスト実行ロジック
  }
}

// modules/test-runner/TestRegistry.ts
export class TestRegistry {
  private static instance: TestRegistry;
  private tests: Map<string, TestCase>;
  
  static register(name: string, testFn: () => void): void {
    this.getInstance().tests.set(name, { name, testFn });
  }
  
  static getInstance(): TestRegistry {
    if (!this.instance) {
      this.instance = new TestRegistry();
    }
    return this.instance;
  }
  
  getTests(filter?: string): TestCase[] {
    // フィルタリングロジック
  }
}

// modules/test-runner/HtmlReporter.ts
export class HtmlReporter {
  render(results: TestResult[]): GoogleAppsScript.HTML.HtmlOutput {
    const html = this.generateHtml(results);
    return HtmlService.createHtmlOutput(html)
      .setTitle('Test Results')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  }
  
  private generateHtml(results: TestResult[]): string {
    // HTML生成ロジック（成功/失敗のスタイル付き）
  }
}
```

**推定工数**: 2-3日
- WebTestRunner基本実装: 1日
- HtmlReporter + TestRegistry: 0.5日
- ProjectTestAdapter + 統合機構: 1日
- テスト・ドキュメント: 0.5日

## 移行戦略

### アーキテクチャ原則

1. **namespace → export/import完全変換**
   - `namespace Locking.Engine { ... }` → `export class Engine { ... }`
   - `namespace Repository.Adapters.GAS { ... }` → `export namespace Adapters { export class GAS { ... } }`

2. **モジュール構造**
   ```
   modules/
   ├── di/              # ✅ 完了
   ├── shared/          # ✅ 完了
   ├── locking/         # Phase 2-A
   ├── repository/      # Phase 2-B
   ├── routing/         # Phase 2-C
   ├── string-helper/   # Phase 2-D
   ├── rest-framework/  # Phase 3
   │   ├── core/
   │   ├── payloads/
   │   ├── utilities/
   │   ├── interfaces/
   │   └── optional/
   ├── testing/         # Phase 4
   │   ├── common/
   │   ├── gas/
   │   └── node/
   ├── test-runner/     # Phase 5 (新規)
   │   ├── WebTestRunner.ts
   │   ├── HtmlReporter.ts
   │   ├── TestRegistry.ts
   │   ├── Types.d.ts
   │   └── integration/
   │       ├── ProjectTestAdapter.ts
   │       ├── TestDiscovery.ts
   │       └── ConfigLoader.ts
   └── index.ts         # メインエントリーポイント（更新）
   ```

3. **依存関係解決**
   - GAS APIへの依存: 型定義で分離（@types/google-apps-script）
   - モジュール間依存: import文で明示的に記述
   - 循環依存の回避: interfaces/型定義の分離

4. **webpack設定更新**
   - entry: modules/index.ts（全モジュールをエクスポート）
   - output: build/bundle.js
   - externals: Google Apps Script API（GAS環境で提供される前提）

5. **テスト戦略**
   - 各モジュールごとに統合テスト作成
   - Node.js環境でのテスト実行
   - GAS API依存部分はモック化

### 実装手順（各Phase共通）

#### Step 1: ディレクトリ構造作成
```bash
mkdir -p modules/<module-name>
```

#### Step 2: namespace → ES Modules変換
- namespace宣言をexport/importに変換
- 相対importパスの確立
- 型定義の整理

#### Step 3: webpack設定更新
- modules/index.tsにエクスポート追加
- ビルド確認

#### Step 4: テスト実装
- 各モジュールの統合テスト作成
- npm testで検証

#### Step 5: ドキュメント更新
- README更新
- Features.md進捗更新
- 移行完了マーク

### 品質基準

各Phaseの完了条件:
- ✅ webpack build成功
- ✅ 全テストPASS
- ✅ TypeScript型チェックPASS
- ✅ README/ドキュメント更新
- ✅ src/配下のnamespaceファイル削除確認

## 推定工数

- **Phase 2 (Core Modules)**: 5-7日
  - Locking: 1日
  - Repository: 2日
  - Routing: 1日
  - StringHelper: 0.5日
  - GasDI GenericFactory統合: 0.5日
  - Shared型定義確認: 0.5日

- **Phase 3 (RestFramework)**: 4-5日
  - Core: 1日
  - Payloads: 1日
  - Utilities: 1日
  - Interfaces: 0.5日
  - Optional: 1日

- **Phase 4 (Testing)**: 2-3日
  - Common: 1日
  - GAS: 0.5日
  - Node: 0.5日

- **Phase 5 (doGet Test Runner)**: 2-3日
  - WebTestRunner基本実装: 1日
  - HtmlReporter + TestRegistry: 0.5日
  - ProjectTestAdapter + 統合機構: 1日
  - テスト・ドキュメント: 0.5日

**合計**: 13-18日

## 技術的課題と解決策

### 課題1: GAS API依存
**問題**: PropertiesService, Logger等のGAS APIへの依存
**解決策**: Adapter patternで分離、型定義のみ参照

### 課題2: namespace階層構造
**問題**: `Repository.Adapters.GAS.SpreadsheetAdapter`等の深い階層
**解決策**: ES Modulesでは`export namespace Adapters { export namespace GAS { ... } }`またはファイル分割

### 課題3: 循環依存
**問題**: モジュール間の相互参照
**解決策**: interfaces/型定義の分離、依存方向の明確化

### 課題4: 既存コードとの互換性
**問題**: YTamaLeagueManagementからの既存参照
**解決策**: 
- 新規コード: `import { Container } from 'gas-app-framework'`
- 移行期間: namespace版とES Modules版を並行維持
- 最終的にnamespace版削除

### 課題5: テストコードの分離
**問題**: GasAppFramework自体のテストコードを参照先プロジェクトに含めたくない
**解決策**:
- GasAppFrameworkのtest/ディレクトリはwebpackバンドルから除外
- modules/test-runner/のみを参照先に提供
- 参照先プロジェクトは独自のテストコードを実装
- webpack設定でtest/ディレクトリを明示的に除外
  ```javascript
  module.exports = {
    entry: './modules/index.ts',
    // test/ディレクトリはエントリーポイントに含めない
  };
  ```

### 課題6: doGet環境でのテスト実行
**問題**: GAS環境ではNode.jsのテストフレームワークが使えない
**解決策**:
- Web App（doGet）経由でテストを実行する専用ランナーを実装
- テスト結果をHTML形式でブラウザに表示
- TestRegistryパターンでテストケースを動的登録
- 参照先プロジェクトのテストコードのみを実行

## 成功基準

### Phase 2完了時
- [ ] 全Core Modulesが`gas-app-framework`からimport可能
- [ ] webpack build成功（bundle.js生成）
- [ ] 統合テスト全PASS（50+テストケース）
- [ ] src/core/modules/配下のnamespaceファイル削除可能

### Phase 3完了時
- [ ] RestFrameworkが完全ES Modules化
- [ ] API開発で`import { RestFramework } from 'gas-app-framework'`利用可能
- [ ] 統合テスト全PASS（30+テストケース）

### Phase 4完了時
- [ ] Testing Frameworkが完全ES Modules化
- [ ] テスト開発で`import { Testing } from 'gas-app-framework'`利用可能
- [ ] 統合テスト全PASS（20+テストケース）

### Phase 5完了時
- [ ] doGet Test Runnerが実装完了
- [ ] 参照先プロジェクト（YTamaLeagueManagement）でdoGet経由のテスト実行可能
- [ ] GasAppFramework自体のテストコードが参照先バンドルに含まれない
- [ ] HTML形式のテスト結果表示が動作
- [ ] テストケースの動的登録・フィルタリング機能が動作
- [ ] 統合テスト全PASS（15+テストケース）
- [ ] 使用例ドキュメント作成完了

### 最終完了時
- [ ] src/配下の全namespaceファイル削除
- [ ] build/bundle.jsサイズ: 50 KiB以下
- [ ] 全統合テスト115+ケースPASS
- [ ] ドキュメント完全更新
- [ ] YTamaLeagueManagementで実戦投入可能
- [ ] doGet Test Runnerで参照先プロジェクトのテストが実行可能

## 次のアクション

1. **Phase 2-A開始**: Locking Module移行
   - modules/locking/ディレクトリ作成
   - Engine.ts, Adapters.ts変換
   - 統合テスト実装

2. **並行作業**: webpack設定の段階的更新
   - modules/index.tsにlockingエクスポート追加
   - ビルド確認

3. **継続作業**: Phase 2の残りモジュール移行
   - Repository → Routing → StringHelper → GasDI統合 → Shared確認

---

## エージェント向け指示

このFeatures.mdを読んだエージェントは、以下の手順で移行作業を進めてください：

1. **現在地確認**: 上記チェックリストで完了済み項目を確認
2. **次Phaseの選択**: 未完了の最上位Phaseを選択
3. **実装開始**:
   - ディレクトリ作成
   - namespace → ES Modules変換
   - webpack設定更新
   - テスト実装
4. **検証**:
   - `npx webpack --config webpack.config.js`
   - `npm test`
5. **Features.md更新**: 完了項目にチェックマーク追加
6. **コミット**: git commit & push
7. **次のPhaseへ**: Step 1に戻る

### コマンドテンプレート

```bash
# Phase開始
cd @dependencies/GasAppFramework
mkdir -p modules/<module-name>

# ビルド
npx webpack --config webpack.config.js

# テスト
npm test -- test/<module-name>.test.ts

# コミット
git add -A
git commit -m "feat(<module-name>): Complete ES Modules migration for <module-name>"
git push origin main
```

### 注意事項

- 各Phase完了ごとにFeatures.mdを更新
- テストは必ず11/11 PASS以上を維持
- webpack buildエラーは即座に解決
- 依存関係の変更はmodules/index.tsに反映
- namespace版のsrc/ファイルは移行完了後も保持（互換性のため、最終Phase完了まで）
