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
                        this.specifications.dayOfMonth.step();
                    }
                }
            },
            dayOfWeek: {
                min: 1,
                max: 7,
                step: () => {
                    let date = this.getTargetDate();
                    let dayOfWeek = date.getUTCDay();
                    if (dayOfWeek === 0) {
                        dayOfWeek = 7;
                    }

                    while (!this.parsed.dayOfWeek.includes(dayOfWeek)) {
                        this.specifications.minute.step();

                        date = this.getTargetDate();
                        dayOfWeek = date.getUTCDay();
                        if (dayOfWeek === 0) {
                            dayOfWeek = 7;
                        }
                    }
                }
            },
            dayOfMonth: {
                min: 1,
                max: 31,
                step: () => {
                    this.current.dayOfMonth++;
                    if (
                        this.current.dayOfMonth >=
                            this.parsed.dayOfMonth.length ||
                        !this.specifications.dayOfMonth.onValidDayOfMonth()
                    ) {
                        this.current.dayOfMonth = 0;
                        this.specifications.monthOfYear.step();
                    }

                    this.specifications.dayOfWeek.step();
                },
                onValidDayOfMonth: () => {
                    const d = this.getTargetDate();
                    if (
                        d.getUTCMonth() + 1 !==
                        this.parsed.monthOfYear[this.current.monthOfYear]
                    ) {
                        return false;
                    }

                    return true;
                }
            },
            monthOfYear: {
                min: 1,
                max: 12,
                step: () => {
                    this.current.monthOfYear++;
                    if (
                        this.current.monthOfYear >=
                        this.parsed.monthOfYear.length
                    ) {
                        this.current.monthOfYear = 0;
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
            dayOfWeek: 0,
            dayOfMonth: 0,
            monthOfYear: 0,
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
                this.parsed.monthOfYear[this.current.monthOfYear] - 1,
                this.parsed.dayOfMonth[this.current.dayOfMonth],
                this.parsed.hour[this.current.hour],
                this.parsed.minute[this.current.minute],
                0,
                0
            )
        );

        return d;
    }

    isSame(other) {
        return (
            this.minute === other.minute &&
            this.hour === other.hour &&
            this.dayOfWeek === other.dayOfWeek &&
            this.dayOfMonth === other.dayOfMonth &&
            this.monthOfYear === other.monthOfYear &&
            this.year === other.year
        );
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
