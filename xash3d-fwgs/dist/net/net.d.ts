import { Em, Sockaddr } from "../generated/xash";
import { RollingBuffer } from "../utils";
import { EmNet } from "./emNet";
export interface NetOptions {
    maxPackets: number;
    hostname: string;
    hostID: number;
}
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
export interface Socket {
    id: number;
    family: number;
    type: number;
    protocol: number;
    addr?: Sockaddr;
}
/**
 * Emulates a simple network layer for Xash3D by implementing network functions
 * in a way that integrates with Emscripten’s networking model.
 */
export declare class Net implements EmNet {
    em?: Em;
    readonly sender: SendtoSender;
    readonly opts: NetOptions;
    readonly incoming: RollingBuffer<Packet>;
    protected lastSocketID: number;
    protected sockets: Map<number, Socket>;
    constructor(sender: SendtoSender, opts?: Partial<NetOptions>);
    /**
     * Initializes the Net instance with a reference to the Emscripten module.
     * Ensures setup happens only once.
     * @param em - The Emscripten module instance
     */
    init(em: Em): void;
    readSockaddrFast(addrPtr: number): [[number, number, number, number], number];
    recvfrom(fd: number, bufPtr: number, bufLen: number, flags: number, sockaddrPtr: number, socklenPtr: number): number;
    sendto(fd: number, bufPtr: number, bufLen: number, flags: number, sockaddrPtr: number, socklenPtr: number): number;
    sendtoBatch(fd: number, bufsPtr: number, lensPtr: number, count: number, flags: number, sockaddrPtr: number, socklenPtr: number): number;
    socket(family: number, type: number, protocol: number): number;
    gethostbyname(hostnamePtr: number): number;
    gethostname(namePtr: number, namelenPtr: number): number;
    getsockname(fd: number, sockaddrPtr: number, socklenPtr: number): number;
    bind(fd: number, sockaddrPtr: number, socklenPtr: number): 0 | -1;
    closesocket(fd: number): 0 | -1;
    getaddrinfo(hostnamePtr: number, restrictPrt: number, hintsPtr: number, addrinfoPtr: number): number;
}
