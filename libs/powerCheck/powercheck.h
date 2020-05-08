#include "CM300Batsense.h"

namespace pxt {

class WBat {

  public:
    codal::CM300Batsense sensor;

    WBat()
    : sensor(*LOOKUP_PIN(BATTSENSE), DEVICE_ID_IO_P0, *LOOKUP_PIN(PWREN), DEVICE_ID_IO_P0)
    {
      
    }
};

}