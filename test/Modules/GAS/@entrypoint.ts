// Entry point for GAS Advanced tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunGASAdvanced() {
    const TRunner = (globalThis as any).TRunner;
    const TGasReporter = (globalThis as any).TGasReporter;
    const results = TRunner.runByCategory('GAS');
    TGasReporter.printCategory(results, 'GAS');
}
