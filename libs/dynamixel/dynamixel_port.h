/*******************************************************************************
* Copyright 2016 ROBOTIS CO., LTD.
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*******************************************************************************/

#pragma once
#include "pxt.h"
#include "Serial.h"
#include "dynamixel.h"

namespace DYNAMIXEL {

/* SerialPortHandler */
class SerialPortHandler : public DXLPortHandler
{
  public:
    SerialPortHandler(CODAL_SERIAL &port, CODAL_PIN &dir_pin)
     : DXLPortHandler(), port_(port), dir_pin_(dir_pin), baud_(57600)
    {}

    virtual void begin()
    {
      begin(baud_);
    }

    virtual void end()
    {
      setOpenState(false);
    }

    virtual int available(void)
    {
      return port_.rxBufferedSize();
    }

    virtual int read()
    {
      return port_.getc();
    }

    virtual size_t write(uint8_t c)
    {
      size_t ret = 0;
      dir_pin_.setDigitalValue(1);

      ret = port_.putc((char)c);
      while(port_.txBufferedSize());
      
      dir_pin_.setDigitalValue(0);

      return ret;
    }

    virtual size_t write(uint8_t *buf, size_t len)
    {
      size_t ret = 0;
      dir_pin_.setDigitalValue(1);

      ret = port_.send(buf, len, codal::SerialMode::SYNC_SPINWAIT);

      dir_pin_.setDigitalValue(0);

      return ret;
    }

    virtual void begin(unsigned long baud)
    {
      baud_ = baud;
      port_.setBaud(baud);
      dir_pin_.setDigitalValue(0);

      port_.setTxBufferSize(254);
      port_.setRxBufferSize(254);

      setOpenState(true);      
    }

    virtual unsigned long getBaud()
    {
      return baud_;
    }

  private:
    CODAL_SERIAL &port_;
    CODAL_PIN &dir_pin_;
    unsigned long baud_;
};


} //namespace DYNAMIXEL