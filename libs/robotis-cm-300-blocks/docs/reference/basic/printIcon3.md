# printIcon3

화살표 아이콘을 LCD 에 표시.

```sig
basic.printIcon3(0)
basic.clearScreen()
```

상하좌우 화살표를 선택하여 LCD 창에 표시할 수 있습니다.
아이콘을 직접 그려서 표시하려면 ``||basic:printDrawing||`` 을 이용할 수 있습니다.
[``Link``](/reference/basic/printDrawing) 을 참조하세요.

## ~hint

힌트를 적을수도 있습니다.

## ~

## Parameters

* **img**: 표시할 아이콘의 값.

## Example

위 화살표를 1초간 표시후 아래 화살표 표시.

```blocks
basic.printIcon3(1)
basic.pause2(1000)
basic.printIcon2(2)
```

## See also #seealso

[while](/blocks/loops/while), [repeat](/blocks/loops/repeat),
[run in parallel](/reference/control/run-in-parallel)
