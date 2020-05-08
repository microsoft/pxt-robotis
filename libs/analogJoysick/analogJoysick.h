#include "CM300Joystick.h"


namespace pxt {

class WJoystick {

  public:
    codal::CM300Joystick sensor;

    WJoystick()
    : sensor(*LOOKUP_PIN(SERVO_1), DEVICE_ID_IO_P0, *LOOKUP_PIN(SERVO_2), DEVICE_ID_IO_P0)
    {
      
    }
};

}