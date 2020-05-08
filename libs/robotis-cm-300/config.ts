namespace config {
    export const PIN_LED = DAL.P1_4; 

    export const PIN_BTN_A = DAL.P1_10; //START BUTTON
    export const PIN_BTN_B = DAL.P1_13; //MODE BUTTON
    
    //Sensors
    export const PIN_PWREN = DAL.P0_0;
    export const PIN_BATTSENSE = DAL.P0_31;
    
    export const PIN_ACCELEROMETER_SCL = DAL.P1_9;
    export const PIN_ACCELEROMETER_SDA = DAL.P0_11;
    export const PIN_ACCELEROMETER_INT = DAL.P1_8;

    //Robotis IR
    export const PIN_A5 = DAL.P0_29;
    export const PIN_A3 = DAL.P0_3;
    export const PIN_A6 = DAL.P0_30;
    export const PIN_A0 = DAL.P0_2;
    export const PIN_A4 = DAL.P0_28;
    export const PIN_D9 = DAL.P0_9;
    export const PIN_D12 = DAL.P1_12;
    export const PIN_D11 = DAL.P1_11;

    //Actuators
    export const PIN_SERVO_1 = DAL.P0_5;
    export const PIN_SERVO_2 = DAL.P0_4;

    //Communication
    export const PIN_RX = DAL.P0_27;
    export const PIN_TX = DAL.P0_26;

    export const PIN_DXL_RX = DAL.P0_8;
    export const PIN_DXL_TX = DAL.P0_7;
    export const PIN_DXL_DIR = DAL.P1_14;
    export const PIN_DXL_PWR = DAL.P1_8;

    export const PIN_SCL = DAL.P1_9;
    export const PIN_SDA = DAL.P0_11;
    
    //LCD (temporarily test lcd with wiring)
    export const PIN_DISPLAY_SCK = DAL.P0_1;
    export const PIN_DISPLAY_MISO = DAL.P0_24;
    export const PIN_DISPLAY_MOSI = DAL.P1_2;
    export const PIN_DISPLAY_CS = DAL.P0_5;
    export const PIN_DISPLAY_DC = DAL.P1_5;
    export const PIN_DISPLAY_RST = DAL.P1_3;
    export const PIN_DISPLAY_BL = DAL.P1_7;
    
    //ILI9341
    export const DISPLAY_TYPE = 9341
    export const DISPLAY_WIDTH = 320
    export const DISPLAY_HEIGHT = 240
    export const DISPLAY_CFG0 = 0x08
    export const DISPLAY_CFG1 = 0x0010ff
    export const DISPLAY_CFG2 = 32    
}
