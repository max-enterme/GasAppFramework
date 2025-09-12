/// <reference path="../../../src/Modules/EventSystem/Schedule.Engine.ts" />
namespace SpecSchedule {
    T.it("isDue true at zero seconds", () => {
        const d = new Date(); d.setSeconds(0, 0);
        TAssert.isTrue(EventSystem.Schedule.isDue("* * * * *", d));
    });
}
