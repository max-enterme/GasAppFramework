// Entry point for Locking module tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunLocking() {
    const results = TRunner.runByCategory('Locking');
    TGasReporter.printCategory(results, 'Locking');
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunLockingDemo() {
    T.it('Demo Locking Test 1', () => {
        TAssert.isTrue(true, 'Locking demo test');
    }, 'Locking');
    
    T.it('Demo Locking Test 2', () => {
        TAssert.equals(Math.max(1, 2, 3), 3, 'Math.max test');
    }, 'Locking');
    
    const results = TRunner.runByCategory('Locking');
    TGasReporter.printCategory(results, 'Locking');
}