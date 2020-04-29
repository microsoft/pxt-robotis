
enum BUTTON_KIND{
    //% block="A"
    buttonA,
    //% block="B"
    buttonB,
    //%block="A+B"
    buttonAB
}

enum CONTROLLER_STATE {
    //% block="제어기방향"
    controllerDirection,
    //% block="흔들림"
    controllerShake
}

enum MEDIA_TYPE {
    //% block="멜로디"
    melody,
    //% block="피아노"
    piano
}
//% color="#68C3E2" weight=101
namespace event {
    /**
     * 목록에서 선택한 버튼(A / B / A+B) 누르면 실행
     * @param btn
     */
    //% block="%btn 누르면 실행"
    //% weight=5
    export function buttonExcute(btn: BUTTON_KIND, handler: () => void) {

    }

    /**
     * 제어기 방향, 흔들림 등 IMU 상태 감지하면 실행
     * @param state
     */
    //% block="%state 감지하면 실행"
    //% weight=4
    export function stateExcute(state: CONTROLLER_STATE, handler: () => void) {

    }

    /**
     * 조건값이 참인 경우 실행
     * @param doWork
     */
    //% block="%doWork 이면 실행"
    //% weight=3
    export function boolExcute(doWork: boolean, handler: () => void) {

    }

    /**
     * 조건값이 참인 경우 실행
     * @param mediaType
     */
    //% block="%mediaType 감지하면 실행"
    //% weight=2
    export function mediaExcute(mediaType: MEDIA_TYPE, handler: () => void) {

    }


}
