import { Queue } from "./utils";
/**
 * Emulates a simple network layer for Xash3D by implementing `sendto` and `recvfrom`
 * in a way that integrates with Emscripten’s networking model.
 */
export class Net {
    /**
     * Constructs the Net instance with a given packet sender.
     * @param sender - Object responsible for sending packets externally
     */
    constructor(sender) {
        /** Queue of incoming packets to be consumed by recvfrom */
        this.incoming = new Queue();
        this.sender = sender;
        /**
         * Handles outgoing packets by extracting them from Emscripten memory
         * and passing them to the `sender` without copying data.
         */
        this.sendto = (sockfd, packets, sizes, packet_count, seq_num, to, to_len) => {
            const em = this.em;
            const heapU8 = em.HEAPU8;
            const heap32 = em.HEAP32;
            let totalSize = 0;
            // Extract IP address from memory
            const ipOffset = to + 4;
            const ip = [
                heapU8[ipOffset],
                heapU8[ipOffset + 1],
                heapU8[ipOffset + 2],
                heapU8[ipOffset + 3]
            ];
            // Extract port from memory
            const portOffset = to + 2;
            const port = (heapU8[portOffset] << 8) | heapU8[portOffset + 1];
            // Loop through packets and pass them to sender
            for (let i = 0; i < packet_count; ++i) {
                const size = heap32[(sizes >> 2) + i]; // Size of each packet
                const packetPtr = heap32[(packets >> 2) + i]; // Pointer to each packet
                totalSize += size;
                // Create a subarray without copying the underlying buffer
                const packetView = heapU8.subarray(packetPtr, packetPtr + size);
                this.sender.sendto({ data: packetView, ip, port }); // Forward the packet
            }
            return totalSize;
        };
        /**
         * Handles incoming packets by copying them from the queue into Emscripten memory.
         */
        this.recvfrom = (sockfd, buf, len, flags, src_addr, addrlen) => {
            const packet = this.incoming.dequeue();
            if (!packet)
                return -1;
            const em = this.em;
            const data = packet.data;
            const u8 = data instanceof Uint8Array ? data : new Uint8Array(data.buffer || data);
            const copyLen = Math.min(len, u8.length);
            // Copy data into Emscripten's memory buffer
            if (copyLen > 0) {
                em.HEAPU8.set(u8.subarray(0, copyLen), buf);
            }
            // Write source IP and port into the address structure
            if (src_addr) {
                const heap8 = em.HEAP8;
                const heap16 = em.HEAP16;
                const base16 = src_addr >> 1;
                const port = packet.port;
                heap16[base16] = 2; // AF_INET
                heap8[src_addr + 2] = (port >> 8) & 0xFF;
                heap8[src_addr + 3] = port & 0xFF;
                heap8[src_addr + 4] = packet.ip[0];
                heap8[src_addr + 5] = packet.ip[1];
                heap8[src_addr + 6] = packet.ip[2];
                heap8[src_addr + 7] = packet.ip[3];
            }
            // Set address length if provided
            if (addrlen) {
                em.HEAP32[addrlen >> 2] = 16;
            }
            return copyLen;
        };
    }
    /**
     * Initializes the Net instance with a reference to the Emscripten module.
     * Ensures setup happens only once.
     * @param em - The Emscripten module instance
     */
    init(em) {
        if (this.em)
            return;
        this.em = em;
    }
}
