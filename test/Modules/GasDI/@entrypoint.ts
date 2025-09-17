// Entry point for GasDI module tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunGasDI() {
    const results = TRunner.runByCategory('GasDI');
    TGasReporter.printCategory(results, 'GasDI');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunGasDIDemo() {
    T.it('Demo GasDI Test 1', () => {
        TAssert.isTrue(true, 'GasDI demo test');
    }, 'GasDI');
    
    T.it('Demo GasDI Test 2', () => {
        TAssert.equals([1, 2, 3].length, 3, 'Array length test');
    }, 'GasDI');
    
    const results = TRunner.runByCategory('GasDI');
    TGasReporter.printCategory(results, 'GasDI');
}