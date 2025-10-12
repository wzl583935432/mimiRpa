export interface BaseMessage<T>{
    bizCode:string,
    requestCode:string,
    messageId:string,
    messageType:string, //request/ response
    returnCode?:string|undefined,
    errorMessage?:string|undefined,
    body?:T
}