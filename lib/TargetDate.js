class TargetDate {
    constructor(pattern) {
        this.pattern = {
            year: pattern.year,
            monthOfYear: pattern.monthOfYear,
            dayOfMonth: pattern.dayOfMonth,
            dayOfWeek: pattern.dayOfWeek,
            hour: pattern.hour,
            minute: pattern.minute
        };

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

            let [timepoints, steps = 1] = str.split("/");

            const { min, max } = this.specifications[key];

            timepoints = this.getUnfilteredTimepoints(timepoints.split(","), {
                min,
                max
            });
            timepoints = timepoints.filter(t => t >= min && t <= max);

            const first = timepoints[0];
            timepoints = timepoints.filter(t => !((t - first) % steps));

            this.parsed[key] = timepoints;
        }
    }

    getUnfilteredTimepoints(timepoints, ends) {
        const { min, max } = ends;
        const processedTimepoints = [];

        for (const timepoint of timepoints) {
            if (timepoint === "*") {
                for (let i = min; i <= max; ++i) {
                    processedTimepoints.push(i);
                }
            } else if (/\d+-\d+/.test(timepoint)) {
                const [start, stop] = timepoint.split("-");

                for (let i = start; i <= stop; ++i) {
                    processedTimepoints.push(i);
                }
            } else if (timepoint >= min && timepoint <= max) {
                processedTimepoints.push(parseInt(timepoint));
            }
        }

        return processedTimepoints.sort();
    }
}

module.exports = TargetDate;
