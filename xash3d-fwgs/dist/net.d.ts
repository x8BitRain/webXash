import { Em, Module } from "./generated/xash";
import { Queue } from "./utils";
/**
 * Represents a network packet with raw data, IP address, and port.
 */
export interface Packet {
    data: Int8Array<ArrayBufferLike>;
    ip: [number, number, number, number];
    port: number;
}
/**
 * Interface for an object that handles sending packets via `sendto`.
 */
export interface SendtoSender {
    sendto: (data: Packet) => void;
}
/**
 * Emulates a simple network layer for Xash3D by implementing `sendto` and `recvfrom`
 * in a way that integrates with Emscripten’s networking model.
 */
export declare class Net {
    /** Function to send packets (Emscripten-compatible) */
    sendto: Module['sendto'];
    /** Function to receive packets (Emscripten-compatible) */
    recvfrom: Module['recvfrom'];
    /** User-defined sender used for emitting outgoing packets */
    sender: SendtoSender;
    /** Queue of incoming packets to be consumed by recvfrom */
    incoming: Queue<Packet>;
    /** Reference to the Emscripten module once initialized */
    em?: Em;
    /**
     * Constructs the Net instance with a given packet sender.
     * @param sender - Object responsible for sending packets externally
     */
    constructor(sender: SendtoSender);
    /**
     * Initializes the Net instance with a reference to the Emscripten module.
     * Ensures setup happens only once.
     * @param em - The Emscripten module instance
     */
    init(em: Em): void;
}
