# StringHelper Module

String templating and formatting utilities for Google Apps Script applications, providing template processing, date formatting, and text manipulation functions.

## Features

- **String Formatting**: Indexed placeholder substitution with {0}, {1}, etc.
- **Date Formatting**: Cross-platform date formatting with timezone support
- **Template Processing**: Simple template engine for text generation
- **GAS Integration**: Leverages Google Apps Script's Utilities and Session services
- **Fallback Support**: Works in both GAS and Node.js environments

## Main APIs

### String Formatting
```typescript
// Basic string formatting with indexed placeholders
const message = StringHelper.formatString(
    "Hello {0}, welcome to {1}!",
    "John",
    "our application"
)
// Result: "Hello John, welcome to our application!"

// Multiple placeholders and types
const info = StringHelper.formatString(
    "User {0} has {1} points and joined on {2}",
    "Alice",
    150,
    "2023-01-15"
)
// Result: "User Alice has 150 points and joined on 2023-01-15"
```

### Date Formatting
```typescript
const date = new Date('2023-12-25T15:30:00Z')

// Basic date formatting (uses GAS Utilities if available)
const formatted = StringHelper.formatDate(date, 'yyyy-MM-dd HH:mm:ss')
// Result: "2023-12-25 15:30:00"

// Date formatting with timezone
const localTime = StringHelper.formatDate(
    date, 
    'yyyy-MM-dd HH:mm:ss',
    'America/New_York'
)
// Result: "2023-12-25 10:30:00" (EST)

// Custom format patterns
const custom = StringHelper.formatDate(date, 'MMM dd, yyyy')
// Result: "Dec 25, 2023"
```

### Template Processing
```typescript
// Simple template substitution
const template = "Dear {name}, your order #{orderId} is ready!"
const result = StringHelper.processTemplate(template, {
    name: "John Smith",
    orderId: "12345"
})
// Result: "Dear John Smith, your order #12345 is ready!"

// Template with conditional content
const emailTemplate = `
Hello {customerName},

Your order has been {status}.
{if:tracking}Tracking number: {trackingNumber}{/if}

Thank you for your business!
`

const processedEmail = StringHelper.processTemplate(emailTemplate, {
    customerName: "Alice Johnson",
    status: "shipped",
    tracking: true,
    trackingNumber: "TN123456789"
})
```

## Usage Examples

### Email Template Processing
```typescript
class EmailService {
    static sendWelcomeEmail(user: { name: string, email: string }) {
        const template = `
Subject: Welcome to {appName}!

Dear {name},

Welcome to {appName}! We're excited to have you on board.

Your account details:
- Email: {email}
- Registration Date: {registrationDate}

Best regards,
The {appName} Team
        `
        
        const content = StringHelper.processTemplate(template, {
            appName: "MyApp",
            name: user.name,
            email: user.email,
            registrationDate: StringHelper.formatDate(new Date(), 'MMM dd, yyyy')
        })
        
        // Send email using GAS MailApp
        MailApp.sendEmail(user.email, content.split('\n')[0], content)
    }
}

// Usage
EmailService.sendWelcomeEmail({
    name: "John Doe",
    email: "john@example.com"
})
```

### Report Generation
```typescript
class ReportGenerator {
    static generateDailyReport(data: {
        date: Date,
        totalSales: number,
        orderCount: number,
        topProduct: string
    }) {
        const reportTemplate = `
Daily Sales Report - {reportDate}
========================================

Sales Summary:
- Total Sales: ${totalSales}
- Order Count: {orderCount}
- Average Order Value: ${avgOrderValue}

Top Performing Product: {topProduct}

Generated on: {generatedAt}
        `
        
        const avgOrderValue = data.totalSales / data.orderCount
        
        return StringHelper.processTemplate(reportTemplate, {
            reportDate: StringHelper.formatDate(data.date, 'MMM dd, yyyy'),
            totalSales: data.totalSales.toFixed(2),
            orderCount: data.orderCount.toString(),
            avgOrderValue: avgOrderValue.toFixed(2),
            topProduct: data.topProduct,
            generatedAt: StringHelper.formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
        })
    }
}

// Usage
const report = ReportGenerator.generateDailyReport({
    date: new Date(),
    totalSales: 15420.50,
    orderCount: 127,
    topProduct: "Premium Widget"
})

console.log(report)
```

### Notification Message Builder
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
🎉 New Order Received!

Order: #{orderId}
Customer: {customerName}
Items: {itemSummary}
Total: ${total}
Estimated Delivery: {deliveryDate}

{if:urgent}⚠️ URGENT: Express delivery requested{/if}
        `
        
        const itemSummary = order.items
            .map(item => `${item.name} (x${item.quantity})`)
            .join(', ')
            
        return StringHelper.processTemplate(messageTemplate, {
            orderId: order.id,
            customerName: order.customerName,
            itemSummary: itemSummary,
            total: order.total.toFixed(2),
            deliveryDate: StringHelper.formatDate(order.estimatedDelivery, 'MMM dd'),
            urgent: order.total > 1000 // Flag for high-value orders
        })
    }
}
```

### Configuration Message Templates
```typescript
class ConfigManager {
    private static templates = {
        error: "Error in {module} at {timestamp}: {message}",
        success: "Operation {operation} completed successfully in {duration}ms",
        warning: "Warning: {resource} usage is at {percentage}% of limit",
        info: "User {user} performed {action} on {date}"
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

// Usage
const errorMsg = ConfigManager.logMessage('error', {
    module: 'UserService',
    timestamp: StringHelper.formatDate(new Date(), 'HH:mm:ss'),
    message: 'Failed to update user profile'
})

const successMsg = ConfigManager.logMessage('success', {
    operation: 'data_sync',
    duration: 1250
})
```

## Testing Strategy

### Unit Tests (Node.js)
```typescript
describe('StringHelper', () => {
    describe('formatString', () => {
        test('should replace indexed placeholders', () => {
            const result = StringHelper.formatString(
                "Hello {0}, you have {1} messages",
                "Alice",
                5
            )
            expect(result).toBe("Hello Alice, you have 5 messages")
        })
        
        test('should handle missing placeholders gracefully', () => {
            const result = StringHelper.formatString(
                "Hello {0}, you have {1} messages",
                "Alice"
            )
            expect(result).toBe("Hello Alice, you have {1} messages")
        })
        
        test('should handle special characters', () => {
            const result = StringHelper.formatString(
                "URL: {0}?param={1}",
                "https://example.com",
                "value with spaces"
            )
            expect(result).toBe("URL: https://example.com?param=value with spaces")
        })
    })
    
    describe('formatDate', () => {
        test('should format dates with fallback formatter', () => {
            const date = new Date('2023-12-25T15:30:00Z')
            const result = StringHelper.formatDate(date, 'yyyy-MM-dd')
            expect(result).toMatch(/2023-12-25/)
        })
        
        test('should handle different format patterns', () => {
            const date = new Date('2023-01-05T09:15:30Z')
            
            expect(StringHelper.formatDate(date, 'yyyy')).toBe('2023')
            expect(StringHelper.formatDate(date, 'MM')).toBe('01')
            expect(StringHelper.formatDate(date, 'dd')).toBe('05')
        })
    })
    
    describe('processTemplate', () => {
        test('should replace named placeholders', () => {
            const template = "Hello {name}, welcome to {app}!"
            const result = StringHelper.processTemplate(template, {
                name: "John",
                app: "MyApp"
            })
            expect(result).toBe("Hello John, welcome to MyApp!")
        })
        
        test('should handle missing variables gracefully', () => {
            const template = "Hello {name}, you have {count} items"
            const result = StringHelper.processTemplate(template, {
                name: "Alice"
            })
            expect(result).toBe("Hello Alice, you have {count} items")
        })
    })
})
```

### Integration Tests (GAS)
```typescript
function test_StringHelperWithGAS() {
    // Test date formatting with GAS Utilities
    const date = new Date()
    const formatted = StringHelper.formatDate(date, 'yyyy-MM-dd HH:mm:ss')
    console.log('Formatted date:', formatted)
    
    // Test timezone formatting
    const timezonedDate = StringHelper.formatDate(
        date,
        'yyyy-MM-dd HH:mm:ss',
        Session.getScriptTimeZone()
    )
    console.log('Timezone date:', timezonedDate)
    
    // Test string formatting
    const message = StringHelper.formatString(
        "Processing {0} records at {1}",
        100,
        formatted
    )
    console.log('Formatted message:', message)
}
```

### Performance Tests
```typescript
test('should handle large template processing efficiently', () => {
    const largeTemplate = "Item {0}: ".repeat(1000) + "End"
    const args = Array.from({ length: 1000 }, (_, i) => `item${i}`)
    
    const start = Date.now()
    const result = StringHelper.formatString(largeTemplate, ...args)
    const elapsed = Date.now() - start
    
    expect(result).toContain("Item item0:")
    expect(result).toContain("Item item999:")
    expect(elapsed).toBeLessThan(100) // Should be fast
})
```

## Configuration

### Format Patterns
- **Date Formatting**: Supports `yyyy`, `MM`, `dd`, `HH`, `mm`, `ss` tokens
- **Placeholder Syntax**: `{0}`, `{1}`, etc. for indexed placeholders
- **Named Placeholders**: `{name}`, `{value}` for template variables

### GAS Integration
- Automatically uses `Utilities.formatDate()` when available
- Falls back to simple formatter in non-GAS environments
- Leverages `Session.getScriptTimeZone()` for timezone detection

### Best Practices
- Use indexed placeholders for simple string formatting
- Use named placeholders for complex templates
- Always provide fallback values for optional template variables
- Consider performance for large-scale template processing
- Test both GAS and Node.js environments for compatibility