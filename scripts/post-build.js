/**
 * Post-build script to ensure global exports are properly set
 */

const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../build/0_main.js');

// Read the bundled file
let content = fs.readFileSync(mainJsPath, 'utf-8');

// CRITICAL FIX: The webpack getters for Container and Context are defined BEFORE
// the actual class definitions, causing them to reference undefined variables.
// We need to patch the modules_namespaceObject getters after classes are defined.

// Find the Container class definition and inject global assignment after it
const containerClassPattern = /Container\.Root = new Container\(\);/;
const contextRunPattern = /static run\(container, fn\) {[\s\S]*?}\s*static get current\(\) {[\s\S]*?}\s*}/;
const injectFunctionPattern = /^function Inject\(token, optional = false\) \{\n    return function \(target, propertyKey, paramIndex\) \{[\s\S]{1,400}?\n    \};\n\}$/m;
const resolveFunctionPattern = /function Resolve\(\) {[\s\S]{1,1000}?\n                }/;

if (containerClassPattern.test(content)) {
    // Inject code after Container.Root = new Container();
    content = content.replace(
        containerClassPattern,
        `Container.Root = new Container();
// POST-BUILD: Store Container reference for global access
if (typeof globalThis !== 'undefined') {
    globalThis.__GasAppFramework_Container = Container;
}`
    );
    console.log('✅ Post-build: Injected Container global assignment');
}

// Find Inject function and inject global assignment after it
const injectStart = content.indexOf('function Inject(token, optional = false)');
if (injectStart > 0) {
    // Find the end of the function (the closing })
    const injectEnd = content.indexOf('\n}', injectStart + 400);  // Search after function body
    if (injectEnd > 0) {
        console.log('[DEBUG] Inject function found at', injectStart, 'ending at', injectEnd);
        const insertPos = injectEnd + 2;  // After '\n}'
        const injection = `
// POST-BUILD: Store Inject reference for global access
if (typeof globalThis !== 'undefined') {
    globalThis.__GasAppFramework_Inject = Inject;
}`;
        content = content.substring(0, insertPos) + injection + content.substring(insertPos);
        console.log('✅ Post-build: Injected Inject global assignment');
    }
}

// Find Resolve function and inject global assignment after it
if (resolveFunctionPattern.test(content)) {
    content = content.replace(
        resolveFunctionPattern,
        (match) => match + `// POST-BUILD: Store Resolve reference for global access
if (typeof globalThis !== 'undefined') {
    globalThis.__GasAppFramework_Resolve = Resolve;
}
`
    );
    console.log('✅ Post-build: Injected Resolve global assignment');
}

// Find Context class and inject global assignment
if (contextRunPattern.test(content)) {
    content = content.replace(
        /class Context {/,
        `class Context {
// POST-BUILD: Store Context reference for global access (done in constructor area)
}
class Context_PostBuild {
    static init() {
        if (typeof globalThis !== 'undefined' && typeof Context !== 'undefined') {
            globalThis.__GasAppFramework_Context = Context;
        }
    }
`
    );
    // Also add a call to Context_PostBuild.init() after Context class
    content = content.replace(
        /}\s*;\/\/ \.\/modules\/di\/Decorators\.ts/,
        `}
Context_PostBuild.init();

;// ./modules/di/Decorators.ts`
    );
    console.log('✅ Post-build: Injected Context global assignment');
}

// Now patch the initialization code to use these global references
const initCode = `

// POST-BUILD INITIALIZATION
// Use stored Container and Context references to patch GasDI
if (typeof initializeGasAppFramework === 'function') {
    initializeGasAppFramework();
}

// Patch GasDI with direct Container/Context/Inject/Resolve references if getters failed
if (typeof globalThis !== 'undefined' && globalThis.GasDI) {
    // Log before patching
    if (typeof Logger !== 'undefined') {
        Logger.log('[POST-BUILD-INIT] Patching GasDI.Decorators');
        Logger.log('[POST-BUILD-INIT] __GasAppFramework_Inject type: ' + typeof globalThis.__GasAppFramework_Inject);
        Logger.log('[POST-BUILD-INIT] __GasAppFramework_Resolve type: ' + typeof globalThis.__GasAppFramework_Resolve);
    }
    
    // Force patch with post-build globals even if properties exist but are undefined
    if ((!globalThis.GasDI.Container || typeof globalThis.GasDI.Container === 'undefined') && globalThis.__GasAppFramework_Container) {
        globalThis.GasDI.Container = globalThis.__GasAppFramework_Container;
        if (globalThis.__GasAppFramework_Container.Root) {
            globalThis.GasDI.Container.Root = globalThis.__GasAppFramework_Container.Root;
        }
    }
    if ((!globalThis.GasDI.Context || typeof globalThis.GasDI.Context === 'undefined') && globalThis.__GasAppFramework_Context) {
        globalThis.GasDI.Context = globalThis.__GasAppFramework_Context;
    }
    if ((!globalThis.GasDI.Inject || typeof globalThis.GasDI.Inject !== 'function') && globalThis.__GasAppFramework_Inject) {
        globalThis.GasDI.Inject = globalThis.__GasAppFramework_Inject;
    }
    if ((!globalThis.GasDI.Resolve || typeof globalThis.GasDI.Resolve !== 'function') && globalThis.__GasAppFramework_Resolve) {
        globalThis.GasDI.Resolve = globalThis.__GasAppFramework_Resolve;
    }
    // Also patch Decorators - FORCE override even if they exist but are invalid
    if (!globalThis.GasDI.Decorators) {
        globalThis.GasDI.Decorators = {};
    }
    if ((!globalThis.GasDI.Decorators.Inject || typeof globalThis.GasDI.Decorators.Inject !== 'function') && globalThis.__GasAppFramework_Inject) {
        globalThis.GasDI.Decorators.Inject = globalThis.__GasAppFramework_Inject;
        if (typeof Logger !== 'undefined') {
            Logger.log('[POST-BUILD-INIT] Patched GasDI.Decorators.Inject');
        }
    }
    if ((!globalThis.GasDI.Decorators.Resolve || typeof globalThis.GasDI.Decorators.Resolve !== 'function') && globalThis.__GasAppFramework_Resolve) {
        globalThis.GasDI.Decorators.Resolve = globalThis.__GasAppFramework_Resolve;
        if (typeof Logger !== 'undefined') {
            Logger.log('[POST-BUILD-INIT] Patched GasDI.Decorators.Resolve');
        }
    }
    if ((!globalThis.GasDI.Decorators.Root || typeof globalThis.GasDI.Decorators.Root === 'undefined') && globalThis.GasDI.Container && globalThis.GasDI.Container.Root) {
        globalThis.GasDI.Decorators.Root = globalThis.GasDI.Container.Root;
    }
    
    // Log after patching
    if (typeof Logger !== 'undefined') {
        Logger.log('[POST-BUILD-INIT] After patching - GasDI.Decorators.Inject type: ' + typeof globalThis.GasDI.Decorators.Inject);
        Logger.log('[POST-BUILD-INIT] After patching - GasDI.Decorators.Resolve type: ' + typeof globalThis.GasDI.Decorators.Resolve);
    }
}
`;

// Check if initialization code already exists
if (!content.includes('// POST-BUILD INITIALIZATION')) {
    content += initCode;
    fs.writeFileSync(mainJsPath, content, 'utf-8');
    console.log('✅ Post-build: Added global initialization code');
} else {
    // Replace existing init code
    content = content.replace(
        /\/\/ POST-BUILD INITIALIZATION[\s\S]*$/,
        initCode.trim()
    );
    fs.writeFileSync(mainJsPath, content, 'utf-8');
    console.log('ℹ️  Post-build: Updated initialization code');
}
