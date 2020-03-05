# Poke

Set a deep sleep time out and poke when the user interacts with the device.


```blocks
power.setDeepSleepTimeout(10000);
forever(function() {
    power.checkDeepSleep();
    pause(1000);
})
input.buttonA.onEvent(ButtonEvent.Click, function () {
    power.poke();
})
```


```package
power
```

```config
feature=power
feature=buttonA
```