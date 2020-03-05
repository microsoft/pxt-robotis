# Console

Display the console output on a screen.

```typescript
input.buttonA.onEvent(ButtonEvent.Click, function () {
    console.log("hello")
})
display.showConsole()
console.log("press button to")
console.log("say hello")
```

```config
feature=uf2
feature=screen
feature=buttonA
```
```package
screen---st7735
display
```