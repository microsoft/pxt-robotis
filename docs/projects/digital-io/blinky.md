# Blinky

## Introduction @unplugged

Turn on and off the light pin to create a blinking effect.

![A breadboard with a blinking LED](/static/projects/digital-io/blinky/gallery.gif)

```template
forever(function() {
    
})
```

## Step 1 @fullscreen

Add a ``||pins:digital write||`` to turn the ``LED`` pin ``LOW``.

```blocks
forever(function() {
    pins.LED.digitalWrite(false)
})
```

## Step 2 @fullscreen

Take a peek at the simulator and make sure the LED is turned off.

![A breadboard with a LED turned off](/static/projects/digital-io/blinky/off.png)

## Step 3 @fullscreen

Add another ``||blocks:pause||`` and ``||pins:digital write||`` to create a blinking effect.
Make sure the digital write is **HIGH**.

```blocks
forever(function() {
    pins.LED.digitalWrite(false)
    pause(500)
    pins.LED.digitalWrite(true)
    pause(500)    
})
```

Play with the duration in your pauses to create different patterns.

## Step 4 @fullscreen

Look at the simulator and make sure your program works as expected. 

If you have a @boardname@, press ``|Download|`` and follow the instruction to get your code on your device.

Click on the **wrench** icon under the simulator to get detailed breadboarding instructions.

![The wrench button](/static/projects/digital-io/blinky/wrench.png)

```config
feature=uf2
feature=led
```