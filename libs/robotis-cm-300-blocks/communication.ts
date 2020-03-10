//% color=#E3008C weight=900 icon="\uf086" block="Communication"
namespace communication {
    /**
     * Run blocks when receives a message.
     * @param message message to receive
     */
    //% help=basic/clear-screen
    //% blockId=cm300_onMessageReceived block="#on message received %message"
    //% weight=1 blockGap=8
    export function onMessageReceived(message: string, handler: () => void): void {

    }

    /**
     * Send a message.
     * @param message message to send
     */
    //% help=basic/clear-screen
    //% blockId=cm300_sendMessage block="#send message %message"
    //% weight=1 blockGap=8
    export function sendMessage(message: string): void {

    }
}