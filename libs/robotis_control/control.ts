enum BLOCKTYPE{
    //% block="모든"
    All,
    //% block="TYPE1"
    TYPE1,
    //% block="TYPE2"
    TYPE2
}

//% color="#00852B" weight=96 advanced=false
//% groups='["ROBOTIS"]'
namespace control {
    /**
     * 구간 안의 명령 무한 반복
     */
    //% block="무한반복 실행"
    //% group="ROBOTIS"
    //% weight=5
    export function repeatForever(handler: () => void) {

    }

    /**
     * 구간 안의 명령 지정된 횟수만큼 반복
     * @param count 횟수
     */
    //% block="%count|번 반복 실행"
    //% group="ROBOTIS"
    //% weight=4
    export function repeatCount(count: number, handler: () => void) {

    }

    /**
     * 구간 안의 명령 조건이 참인 동안 반복
     * @param isBool 
     */
    //% block="%isBool|인 동안 반복 실행"
    //% group="ROBOTIS"
    //% weight=3
    export function repeatBool(isBool: boolean, handler: () => void) {

    }

    /**
     * 선택(or 입력)한 시간만큼 실행을 대기시키는 명령
     * @param ms 대기시간 
     */
    //% blockId=waitBlock block="대기 %ms| ms"
    //% group="ROBOTIS"
    //% weight=2
    //% ms.fieldEditor="numberdropdown" ms.fieldOptions.decompileLiterals=true
    //% ms.fieldOptions.data='[["100 ms", 100],["200 ms", 200],["500 ms", 500],["1 second", 1000],["2 second", 2000],["3 second", 3000]]'
    export function waitForSecnods(ms: number) {

    }

    /**
     * 선택(or 입력)한 시간만큼 실행을 대기시키는 명령
     * @param isWait  
     */
    //% block="%isWait|일 때까지 대기"
    //% group="ROBOTIS"
    //% weight=1
    export function waitForBool(isWait: boolean) {

    }

    /**
     * 선택(or 입력)한 시간만큼 실행을 대기시키는 명령
     * @param blockType  
     */
    //% block="%blockType 명령 블록 종료"
    //% group="ROBOTIS"
    //% weight=0
    export function terminateBlock(blockType: BLOCKTYPE) {

    }
}