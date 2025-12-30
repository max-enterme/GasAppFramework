#!/usr/bin/env node

/**
 * . clasp.jsonを生成するスクリプト
 *
 * 使い方:
 *   node scripts/generate-clasp-json. js
 *   node scripts/generate-clasp-json.js --scriptId YOUR_SCRIPT_ID
 */

/* eslint-disable */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    yellow: '\x1b[33m'
};

function log(message, color = 'reset') {
    console.log(colors[color] + message + colors.reset);
}

// Parse command line arguments
const args = process.argv.slice(2);
let scriptId = null;

args.forEach(arg => {
    if (arg.startsWith('--scriptId=')) {
        scriptId = arg.split('=')[1];
    }
});

// Try to get scriptId from existing .clasp.json if not provided
function getExistingScriptId() {
    const claspJsonPath = path.join(__dirname, '../.clasp.json');
    if (fs.existsSync(claspJsonPath)) {
        try {
            const existingConfig = JSON.parse(fs.readFileSync(claspJsonPath, 'utf8'));
            return existingConfig.scriptId || null;
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Try to get scriptId from clasp status
function getScriptIdFromClasp() {
    try {
        const output = execSync('clasp status', { encoding: 'utf8' });
        const match = output.match(/scriptId:\s*([^\s]+)/);
        return match ?  match[1] : null;
    } catch (e) {
        return null;
    }
}

// Generate .clasp. json
function generateClaspJson(scriptId) {
    const claspConfig = {
        scriptId: scriptId,
        rootDir: './build'
    };

    const claspJsonPath = path.join(__dirname, '../.clasp.json');
    fs.writeFileSync(claspJsonPath, JSON.stringify(claspConfig, null, 2) + '\n', 'utf8');

    log('\n✅ .clasp.json が生成されました', 'green');
    log('\n内容:', 'blue');
    log(JSON.stringify(claspConfig, null, 2), 'bright');
    log('\n📁 場所:  ' + claspJsonPath, 'blue');
}

// Main
async function main() {
    log('\n🔧 .clasp.json 生成スクリプト', 'blue');
    log('='.repeat(60), 'blue');

    // Get scriptId from various sources
    if (!scriptId) {
        scriptId = getExistingScriptId();
        if (scriptId) {
            log('\n📋 既存の .clasp.json から scriptId を取得しました', 'yellow');
        }
    }

    if (!scriptId) {
        scriptId = getScriptIdFromClasp();
        if (scriptId) {
            log('\n📋 clasp status から scriptId を取得しました', 'yellow');
        }
    }

    if (!scriptId) {
        log('\n❌ エラー: scriptId が見つかりません', 'red');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
        log('', 'reset');
        log('以下のいずれかの方法で scriptId を取得してください:', 'reset');
        log('', 'reset');
        log('方法1: 新しいGASプロジェクトを作成', 'blue');
        log('  clasp create --type standalone --title "GasAppFramework"', 'bright');
        log('  その後、このスクリプトを再実行してください', 'reset');
        log('', 'reset');
        log('方法2: 既存のプロジェクトをクローン', 'blue');
        log('  clasp clone YOUR_SCRIPT_ID', 'bright');
        log('  その後、このスクリプトを再実行してください', 'reset');
        log('', 'reset');
        log('方法3: scriptId を直接指定', 'blue');
        log('  node scripts/generate-clasp-json.js --scriptId=YOUR_SCRIPT_ID', 'bright');
        log('', 'reset');
        log('scriptId の確認方法:', 'yellow');
        log('  - Apps Script エディタの URL から:', 'reset');
        log('    https://script.google.com/home/projects/YOUR_SCRIPT_ID/edit', 'reset');
        log('  - または、プロジェクト設定 > スクリプトID', 'reset');
        log('', 'reset');
        log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'red');
        process.exit(1);
    }

    log(`\n📌 使用する scriptId: ${scriptId}`, 'blue');
    generateClaspJson(scriptId);

    log('\n' + '='.repeat(60), 'green');
    log('✅ 完了しました! ', 'green');
    log('='.repeat(60), 'green');
    log('\n次のステップ:', 'blue');
    log('  npm run gas:push   # コードをGASにプッシュ', 'reset');
    log('  npm run gas:deploy # Web Appとしてデプロイ', 'reset');
    log('', 'reset');
}

main().catch(error => {
    log('\n❌ エラーが発生しました:', 'red');
    log(error.message, 'red');
    process.exit(1);
});
