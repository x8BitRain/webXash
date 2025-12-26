export interface RollingBufferOptions {
    maxSize: number;
}
export declare class RollingBuffer<T> {
    readonly opts: RollingBufferOptions;
    private readonly buffer;
    private head;
    private tail;
    private count;
    constructor(opts: RollingBufferOptions);
    push(item: T): void;
    enqueue(item: T): void;
    pull(): T | undefined;
    peek(): T | undefined;
    size(): number;
    isFull(): boolean;
    isEmpty(): boolean;
    clear(): void;
    toArray(): T[];
}
