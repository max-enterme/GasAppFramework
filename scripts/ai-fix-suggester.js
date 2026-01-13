#!/usr/bin/env node

/**
 * AI Fix Suggester
 * エラーログを解析してAIによる修正候補を生成します
 */

/* eslint-disable */

const fs = require('fs');
const path = require('path');

const { getFlagValue } = require('./lib/cli-args');

function printHelp() {
  console.log(`AI Fix Suggester

Usage:
  node scripts/ai-fix-suggester.js [options]

Options:
  --lint-output <path>       ESLintログファイル
  --typecheck-output <path>  tscログファイル
  --test-output <path>       テストログファイル
  --output <path>            出力先 (default: suggestions.md)
  --projectRoot <path>       相対パス解決の基準 (指定時のみ)
  --help                     ヘルプを表示

Env (いずれか):
  GITHUB_TOKEN | ANTHROPIC_API_KEY | OPENAI_API_KEY
`);
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const projectRootArg = getFlagValue(argv, 'projectRoot');
  const baseDir = projectRootArg ? path.resolve(projectRootArg) : process.cwd();

  const lintOutput = getFlagValue(argv, 'lint-output');
  const typecheckOutput = getFlagValue(argv, 'typecheck-output');
  const testOutput = getFlagValue(argv, 'test-output');
  const output = getFlagValue(argv, 'output') || 'suggestions.md';

  return {
    lintOutput: lintOutput ? path.resolve(baseDir, lintOutput) : null,
    typecheckOutput: typecheckOutput ? path.resolve(baseDir, typecheckOutput) : null,
    testOutput: testOutput ? path.resolve(baseDir, testOutput) : null,
    output: path.resolve(process.cwd(), output),
  };
}

// ファイルからエラーログを読み込む
function readLogFile(filePath) {
  if (!filePath || !fs.existsSync(filePath)) {
    return null;
  }
  return fs.readFileSync(filePath, 'utf8');
}

// OpenAI APIを使用して修正候補を生成
async function generateSuggestionsWithOpenAI(errors) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('OPENAI_API_KEY が設定されていません');
    return null;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたはTypeScript/JavaScriptのエキスパートです。エラーログを分析して、具体的な修正方法を提案してください。'
          },
          {
            role: 'user',
            content: `以下のエラーを修正するための具体的な提案をMarkdown形式で提供してください。各エラーについて、原因と修正方法を説明してください。\n\n${errors}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI APIエラー:', error.message);
    return null;
  }
}

// GitHub Models APIを使用して修正候補を生成
async function generateSuggestionsWithGitHubModels(errors) {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.warn('GITHUB_TOKEN が設定されていません');
    return null;
  }

  try {
    const response = await fetch('https://models.inference.ai.azure.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${githubToken}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'あなたはTypeScript/JavaScriptのエキスパートです。エラーログを分析して、具体的な修正方法を提案してください。'
          },
          {
            role: 'user',
            content: `以下のエラーを修正するための具体的な提案をMarkdown形式で提供してください。各エラーについて、原因と修正方法を説明してください。\n\n${errors}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub Models API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('GitHub Models APIエラー:', error.message);
    return null;
  }
}

// Anthropic Claude APIを使用して修正候補を生成
async function generateSuggestionsWithClaude(errors) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY が設定されていません');
    return null;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: `あなたはTypeScript/JavaScriptのエキスパートです。以下のエラーログを分析して、具体的な修正方法をMarkdown形式で提案してください。各エラーについて、原因と修正方法を説明してください。\n\n${errors}`
          }
        ],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude APIエラー:', error.message);
    return null;
  }
}

// エラーログを整形
function formatErrors(lintLog, typecheckLog, testLog) {
  let errors = '';

  if (lintLog) {
    errors += '## ESLint エラー\n\n```\n' + lintLog.substring(0, 3000) + '\n```\n\n';
  }

  if (typecheckLog) {
    errors += '## TypeScript 型チェックエラー\n\n```\n' + typecheckLog.substring(0, 3000) + '\n```\n\n';
  }

  if (testLog) {
    errors += '## テストエラー\n\n```\n' + testLog.substring(0, 3000) + '\n```\n\n';
  }

  return errors;
}

// メイン処理
async function main() {
  const options = parseArgs(process.argv.slice(2));

  // ログファイルを読み込む
  const lintLog = readLogFile(options.lintOutput);
  const typecheckLog = readLogFile(options.typecheckOutput);
  const testLog = readLogFile(options.testOutput);

  // エラーがない場合
  if (!lintLog && !typecheckLog && !testLog) {
    console.log('✅ エラーが見つかりませんでした');
    fs.writeFileSync(options.output, '✅ すべてのチェックが成功しました！', 'utf8');
    return;
  }

  // エラーログを整形
  const formattedErrors = formatErrors(lintLog, typecheckLog, testLog);

  console.log('AI修正候補を生成中...');

  // AIによる修正候補を生成（GitHub Models > Claude > OpenAI の優先順位）
  let suggestions = await generateSuggestionsWithGitHubModels(formattedErrors);

  if (!suggestions) {
    console.log('GitHub Modelsが利用できないため、Claudeを使用します...');
    suggestions = await generateSuggestionsWithClaude(formattedErrors);
  }

  if (!suggestions) {
    console.log('Claudeが利用できないため、OpenAIを使用します...');
    suggestions = await generateSuggestionsWithOpenAI(formattedErrors);
  }

  // 修正候補を生成できなかった場合
  if (!suggestions) {
    suggestions = `### ⚠️ AI修正候補の生成に失敗しました

以下のいずれかの環境変数を設定してください：
- \`GITHUB_TOKEN\`: GitHub Copilot Pro ユーザーは GitHub Models API を利用可能（推奨・無料）
- \`ANTHROPIC_API_KEY\`: Anthropic Claude API キー
- \`OPENAI_API_KEY\`: OpenAI API キー

以下のエラーを手動で確認してください：

${formattedErrors}

### 設定方法

GitHubリポジトリの Settings > Secrets and variables > Actions で以下のシークレットを設定してください：

**GitHub Copilot Pro ユーザー（推奨・無料）:**
- \`GITHUB_TOKEN\` は自動的に利用可能（追加設定不要）

**または外部APIを使用:**
- \`ANTHROPIC_API_KEY\`: Anthropic API キー
- \`OPENAI_API_KEY\`: OpenAI API キー
`;
  }

  // 結果をファイルに書き込む
  const output = `### ❌ チェックに失敗しました

以下の問題が見つかりました：

${lintLog ? '- ❌ ESLint エラー\n' : ''}${typecheckLog ? '- ❌ TypeScript 型チェックエラー\n' : ''}${testLog ? '- ❌ テストエラー\n' : ''}

---

## 🤖 AI修正候補

${suggestions}

---

<details>
<summary>📋 エラーログ詳細</summary>

${formattedErrors}

</details>
`;

  fs.writeFileSync(options.output, output, 'utf8');
  console.log(`修正候補を ${options.output} に保存しました`);
}

main().catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
