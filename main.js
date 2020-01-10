const ScheduleManager = require("./lib/ScheduleManager");
const uuidv4 = require("uuid/v4");

const uuid = uuidv4;

let scheduleManager;

const main = (broker, config, logger) => {
    scheduleManager = new ScheduleManager(config, logger, schedule => {
        logger.info(`Running schedule: ${schedule.id}.`);

        const message = {
            uuid: uuid(),
            schedule: schedule
        };

        broker.publish(config.exchangeName, config.schedulerOutputQ, message);
    });

    scheduleManager.start();
};

module.exports = main;
