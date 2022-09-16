export type ConnectionOptions = {
    tcpProtocol: string,
    udpProtocol: string,
    host: string,
    port: number,
    baseRoute: string,
}

export type PacketEncoder<T> = (value: T) => string
export type PacketDecoder<T> = (value: string) => T