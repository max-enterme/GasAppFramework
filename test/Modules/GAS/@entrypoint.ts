// Entry point for GAS Advanced tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunGASAdvanced() {
    const results = TRunner.runByCategory('GAS');
    TGasReporter.printCategory(results, 'GAS');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunGASDemo() {
    T.it('Demo GAS Test 1', () => {
        TAssert.isTrue(true, 'GAS demo test');
    }, 'GAS');
    
    T.it('Demo GAS Test 2', () => {
        TAssert.equals(typeof 'hello', 'string', 'Type check test');
    }, 'GAS');
    
    const results = TRunner.runByCategory('GAS');
    TGasReporter.printCategory(results, 'GAS');
}