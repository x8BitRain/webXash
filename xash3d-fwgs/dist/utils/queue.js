export class Queue {
    constructor() {
        this.size = 0;
    }
    enqueue(value) {
        const newNode = { value };
        if (!this.tail) {
            this.head = this.tail = newNode;
        }
        else {
            this.tail.next = newNode;
            this.tail = newNode;
        }
        this.size += 1;
    }
    dequeue() {
        if (!this.head)
            return undefined;
        const dequeuedValue = this.head.value;
        this.head = this.head.next;
        if (!this.head)
            this.tail = undefined;
        this.size -= 1;
        return dequeuedValue;
    }
}
