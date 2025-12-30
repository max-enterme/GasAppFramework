# GitHub Actions セットアップガイド

このプロジェクトでは、GitHub ActionsとAIを使用してPRの品質チェックと自動修正候補の提案を行います。

## 📋 目次

- [概要](#概要)
- [セットアップ手順](#セットアップ手順)
- [ワークフローの説明](#ワークフローの説明)
- [トラブルシューティング](#トラブルシューティング)

## 概要

PRを作成すると、以下のチェックが自動実行されます：

1. **ESLint** - コード品質チェック
2. **TypeScript型チェック** - 型安全性の検証
3. **Jest テスト** - ユニットテストの実行
4. **AI修正候補** - エラーがあった場合、AIが修正方法を提案

## セットアップ手順

### 1. GitHub Secretsの設定

リポジトリに以下のシークレットを設定します：

1. GitHubリポジトリページで **Settings** > **Secrets and variables** > **Actions** を開く
2. **New repository secret** をクリック
3. 以下のシークレットを追加：

#### 🎉 GitHub Copilot Pro ユーザー（推奨・無料）

**追加設定不要！**

GitHub Copilot Pro契約があれば、**GitHub Models API** が自動的に利用できます：
- ✅ `GITHUB_TOKEN` は自動的に提供される（追加設定不要）
- ✅ GPT-4o、GPT-4o-mini、Claude 3.5 Sonnetなどが利用可能
- ✅ 追加料金なし（Copilot Pro料金に含まれる）
- ✅ 無料枠が提供される

> **注意:** `GITHUB_TOKEN` は GitHub Actions で自動的に利用可能なので、Secretsへの追加は不要です。

#### または: 外部AI APIキー（オプション）

GitHub Copilot契約がない場合、または別のAIサービスを使用したい場合：

**オプションA: Anthropic Claude**

```
Name: ANTHROPIC_API_KEY
Secret: sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Claude API キーの取得方法：**
1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. サインアップ/ログイン
3. API Keys セクションで新しいキーを作成
4. **Claude 3.5 Sonnet** が利用可能

**料金:** 従量課金（$3 / 1M input tokens, $15 / 1M output tokens）

**オプションB: OpenAI**

```
Name: OPENAI_API_KEY
Secret: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**OpenAI API キーの取得方法：**
1. [OpenAI Platform](https://platform.openai.com/) にアクセス
2. サインアップ/ログイン
3. API keys セクションで新しいキーを作成
4. **GPT-4o** が利用可能

**料金:** 従量課金（$2.5 / 1M input tokens, $10 / 1M output tokens）

> **優先順位:** GitHub Models API（Copilot Pro） > Claude > OpenAI の順で自動的に選択されます。

#### オプション: GASテスト自動化（推奨）

GASテストを自動実行したい場合、以下のシークレットを追加設定します：

**CLASPRC_JSON**
```
Name: CLASPRC_JSON
Secret: (ローカルの ~/.clasprc.json の内容)
```

**取得方法：**
1. ローカルで `clasp login` を実行して認証
2. `~/.clasprc.json` ファイルを開く（Windows: `%USERPROFILE%\.clasprc.json`）
3. ファイル全体の内容をコピー
4. GitHub Secretsに貼り付け

**GAS_CONFIG_JSON**
```
Name: GAS_CONFIG_JSON
Secret: (.gas-config.json の内容)
```

**設定方法：**
1. プロジェクトルートの `.gas-config.json` ファイルを開く
2. ファイル全体の内容をコピー
3. GitHub Secretsに貼り付け

例：
```json
{
  "clasprcPath": null,
  "deployments": {
    "headDeployId": "AKfycby...",
    "targetDeployId": "AKfycby..."
  }
}
```

> **セキュリティ注意:** `.clasprc.json` にはOAuthトークンが含まれます。必ずGitHub Secretsで管理し、リポジトリにコミットしないでください。

### 2. GASテスト自動化の有効化（オプション）

PRでGASテストを自動実行したい場合：

1. **Repository Variables** の設定
   - Settings > Secrets and variables > Actions > **Variables** タブ
   - **New repository variable** をクリック
   - 以下を追加：
     ```
     Name: ENABLE_GAS_TEST
     Value: true
     ```

2. **Secrets** の設定（上記の `CLASPRC_JSON` と `GAS_CONFIG_JSON`）

> **注意:** GASテストの自動化を有効にしない場合、変数の設定は不要です。手動トリガーワークフローは引き続き使用できます。

### 3. ワークフローの有効化

`.github/workflows/pr-check.yml` と `.github/workflows/gas-test.yml` がリポジトリに存在することを確認します。
これらのファイルは自動的にワークフローをトリガーします。

### 4. 動作確認

**基本チェックの確認:**
1. 新しいブランチを作成
2. 意図的にエラーを含むコードを追加（例: 型エラーやlintエラー）
3. PRを作成
4. GitHub Actionsが自動実行され、AIによる修正候補がコメントされる

**GASテストの確認（ENABLE_GAS_TEST=true の場合）:**
1. PRを作成または更新
2. `gas-test` ジョブが自動実行される
3. テスト結果がPRにコメントされる

**手動GASテストの実行:**
1. GitHub リポジトリの **Actions** タブを開く
2. **GAS Deploy and Test** ワークフローを選択
3. **Run workflow** をクリックして手動実行

## ワークフローの説明

### PR Quality Check (`pr-check.yml`)

**トリガー:** PR作成、更新、再オープン

**ジョブ1: lint-and-test**
1. コードのチェックアウト
2. Node.js環境のセットアップ
3. 依存関係のインストール
4. ESLint実行
5. TypeScript型チェック実行
6. Jestテスト実行
7. エラーがあればAI修正候補を生成
8. PRにコメントとして投稿

**ジョブ2: gas-test（オプション）**
- 条件: `ENABLE_GAS_TEST` 変数が `true` の場合のみ実行
- 処理:
  1. clasp認証情報をセットアップ
  2. GAS設定ファイルを作成
  3. `npm run gas:push` でデプロイ
  4. `npm run gas:test` でテスト実行
  5. 結果をPRにコメント

**成功条件:** すべてのチェックがエラーなく完了

### GAS Deploy and Test (`gas-test.yml`)

**トリガー:** 手動実行のみ（workflow_dispatch）

**パラメータ:**
- `deploy`: clasp pushを実行するか（デフォルト: true）
- `test`: GASテストを実行するか（デフォルト: true）

**実行内容:**
1. コードのチェックアウト
2. clasp認証情報のセットアップ
3. GAS設定ファイルの作成
4. プロジェクトのビルド
5. GASへのデプロイ（deploy=true の場合）
6. GASテストの実行（test=true の場合）
7. テスト結果のアップロード

**使用例:**
- デプロイとテストの両方を実行（デフォルト）
- テストのみ実行（deploy=false, test=true）
- デプロイのみ実行（deploy=true, test=false）

## AI修正候補の動作

エラーが検出されると、以下のようなコメントがPRに投稿されます：

```markdown
## 🔍 自動チェック結果

### ❌ チェックに失敗しました

以下の問題が見つかりました：
- ❌ ESLint エラー
- ❌ TypeScript 型チェックエラー

---

## 🤖 AI修正候補

### ESLintエラーの修正

**エラー:** `'foo' is assigned a value but never used`

**修正方法:**
1. 未使用の変数を削除する
2. または、変数名の前にアンダースコアを付ける（例: `_foo`）

...（AIによる詳細な提案）
```

**使用AI:**
1. **GitHub Models API** (Copilot Pro契約時) - 優先・無料
2. **Anthropic Claude** - ANTHROPIC_API_KEY設定時
3. **OpenAI GPT-4o** - OPENAI_API_KEY設定時

## トラブルシューティング

### エラー: "AI修正候補の生成に失敗しました"

**原因:** APIキーが設定されていない、または無効

**解決方法:**
1. GitHub Secretsで `ANTHROPIC_API_KEY` または `OPENAI_API_KEY` が正しく設定されているか確認
2. APIキーが有効期限切れでないか確認
3. APIの使用制限に達していないか確認

### エラー: "rate limit exceeded"

**原因:** API使用量が制限を超えた

**解決方法:**
1. APIプロバイダーのダッシュボードで使用状況を確認
2. 必要に応じて使用プランをアップグレード
3. 一時的に別のAIプロバイダーを使用

### ワークフローが実行されない

**確認事項:**
1. `.github/workflows/pr-check.yml` が `main` または `master` ブランチに存在するか
2. リポジトリでGitHub Actionsが有効になっているか（Settings > Actions）
3. PRが正しく作成されているか

### GASテストの自動化について

**✅ 実装完了！**

`.clasprc.json`のトークン情報をGitHub Secretsに保存することで、GASテストの自動化が可能になりました。

**仕組み:**
1. **CLASPRC_JSON**: Googleアカウント認証トークン（リフレッシュトークン含む）
2. **GAS_CONFIG_JSON**: デプロイメントID設定
3. ワークフロー内で一時的に認証ファイルを作成
4. `npm run gas:push` でGASへデプロイ
5. `npm run gas:test` でテスト実行

**自動実行の制御:**
- **PRでの自動実行**: `ENABLE_GAS_TEST=true` 変数を設定
- **手動実行**: Actions タブから `GAS Deploy and Test` を実行

**セキュリティ考慮:**
- OAuthトークンはGitHub Secretsで暗号化保存
- トークンは実行時のみメモリに展開
- ログには表示されない（GitHub Actionsが自動マスク）

**トークンの更新:**
- リフレッシュトークンにより自動更新
- 期限切れの場合は、ローカルで `clasp login` を再実行し、Secretsを更新

**代替案（参考）:**
1. **サービスアカウント**: Google Cloud Projectのサービスアカウントを使用（Apps Script APIの制限あり）
2. **モックテスト**: GAS APIをモック化してNode.js環境でテスト
3. **外部通知**: GAS側でテストをスケジュール実行し、結果をWebhookで通知

## 料金の目安

### GitHub Copilot Pro ユーザー

**完全無料！** 🎉

Copilot Pro契約（$10/月）に含まれるGitHub Models APIを使用：
- ✅ AI修正候補生成：無料（無料枠内）
- ✅ 追加設定不要
- ✅ 月間制限あり（通常のPR利用では十分）

### 外部AI API使用時

AIによる修正候補生成のコスト（概算）：

- **1回のPRチェック:** 約 $0.01 - $0.05
- **月100回のPR:** 約 $1 - $5

実際のコストはエラーログの長さとAIの応答サイズによって変動します。

## 参考リンク

- **[GitHub Models Documentation](https://docs.github.com/en/github-models)** - GitHub Models APIの公式ドキュメント
- [Anthropic Claude API Documentation](https://docs.anthropic.com/claude/reference/getting-started-with-the-api)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Clasp Documentation](https://github.com/google/clasp)
