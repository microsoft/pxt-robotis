#include "pxt.h"
#include "ST7735.h"
#include "ILI9341.h"

#include "SPIScreenIO.h"
#ifdef STM32F4
#include "FSMCIO.h"
#endif

namespace pxt {

class WDisplay {
  public:
    ScreenIO *io;
    ST7735 *lcd;

    uint32_t currPalette[16];
    bool newPalette;
    bool inUpdate;

    uint8_t *screenBuf;
    Image_ lastStatus;

    uint16_t width, height;
    uint16_t displayHeight;
    uint8_t offX, offY;
    bool doubleSize;
    uint32_t palXOR;

    WDisplay() {
        uint32_t cfg2 = getConfig(CFG_DISPLAY_CFG2, 0x0);
        int conn = cfg2 >> 24;

        SPI *spi = NULL;
        if (conn == 0) {
            spi = new CODAL_SPI(*LOOKUP_PIN(DISPLAY_MOSI), *LOOKUP_PIN(DISPLAY_MISO),
                                *LOOKUP_PIN(DISPLAY_SCK));
            io = new SPIScreenIO(*spi);
        } else if (conn == 1) {
#ifdef CODAL_CREATE_PARALLEL_SCREEN_IO
            io = CODAL_CREATE_PARALLEL_SCREEN_IO(cfg2 & 0xffffff, PIN(DISPLAY_MOSI),
                                                 PIN(DISPLAY_MISO));
#else
            target_panic(PANIC_SCREEN_ERROR);
#endif
        } else {
            target_panic(PANIC_SCREEN_ERROR);
        }

        int dispTp = getConfig(CFG_DISPLAY_TYPE, DISPLAY_TYPE_ST7735);

        doubleSize = false;

        if (dispTp == DISPLAY_TYPE_ST7735)
            lcd = new ST7735(*io, *LOOKUP_PIN(DISPLAY_CS), *LOOKUP_PIN(DISPLAY_DC));
        else if (dispTp == DISPLAY_TYPE_ILI9341) {
            lcd = new ILI9341(*io, *LOOKUP_PIN(DISPLAY_CS), *LOOKUP_PIN(DISPLAY_DC));
            doubleSize = true;
        } else
            target_panic(PANIC_SCREEN_ERROR);

        uint32_t cfg0 = getConfig(CFG_DISPLAY_CFG0, 0x40);
        uint32_t frmctr1 = getConfig(CFG_DISPLAY_CFG1, 0x000603);
        palXOR = (cfg0 & 0x1000000) ? 0xffffff : 0x000000;
        auto madctl = cfg0 & 0xff;
        offX = (cfg0 >> 8) & 0xff;
        offY = (cfg0 >> 16) & 0xff;

        DMESG("configure screen: FRMCTR1=%p MADCTL=%p type=%d", frmctr1, madctl, dispTp);

        if (spi) {
            auto freq = (cfg2 & 0xff);
            if (!freq)
                freq = 15;
            spi->setFrequency(freq * 1000000);
            spi->setMode(0);
            // make sure the SPI peripheral is initialized before toggling reset
            spi->write(0);
        }

        auto rst = LOOKUP_PIN(DISPLAY_RST);
        if (rst) {
            rst->setDigitalValue(0);
            fiber_sleep(20);
            rst->setDigitalValue(1);
            fiber_sleep(20);
        }

        auto bl = LOOKUP_PIN(DISPLAY_BL);
        if (bl) {
            bl->setDigitalValue(1);
        }

        lcd->init();
        lcd->configure(madctl, frmctr1);
        width = getConfig(CFG_DISPLAY_WIDTH, 160);
        height = getConfig(CFG_DISPLAY_HEIGHT, 128);
        DMESG("screen: %d x %d, off=%d,%d", width, height, offX, offY);
        int sz = width * height;
        width = doubleSize ? (width << 1) : width;
        height = doubleSize ? (height << 1) : height;
        displayHeight = height;
        setAddrMain();
        screenBuf = (uint8_t *)app_alloc(sz / 2 + 20);

        lastStatus = NULL;
        registerGC((TValue *)&lastStatus);
        inUpdate = false;
    }

    void setAddrStatus() {
        lcd->setAddrWindow(offX, offY + displayHeight, width, height - displayHeight);
    }
    void setAddrMain() { lcd->setAddrWindow(offX, offY, width, displayHeight); }
};

SINGLETON_IF_PIN(WDisplay, DISPLAY_MOSI);

//%
int setScreenBrightnessSupported() {
    auto bl = LOOKUP_PIN(DISPLAY_BL);
    if (!bl)
        return 0;
#ifdef SAMD51
    if (bl->name == PA06)
        return 0;
#endif
    return 1;
}

//%
void setScreenBrightness(int level) {
    auto bl = LOOKUP_PIN(DISPLAY_BL);
    if (!bl)
        return;

    if (level < 0)
        level = 0;
    if (level > 100)
        level = 100;

    if (level == 0)
        bl->setDigitalValue(0);
    else if (level == 100)
        bl->setDigitalValue(1);
    else {
        if (setScreenBrightnessSupported()) {
            bl->setAnalogPeriodUs(1000);
            bl->setAnalogValue(level * level * 1023 / 10000);
        }
    }
}

//%
void setPalette(Buffer buf) {
    auto display = getWDisplay();
    if (!display)
        return;

    if (48 != buf->length)
        target_panic(PANIC_SCREEN_ERROR);
    for (int i = 0; i < 16; ++i) {
        display->currPalette[i] =
            (buf->data[i * 3] << 16) | (buf->data[i * 3 + 1] << 8) | (buf->data[i * 3 + 2] << 0);
        display->currPalette[i] ^= display->palXOR;
    }
    display->newPalette = true;
}

//%
void setupScreenStatusBar(int barHeight) {
    auto display = getWDisplay();
    if (!display)
        return;
    if (!display->doubleSize) {
        display->displayHeight = display->height - barHeight;
        display->setAddrMain();
    }
}

//%
void updateScreenStatusBar(Image_ img) {
    auto display = getWDisplay();
    if (!display)
        return;

    if (!img)
        return;
    display->lastStatus = img;
}

//%
void updateScreen(Image_ img) {
    auto display = getWDisplay();
    if (!display)
        return;

    if (display->inUpdate)
        return;

    display->inUpdate = true;

    auto mult = display->doubleSize ? 2 : 1;

    if (img) {
        if (img->bpp() != 4 || img->width() * mult != display->width ||
            img->height() * mult != display->displayHeight)
            target_panic(PANIC_SCREEN_ERROR);

        // DMESG("wait for done");
        display->lcd->waitForSendDone();

        auto palette = display->currPalette;

        if (display->newPalette) {
            display->newPalette = false;
        } else {
            palette = NULL;
        }

        memcpy(display->screenBuf, img->pix(), img->pixLength());

        // DMESG("send");
        display->lcd->sendIndexedImage(display->screenBuf, img->width(), img->height(), palette);
    }

    if (display->lastStatus && !display->doubleSize) {
        display->lcd->waitForSendDone();
        img = display->lastStatus;
        auto barHeight = display->height - display->displayHeight;
        if (img->bpp() != 4 || barHeight != img->height() || img->width() != display->width)
            target_panic(PANIC_SCREEN_ERROR);
        memcpy(display->screenBuf, img->pix(), img->pixLength());
        display->setAddrStatus();
        display->lcd->sendIndexedImage(display->screenBuf, img->width(), img->height(), NULL);
        display->lcd->waitForSendDone();
        display->setAddrMain();
        display->lastStatus = NULL;
    }

    display->inUpdate = false;
}

//%
void updateStats(String msg) {
    // ignore...
}
} // namespace pxt