enum Channel {
    //% block="chanel1"
    chanel1,
    //% block="chanel2"
    chanel2,
    //% block="chanel3"
    chanel3,
    //% block="chanel4"
    chanel4,
}

enum Signal {
    //% block="signal1"
    signal1,
    //% block="signal2"
    signal2,
    //% block="signal3"
    signal3,
    //% block="signal4"
    signal4,
}

//% color="#C8509B" weight=100
namespace communication {
    
    /**
     * RF 통신 사용
     */
    //% blockId=use_rf_communication block="RF : RF 통신 사용"
    //% weight=10
    //% blockGap=8
    export function useRF() {        
    }

    /**
     * RF 통신 채널 설정
     */
    //% blockId=set_rf_channel block="RF : 내 채널을 %channel 로 설정"
    //% weight=9
    //% blockGap=8
    export function setChannel(channel?: Channel) {
    }

    /**
     * 입력한 메시지 자/타 제어기에 보내기
     */
    //% blockId=send_message block="RF : %msg 를 %channel 로 보내기"
    //% weight=8
    //% blockGap=8
    export function sendMessage(msg?:string, channel?: Channel) {
    }

    /**
     * This is an event handler block
     */
    //% blockId=received_message_event block="RF : %msg 를 받았을 때 실행"
    //% weight=7
    //% blockGap=8
    export function receivedMsgEvent(msg:string, handler: () => void) {

    }

    /**
     * Bluetooth 통신 사용
     */
    //% blockId=use_ble_communication block="BLE : Bluetooth 통신 사용"
    //% weight=4
    //% blockGap=8
    export function useBle() {        
    }

    /**
     * [신호]를 보내기
     * @param signal send signal
     */
    //% blockId=send_ble_signal block="BLE : %signal 를 보내기"
    //% weight=3
    //% blockGap=8
    export function sendSignal(signal?: Signal) {        
    }

    /**
     * This is an event handler block
     * @param signal received signal
     */
    //% blockId=received_signal_event block="BLE : %signal 를 받았을 때 실행"
    //% weight=2
    //% blockGap=8
    export function receivedSignalEvent(signal: Signal, handler: () => void) {

    }
}