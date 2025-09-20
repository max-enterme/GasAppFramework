namespace Spec_Schedule {
    T.it('isDue true at zero seconds', () => {
        const d = new Date(); d.setSeconds(0, 0);
        TAssert.isTrue(EventSystem.Schedule.isDue('* * * * *', d));
    }, 'EventSystem');
}
