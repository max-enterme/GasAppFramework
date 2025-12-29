// Entry point for Locking module tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunLocking() {    const TRunner = (globalThis as any).TRunner;
    const TGasReporter = (globalThis as any).TGasReporter;    const results = TRunner.runByCategory('Locking');
    TGasReporter.printCategory(results, 'Locking');
}
