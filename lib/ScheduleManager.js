const fetch = require("node-fetch");
const TargetDate = require("./TargetDate");
const Schedule = require("./Schedule");

class ScheduleManager {
    constructor(broker, config, logger, callback) {
        this.broker = broker;
        this.config = config;
        this.logger = logger;
        this.callback = callback;

        this.schedules = {};
    }

    start() {
        this.getSchedules()
            .then(schedules => this.setupSchedules(schedules))
            .then(() => this.startUpdateListener());
    }

    getSchedules() {
        return fetch(`${this.config.oopCoreApiUrl}/schedules`, {
            headers: { "X-Core-Token": this.config.oopCoreToken }
        }).then(res => res.json());
    }

    setupSchedules(schedules) {
        const seenIds = [];

        for (const schedule of schedules) {
            seenIds.push(String(schedule.id));
            this.logger.info(`Loading schedule: ${schedule.id}.`);

            if (schedule.id in this.schedules) {
                const loaded = this.schedules[schedule.id];

                if (!loaded.isSame(schedule)) {
                    loaded.stop();

                    this.schedules[schedule.id] = new Schedule(
                        schedule.id,
                        new TargetDate(schedule),
                        this.getCallback(schedule)
                    );

                    this.schedules[schedule.id].run();
                }
            } else {
                this.schedules[schedule.id] = new Schedule(
                    schedule.id,
                    new TargetDate(schedule),
                    this.getCallback(schedule)
                );

                this.schedules[schedule.id].run();
            }
        }

        for (const scheduleId of Object.keys(this.schedules)) {
            if (!seenIds.includes(String(scheduleId))) {
                this.logger.info(`Stopping schedule: ${scheduleId}.`);
                const loaded = this.schedules[scheduleId];

                loaded.stop();
                delete this.schedules[scheduleId];
            }
        }
    }

    getCallback(schedule) {
        return () => this.callback(schedule);
    }

    startUpdateListener() {
        this.broker.subscribe(this.config.scheduleUpdateQ, message => {
            const { action, schedule } = message.content;
            let schedules = Object.values(this.schedules);

            switch (action) {
                case "create":
                    schedules.push(schedule);
                    break;

                case "update":
                    schedules = schedules.map(oldSchedule =>
                        oldSchedule.id === schedule.id ? schedule : oldSchedule
                    );
                    break;

                case "delete":
                    schedules = schedules.filter(
                        ({ id }) => id !== schedule.id
                    );
                    break;

                default:
                    throw new Error(
                        `Unknown schedule update action: '${action}'.`
                    );
            }

            this.setupSchedules(schedules);
        });
    }
}

module.exports = ScheduleManager;
