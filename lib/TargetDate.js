class TargetDate {
    constructor(pattern) {
        this.pattern = pattern;

        this.target = new Date();

        this.specifications = {
            minute: {
                min: 0,
                max: 59,
                step: () => {
                    this.current.minute++;
                    if (this.current.minute >= this.parsed.minute.length) {
                        this.current.minute = 0;
                        this.specifications.hour.step();
                    }
                }
            },
            hour: {
                min: 0,
                max: 23,
                step: () => {
                    this.current.hour++;
                    if (this.current.hour >= this.parsed.hour.length) {
                        this.current.hour = 0;
                        this.specifications.day_of_month.step();
                    }
                }
            },
            day_of_week: {
                min: 1,
                max: 7,
                step: () => {
                    let date = this.getTargetDate();
                    let dayOfWeek = date.getUTCDay();
                    if (dayOfWeek === 0) {
                        dayOfWeek = 7;
                    }

                    while (!this.parsed.day_of_week.includes(dayOfWeek)) {
                        this.specifications.minute.step();

                        date = this.getTargetDate();
                        dayOfWeek = date.getUTCDay();
                        if (dayOfWeek === 0) {
                            dayOfWeek = 7;
                        }
                    }
                }
            },
            day_of_month: {
                min: 1,
                max: 31,
                step: () => {
                    this.current.day_of_month++;
                    if (
                        this.current.day_of_month >=
                            this.parsed.day_of_month.length ||
                        !this.specifications.day_of_month.onValidDayOfMonth()
                    ) {
                        this.current.day_of_month = 0;
                        this.specifications.month_of_year.step();
                    }

                    this.specifications.day_of_week.step();
                },
                onValidDayOfMonth: () => {
                    const d = this.getTargetDate();
                    if (
                        d.getUTCMonth() + 1 !==
                        this.parsed.month_of_year[this.current.month_of_year]
                    ) {
                        return false;
                    }

                    return true;
                }
            },
            month_of_year: {
                min: 1,
                max: 12,
                step: () => {
                    this.current.month_of_year++;
                    if (
                        this.current.month_of_year >=
                        this.parsed.month_of_year.length
                    ) {
                        this.current.month_of_year = 0;
                        this.specifications.year.step();
                    }
                }
            },
            year: {
                min: new Date().getFullYear(),
                max: 3000,
                step: () => {
                    this.current.year++;
                }
            }
        };

        this.parsed = {};

        this.current = {
            minute: 0,
            hour: 0,
            day_of_week: 0,
            day_of_month: 0,
            month_of_year: 0,
            year: 0
        };

        this.parse();
        this.next();
    }

    next() {
        while (this.getTargetDate() <= this.target) {
            this.specifications.minute.step();
        }

        this.target = this.getTargetDate();
    }

    getTargetDate() {
        const d = new Date(
            Date.UTC(
                this.parsed.year[this.current.year],
                this.parsed.month_of_year[this.current.month_of_year] - 1,
                this.parsed.day_of_month[this.current.day_of_month],
                this.parsed.hour[this.current.hour],
                this.parsed.minute[this.current.minute],
                0,
                0
            )
        );

        return d;
    }

    parse() {
        const pattern = /^(\*|\d+(-\d+)?(,\d+(-\d+)?)*)(\/\d+)?$/;

        for (const key in this.pattern) {
            const str = this.pattern[key];

            if (!pattern.test(str)) {
                console.log("No match!");
                continue;
            }

            let [timepoints, steps] = str.split("/");

            if (!steps) {
                steps = 1;
            }

            timepoints = timepoints.split(",");

            const processedTimepoints = [];
            for (const timepoint of timepoints) {
                if (timepoint === "*") {
                    const [start, stop] = [
                        this.specifications[key].min,
                        this.specifications[key].max
                    ];

                    for (let i = start; i <= stop; ++i) {
                        processedTimepoints.push(i);
                    }
                } else if (/\d+-\d+/.test(timepoint)) {
                    const [start, stop] = timepoint.split("-");

                    for (let i = start; i <= stop; ++i) {
                        processedTimepoints.push(i);
                    }
                } else {
                    processedTimepoints.push(timepoint);
                }
            }

            for (let i = processedTimepoints.length; i >= 0; --i) {
                if (
                    processedTimepoints[i] < this.specifications[key].min ||
                    processedTimepoints[i] > this.specifications[key].max
                ) {
                    processedTimepoints.splice(i, 1);
                }
            }

            for (let i = processedTimepoints.length; i >= 0; --i) {
                if ((processedTimepoints[i] - processedTimepoints[0]) % steps) {
                    processedTimepoints.splice(i, 1);
                }
            }

            timepoints = processedTimepoints;

            this.parsed[key] = processedTimepoints.map(i => parseInt(i));
        }
    }
}

module.exports = TargetDate;
