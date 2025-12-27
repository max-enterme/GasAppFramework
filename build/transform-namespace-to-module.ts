/**
 * Transform GAS namespace code to Node.js modules for testing
 * 
 * This script uses ts-morph to parse TypeScript namespace declarations
 * and convert them to ES6 module exports suitable for Node.js testing.
 */

import { Project, SyntaxKind, Node, SourceFile, ModuleDeclaration } from 'ts-morph';
import * as fs from 'fs';
import * as path from 'path';

interface TransformConfig {
    name: string;
    sourceFiles: string[];
    outputFile: string;
    namespace: string;
    includeTypes: boolean;
    compatibilityExports?: string[];
}

interface Config {
    transforms: TransformConfig[];
}

// Allow override of project root via environment variable or use script's parent directory
const PROJECT_ROOT = process.env.TRANSFORM_PROJECT_ROOT
    ? path.resolve(process.env.TRANSFORM_PROJECT_ROOT)
    : path.resolve(__dirname, '..');

/**
 * Load configuration from transform.config.json
 * Supports custom config path via TRANSFORM_CONFIG_PATH environment variable
 */
function loadConfig(): Config {
    // Check if custom config path is provided via environment variable
    const configPath = process.env.TRANSFORM_CONFIG_PATH
        ? path.resolve(PROJECT_ROOT, process.env.TRANSFORM_CONFIG_PATH)
        : path.join(__dirname, 'transform.config.json');

    console.log(`📄 Loading config from: ${configPath}`);

    if (!fs.existsSync(configPath)) {
        throw new Error(`Configuration file not found: ${configPath}`);
    }

    const configContent = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(configContent);
}

/**
 * Process a single namespace and convert it to module exports
 */
function processNamespace(
    namespace: ModuleDeclaration,
    targetNamespace: string,
    outputLines: string[],
    includeTypes: boolean
): void {
    const namespaceName = namespace.getName();

    // Get the body of the namespace
    let body = namespace.getBody();

    // Handle dotted namespace syntax (e.g., namespace Repository.Engine)
    // TypeScript parses this as nested ModuleDeclarations
    while (body && Node.isModuleDeclaration(body)) {
        body = body.getBody();
    }

    if (!body || !Node.isModuleBlock(body)) {
        return;
    }

    // Check if this is a nested namespace (e.g., Repository.Engine)
    const isNestedNamespace = namespaceName.includes('.');
    const namespaceBaseName = isNestedNamespace ? namespaceName.split('.')[0] : namespaceName;

    // Support both exact match and base namespace match
    // e.g., targetNamespace can be "YTamaLeagueManagement" or "YTamaLeagueManagement.Services"
    const isExactMatch = namespaceName === targetNamespace;
    const isBaseMatch = namespaceBaseName === targetNamespace;
    const isTargetNestedInNamespace = targetNamespace.startsWith(namespaceName + '.');

    // Only process namespaces matching our target
    if (!isExactMatch && !isBaseMatch && !isTargetNestedInNamespace) {
        return;
    }

    // Check if this is a declare namespace (for type definitions)
    const isDeclareNamespace = namespace.hasDeclareKeyword();

    // If targetNamespace is an exact match, extract contents directly without wrapping
    if (isExactMatch) {
        // For exact match, extract all statements directly
        for (const statement of body.getStatements()) {
            processStatement(statement, outputLines, '', isDeclareNamespace, includeTypes);
        }
        return;
    }

    // If this is a nested namespace like "Repository.Engine" or "Routing.Ports", export it as a namespace
    if (isNestedNamespace && isBaseMatch) {
        const nestingLevels = namespaceName.split('.');
        const nestedName = nestingLevels.slice(1).join('.');

        // For declare namespaces, keep them as exported namespaces (for types)
        outputLines.push(`export namespace ${nestedName} {`);

        // Process all statements within the nested namespace
        for (const statement of body.getStatements()) {
            // For declare namespaces, always export types
            processStatement(statement, outputLines, '    ', isDeclareNamespace, includeTypes);
        }

        outputLines.push('}');
        outputLines.push('');
        return;
    }

    // For top-level namespace, extract all statements
    for (const statement of body.getStatements()) {
        processStatement(statement, outputLines, '', isDeclareNamespace, includeTypes);
    }
}

/**
 * Remove type annotations from code when includeTypes is false
 */
function stripTypeAnnotations(text: string, includeTypes: boolean): string {
    if (includeTypes) {
        return text;
    }

    // For now, we don't strip type annotations as it's too complex with regex
    // Type checking will be disabled with @ts-nocheck at the file level
    return text;
}

/**
 * Process a single statement from the namespace
 */
function processStatement(statement: Node, outputLines: string[], indent: string, forceExport = false, includeTypes = true): void {
    const kind = statement.getKind();

    // Check if the statement was exported in the namespace using ts-morph API
    let hasExport = forceExport;

    if (!hasExport && 'hasExportKeyword' in statement) {
        hasExport = (statement as any).hasExportKeyword();
    }

    // Handle nested namespace declarations (like "namespace Ports" inside "declare namespace Routing")
    if (kind === SyntaxKind.ModuleDeclaration) {
        const nestedNamespace = statement as ModuleDeclaration;
        const nestedName = nestedNamespace.getName();
        const nestedBody = nestedNamespace.getBody();

        if (nestedBody && Node.isModuleBlock(nestedBody)) {
            outputLines.push(indent + `export namespace ${nestedName} {`);

            for (const nestedStatement of nestedBody.getStatements()) {
                processStatement(nestedStatement, outputLines, indent + '    ', true, includeTypes);
            }

            outputLines.push(indent + '}');
            outputLines.push('');
        }
        return;
    }

    // Handle function declarations
    if (kind === SyntaxKind.FunctionDeclaration) {
        const text = statement.getText();
        // Remove 'export' keyword if present
        const cleanText = text.replace(/^(\s*)export\s+/, '$1');

        if (hasExport) {
            outputLines.push(indent + 'export ' + cleanText);
        } else {
            outputLines.push(indent + cleanText);
        }
        outputLines.push('');
        return;
    }

    // Handle class declarations
    if (kind === SyntaxKind.ClassDeclaration) {
        const text = statement.getText();
        
        // Remove 'export' keyword if present, handling decorators properly
        // Look for export keyword that comes after decorators
        const cleanText = text.replace(/^((?:@[\w.]+(?:\([^)]*\))?\s*)*\s*)export\s+/, '$1');

        if (hasExport) {
            // Add export before decorators
            const lines = cleanText.split('\n');
            if (lines[0].trim().startsWith('@')) {
                // Has decorators, find where class keyword is
                const classLineIndex = lines.findIndex(line => line.includes('class '));
                if (classLineIndex !== -1) {
                    lines[classLineIndex] = lines[classLineIndex].replace(/^(\s*)class\s/, '$1export class ');
                    outputLines.push(indent + lines.join('\n'));
                } else {
                    outputLines.push(indent + 'export ' + cleanText);
                }
            } else {
                outputLines.push(indent + 'export ' + cleanText);
            }
        } else {
            outputLines.push(indent + cleanText);
        }
        outputLines.push('');
        return;
    }

    // Handle interface declarations
    if (kind === SyntaxKind.InterfaceDeclaration) {
        const text = statement.getText();
        const cleanText = text.replace(/^(\s*)export\s+/, '$1');

        if (hasExport) {
            outputLines.push(indent + 'export ' + cleanText);
        } else {
            outputLines.push(indent + cleanText);
        }
        outputLines.push('');
        return;
    }

    // Handle type alias declarations
    if (kind === SyntaxKind.TypeAliasDeclaration) {
        const text = statement.getText();
        const cleanText = text.replace(/^(\s*)export\s+/, '$1');

        if (hasExport) {
            outputLines.push(indent + 'export ' + cleanText);
        } else {
            outputLines.push(indent + cleanText);
        }
        outputLines.push('');
        return;
    }

    // Handle enum declarations
    if (kind === SyntaxKind.EnumDeclaration) {
        const text = statement.getText();
        const cleanText = text.replace(/^(\s*)export\s+/, '$1');

        if (hasExport) {
            outputLines.push(indent + 'export ' + cleanText);
        } else {
            outputLines.push(indent + cleanText);
        }
        outputLines.push('');
        return;
    }

    // Handle variable statements (const, let, var)
    if (kind === SyntaxKind.VariableStatement) {
        const text = statement.getText();
        const cleanText = text.replace(/^(\s*)export\s+/, '$1');

        if (hasExport) {
            outputLines.push(indent + 'export ' + cleanText);
        } else {
            outputLines.push(indent + cleanText);
        }
        outputLines.push('');
        return;
    }

    // Keep internal non-exported items as-is (for helper functions, etc.)
    if (!hasExport) {
        const text = statement.getText();
        outputLines.push(indent + text);
        outputLines.push('');
    }
}

/**
 * Transform a set of source files into a single module
 */
function transformFiles(config: TransformConfig): void {
    console.log(`\n📦 Transforming: ${config.name}`);
    console.log(`   Sources: ${config.sourceFiles.join(', ')}`);
    console.log(`   Output: ${config.outputFile}`);

    // Create a new ts-morph project
    const project = new Project({
        tsConfigFilePath: path.join(PROJECT_ROOT, 'tsconfig.json'),
        skipAddingFilesFromTsConfig: true,
    });

    // Add all source files
    const sourceFiles: SourceFile[] = [];
    for (const sourcePath of config.sourceFiles) {
        const fullPath = path.join(PROJECT_ROOT, sourcePath);
        const sourceFile = project.addSourceFileAtPath(fullPath);
        sourceFiles.push(sourceFile);
    }

    // Prepare output
    const outputLines: string[] = [];

    // Add header comment
    outputLines.push('/**');
    outputLines.push(` * ${config.name} - Auto-generated module for Node.js testing`);
    outputLines.push(' * ');
    outputLines.push(' * ⚠️  DO NOT EDIT THIS FILE MANUALLY');
    outputLines.push(' * This file is automatically generated from:');
    for (const sourcePath of config.sourceFiles) {
        outputLines.push(` * - ${sourcePath}`);
    }
    outputLines.push(' * ');
    outputLines.push(' * To regenerate: npm run build:test-modules');
    outputLines.push(' */');
    outputLines.push('');
    
    // Add @ts-nocheck if includeTypes is false
    if (!config.includeTypes) {
        outputLines.push('// @ts-nocheck - Type checking disabled for test module');
        outputLines.push('');
    }

    // Process each source file
    for (const sourceFile of sourceFiles) {
        // Extract only top-level namespace declarations (not nested ones)
        const namespaces = sourceFile.getStatements()
            .filter(stmt => stmt.getKind() === SyntaxKind.ModuleDeclaration) as ModuleDeclaration[];

        for (const namespace of namespaces) {
            processNamespace(namespace, config.namespace, outputLines, config.includeTypes);
        }
    }

    // Add compatibility exports if specified
    if (config.compatibilityExports && config.compatibilityExports.length > 0) {
        outputLines.push('');
        for (const compatExport of config.compatibilityExports) {
            outputLines.push(compatExport);
        }
        outputLines.push('');
    }

    // Write output file
    const outputPath = path.join(PROJECT_ROOT, config.outputFile);
    const outputDir = path.dirname(outputPath);

    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, outputLines.join('\n'), 'utf-8');

    console.log(`   ✅ Generated: ${config.outputFile}`);
}

/**
 * Main execution
 */
function main(): void {
    console.log('🔄 Starting namespace-to-module transformation...\n');
    console.log(`📁 Project Root: ${PROJECT_ROOT}`);

    const config = loadConfig();

    for (const transform of config.transforms) {
        try {
            transformFiles(transform);
        } catch (error) {
            console.error(`❌ Error transforming ${transform.name}:`, error);
            process.exit(1);
        }
    }

    console.log('\n✨ All transformations completed successfully!\n');
}

// Run the script
main();
