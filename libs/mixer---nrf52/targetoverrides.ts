enum Playtime {
    //% block="모두"
    all,
    //% block="1초"
    sec1,
    //% block="5초"
    sec5
}

namespace music {
    
    /**
     * 마이크에 들어오는 소리 녹음
     * @param sec received message
     */
    //% blockId=record_sound_for block="%sec 초 동안 소리 녹음하기"
    //% weight=1000
    //% blockGap=8
    export function recordSoundForsec(sec: number){
        if(!sec) return;
    }

    /**
     * 녹음된 소리 모두/1초/5초 실행하기
     * @param sec received message
     */
    //% blockId=play_sound_for block="녹음된 소리 %sec 실행하기"
    //% weight=999
    //% blockGap=8
    export function playSoundForsec(sec: Playtime){
        if(!sec) return;
    }

    /**
     * 실시간 소리 값 
     */
    //% blockId=realtime_sound block="실시간 소리 값"
    export function realtimeSound(): number {
        return 0;
    }

    /**
     * 최종 소리 값 
     */
    //% blockId=final_sound block="최종 소리 값"
    export function finalSound(): number {
        return 0;
    }

}