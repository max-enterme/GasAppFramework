# EventSystem (Unified, tz fix, compat)
- tz 正規化済み（Trigger/Workflow）
- `Workflow.Ports` 互換 d.ts 付き
- Facade は `EventSystem.Facade.*`（重複回避）
- テストFWの `isTrue` リネーム済み

## 実行
GASでは `test_RunAll` を実行。Spreadsheet を使う本番関数は ID を実値に置き換えてから。
