// Entry point for EventSystem module tests
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function test_RunEventSystem() {
    const results = TRunner.runByCategory('EventSystem');
    TGasReporter.printCategory(results, 'EventSystem');
}
