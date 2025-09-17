# StringHelper モジュール

Google Apps Script アプリケーション向けの文字列テンプレートとフォーマットユーティリティ。テンプレート処理、日付フォーマット、テキスト操作機能を提供します。

## 機能

- **文字列フォーマット**: {0}, {1}などのインデックス付きプレースホルダー置換
- **日付フォーマット**: タイムゾーンサポート付きクロスプラットフォーム日付フォーマット
- **テンプレート処理**: テキスト生成のためのシンプルテンプレートエンジン
- **GAS統合**: Google Apps ScriptのUtilitiesとSessionサービスを活用
- **フォールバックサポート**: GASとNode.js環境の両方で動作

## 主要API

### 文字列フォーマット
```typescript
// インデックス付きプレースホルダーによる基本文字列フォーマット
const message = StringHelper.formatString(
    "こんにちは{0}さん、{1}へようこそ！",
    "田中",
    "私たちのアプリケーション"
)
// 結果: "こんにちは田中さん、私たちのアプリケーションへようこそ！"

// 複数プレースホルダーと型
const info = StringHelper.formatString(
    "ユーザー{0}は{1}ポイント持ち、{2}に参加しました",
    "佐藤",
    150,
    "2023-01-15"
)
// 結果: "ユーザー佐藤は150ポイント持ち、2023-01-15に参加しました"
```

### 日付フォーマット
```typescript
const date = new Date('2023-12-25T15:30:00Z')

// 基本日付フォーマット（利用可能な場合はGAS Utilitiesを使用）
const formatted = StringHelper.formatDate(date, 'yyyy-MM-dd HH:mm:ss')
// 結果: "2023-12-25 15:30:00"

// タイムゾーン付き日付フォーマット
const localTime = StringHelper.formatDate(
    date, 
    'yyyy-MM-dd HH:mm:ss',
    'Asia/Tokyo'
)
// 結果: "2023-12-26 00:30:00" (JST)

// カスタムフォーマットパターン
const custom = StringHelper.formatDate(date, 'yyyy年MM月dd日')
// 結果: "2023年12月25日"
```

### テンプレート処理
```typescript
// シンプルテンプレート置換
const template = "{name}様、ご注文#{orderId}の準備ができました！"
const result = StringHelper.processTemplate(template, {
    name: "田中太郎",
    orderId: "12345"
})
// 結果: "田中太郎様、ご注文#12345の準備ができました！"

// 条件付きコンテンツ付きテンプレート
const emailTemplate = `
{customerName}様へ

ご注文が{status}されました。
{if:tracking}追跡番号: {trackingNumber}{/if}

ご利用ありがとうございました！
`

const processedEmail = StringHelper.processTemplate(emailTemplate, {
    customerName: "佐藤花子",
    status: "発送",
    tracking: true,
    trackingNumber: "TN123456789"
})
```

## 使用例

### メールテンプレート処理
```typescript
class EmailService {
    static sendWelcomeEmail(user: { name: string, email: string }) {
        const template = `
件名: {appName}へようこそ！

{name}様

{appName}へようこそ！ご参加いただき誠にありがとうございます。

アカウント詳細:
- メールアドレス: {email}
- 登録日: {registrationDate}

{appName}チーム一同
        `
        
        const content = StringHelper.processTemplate(template, {
            appName: "マイアプリ",
            name: user.name,
            email: user.email,
            registrationDate: StringHelper.formatDate(new Date(), 'yyyy年MM月dd日')
        })
        
        // GAS MailAppを使用してメール送信
        MailApp.sendEmail(user.email, content.split('\n')[0], content)
    }
}

// 使用方法
EmailService.sendWelcomeEmail({
    name: "田中太郎",
    email: "tanaka@example.com"
})
```

### レポート生成
```typescript
class ReportGenerator {
    static generateDailyReport(data: {
        date: Date,
        totalSales: number,
        orderCount: number,
        topProduct: string
    }) {
        const reportTemplate = `
日次売上レポート - {reportDate}
========================================

売上サマリー:
- 総売上: ¥{totalSales}
- 注文数: {orderCount}件
- 平均注文額: ¥{avgOrderValue}

最高売上商品: {topProduct}

生成日時: {generatedAt}
        `
        
        const avgOrderValue = data.totalSales / data.orderCount
        
        return StringHelper.processTemplate(reportTemplate, {
            reportDate: StringHelper.formatDate(data.date, 'yyyy年MM月dd日'),
            totalSales: data.totalSales.toLocaleString(),
            orderCount: data.orderCount.toString(),
            avgOrderValue: avgOrderValue.toLocaleString(),
            topProduct: data.topProduct,
            generatedAt: StringHelper.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
        })
    }
}

// 使用方法
const report = ReportGenerator.generateDailyReport({
    date: new Date(),
    totalSales: 1542050,
    orderCount: 127,
    topProduct: "プレミアムウィジェット"
})

console.log(report)
```

### 通知メッセージビルダー
```typescript
class NotificationBuilder {
    static buildOrderNotification(order: {
        id: string,
        customerName: string,
        items: Array<{name: string, quantity: number}>,
        total: number,
        estimatedDelivery: Date
    }) {
        const messageTemplate = `
🎉 新規注文受付！

注文番号: #{orderId}
お客様: {customerName}
商品: {itemSummary}
合計: ¥{total}
お届け予定: {deliveryDate}

{if:urgent}⚠️ 緊急: 速達配送指定{/if}
        `
        
        const itemSummary = order.items
            .map(item => `${item.name} (${item.quantity}個)`)
            .join(', ')
            
        return StringHelper.processTemplate(messageTemplate, {
            orderId: order.id,
            customerName: order.customerName,
            itemSummary: itemSummary,
            total: order.total.toLocaleString(),
            deliveryDate: StringHelper.formatDate(order.estimatedDelivery, 'MM月dd日'),
            urgent: order.total > 100000 // 高額注文のフラグ
        })
    }
}
```

### 設定メッセージテンプレート
```typescript
class ConfigManager {
    private static templates = {
        error: "{module}でエラーが発生しました（{timestamp}）: {message}",
        success: "操作{operation}が{duration}ミリ秒で正常完了しました",
        warning: "警告: {resource}の使用量が制限の{percentage}%に達しています",
        info: "ユーザー{user}が{date}に{action}を実行しました"
    }
    
    static logMessage(
        level: 'error' | 'success' | 'warning' | 'info',
        params: { [key: string]: string | number }
    ): string {
        const template = this.templates[level]
        const formattedParams = Object.fromEntries(
            Object.entries(params).map(([key, value]) => [
                key, 
                typeof value === 'number' ? value.toString() : value
            ])
        )
        
        return StringHelper.formatString(template, ...Object.values(formattedParams))
    }
}

// 使用方法
const errorMsg = ConfigManager.logMessage('error', {
    module: 'ユーザーサービス',
    timestamp: StringHelper.formatDate(new Date(), 'HH:mm:ss'),
    message: 'ユーザープロフィール更新に失敗'
})

const successMsg = ConfigManager.logMessage('success', {
    operation: 'データ同期',
    duration: 1250
})
```

## テスト戦略

### 単体テスト (Node.js)
```typescript
describe('StringHelper', () => {
    describe('formatString', () => {
        test('インデックス付きプレースホルダーを置換できること', () => {
            const result = StringHelper.formatString(
                "こんにちは{0}さん、{1}件のメッセージがあります",
                "田中",
                5
            )
            expect(result).toBe("こんにちは田中さん、5件のメッセージがあります")
        })
        
        test('不足するプレースホルダーを適切に処理できること', () => {
            const result = StringHelper.formatString(
                "こんにちは{0}さん、{1}件のメッセージがあります",
                "田中"
            )
            expect(result).toBe("こんにちは田中さん、{1}件のメッセージがあります")
        })
        
        test('特殊文字を処理できること', () => {
            const result = StringHelper.formatString(
                "URL: {0}?param={1}",
                "https://example.com",
                "スペース付き値"
            )
            expect(result).toBe("URL: https://example.com?param=スペース付き値")
        })
    })
    
    describe('formatDate', () => {
        test('フォールバックフォーマッターで日付をフォーマットできること', () => {
            const date = new Date('2023-12-25T15:30:00Z')
            const result = StringHelper.formatDate(date, 'yyyy-MM-dd')
            expect(result).toMatch(/2023-12-25/)
        })
        
        test('異なるフォーマットパターンを処理できること', () => {
            const date = new Date('2023-01-05T09:15:30Z')
            
            expect(StringHelper.formatDate(date, 'yyyy')).toBe('2023')
            expect(StringHelper.formatDate(date, 'MM')).toBe('01')
            expect(StringHelper.formatDate(date, 'dd')).toBe('05')
        })
    })
    
    describe('processTemplate', () => {
        test('名前付きプレースホルダーを置換できること', () => {
            const template = "こんにちは{name}さん、{app}へようこそ！"
            const result = StringHelper.processTemplate(template, {
                name: "田中",
                app: "マイアプリ"
            })
            expect(result).toBe("こんにちは田中さん、マイアプリへようこそ！")
        })
        
        test('不足する変数を適切に処理できること', () => {
            const template = "こんにちは{name}さん、{count}個のアイテムがあります"
            const result = StringHelper.processTemplate(template, {
                name: "佐藤"
            })
            expect(result).toBe("こんにちは佐藤さん、{count}個のアイテムがあります")
        })
    })
})
```

### 統合テスト (GAS)
```typescript
function test_StringHelperWithGAS() {
    // GAS Utilitiesを使った日付フォーマットのテスト
    const date = new Date()
    const formatted = StringHelper.formatDate(date, 'yyyy-MM-dd HH:mm:ss')
    console.log('フォーマット済み日付:', formatted)
    
    // タイムゾーンフォーマットのテスト
    const timezonedDate = StringHelper.formatDate(
        date,
        'yyyy-MM-dd HH:mm:ss',
        Session.getScriptTimeZone()
    )
    console.log('タイムゾーン日付:', timezonedDate)
    
    // 文字列フォーマットのテスト
    const message = StringHelper.formatString(
        "{0}件のレコードを{1}に処理中",
        100,
        formatted
    )
    console.log('フォーマット済みメッセージ:', message)
}
```

### パフォーマンステスト
```typescript
test('大きなテンプレート処理を効率的に処理できること', () => {
    const largeTemplate = "アイテム{0}: ".repeat(1000) + "終了"
    const args = Array.from({ length: 1000 }, (_, i) => `item${i}`)
    
    const start = Date.now()
    const result = StringHelper.formatString(largeTemplate, ...args)
    const elapsed = Date.now() - start
    
    expect(result).toContain("アイテムitem0:")
    expect(result).toContain("アイテムitem999:")
    expect(elapsed).toBeLessThan(100) // 高速であること
})
```

## 設定

### フォーマットパターン
- **日付フォーマット**: `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss` トークンをサポート
- **プレースホルダー構文**: インデックス付きプレースホルダーに `{0}`, `{1}` など
- **名前付きプレースホルダー**: テンプレート変数に `{name}`, `{value}`

### GAS統合
- 利用可能な場合は自動的に `Utilities.formatDate()` を使用
- 非GAS環境ではシンプルフォーマッターにフォールバック
- タイムゾーン検出で `Session.getScriptTimeZone()` を活用

### ベストプラクティス
- シンプルな文字列フォーマットにはインデックス付きプレースホルダーを使用
- 複雑なテンプレートには名前付きプレースホルダーを使用
- オプションのテンプレート変数には常にフォールバック値を提供
- 大規模テンプレート処理のパフォーマンスを考慮
- 互換性のためGASとNode.js環境の両方でテスト