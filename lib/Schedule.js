const MAX_TIMEOUT = 1073741824;

class Schedule {
    constructor(dateProvidor, callback) {
        this.dateProvidor = dateProvidor;
        this.callback = callback;

        this.running = true;
        this.timeout = null;
    }

    run() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }

        const now = new Date();
        const target = this.dateProvidor.target;

        const timeout = Math.min(target.getTime() - now.getTime(), MAX_TIMEOUT);

        this.timeout = setTimeout(() => {
            this.timeout = null;

            const now = new Date();
            if (target.getTime() - now.getTime() < 10) {
                this.dateProvidor.next();
                console.log(`Setting immediate ${Date()}`);
                setImmediate(() => this.callback());
            }

            this.run();
        }, timeout);
    }

    stop() {
        if (this.timeout !== null) {
            clearTimeout(this.timeout);
        }
    }
}

module.exports = Schedule;
