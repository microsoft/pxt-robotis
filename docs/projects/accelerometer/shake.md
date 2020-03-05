# Shake

Use an accelerometer to detect when the device is shaken.

```blocks
input.onGesture(Gesture.Shake, function() {
    pins.LED.digitalWrite(true);
    pause(500);
    pins.LED.digitalWrite(false);
})
```

```config
feature=uf2
feature=accelerometer
feature=led
```

```package
accelerometer
```