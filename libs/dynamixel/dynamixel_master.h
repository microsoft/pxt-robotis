#pragma once
#include "dynamixel_port.h"

#define DEVICE_ID_DYNAMIXEL 40000
#define CFG_PIN_DXL_RX 40000
#define CFG_PIN_DXL_TX 40001
#define CFG_PIN_DXL_DIR 40002
#define CFG_PIN_DXL_PWR 40003

enum class DXLBaudRate {
  //% block=1M
  BaudRate1M = 1000000,
  //% block=115200
  BaudRate115200 = 115200,
  //% block=57600
  BaudRate57600 = 57600,
  //% block=9600
  BaudRate9600 = 9600
};

enum class DXLOperatingMode {
  //% block=Velocity
  OPModeVelocity = 1,
  //% block=Position
  OPModePosition = 3,
  //% block=Extended Position
  OPModeExPosition = 4,
  //% block=PWM
  OPModePWM = 16
};

namespace dynamixel {

class DynamixelMaster:public DYNAMIXEL::Master {
  private:
    DevicePin *tx;
    DevicePin *rx;
    DevicePin *dir;
    CODAL_SERIAL ser;

  public:
    dynamixel::SerialPortHandler port;

    DynamixelMaster(DevicePin *_tx, DevicePin *_rx, DevicePin *_dir, int id)
        : Master(), tx(_tx), rx(_rx), dir(_dir), ser(*tx, *rx), port(ser, *dir){
        if (id <= 0)
            id = allocateNotifyEvent();
        ser.id = id;
        this->setPort(&port);
    }
    
    void setPortBaudRate(DXLBaudRate rate) { port.begin((unsigned long)rate); }
};

} // namespace dynamixel

typedef dynamixel::DynamixelMaster* DynamixelDevice;
