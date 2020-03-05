# Button

## Introduction @unplugged

Use a button on a digital pin to control an LED.

![A breadboard with a button that turns on an LED](/static/projects/digital-io/button-led/gallery.gif)

## Step 1 @fullscreen

Add a ``||input:on event||`` to handle a "button click" on pin **LED**.

```blocks
input.buttonA.onEvent(ButtonEvent.Click, function () {
})
```

## Step 2 @fullscreen

Add ``||pins:digital write||`` to set pin **LED** HIGH when **START Button** is clicked.

```blocks
input.buttonA.onEvent(ButtonEvent.Click, function () {
    pins.LED.digitalWrite(true)
})
```

## Step 3 @fullscreen

Look at the simulator and notice that a breadboard and a button has been added to the board.
Try pressing on the button and the LED should light up.

![A simulated boardboard turning on a LED](/static/projects/digital-io/button-led/led-on.gif)

## Step 4 @fullscreen

Add ``||loops:pause||`` to wait some time, then another ``||pins:digital write||`` to 
turn pin **LED** to low.

```blocks
input.buttonA.onEvent(ButtonEvent.Click, function () {
    pins.LED.digitalWrite(true)
    pause(1000)
    pins.LED.digitalWrite(false)    
})
```

## Step 5 @fullscreen

Try your program in the simulator. If it works as expected, click on the ``|Download|`` button
and follow the instructions to get it on your board.

## Step 6 @fullscreen

Click on the **wrench** icon under the simulator to print detailed breadboard wiring instructions.

![Wrench icon](/static/projects/digital-io/button-led/wrench.png)

```config
feature=uf2
feature=led
feature=buttonA
```