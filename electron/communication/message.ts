
export interface CommunicationIpcRequest {
    messageId: string;
    channel: string;
    args: any[];
}

export interface CommunicationIpcResponse<T> {
    messageId: string;
    data: T;
    error?: string;
}