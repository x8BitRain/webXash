export interface QueueNode<T> {
    value: T;
    next?: QueueNode<T>;
}
export declare class Queue<T> {
    private head?;
    private tail?;
    private size;
    enqueue(value: T): void;
    dequeue(): T | undefined;
}
