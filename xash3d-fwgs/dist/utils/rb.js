export class RollingBuffer {
    constructor(opts) {
        this.head = 0;
        this.tail = 0;
        this.count = 0;
        this.opts = opts;
        this.buffer = new Array(this.opts.maxSize);
    }
    push(item) {
        if (this.isFull()) {
            this.tail = (this.tail + 1) % this.opts.maxSize;
        }
        else {
            this.count += 1;
        }
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.opts.maxSize;
    }
    enqueue(item) {
        this.push(item);
    }
    pull() {
        if (this.isEmpty())
            return undefined;
        const item = this.buffer[this.tail];
        this.buffer[this.tail] = undefined;
        this.tail = (this.tail + 1) % this.opts.maxSize;
        this.count -= 1;
        return item;
    }
    peek() {
        return this.buffer[this.tail];
    }
    size() {
        return this.count;
    }
    isFull() {
        return this.count === this.opts.maxSize;
    }
    isEmpty() {
        return this.count === 0;
    }
    clear() {
        this.buffer.fill(undefined);
        this.head = 0;
        this.tail = 0;
        this.count = 0;
    }
    toArray() {
        const res = new Array(this.size());
        for (let i = 0; i < this.size(); ++i) {
            const idx = (this.tail + i) % this.opts.maxSize;
            res[i] = this.buffer[idx];
        }
        return res;
    }
}
