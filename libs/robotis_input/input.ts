enum Axis {
    //% block="x"
    X,
    //% block="y"
    Y,
    //% block="z"
    Z,

}

enum Rotate {
    //% block="Roll"
    Roll,
    //% block="Pitch"
    Pitch,
    //% block="Yaw"
    Yaw
}

enum SensorType {
    //% block="적외선1"
    IR1,
    //% block="적외선2"
    IR2,
    //% block="적외선3"
    IR3,
    //% block="적외선4"
    IR4,
    //% block="조도"
    ILLUMINATION
}

enum MICSOUNDTYPE {
    //% 실시간소리
    REALTIME,
    //% 최종소리
    FINAL
}

//% color="#5F3109" weight=98
//% groups=['ROBOTIS']
namespace input {
    /**
     * 가속도 센서의 선택한 축 (x/y/z)의 값
     */
    //% blockId=accel_value block="가속도 %axis|의 값"
    //% weight=1000
    //% blockGap=8
    //% group="ROBOTIS"
    export function accelAxisValue(axis?: Axis): Axis {
        return axis;
    }

    /**
     * 자이로 센서의 선택한 축 (x/y/z)의 값
     */
    //% blockId=gyro_value block="자이로 %axis|의 값"
    //% weight=999
    //% blockGap=8
    //% group="ROBOTIS"
    export function gyroAxisValue(axis?: Axis): Axis {
        return axis;
    }

    /**
     * Roll, Pitch, Yaw의 회전 값
     */
    //% blockId=gyro_value block="%rotate 값"
    //% weight=998
    //% blockGap=8
    //% group="ROBOTIS"
    export function rotateValue(rotate?: Rotate): Rotate {
        return rotate;
    }

    /**
     * 목록에서 선택한 적외선 센서, 조도 센서 값
     */
    //% blockId=sensor_value block="%sensor 값"
    //% weight=997
    //% blockGap=8
    //% group="ROBOTIS"
    export function sensorValue(sensor?: SensorType): SensorType {
        return sensor;
    }

    /**
     * 실시간, 최종소리 값
     */
    //% blockId=mic_value block="%mic 값"
    //% weight=996
    //% group="ROBOTIS"
    //% blockGap=8
    export function micValue(mic?: MICSOUNDTYPE): MICSOUNDTYPE {
        return mic;
    }

    /**
     * 조이스틱 값(상하좌우/중앙/좌상/좌하/우상/우하)
     */
    //% blockId=joystic_value block="조이스틱 값 %joysticVal"
    //% weight=995
    //% blockGap=8
    //% group="ROBOTIS"
    export function joysticValue(joysticVal?: number) {

    }

    /**
     * 제어기 켜진 후부터 ms 단쉬의 시간 값
     */
    //% blockId=get_workTime block="작동시간"
    //% weight=994
    //% blockGap=8
    //% group="ROBOTIS"
    export function getWorkTime(): number {
        return 0;
    }


}