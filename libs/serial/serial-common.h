#pragma once
#include "pxt.h"
#include "serial-target.h"

enum class BaudRate {
  //% block=1M
  BaudRate1M = 1000000,
  //% block=921600
  BaudRate921600 = 921600,
  //% block=230400
  BaudRate230400 = 230400,
  //% block=115200
  BaudRate115200 = 115200,
  //% block=57600
  BaudRate57600 = 57600,
  //% block=38400
  BaudRate38400 = 38400,
  //% block=9600
  BaudRate9600 = 9600
};

enum class SerialEvent {
    //% block="data received"
    DataReceived = CODAL_SERIAL_EVT_DATA_RECEIVED,
    //% block="rx buffer full"
    RxBufferFull = CODAL_SERIAL_EVT_RX_FULL
};

enum class Delimiters {
    //% block="new line"
    NewLine = 10, //'\n',
    //% block=","
    Comma = 44, //',',
    //% block="$"
    Dollar = 36, // '$',
    //% block=":"
    Colon = 58, // ':',
    //% block="."
    Fullstop = 46, //'.',
    //% block="#"
    Hash = 35, //'#',
    //% block=";"
    SemiColumn = 59,
    //% block="space",
    Space = 32,
    //% block="tab"
    Tab = 9, //'\t'
    //% block="pipe"
    Pipe = 124 // `|`,
};

