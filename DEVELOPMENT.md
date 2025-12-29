# 開発ガイド

## コード品質チェック

### 全ファイルのエラー/警告をチェック

VS Codeの「問題」ウィンドウは**開いているファイルのみ**を表示します。全ファイルをチェックするには以下のコマンドを使用してください：

#### 1. ESLint（コードスタイル・潜在的なバグ）
```bash
npm run lint
```

エラーを自動修正：
```bash
npm run lint:fix
```

#### 2. TypeScript型チェック（型エラー）
```bash
npm run type-check
```

#### 3. テスト実行
```bash
npm test
```

#### 4. 全チェック（lint + 型チェック + テスト）を一括実行
```bash
npm run check
```

このコマンドは以下を順次実行します：
1. ESLint（全ファイル）
2. TypeScript型チェック（全ファイル）
3. Jest テストスイート（208テスト）

**推奨**: コミット前に `npm run check` を実行してください。

---

## CI/CDでの使用

GitHubActionsやその他のCIツールでは、以下のワークフローを推奨：

```yaml
- name: Lint
  run: npm run lint
  
- name: Type Check
  run: npm run type-check
  
- name: Test
  run: npm test
```

または簡潔に：

```yaml
- name: Quality Check
  run: npm run check
```

---

## エラーの種類

### ESLintエラー/警告
- **内容**: コードスタイル、未使用変数、潜在的なバグ
- **確認**: `npm run lint`
- **修正**: `npm run lint:fix`（自動修正可能なもの）

### TypeScript型エラー
- **内容**: 型の不一致、未定義のプロパティ、型引数の誤り
- **確認**: `npm run type-check`
- **修正**: 手動でコードを修正

### テスト失敗
- **内容**: 単体テスト・統合テストの失敗
- **確認**: `npm test`
- **修正**: テストコードまたは実装コードを修正

---

## GASテストファイルの特殊性

`test/Modules/` 内のファイルはGAS環境専用で、多くの型エラーが発生します。これらは以下で無効化されています：

- `// @ts-nocheck` - TypeScript型チェックを無効化
- `/* eslint-disable */` - ESLintチェックを無効化

これらのファイルはGASランタイムでのみ実行され、Node.js環境では実行されません。

---

## 開発ワークフロー

1. **コーディング**
   ```bash
   npm run watch  # 自動ビルド
   npm run test:watch  # テスト自動実行
   ```

2. **コミット前チェック**
   ```bash
   npm run check
   ```

3. **GASデプロイ**
   ```bash
   npm run gas:push  # ビルド + clasp push
   npm run gas:test  # GAS環境でテスト実行
   ```

---

## トラブルシューティング

### 「問題」ウィンドウにエラーが表示されない
→ そのファイルが開かれていない可能性があります。`npm run check` で全ファイルをチェックしてください。

### lint/type-checkは通るのに「問題」ウィンドウにエラーが出る
→ VS Codeを再起動してください。または、該当ファイルを閉じて再度開いてください。

### テストが遅い
→ 特定のテストファイルのみ実行: `npm test -- repository.test.ts`
