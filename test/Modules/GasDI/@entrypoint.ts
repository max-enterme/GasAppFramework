// Entry point for GasDI module tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunGasDI() {
    const results = TRunner.runByCategory('GasDI');
    TGasReporter.printCategory(results, 'GasDI');
}
