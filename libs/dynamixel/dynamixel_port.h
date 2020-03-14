#pragma once
#include "pxt.h"
#include "Serial.h"

#include <stdint.h>
#include <stddef.h>

#define DEFAULT_DXL_BUF_LENGTH  256
#if (DEFAULT_DXL_BUF_LENGTH > 0xFFFF)
#error "\r\nError : DEFAULT_DXL_BUF_LENGTH is OVERFLOW! This must be a 16 bit range."
#endif

class DXLPortHandler
{
  public:
    DXLPortHandler(): open_state_(false) {}
    
    virtual void begin() = 0;
    virtual void end() = 0;
    virtual int available(void) = 0;
    virtual int read() = 0;
    virtual size_t write(uint8_t) = 0;
    virtual size_t write(uint8_t *buf, size_t len) = 0;
    bool getOpenState() const {return open_state_;};
    void setOpenState(bool state) {open_state_ = state;};

  private:
    bool open_state_;
};

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
