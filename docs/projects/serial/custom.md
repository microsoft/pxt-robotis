# Custom

Attach a serial device to different pins.

```typescript
const ser = serial.createSerial(pins.TX, pins.RX);
forever(function () {
	ser.writeLine("hello")
    pause(500)
})

```

```package
serial
```