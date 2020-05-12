enum MOTOR {
    //% block="1번모터"
    port1,
    //% block="2번모터"
    port2,
    //% block="모든모터"
    portAll
}

enum MOTORMODE {
    //% block="바퀴모드"
    wheel,
    //% block="관절모드"
    joint
}

enum DIRECTION {
    //% block="전진"
    front,
    //% block="후진"
    rear,
    //% block="좌회전"
    left,
    //% block="우회전"
    right,
    //% block="정지"
    stop
}

enum CLOCKWISE {
    //% block="정방향"
    clockwise,
    //% block="역방향"
    counterclockwise
}

enum BUTTONTYPE {
    //% block="버튼A"
    buttonA,
    //% block="버튼B"
    buttonB,
    //% block="모든버튼"
    allButton,
}
enum ON_OFF {
    //% block="켜기"
    on,
    //% block="끄기"
    off
}

//% color="#D67923" weight=99
namespace output {
    /**
     * 선택한 번호/모든 모터 바퀴/관절 모드로 설정
     * @param motor motor port
     * @param mode  motor mode
     */
    //% blockId=set_motor_mode block="%motor %mode|로 설정"
    //% weight=1000
    //% blockGap=8
    export function setMotorMode(motor: MOTOR, mode: MOTORMODE){
    }

    /**
     * 관절모드일 때 선택한 속도로 설정
     * @param speed  motor speed
     */
    //% blockId=set_joint_speed block="관절모드를 %speed 속도로 설정"
    //% speed.min=0 speed.max=100
    //% weight=999
    //% blockGap=8
    export function setJointSpeed(speed: number){
    }

    /**
     * 전진/후진/좌회전/우회전/정지
     * @param speed motor speed
     * @param direction direction
     */
    //% blockId=set_speed_direction block="E2 로봇을 %speed|의 속도로 %direction"
    //% speed.min=0 speed.max=100
    //% weight=998
    //% blockGap=8
    export function setSpeedDirection(speed: number, direction: DIRECTION){
    }

    /**
     * 선택한 모터를 선택한 속도와 방향으로 회전
     * @param motor motor port
     * @param speed motor speed
     * @param clockwise clockwise
     */
    //% blockId=set_speed_clockwise block="%motor %speed|의 속도로 %clockwise 회전"
    //% speed.min=0 speed.max=100
    //% weight=997
    //% blockGap=8
    export function setSpeedClockwise(motor: MOTOR, speed: number, clockwise: CLOCKWISE){
    }

    /**
     * 선택한 모터의 위치 값을 지정된 값으로 이동
     * @param motor motor port
     * @param position motor position
     */
    //% blockId=set_motor_position block="%motor|의 위치를 %position|으로 이동"
    //% position.min=0 position.max=2048
    //% weight=995
    //% blockGap=8
    export function setMotorPosition(motor: MOTOR, position: number){
    }

    /**
     * 선택한 버튼의 LED 켜기/끄기
     * @param button button
     * @param onoff set button led
     */
    //% blockId=set_button_led block="%button LED %onoff"
    //% weight=994
    //% blockGap=8
    export function setButtonLed(button: BUTTONTYPE, onoff: ON_OFF){
    }

}