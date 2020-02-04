const fetch = require("node-fetch");
const TargetDate = require("./TargetDate");
const Schedule = require("./Schedule");

class ScheduleManager {
    constructor(config, logger, callback) {
        this.config = config;
        this.logger = logger;
        this.callback = callback;

        this.schedules = {};
    }

    start() {
        this.getSchedules().then(schedules => this.setupSchedules(schedules));
    }

    getSchedules() {
        return fetch(
            `${this.config.oopCoreApiUrl}/schedules`,
            {
                headers: { "X-Core-Token": this.config.oopCoreToken }
            }
        ).then(res => res.json());
    }

    setupSchedules(schedules) {
        const seenIds = [];

        for (const schedule of schedules) {
            seenIds.push(String(schedule.id));

            if (schedule.id in this.schedules) {
                const loaded = this.schedules[schedule.id];

                if (!this.isSame(schedule.schedule, loaded.schedule)) {
                    loaded.stop();
                    delete this.schedules[schedule.id];
                    this.schedules[schedule.id] = new Schedule(
                        new TargetDate(schedule.schedule),
                        this.getCallback(schedule)
                    );
                    this.schedules[schedule.id].run();
                }
            } else {
                this.schedules[schedule.id] = new Schedule(
                    new TargetDate(schedule.schedule),
                    this.getCallback(schedule)
                );
                this.schedules[schedule.id].run();
            }
        }

        for (const scheduleId of Object.keys(this.schedules)) {
            if (!seenIds.includes(String(scheduleId))) {
                const loaded = this.schedules[scheduleId];

                loaded.stop();
                delete this.schedules[scheduleId];
            }
        }
    }

    getCallback(schedule) {
        return () => this.callback(schedule);
    }

    isSame(a, b) {
        return (
            a.minute === b.minute &&
            a.hour === b.hour &&
            a.day_of_week === b.day_of_week &&
            a.day_of_month === b.day_of_month &&
            a.month_of_year === b.month_of_year &&
            a.year === b.year
        );
    }
}

module.exports = ScheduleManager;
