const oop = require("oop-node-common");

module.exports = new oop.Config({
    amqpAddress: "OOP_AMQP_ADDRESS",
    exchangeName: "OOP_EXCHANGE_NAME",
    oopCoreToken: "OOP_CORE_TOKEN",

    schedulerOutputQ: "OOP_SCHEDULER_OUTPUT_Q",

    oopCoreApiUrl: "OOP_CORE_API_URL"
});
