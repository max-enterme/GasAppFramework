# GAS Deployment and Testing Guide

このガイドでは、Google Apps Script (GAS) 環境へのデプロイとテスト実行方法を説明します。

## セットアップ

### 1. Clasp のインストール

```bash
npm install -g @google/clasp
clasp login
```

### 2. GAS プロジェクトの作成または接続

新規プロジェクト:
```bash
clasp create --type standalone --title "GasAppFramework"
```

既存プロジェクト:
```bash
# .clasp.json にスクリプトIDが設定されていることを確認
cat .clasp.json
```

### 3. デプロイメント URL の設定

`.gas-config.example.json` をコピーして `.gas-config.json` を作成:

```bash
cp .gas-config.example.json .gas-config.json
```

`.gas-config.json` を編集してデプロイメント URL を設定:

```json
{
  "deploymentUrl": "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec",
  "scriptId": "YOUR_SCRIPT_ID"
}
```

## ビルドとデプロイ

### ビルド

```bash
npm run build
```

これにより、`build/` ディレクトリに以下のファイルが生成されます:
- `bundle.js` - フレームワークコード
- `main.js` - doGet ハンドラー

### GAS へプッシュ

```bash
npm run gas:push
```

または手動で:

```bash
clasp push
```

### デプロイ

```bash
npm run gas:deploy
```

または手動で:

```bash
clasp deploy --description "Test deployment $(date)"
```

デプロイ後、Web アプリの URL を `.gas-config.json` に設定してください。

## テストの実行

### Web インターフェースで実行

ブラウザで Web アプリの URL を開きます:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

#### クエリパラメータ

- `?list=true` - すべてのテストを一覧表示
- `?category=Repository` - 特定のカテゴリのテストのみ実行
- `?format=json` - JSON 形式で結果を取得（CLI 用）

### CLI から実行

```bash
# すべてのテストを実行
npm run gas:test

# 特定のカテゴリのテストを実行
npm run gas:test -- --category=Repository

# テスト一覧を表示
npm run gas:test -- --list
```

### 手動で URL を指定

```bash
GAS_DEPLOYMENT_URL="https://script.google.com/macros/s/YOUR_ID/exec" npm run gas:test
```

## ワークフロー

### 開発サイクル

1. コードを編集
2. ローカルでテスト: `npm test`
3. ビルド: `npm run build`
4. GAS へプッシュ: `npm run gas:push`
5. GAS でテスト: `npm run gas:test`

### 本番デプロイ

1. すべてのテストが通ることを確認
   ```bash
   npm test && npm run gas:test
   ```

2. 新しいバージョンをデプロイ
   ```bash
   npm run gas:deploy
   ```

3. デプロイ ID を更新

## トラブルシューティング

### エラー: GAS_DEPLOYMENT_URL not set

`.gas-config.json` を作成し、デプロイメント URL を設定してください。

### エラー: Request failed

1. Web アプリが正しくデプロイされているか確認
2. Web アプリのアクセス権限が "Anyone" または "Anyone with the link" になっているか確認
3. デプロイメント URL が正しいか確認

### テストが実行されない

1. `build/main.js` に `doGet` 関数が含まれているか確認
2. GAS エディタでエラーログを確認
3. Web アプリを再デプロイ

## GAS エディタで直接実行

GAS エディタでテストを実行する関数:

```javascript
// すべてのテストを実行
function runAllTests() {
  const e = { parameter: {} };
  const output = doGet(e);
  Logger.log(output.getContent());
}

// 特定のカテゴリのテストを実行
function runRepositoryTests() {
  const e = { parameter: { category: 'Repository' } };
  const output = doGet(e);
  Logger.log(output.getContent());
}
```

## CI/CD との統合

### GitHub Actions の例

```yaml
name: GAS Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
      - run: npm run build
      - run: npm run gas:push
        env:
          CLASPRC_ACCESS_TOKEN: ${{ secrets.CLASPRC_ACCESS_TOKEN }}
      - run: npm run gas:test
        env:
          GAS_DEPLOYMENT_URL: ${{ secrets.GAS_DEPLOYMENT_URL }}
```
