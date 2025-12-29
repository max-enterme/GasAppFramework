# クイックスタート: GAS テスト実行

## 1. ビルド

```bash
npm run build
```

## 2. GAS へプッシュ

```bash
npm run gas:push
```

初回の場合、GAS エディタが開くので Web アプリとしてデプロイしてください:

1. 右上の「デプロイ」→「新しいデプロイ」
2. 種類の選択: 「ウェブアプリ」
3. 説明: 任意（例: "Test deployment"）
4. 実行ユーザー: 「自分」
5. アクセスできるユーザー: 「全員」
6. 「デプロイ」をクリック
7. **Web アプリの URL をコピー**

## 3. 設定ファイルを作成

```bash
cp .gas-config.example.json .gas-config.json
```

`.gas-config.json` を編集して、コピーした URL を設定:

```json
{
  "deploymentUrl": "https://script.google.com/macros/s/AKfycbxxx.../exec",
  "scriptId": "12pGIYttX0vZE3schx4jZCvJACL19x32sMChNkzfOrPiZAyAPfYI0QPot"
}
```

## 4. テストを実行

```bash
npm run gas:test
```

### カテゴリ別に実行

```bash
npm run gas:test -- --category=Repository
npm run gas:test -- --category=Locking
npm run gas:test -- --category=GasDI
```

### ブラウザで確認

Web アプリの URL を開いて、ブラウザで結果を確認することもできます:

```
https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

## トラブルシューティング

### エラー: No files matching the pattern "build/**"

ビルドを実行してください: `npm run build`

### エラー: GAS_DEPLOYMENT_URL not set

`.gas-config.json` を作成して URL を設定してください。

### テストが空

`test/Modules/` 配下のテストファイルが GAS にプッシュされているか確認してください。
`.claspignore` を確認し、必要に応じて調整してください。

## 開発フロー

```bash
# 1. コードを編集
# 2. ローカルテスト
npm test

# 3. ビルド & プッシュ
npm run gas:push

# 4. GAS テスト
npm run gas:test
```
