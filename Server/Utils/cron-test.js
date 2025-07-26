const cron = require("node-cron");

const runDaily = func => {
    cron.schedule("0 7 * * *", () => {
        func();
        console.log("function has run today at 7");
    });
};

module.exports = runDaily;

// ```
// # ┌────────────── second (optional)
// # │ ┌──────────── minute
// # │ │ ┌────────── hour
// # │ │ │ ┌──────── day of month
// # │ │ │ │ ┌────── month
// # │ │ │ │ │ ┌──── day of week
// # │ │ │ │ │ │
// # │ │ │ │ │ │
// # * * * * * *
// ```