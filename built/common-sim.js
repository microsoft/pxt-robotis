var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function onGesture(gesture, handler) {
            var b = pxsim.accelerometer();
            b.accelerometer.activate();
            if (gesture == 11 /* ACCELEROMETER_EVT_SHAKE */ && !b.useShake) {
                b.useShake = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            pxsim.pxtcore.registerWithDal(13 /* DEVICE_ID_GESTURE */, gesture, handler);
        }
        input.onGesture = onGesture;
        function rotation(kind) {
            var b = pxsim.accelerometer();
            var acc = b.accelerometer;
            acc.activate();
            var x = acc.getX(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var y = acc.getY(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var z = acc.getZ(pxsim.MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var roll = Math.atan2(y, z);
            var pitch = Math.atan(-x / (y * Math.sin(roll) + z * Math.cos(roll)));
            var r = 0;
            switch (kind) {
                case 0:
                    r = pitch;
                    break;
                case 1:
                    r = roll;
                    break;
            }
            return Math.floor(r / Math.PI * 180);
        }
        input.rotation = rotation;
        function setAccelerometerRange(range) {
            var b = pxsim.accelerometer();
            b.accelerometer.setSampleRange(range);
        }
        input.setAccelerometerRange = setAccelerometerRange;
        function acceleration(dimension) {
            var b = pxsim.accelerometer();
            var acc = b.accelerometer;
            acc.activate();
            switch (dimension) {
                case 0: return acc.getX();
                case 1: return acc.getY();
                case 2: return acc.getZ();
                default: return Math.floor(Math.sqrt(acc.instantaneousAccelerationSquared()));
            }
        }
        input.acceleration = acceleration;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    /**
      * Co-ordinate systems that can be used.
      * RAW: Unaltered data. Data will be returned directly from the accelerometer.
      *
      * SIMPLE_CARTESIAN: Data will be returned based on an easy to understand alignment, consistent with the cartesian system taught in schools.
      * When held upright, facing the user:
      *
      *                            /
      *    +--------------------+ z
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * y  +--------------------+  x-->
      *
      *
      * NORTH_EAST_DOWN: Data will be returned based on the industry convention of the North East Down (NED) system.
      * When held upright, facing the user:
      *
      *                            z
      *    +--------------------+ /
      *    |                    |
      *    |       .....        |
      *    | *     .....      * |
      * ^  |       .....        |
      * |  |                    |
      * x  +--------------------+  y-->
      *
      */
    var MicroBitCoordinateSystem;
    (function (MicroBitCoordinateSystem) {
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["RAW"] = 0] = "RAW";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["SIMPLE_CARTESIAN"] = 1] = "SIMPLE_CARTESIAN";
        MicroBitCoordinateSystem[MicroBitCoordinateSystem["NORTH_EAST_DOWN"] = 2] = "NORTH_EAST_DOWN";
    })(MicroBitCoordinateSystem = pxsim.MicroBitCoordinateSystem || (pxsim.MicroBitCoordinateSystem = {}));
    var Accelerometer = /** @class */ (function () {
        function Accelerometer(runtime) {
            this.runtime = runtime;
            this.sigma = 0; // the number of ticks that the instantaneous gesture has been stable.
            this.lastGesture = 0; // the last, stable gesture recorded.
            this.currentGesture = 0; // the instantaneous, unfiltered gesture detected.
            this.sample = { x: 0, y: 0, z: -1023 };
            this.shake = { x: false, y: false, z: false, count: 0, shaken: 0, timer: 0 }; // State information needed to detect shake events.
            this.isActive = false;
            this.sampleRange = 2;
            this.id = 5 /* DEVICE_ID_ACCELEROMETER */;
        }
        Accelerometer.prototype.setSampleRange = function (range) {
            this.activate();
            this.sampleRange = Math.max(1, Math.min(8, range));
        };
        Accelerometer.prototype.activate = function () {
            if (!this.isActive) {
                this.isActive = true;
                this.runtime.queueDisplayUpdate();
            }
        };
        /**
         * Reads the acceleration data from the accelerometer, and stores it in our buffer.
         * This is called by the tick() member function, if the interrupt is set!
         */
        Accelerometer.prototype.update = function (x, y, z) {
            // read MSB values...
            this.sample.x = Math.floor(x);
            this.sample.y = Math.floor(y);
            this.sample.z = Math.floor(z);
            // Update gesture tracking
            this.updateGesture();
            // Indicate that a new sample is available
            pxsim.board().bus.queue(this.id, 1 /* ACCELEROMETER_EVT_DATA_UPDATE */);
        };
        Accelerometer.prototype.instantaneousAccelerationSquared = function () {
            // Use pythagoras theorem to determine the combined force acting on the device.
            return this.sample.x * this.sample.x + this.sample.y * this.sample.y + this.sample.z * this.sample.z;
        };
        /**
         * Service function. Determines the best guess posture of the device based on instantaneous data.
         * This makes no use of historic data (except for shake), and forms this input to the filter implemented in updateGesture().
         *
         * @return A best guess of the current posture of the device, based on instantaneous data.
         */
        Accelerometer.prototype.instantaneousPosture = function () {
            var force = this.instantaneousAccelerationSquared();
            var shakeDetected = false;
            // Test for shake events.
            // We detect a shake by measuring zero crossings in each axis. In other words, if we see a strong acceleration to the left followed by
            // a string acceleration to the right, then we can infer a shake. Similarly, we can do this for each acxis (left/right, up/down, in/out).
            //
            // If we see enough zero crossings in succession (MICROBIT_ACCELEROMETER_SHAKE_COUNT_THRESHOLD), then we decide that the device
            // has been shaken.
            if ((this.getX() < -400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.x) || (this.getX() > 400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.x)) {
                shakeDetected = true;
                this.shake.x = !this.shake.x;
            }
            if ((this.getY() < -400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.y) || (this.getY() > 400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.y)) {
                shakeDetected = true;
                this.shake.y = !this.shake.y;
            }
            if ((this.getZ() < -400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && this.shake.z) || (this.getZ() > 400 /* ACCELEROMETER_SHAKE_TOLERANCE */ && !this.shake.z)) {
                shakeDetected = true;
                this.shake.z = !this.shake.z;
            }
            if (shakeDetected && this.shake.count < 4 /* ACCELEROMETER_SHAKE_COUNT_THRESHOLD */ && ++this.shake.count == 4 /* ACCELEROMETER_SHAKE_COUNT_THRESHOLD */)
                this.shake.shaken = 1;
            if (++this.shake.timer >= 10 /* ACCELEROMETER_SHAKE_DAMPING */) {
                this.shake.timer = 0;
                if (this.shake.count > 0) {
                    if (--this.shake.count == 0)
                        this.shake.shaken = 0;
                }
            }
            if (this.shake.shaken)
                return 11 /* ACCELEROMETER_EVT_SHAKE */;
            var sq = function (n) { return n * n; };
            if (force < sq(400 /* ACCELEROMETER_FREEFALL_TOLERANCE */))
                return 7 /* ACCELEROMETER_EVT_FREEFALL */;
            if (force > sq(3072 /* ACCELEROMETER_3G_TOLERANCE */))
                return 8 /* ACCELEROMETER_EVT_3G */;
            if (force > sq(6144 /* ACCELEROMETER_6G_TOLERANCE */))
                return 9 /* ACCELEROMETER_EVT_6G */;
            if (force > sq(8192 /* ACCELEROMETER_8G_TOLERANCE */))
                return 10 /* ACCELEROMETER_EVT_8G */;
            // Determine our posture.
            if (this.getX() < (-1000 + 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 3 /* ACCELEROMETER_EVT_TILT_LEFT */;
            if (this.getX() > (1000 - 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 4 /* ACCELEROMETER_EVT_TILT_RIGHT */;
            if (this.getY() < (-1000 + 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 1 /* ACCELEROMETER_EVT_TILT_UP */;
            if (this.getY() > (1000 - 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 2 /* ACCELEROMETER_EVT_TILT_DOWN */;
            if (this.getZ() < (-1000 + 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 5 /* ACCELEROMETER_EVT_FACE_UP */;
            if (this.getZ() > (1000 - 200 /* ACCELEROMETER_TILT_TOLERANCE */))
                return 6 /* ACCELEROMETER_EVT_FACE_DOWN */;
            return 0;
        };
        Accelerometer.prototype.updateGesture = function () {
            // Determine what it looks like we're doing based on the latest sample...
            var g = this.instantaneousPosture();
            // Perform some low pass filtering to reduce jitter from any detected effects
            if (g == this.currentGesture) {
                if (this.sigma < 5 /* ACCELEROMETER_GESTURE_DAMPING */)
                    this.sigma++;
            }
            else {
                this.currentGesture = g;
                this.sigma = 0;
            }
            // If we've reached threshold, update our record and raise the relevant event...
            if (this.currentGesture != this.lastGesture && this.sigma >= 5 /* ACCELEROMETER_GESTURE_DAMPING */) {
                this.lastGesture = this.currentGesture;
                pxsim.board().bus.queue(13 /* DEVICE_ID_GESTURE */, this.lastGesture);
            }
        };
        /**
          * Reads the X axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the X axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getX();
          * uBit.accelerometer.getX(RAW);
          * @endcode
          */
        Accelerometer.prototype.getX = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            var val;
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    val = -this.sample.x;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    val = this.sample.y;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN.RAW:
                default:
                    val = this.sample.x;
            }
            return pxsim.board().invertAccelerometerXAxis ? val * -1 : val;
        };
        /**
          * Reads the Y axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Y axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getY();
          * uBit.accelerometer.getY(RAW);
          * @endcode
          */
        Accelerometer.prototype.getY = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            var val;
            switch (system) {
                case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                    val = -this.sample.y;
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    val = -this.sample.x;
                //case RAW:
                default:
                    val = this.sample.y;
            }
            return pxsim.board().invertAccelerometerYAxis ? val * -1 : val;
        };
        /**
          * Reads the Z axis value of the latest update from the accelerometer.
          * @param system The coordinate system to use. By default, a simple cartesian system is provided.
          * @return The force measured in the Z axis, in milli-g.
          *
          * Example:
          * @code
          * uBit.accelerometer.getZ();
          * uBit.accelerometer.getZ(RAW);
          * @endcode
          */
        Accelerometer.prototype.getZ = function (system) {
            if (system === void 0) { system = MicroBitCoordinateSystem.SIMPLE_CARTESIAN; }
            this.activate();
            var val;
            switch (system) {
                case MicroBitCoordinateSystem.NORTH_EAST_DOWN:
                    val = -this.sample.z;
                //case MicroBitCoordinateSystem.SIMPLE_CARTESIAN:
                //case MicroBitCoordinateSystem.RAW:
                default:
                    val = this.sample.z;
            }
            return pxsim.board().invertAccelerometerZAxis ? val * -1 : val;
        };
        /**
          * Provides a rotation compensated pitch of the device, based on the latest update from the accelerometer.
          * @return The pitch of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getPitch();
          * @endcode
          */
        Accelerometer.prototype.getPitch = function () {
            this.activate();
            return Math.floor((360 * this.getPitchRadians()) / (2 * Math.PI));
        };
        Accelerometer.prototype.getPitchRadians = function () {
            this.recalculatePitchRoll();
            return this.pitch;
        };
        /**
          * Provides a rotation compensated roll of the device, based on the latest update from the accelerometer.
          * @return The roll of the device, in degrees.
          *
          * Example:
          * @code
          * uBit.accelerometer.getRoll();
          * @endcode
          */
        Accelerometer.prototype.getRoll = function () {
            this.activate();
            return Math.floor((360 * this.getRollRadians()) / (2 * Math.PI));
        };
        Accelerometer.prototype.getRollRadians = function () {
            this.recalculatePitchRoll();
            return this.roll;
        };
        /**
         * Recalculate roll and pitch values for the current sample.
         * We only do this at most once per sample, as the necessary trigonemteric functions are rather
         * heavyweight for a CPU without a floating point unit...
         */
        Accelerometer.prototype.recalculatePitchRoll = function () {
            var x = this.getX(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var y = this.getY(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            var z = this.getZ(MicroBitCoordinateSystem.NORTH_EAST_DOWN);
            this.roll = Math.atan2(y, z);
            this.pitch = Math.atan(-x / (y * Math.sin(this.roll) + z * Math.cos(this.roll)));
        };
        return Accelerometer;
    }());
    pxsim.Accelerometer = Accelerometer;
    var AccelerometerState = /** @class */ (function () {
        function AccelerometerState(runtime) {
            this.useShake = false;
            this.tiltDecayer = 0;
            this.accelerometer = new Accelerometer(runtime);
        }
        AccelerometerState.prototype.attachEvents = function (element) {
            var _this = this;
            this.element = element;
            this.tiltDecayer = 0;
            this.element.addEventListener(pxsim.pointerEvents.move, function (ev) {
                if (!_this.accelerometer.isActive)
                    return;
                if (_this.tiltDecayer) {
                    clearInterval(_this.tiltDecayer);
                    _this.tiltDecayer = 0;
                }
                var bbox = element.getBoundingClientRect();
                var ax = (ev.clientX - bbox.width / 2) / (bbox.width / 3);
                var ay = (ev.clientY - bbox.height / 2) / (bbox.height / 3);
                var x = -Math.max(-1023, Math.min(1023, Math.floor(ax * 1023)));
                var y = Math.max(-1023, Math.min(1023, Math.floor(ay * 1023)));
                var z2 = 1023 * 1023 - x * x - y * y;
                var z = Math.floor((z2 > 0 ? -1 : 1) * Math.sqrt(Math.abs(z2)));
                _this.accelerometer.update(-x, y, z);
                _this.updateTilt();
            }, false);
            this.element.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                if (!_this.accelerometer.isActive)
                    return;
                if (!_this.tiltDecayer) {
                    _this.tiltDecayer = setInterval(function () {
                        var accx = _this.accelerometer.getX();
                        accx = Math.floor(Math.abs(accx) * 0.85) * (accx > 0 ? 1 : -1);
                        var accy = _this.accelerometer.getY();
                        accy = Math.floor(Math.abs(accy) * 0.85) * (accy > 0 ? 1 : -1);
                        var accz = -Math.sqrt(Math.max(0, 1023 * 1023 - accx * accx - accy * accy));
                        if (Math.abs(accx) <= 24 && Math.abs(accy) <= 24) {
                            clearInterval(_this.tiltDecayer);
                            _this.tiltDecayer = 0;
                            accx = 0;
                            accy = 0;
                            accz = -1023;
                        }
                        _this.accelerometer.update(accx, accy, accz);
                        _this.updateTilt();
                    }, 50);
                }
            }, false);
        };
        AccelerometerState.prototype.updateTilt = function () {
            if (!this.accelerometer.isActive || !this.element)
                return;
            var x = this.accelerometer.getX();
            var y = this.accelerometer.getY();
            var af = 8 / 1023;
            var s = 1 - Math.min(0.1, Math.pow(Math.max(Math.abs(x), Math.abs(y)) / 1023, 2) / 35);
            this.element.style.transform = "perspective(30em) rotateX(" + y * af + "deg) rotateY(" + x * af + "deg) scale(" + s + ", " + s + ")";
            this.element.style.perspectiveOrigin = "50% 50% 50%";
            this.element.style.perspective = "30em";
        };
        return AccelerometerState;
    }());
    pxsim.AccelerometerState = AccelerometerState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function accelerometer() {
        return pxsim.board().accelerometerState;
    }
    pxsim.accelerometer = accelerometer;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function getPin(id) {
            var b = pxsim.board();
            if (b && b.edgeConnectorState)
                return b.edgeConnectorState.getPin(id);
            return undefined;
        }
        pxtcore.getPin = getPin;
        function lookupPinCfg(key) {
            return getPinCfg(key);
        }
        pxtcore.lookupPinCfg = lookupPinCfg;
        function getPinCfg(key) {
            return getPin(pxtcore.getConfig(key, -1));
        }
        pxtcore.getPinCfg = getPinCfg;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        // TODO: add in support for mode, as in CODAL
        function registerWithDal(id, evid, handler, mode) {
            if (mode === void 0) { mode = 0; }
            pxsim.board().bus.listen(id, evid, handler);
        }
        pxtcore.registerWithDal = registerWithDal;
        function deepSleep() {
            // TODO?
            console.log("deep sleep requested");
        }
        pxtcore.deepSleep = deepSleep;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var control;
    (function (control) {
        control.runInParallel = pxsim.thread.runInBackground;
        control.delay = pxsim.thread.pause;
        function reset() {
            pxsim.Runtime.postMessage({
                type: "simulator",
                command: "restart",
                controlReset: true
            });
            var cb = pxsim.getResume();
        }
        control.reset = reset;
        function waitMicros(micros) {
            pxsim.thread.pause(micros / 1000); // it prempts not much we can do here.
        }
        control.waitMicros = waitMicros;
        function deviceName() {
            var b = pxsim.board();
            return b && b.id
                ? b.id.slice(0, 4)
                : "abcd";
        }
        control.deviceName = deviceName;
        function _ramSize() {
            return 32 * 1024 * 1024;
        }
        control._ramSize = _ramSize;
        function deviceSerialNumber() {
            var b = pxsim.board();
            if (!b)
                return 42;
            var n = 0;
            if (b.id) {
                n = parseInt(b.id.slice(1));
                if (isNaN(n)) {
                    n = 0;
                    for (var i = 0; i < b.id.length; ++i) {
                        n = ((n << 5) - n) + b.id.charCodeAt(i);
                        n |= 0;
                    }
                    n = Math.abs(n);
                }
            }
            if (!n)
                n = 42;
            return n;
        }
        control.deviceSerialNumber = deviceSerialNumber;
        function deviceLongSerialNumber() {
            var b = control.createBuffer(8);
            pxsim.BufferMethods.setNumber(b, pxsim.BufferMethods.NumberFormat.UInt32LE, 0, deviceSerialNumber());
            return b;
        }
        control.deviceLongSerialNumber = deviceLongSerialNumber;
        function deviceDalVersion() {
            return "sim";
        }
        control.deviceDalVersion = deviceDalVersion;
        function internalOnEvent(id, evid, handler) {
            pxsim.pxtcore.registerWithDal(id, evid, handler);
        }
        control.internalOnEvent = internalOnEvent;
        function waitForEvent(id, evid) {
            var cb = pxsim.getResume();
            pxsim.board().bus.wait(id, evid, cb);
        }
        control.waitForEvent = waitForEvent;
        function allocateNotifyEvent() {
            var b = pxsim.board();
            return b.bus.nextNotifyEvent++;
        }
        control.allocateNotifyEvent = allocateNotifyEvent;
        function raiseEvent(id, evid, mode) {
            // TODO mode?
            pxsim.board().bus.queue(id, evid);
        }
        control.raiseEvent = raiseEvent;
        function millis() {
            return pxsim.runtime.runningTime();
        }
        control.millis = millis;
        function micros() {
            return pxsim.runtime.runningTimeUs() & 0x3fffffff;
        }
        control.micros = micros;
        function delayMicroseconds(us) {
            control.delay(us / 0.001);
        }
        control.delayMicroseconds = delayMicroseconds;
        function createBuffer(size) {
            return pxsim.BufferMethods.createBuffer(size);
        }
        control.createBuffer = createBuffer;
        function dmesg(msg) {
            console.log("DMESG: " + msg);
        }
        control.dmesg = dmesg;
        function setDebugFlags(flags) {
            console.log("debug flags: " + flags);
        }
        control.setDebugFlags = setDebugFlags;
        function heapSnapshot() {
            console.log(pxsim.runtime.traceObjects());
        }
        control.heapSnapshot = heapSnapshot;
        function toStr(v) {
            if (v instanceof pxsim.RefRecord) {
                return v.vtable.name + "@" + v.id;
            }
            if (v instanceof pxsim.RefCollection) {
                var r = "[";
                for (var _i = 0, _a = v.toArray(); _i < _a.length; _i++) {
                    var e = _a[_i];
                    if (r.length > 200) {
                        r += "...";
                        break;
                    }
                    r += toStr(e) + ", ";
                }
                r += "]";
                return r;
            }
            if (typeof v == "function") {
                return (v + "").slice(0, 60) + "...";
            }
            return v + "";
        }
        function dmesgPtr(msg, ptr) {
            console.log("DMESG: " + msg + " " + toStr(ptr));
        }
        control.dmesgPtr = dmesgPtr;
        function dmesgValue(ptr) {
            console.log("DMESG: " + toStr(ptr));
        }
        control.dmesgValue = dmesgValue;
        function gc() { }
        control.gc = gc;
        function profilingEnabled() {
            return !!pxsim.runtime.perfCounters;
        }
        control.profilingEnabled = profilingEnabled;
        function __log(priority, str) {
            var prefix = "";
            switch (priority) {
                case 0:
                    prefix = "d>";
                    break;
                case 1:
                    prefix = "l>";
                    break;
                case 2:
                    prefix = "w>";
                    break;
                case 3:
                    prefix = "e>";
                    break;
            }
            console.log(prefix + str);
            pxsim.runtime.board.writeSerial(str);
        }
        control.__log = __log;
        function heapDump() {
            // TODO something better
        }
        control.heapDump = heapDump;
        function isUSBInitialized() {
            return false;
        }
        control.isUSBInitialized = isUSBInitialized;
    })(control = pxsim.control || (pxsim.control = {}));
})(pxsim || (pxsim = {}));
/// <reference path="../../../node_modules/pxt-core/built/pxtsim.d.ts" />
var pxsim;
(function (pxsim) {
    function board() {
        return pxsim.runtime.board;
    }
    pxsim.board = board;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var loops;
    (function (loops) {
        loops.pause = pxsim.thread.pause;
        loops.forever = pxsim.thread.forever;
    })(loops = pxsim.loops || (pxsim.loops = {}));
})(pxsim || (pxsim = {}));
/// <reference path="../../core/dal.d.ts"/>
var pxsim;
(function (pxsim) {
    var DOUBLE_CLICK_TIME = 500;
    var CommonButton = /** @class */ (function (_super) {
        __extends(CommonButton, _super);
        function CommonButton() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._pressedTime = -1;
            _this._clickedTime = -1;
            return _this;
        }
        CommonButton.prototype.setPressed = function (p) {
            if (this.pressed === p) {
                return;
            }
            this.pressed = p;
            if (p) {
                this._wasPressed = true;
                pxsim.board().bus.queue(this.id, 1 /* DEVICE_BUTTON_EVT_DOWN */);
                this._pressedTime = pxsim.runtime.runningTime();
            }
            else if (this._pressedTime !== -1) {
                pxsim.board().bus.queue(this.id, 2 /* DEVICE_BUTTON_EVT_UP */);
                var current = pxsim.runtime.runningTime();
                if (current - this._pressedTime >= 1000 /* DEVICE_BUTTON_LONG_CLICK_TIME */) {
                    pxsim.board().bus.queue(this.id, 4 /* DEVICE_BUTTON_EVT_LONG_CLICK */);
                }
                else {
                    pxsim.board().bus.queue(this.id, 3 /* DEVICE_BUTTON_EVT_CLICK */);
                }
                if (this._clickedTime !== -1) {
                    if (current - this._clickedTime <= DOUBLE_CLICK_TIME) {
                        pxsim.board().bus.queue(this.id, 6 /* DEVICE_BUTTON_EVT_DOUBLE_CLICK */);
                    }
                }
                this._clickedTime = current;
            }
        };
        CommonButton.prototype.wasPressed = function () {
            var temp = this._wasPressed;
            this._wasPressed = false;
            return temp;
        };
        CommonButton.prototype.pressureLevel = function () {
            // digital for now
            return this.isPressed() ? 512 : 0;
        };
        CommonButton.prototype.isPressed = function () {
            return this.pressed;
        };
        return CommonButton;
    }(pxsim.Button));
    pxsim.CommonButton = CommonButton;
    var CommonButtonState = /** @class */ (function () {
        function CommonButtonState(buttons) {
            var _this = this;
            this.usesButtonAB = false;
            this.buttonsByPin = {};
            this.buttons = buttons || [
                new CommonButton(1 /* DEVICE_ID_BUTTON_A */),
                new CommonButton(2 /* DEVICE_ID_BUTTON_B */),
                new CommonButton(3 /* DEVICE_ID_BUTTON_AB */)
            ];
            this.buttons.forEach(function (btn) { return _this.buttonsByPin[btn.id] = btn; });
        }
        return CommonButtonState;
    }());
    pxsim.CommonButtonState = CommonButtonState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function getButtonByPin(pinId) {
            var m = pxsim.board().buttonState.buttonsByPin;
            var b = m[pinId + ""];
            if (!b) {
                b = m[pinId + ""] = new pxsim.CommonButton(pinId);
            }
            return b;
        }
        pxtcore.getButtonByPin = getButtonByPin;
        function getButtonByPinCfg(key) {
            return getButtonByPin(pxtcore.getConfig(key, -1));
        }
        pxtcore.getButtonByPinCfg = getButtonByPinCfg;
        function getButton(buttonId) {
            var buttons = pxsim.board().buttonState.buttons;
            if (buttonId === 2) {
                pxsim.board().buttonState.usesButtonAB = true;
                pxsim.runtime.queueDisplayUpdate();
            }
            if (buttonId < buttons.length && buttonId >= 0) {
                return buttons[buttonId];
            }
            // panic
            return undefined;
        }
        pxtcore.getButton = getButton;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var ButtonMethods;
    (function (ButtonMethods) {
        function onEvent(button, ev, body) {
            pxsim.pxtcore.registerWithDal(button.id, ev, body);
        }
        ButtonMethods.onEvent = onEvent;
        function isPressed(button) {
            return button.pressed;
        }
        ButtonMethods.isPressed = isPressed;
        function pressureLevel(button) {
            return button.pressureLevel();
        }
        ButtonMethods.pressureLevel = pressureLevel;
        function wasPressed(button) {
            return button.wasPressed();
        }
        ButtonMethods.wasPressed = wasPressed;
        function id(button) {
            return button.id;
        }
        ButtonMethods.id = id;
    })(ButtonMethods = pxsim.ButtonMethods || (pxsim.ButtonMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var DigitalInOutPinMethods;
    (function (DigitalInOutPinMethods) {
        function pushButton(pin) {
            return pxsim.pxtcore.getButtonByPin(pin.id);
        }
        DigitalInOutPinMethods.pushButton = pushButton;
    })(DigitalInOutPinMethods = pxsim.DigitalInOutPinMethods || (pxsim.DigitalInOutPinMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var network;
    (function (network) {
        function cableSendPacket(buf) {
            var state = pxsim.getCableState();
            state.send(buf);
        }
        network.cableSendPacket = cableSendPacket;
        function cablePacket() {
            var state = pxsim.getCableState();
            return (state.packet);
        }
        network.cablePacket = cablePacket;
        function onCablePacket(body) {
            var state = pxsim.getCableState();
            state.listen(body);
        }
        network.onCablePacket = onCablePacket;
        function onCableError(body) {
            var state = pxsim.getCableState();
            state.listenError(body);
        }
        network.onCableError = onCableError;
    })(network = pxsim.network || (pxsim.network = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var CableState = /** @class */ (function () {
        function CableState() {
            // notify view that a packet was received
            this.packetReceived = false;
            // PULSE_IR_COMPONENT_ID = 0x2042;
            this.PULSE_CABLE_COMPONENT_ID = 0x2043;
            this.PULSE_PACKET_EVENT = 0x2;
            this.PULSE_PACKET_ERROR_EVENT = 0x3;
        }
        CableState.prototype.send = function (buf) {
            pxsim.Runtime.postMessage({
                type: "irpacket",
                packet: buf.data
            });
        };
        CableState.prototype.listen = function (body) {
            pxsim.pxtcore.registerWithDal(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_EVENT, body);
        };
        CableState.prototype.listenError = function (body) {
            pxsim.pxtcore.registerWithDal(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_ERROR_EVENT, body);
        };
        CableState.prototype.receive = function (buf) {
            this.packet = buf;
            this.packetReceived = true;
            pxsim.board().bus.queue(this.PULSE_CABLE_COMPONENT_ID, this.PULSE_PACKET_EVENT);
        };
        return CableState;
    }());
    pxsim.CableState = CableState;
    function getCableState() {
        return pxsim.board().cableState;
    }
    pxsim.getCableState = getCableState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var ThresholdState;
    (function (ThresholdState) {
        ThresholdState[ThresholdState["High"] = 0] = "High";
        ThresholdState[ThresholdState["Low"] = 1] = "Low";
        ThresholdState[ThresholdState["Normal"] = 2] = "Normal";
    })(ThresholdState || (ThresholdState = {}));
    var AnalogSensorState = /** @class */ (function () {
        function AnalogSensorState(id, min, max, lowThreshold, highThreshold) {
            if (min === void 0) { min = 0; }
            if (max === void 0) { max = 255; }
            if (lowThreshold === void 0) { lowThreshold = 64; }
            if (highThreshold === void 0) { highThreshold = 192; }
            this.id = id;
            this.min = min;
            this.max = max;
            this.lowThreshold = lowThreshold;
            this.highThreshold = highThreshold;
            this.sensorUsed = false;
            this.state = ThresholdState.Normal;
            this.level = Math.ceil((max - min) / 2);
        }
        AnalogSensorState.prototype.setUsed = function () {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                pxsim.runtime.queueDisplayUpdate();
            }
        };
        AnalogSensorState.prototype.setLevel = function (level) {
            this.level = this.clampValue(level);
            if (this.level >= this.highThreshold) {
                this.setState(ThresholdState.High);
            }
            else if (this.level <= this.lowThreshold) {
                this.setState(ThresholdState.Low);
            }
            else {
                this.setState(ThresholdState.Normal);
            }
        };
        AnalogSensorState.prototype.getLevel = function () {
            return this.level;
        };
        AnalogSensorState.prototype.setLowThreshold = function (value) {
            this.lowThreshold = this.clampValue(value);
            this.highThreshold = Math.max(this.lowThreshold + 1, this.highThreshold);
        };
        AnalogSensorState.prototype.setHighThreshold = function (value) {
            this.highThreshold = this.clampValue(value);
            this.lowThreshold = Math.min(this.highThreshold - 1, this.lowThreshold);
        };
        AnalogSensorState.prototype.clampValue = function (value) {
            if (value < this.min) {
                return this.min;
            }
            else if (value > this.max) {
                return this.max;
            }
            return value;
        };
        AnalogSensorState.prototype.setState = function (state) {
            if (this.state === state) {
                return;
            }
            this.state = state;
            switch (state) {
                case ThresholdState.High:
                    pxsim.board().bus.queue(this.id, 2 /* SENSOR_THRESHOLD_HIGH */);
                    break;
                case ThresholdState.Low:
                    pxsim.board().bus.queue(this.id, 1 /* SENSOR_THRESHOLD_LOW */);
                    break;
                case ThresholdState.Normal:
                    break;
            }
        };
        return AnalogSensorState;
    }());
    pxsim.AnalogSensorState = AnalogSensorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function mkBtnSvg(xy) {
            var _a = ["sim-button", "sim-button-outer"], innerCls = _a[0], outerCls = _a[1];
            var tabSize = visuals.PIN_DIST / 2.5;
            var pegR = visuals.PIN_DIST / 5;
            var btnR = visuals.PIN_DIST * .8;
            var pegMargin = visuals.PIN_DIST / 8;
            var plateR = visuals.PIN_DIST / 12;
            var pegOffset = pegMargin + pegR;
            var x = xy[0], y = xy[1];
            var left = x - tabSize / 2;
            var top = y - tabSize / 2;
            var plateH = 3 * visuals.PIN_DIST - tabSize;
            var plateW = 2 * visuals.PIN_DIST + tabSize;
            var plateL = left;
            var plateT = top + tabSize;
            var btnCX = plateL + plateW / 2;
            var btnCY = plateT + plateH / 2;
            var btng = pxsim.svg.elt("g");
            //tabs
            var mkTab = function (x, y) {
                pxsim.svg.child(btng, "rect", { class: "sim-button-tab", x: x, y: y, width: tabSize, height: tabSize });
            };
            mkTab(left, top);
            mkTab(left + 2 * visuals.PIN_DIST, top);
            mkTab(left, top + 3 * visuals.PIN_DIST);
            mkTab(left + 2 * visuals.PIN_DIST, top + 3 * visuals.PIN_DIST);
            //plate
            pxsim.svg.child(btng, "rect", { class: outerCls, x: plateL, y: plateT, rx: plateR, ry: plateR, width: plateW, height: plateH });
            //pegs
            var mkPeg = function (x, y) {
                pxsim.svg.child(btng, "circle", { class: "sim-button-nut", cx: x, cy: y, r: pegR });
            };
            mkPeg(plateL + pegOffset, plateT + pegOffset);
            mkPeg(plateL + plateW - pegOffset, plateT + pegOffset);
            mkPeg(plateL + pegOffset, plateT + plateH - pegOffset);
            mkPeg(plateL + plateW - pegOffset, plateT + plateH - pegOffset);
            //inner btn
            var innerBtn = pxsim.svg.child(btng, "circle", { class: innerCls, cx: btnCX, cy: btnCY, r: btnR });
            //return
            return { el: btng, y: top, x: left, w: plateW, h: plateH + 2 * tabSize };
        }
        visuals.mkBtnSvg = mkBtnSvg;
        visuals.BUTTON_PAIR_STYLE = "\n            .sim-button {\n                pointer-events: none;\n                fill: #000;\n            }\n            .sim-button-outer:active ~ .sim-button,\n            .sim-button-virtual:active {\n                fill: #FFA500;\n            }\n            .sim-button-outer {\n                cursor: pointer;\n                fill: #979797;\n            }\n            .sim-button-outer:hover {\n                stroke:gray;\n                stroke-width: " + visuals.PIN_DIST / 5 + "px;\n            }\n            .sim-button-nut {\n                fill:#000;\n                pointer-events:none;\n            }\n            .sim-button-nut:hover {\n                stroke:" + visuals.PIN_DIST / 15 + "px solid #704A4A;\n            }\n            .sim-button-tab {\n                fill:#FFF;\n                pointer-events:none;\n            }\n            .sim-button-virtual {\n                cursor: pointer;\n                fill: rgba(255, 255, 255, 0.6);\n                stroke: rgba(255, 255, 255, 1);\n                stroke-width: " + visuals.PIN_DIST / 5 + "px;\n            }\n            .sim-button-virtual:hover {\n                stroke: rgba(128, 128, 128, 1);\n            }\n            .sim-text-virtual {\n                fill: #000;\n                pointer-events:none;\n            }\n            ";
        var ButtonPairView = /** @class */ (function () {
            function ButtonPairView() {
                this.style = visuals.BUTTON_PAIR_STYLE;
            }
            ButtonPairView.prototype.init = function (bus, state) {
                this.state = state;
                this.bus = bus;
                this.defs = [];
                this.element = this.mkBtns();
                this.updateState();
                this.attachEvents();
            };
            ButtonPairView.prototype.moveToCoord = function (xy) {
                var btnWidth = visuals.PIN_DIST * 3;
                var x = xy[0], y = xy[1];
                visuals.translateEl(this.aBtn, [x, y]);
                visuals.translateEl(this.bBtn, [x + btnWidth, y]);
                visuals.translateEl(this.abBtn, [x + visuals.PIN_DIST * 1.5, y + visuals.PIN_DIST * 4]);
            };
            ButtonPairView.prototype.updateState = function () {
                var stateBtns = [this.state.aBtn, this.state.bBtn, this.state.abBtn];
                var svgBtns = [this.aBtn, this.bBtn, this.abBtn];
                if (this.state.usesButtonAB && this.abBtn.style.visibility != "visible") {
                    this.abBtn.style.visibility = "visible";
                }
            };
            ButtonPairView.prototype.updateTheme = function () { };
            ButtonPairView.prototype.mkBtns = function () {
                this.aBtn = mkBtnSvg([0, 0]).el;
                this.bBtn = mkBtnSvg([0, 0]).el;
                var mkVirtualBtn = function () {
                    var numPins = 2;
                    var w = visuals.PIN_DIST * 2.8;
                    var offset = (w - (numPins * visuals.PIN_DIST)) / 2;
                    var corner = visuals.PIN_DIST / 2;
                    var cx = 0 - offset + w / 2;
                    var cy = cx;
                    var txtSize = visuals.PIN_DIST * 1.3;
                    var x = -offset;
                    var y = -offset;
                    var txtXOff = visuals.PIN_DIST / 7;
                    var txtYOff = visuals.PIN_DIST / 10;
                    var btng = pxsim.svg.elt("g");
                    var btn = pxsim.svg.child(btng, "rect", { class: "sim-button-virtual", x: x, y: y, rx: corner, ry: corner, width: w, height: w });
                    var btnTxt = visuals.mkTxt(cx + txtXOff, cy + txtYOff, txtSize, 0, "A+B");
                    pxsim.U.addClass(btnTxt, "sim-text");
                    pxsim.U.addClass(btnTxt, "sim-text-virtual");
                    btng.appendChild(btnTxt);
                    return btng;
                };
                this.abBtn = mkVirtualBtn();
                this.abBtn.style.visibility = "hidden";
                var el = pxsim.svg.elt("g");
                pxsim.U.addClass(el, "sim-buttonpair");
                el.appendChild(this.aBtn);
                el.appendChild(this.bBtn);
                el.appendChild(this.abBtn);
                return el;
            };
            ButtonPairView.prototype.attachEvents = function () {
                var _this = this;
                var btnStates = [this.state.aBtn, this.state.bBtn];
                var btnSvgs = [this.aBtn, this.bBtn];
                btnSvgs.forEach(function (btn, index) {
                    pxsim.pointerEvents.down.forEach(function (evid) { return btn.addEventListener(evid, function (ev) {
                        btnStates[index].pressed = true;
                    }); });
                    btn.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                        btnStates[index].pressed = false;
                    });
                    btn.addEventListener(pxsim.pointerEvents.up, function (ev) {
                        btnStates[index].pressed = false;
                        _this.bus.queue(btnStates[index].id, _this.state.props.BUTTON_EVT_UP);
                        _this.bus.queue(btnStates[index].id, _this.state.props.BUTTON_EVT_CLICK);
                    });
                });
                var updateBtns = function (s) {
                    btnStates.forEach(function (b) { return b.pressed = s; });
                };
                pxsim.pointerEvents.down.forEach(function (evid) { return _this.abBtn.addEventListener(evid, function (ev) {
                    updateBtns(true);
                }); });
                this.abBtn.addEventListener(pxsim.pointerEvents.leave, function (ev) {
                    updateBtns(false);
                });
                this.abBtn.addEventListener(pxsim.pointerEvents.up, function (ev) {
                    updateBtns(false);
                    _this.bus.queue(_this.state.abBtn.id, _this.state.props.BUTTON_EVT_UP);
                    _this.bus.queue(_this.state.abBtn.id, _this.state.props.BUTTON_EVT_CLICK);
                });
            };
            return ButtonPairView;
        }());
        visuals.ButtonPairView = ButtonPairView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var PinFlags;
    (function (PinFlags) {
        PinFlags[PinFlags["Unused"] = 0] = "Unused";
        PinFlags[PinFlags["Digital"] = 1] = "Digital";
        PinFlags[PinFlags["Analog"] = 2] = "Analog";
        PinFlags[PinFlags["Input"] = 4] = "Input";
        PinFlags[PinFlags["Output"] = 8] = "Output";
        PinFlags[PinFlags["Touch"] = 16] = "Touch";
    })(PinFlags = pxsim.PinFlags || (pxsim.PinFlags = {}));
    var Pin = /** @class */ (function () {
        function Pin(id) {
            this.id = id;
            this.touched = false;
            this.value = 0;
            this.period = 0;
            this.servoAngle = 0;
            this.mode = PinFlags.Unused;
            this.pitch = false;
            this.pull = 0; // PullDown
            this.eventMode = 0;
            this.used = false;
        }
        Pin.prototype.setValue = function (value) {
            // value set from the simulator
            var old = this.value;
            this.value = value;
            var b = pxsim.board();
            if (b && this.eventMode == 1 /* DEVICE_PIN_EVENT_ON_EDGE */ && old != this.value)
                b.bus.queue(this.id, this.value > 0 ? 2 /* DEVICE_PIN_EVT_RISE */ : 3 /* DEVICE_PIN_EVT_FALL */);
        };
        Pin.prototype.digitalReadPin = function () {
            this.mode = PinFlags.Digital | PinFlags.Input;
            return this.value > 100 ? 1 : 0;
        };
        Pin.prototype.digitalWritePin = function (value) {
            var b = pxsim.board();
            this.mode = PinFlags.Digital | PinFlags.Output;
            var v = this.value;
            this.value = value > 0 ? 1023 : 0;
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.setPull = function (pull) {
            this.pull = pull;
        };
        Pin.prototype.analogReadPin = function () {
            this.mode = PinFlags.Analog | PinFlags.Input;
            return this.value || 0;
        };
        Pin.prototype.analogWritePin = function (value) {
            var b = pxsim.board();
            this.mode = PinFlags.Analog | PinFlags.Output;
            var v = this.value;
            this.value = Math.max(0, Math.min(1023, value));
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.analogSetPeriod = function (micros) {
            this.mode = PinFlags.Analog | PinFlags.Output;
            this.period = micros;
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.servoWritePin = function (value) {
            this.analogSetPeriod(20000);
            this.servoAngle = Math.max(0, Math.min(180, value));
            pxsim.runtime.queueDisplayUpdate();
        };
        Pin.prototype.servoSetPulse = function (pinId, micros) {
            // TODO
        };
        Pin.prototype.isTouched = function () {
            this.mode = PinFlags.Touch | PinFlags.Analog | PinFlags.Input;
            return this.touched;
        };
        Pin.prototype.onEvent = function (ev, handler) {
            var b = pxsim.board();
            switch (ev) {
                case 4 /* DEVICE_PIN_EVT_PULSE_HI */:
                case 5 /* DEVICE_PIN_EVT_PULSE_LO */:
                    this.eventMode = 2 /* DEVICE_PIN_EVENT_ON_PULSE */;
                    break;
                case 2 /* DEVICE_PIN_EVT_RISE */:
                case 3 /* DEVICE_PIN_EVT_FALL */:
                    this.eventMode = 1 /* DEVICE_PIN_EVENT_ON_EDGE */;
                    break;
                default:
                    return;
            }
            b.bus.listen(this.id, ev, handler);
        };
        return Pin;
    }());
    pxsim.Pin = Pin;
    var SerialDevice = /** @class */ (function () {
        function SerialDevice(tx, rx, id) {
            this.tx = tx;
            this.rx = rx;
            this.id = id;
            this.baudRate = 115200;
            this.setRxBufferSize(64);
            this.setTxBufferSize(64);
        }
        SerialDevice.prototype.setTxBufferSize = function (size) {
            this.txBuffer = pxsim.control.createBuffer(size);
        };
        SerialDevice.prototype.setRxBufferSize = function (size) {
            this.rxBuffer = pxsim.control.createBuffer(size);
        };
        SerialDevice.prototype.read = function () {
            return -1;
        };
        SerialDevice.prototype.readBuffer = function () {
            var buf = pxsim.control.createBuffer(0);
            return buf;
        };
        SerialDevice.prototype.writeBuffer = function (buffer) {
        };
        SerialDevice.prototype.setBaudRate = function (rate) {
            this.baudRate = rate;
        };
        SerialDevice.prototype.redirect = function (tx, rx, rate) {
            this.tx = tx;
            this.rx = rx;
            this.baudRate = rate;
        };
        SerialDevice.prototype.onEvent = function (event, handler) {
            pxsim.control.internalOnEvent(this.id, event, handler);
        };
        SerialDevice.prototype.onDelimiterReceived = function (delimiter, handler) {
            // TODO
        };
        return SerialDevice;
    }());
    pxsim.SerialDevice = SerialDevice;
    var SPI = /** @class */ (function () {
        function SPI(mosi, miso, sck) {
            this.mosi = mosi;
            this.miso = miso;
            this.sck = sck;
            this.frequency = 250000;
            this.mode = 0;
        }
        SPI.prototype.write = function (value) {
            return 0;
        };
        SPI.prototype.transfer = function (command, response) {
        };
        SPI.prototype.setFrequency = function (frequency) {
            this.frequency = frequency;
        };
        SPI.prototype.setMode = function (mode) {
            this.mode = mode;
        };
        return SPI;
    }());
    pxsim.SPI = SPI;
    var I2C = /** @class */ (function () {
        function I2C(sda, scl) {
            this.sda = sda;
            this.scl = scl;
        }
        I2C.prototype.readBuffer = function (address, size, repeat) {
            return pxsim.control.createBuffer(0);
        };
        I2C.prototype.writeBuffer = function (address, buf, repeat) {
            return 0;
        };
        return I2C;
    }());
    pxsim.I2C = I2C;
    var EdgeConnectorState = /** @class */ (function () {
        function EdgeConnectorState(props) {
            this.props = props;
            this._i2cs = [];
            this._spis = [];
            this._serials = [];
            this.pins = props.pins.map(function (id) { return id != undefined ? new Pin(id) : null; });
        }
        EdgeConnectorState.prototype.getPin = function (id) {
            return this.pins.filter(function (p) { return p && p.id == id; })[0] || null;
        };
        EdgeConnectorState.prototype.createI2C = function (sda, scl) {
            var ser = this._i2cs.filter(function (s) { return s.sda == sda && s.scl == scl; })[0];
            if (!ser)
                this._i2cs.push(ser = new I2C(sda, scl));
            return ser;
        };
        EdgeConnectorState.prototype.createSPI = function (mosi, miso, sck) {
            var ser = this._spis.filter(function (s) { return s.mosi == mosi && s.miso == miso && s.sck == sck; })[0];
            if (!ser)
                this._spis.push(ser = new SPI(mosi, miso, sck));
            return ser;
        };
        EdgeConnectorState.prototype.createSerialDevice = function (tx, rx, id) {
            var ser = this._serials.filter(function (s) { return s.tx == tx && s.rx == rx; })[0];
            if (!ser)
                this._serials.push(ser = new SerialDevice(tx, rx, id));
            return ser;
        };
        return EdgeConnectorState;
    }());
    pxsim.EdgeConnectorState = EdgeConnectorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var configStorage;
    (function (configStorage) {
        function setBuffer(key, value) {
            // TODO
        }
        configStorage.setBuffer = setBuffer;
        function getBuffer(key) {
            // TODO
            return undefined;
        }
        configStorage.getBuffer = getBuffer;
        function removeItem(key) {
            // TODO
        }
        configStorage.removeItem = removeItem;
        function clear() {
            // TODO
        }
        configStorage.clear = clear;
    })(configStorage = pxsim.configStorage || (pxsim.configStorage = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var LED_PART_XOFF = -8;
        var LED_PART_YOFF = -7;
        var LED_PART_WIDTH = 68;
        var LED_PART_HEIGHT = 180;
        var LED_PART = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"Layer_1\" viewBox=\"0 0 33.6 90\" width=\"33.599998\" height=\"90\">\n    <path class=\"st0\" d=\"M1.3 65.000002v5.9C1.3 74.800002 4.5 78 8.4 78c3.9 0 7.1-3.199998 7.1-7.099998v-13.7c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9v1.5c0 1.2.5 2.3 1.3 3.2z\" id=\"path5\" opacity=\".65\" fill=\"#ececec\"/>\n    <g id=\"g7\" transform=\"translate(0 10.900002)\">\n      <path class=\"st1\" d=\"M12.7 49.6l1.2 1.4h-1l-2.4-1.4V15c0-.3.5-.5 1.1-.5.6 0 1.1.2 1.1.5z\" id=\"path9\" fill=\"#8c8c8c\"/>\n      <path class=\"st1\" d=\"M2.6 42.9c0 .7 1.1 1.3 2.1 1.8.4.2 1.2.6 1.2.9V49l-2.5 2h.9L8 49v-3.5c0-.7-.9-1.2-1.9-1.7-.4-.2-1.3-.8-1.3-1.1v-52.9c0-.4-.5-.7-1.1-.7-.6 0-1.1.3-1.1.7z\" id=\"path11\" fill=\"#8c8c8c\"/>\n      <path class=\"sim-led-main\" d=\"M1.3 54.1V60c0 3.9 3.2 7.1 7.1 7.1 3.9 0 7.1-3.2 7.1-7.1V46.3c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9v1.5c0 1.2.5 2.3 1.3 3.2z\" id=\"LED\" opacity=\".3\" fill=\"#ccc\"/>\n      <path class=\"st3\" d=\"M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-4.6c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9V51c0 1.1.5 2.2 1.3 3.1z\" id=\"path15\" opacity=\".9\" fill=\"#d1d1d1\"/>\n      <path class=\"st4\" d=\"M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-4.6c-1.9-1.9-4.4-2.9-7.1-2.8-4.6 0-8.4 2.6-8.4 5.9V51c0 1.1.5 2.2 1.3 3.1z\" id=\"path17\" opacity=\".7\" fill=\"#e6e6e6\"/>\n      <path class=\"st5\" d=\"M1.3 54.1V51c0-2.7 3.2-5 7.1-5 3.9 0 7.1 2.2 7.1 5v-3.1c-1.9-1.9-4.4-2.9-7.1-2.8C3.8 45.1 0 47.7 0 51c0 1.1.5 2.2 1.3 3.1z\" id=\"path19\" opacity=\".25\" fill=\"#e6e6e6\"/>\n      <ellipse class=\"st5\" cx=\"8.3\" cy=\"51\" rx=\"7.1\" ry=\"5\" id=\"ellipse21\" opacity=\".25\" fill=\"#e6e6e6\"/>\n      <ellipse class=\"st5\" cx=\"8.3\" cy=\"51\" rx=\"7.1\" ry=\"5\" id=\"ellipse23\" opacity=\".25\" fill=\"#e6e6e6\"/>\n      <g class=\"st8\" id=\"g29\" transform=\"translate(0 -12)\" opacity=\".61\">\n        <path class=\"st9\" d=\"M8.3 57.1c4.3 0 6.1 2 6.1 2l-.7.7s-1.6-1.7-5.4-1.7C5.9 58 3.6 59 2 60.8l-.8-.6c1.9-2.1 4.4-3.2 7.1-3.1z\" id=\"path31\" fill=\"#fff\"/>\n      </g>\n      <g class=\"st8\" id=\"g33\" transform=\"translate(0 -12)\" opacity=\".61\">\n        <path class=\"st9\" d=\"M12.9 75.9c1.1-1.1 1.7-2.6 1.7-4.2V61.4l-1.9-1.5v10.4c.9 2.8.3 4.2-.7 5.2.3.1.6.2.9.4z\" id=\"path35\" fill=\"#fff\"/>\n        <path class=\"st9\" d=\"M5.6 77.5l.3-.9c-1.5-.7-2.6-2.1-2.8-3.7h-1c.3 2 1.6 3.7 3.5 4.6z\" id=\"path37\" fill=\"#fff\"/>\n      </g>\n      <text style=\"line-height:1.25;-inkscape-font-specification:consolas\" x=\"14.103056\" y=\".224915\" id=\"text4514\" font-weight=\"400\" font-size=\"7.744442\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#666\" stroke-width=\".968055\">\n        <tspan id=\"tspan4512\" x=\"14.103056\" y=\".224915\">330\u03A9</tspan>\n      </text>\n      <text style=\"line-height:1.25;-inkscape-font-specification:consolas\" x=\"1.868053\" y=\"77.579796\" id=\"text4524\" font-weight=\"400\" font-size=\"32.793365\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" stroke-width=\".819834\">\n        <tspan id=\"tspan4522\" x=\"1.868053\" y=\"77.579796\" font-size=\"10.931121\"></tspan>\n      </text>\n    </g>\n    <g id=\"g39\" transform=\"translate(0 -1.099998)\">\n      <path class=\"st1\" id=\"rect41\" fill=\"#8c8c8c\" d=\"M11.6 16.9h21.700001v1.9H11.6z\"/>\n      <g id=\"g43\">\n        <path class=\"st10\" id=\"rect45\" fill=\"none\" d=\"M12 16.9h3.2v1.9H12z\"/>\n        <path class=\"st11\" d=\"M19 15c-.3-.2-.6-.3-.9-.3h-1.4c-.3 0-.5.3-.5.7v4.9c0 .4.2.7.5.7h1.4c.3 0 .6-.1.9-.3.3-.2.6-.3.9-.3h5c.3 0 .6.1.9.3h.1c.3.2.6.3.9.3h1.4c.3 0 .5-.3.5-.7v-4.9c0-.4-.2-.7-.5-.7h-1.4c-.3 0-.6.1-.9.3h-.1c-.3.2-.6.3-.9.3h-5c-.2 0-.5-.1-.9-.3z\" id=\"path47\" fill=\"#d6bf90\"/>\n        <path class=\"st12\" d=\"M28.4 18.5c-.1.1-.1.2-.2.3-.3.5-.7.8-1.2.8s-.9-.1-1.4-.3c-.6-.1-1.1-.1-1.7-.1-2 0-3.9 0-5.9.2-.4.1-.8 0-1.1-.1-.2-.1-.4-.2-.5-.5v1.5c0 .2.1.3.2.3H18c.3 0 .6-.1.9-.3.3-.2.7-.3 1.1-.3h5c.4 0 .8.1 1.1.3.3.1.6.2.8.2h1.4c.1 0 .2-.1.2-.3v-1.9c0 .1-.1.2-.1.2z\" id=\"path49\" fill=\"#aa936b\"/>\n        <g id=\"g51\">\n          <path class=\"st13\" id=\"rect53\" fill=\"#ad9f4e\" d=\"M27.200001 14.7h.7v6.2h-.7z\"/>\n          <path class=\"st14\" id=\"rect55\" opacity=\".4\" d=\"M27.200001 17.799999h.7v2.5h-.7z\"/>\n          <path class=\"st15\" id=\"rect57\" opacity=\".5\" fill=\"#ff3\" d=\"M27.200001 15h.7v1.3h-.7z\"/>\n          <path class=\"st16\" id=\"rect59\" opacity=\".5\" fill=\"#fff\" d=\"M27.200001 15.3h.7v.7h-.7z\"/>\n        </g>\n        <path class=\"st17\" id=\"rect61\" fill=\"#aa4518\" d=\"M23.1 15.3h1.3v5.1h-1.3z\"/>\n        <path class=\"st18\" id=\"rect63\" fill=\"#ff9700\" d=\"M20.6 15.3h1.3v5.1h-1.3z\"/>\n        <path class=\"st18\" d=\"M19.3 15.1c-.1 0-.1-.1-.2-.1-.3-.2-.6-.3-.9-.3H18V21h.1c.3 0 .6-.1.9-.3.1 0 .1-.1.2-.1v-5.5z\" id=\"path65\" fill=\"#ff9700\"/>\n        <path class=\"st19\" d=\"M18.7 15.7c.4.1.8.2 1.2.2H21c1.2-.1 2.4-.1 3.6 0 .4 0 .9 0 1.3-.1.3-.1.6-.2.8-.3.6-.2 1.2-.3 1.8-.2 0-.1-.1-.3-.2-.3h-1.4c-.3 0-.6.1-.9.3-.3.2-.7.3-1.1.3h-5c-.4 0-.8-.1-1.1-.3-.3-.1-.6-.2-.8-.2h-1.4c-.1 0-.2.1-.2.3v.2c.8-.1 1.5 0 2.3.1z\" id=\"path67\" opacity=\".74\" fill=\"#fffdfa\"/>\n      </g>\n    </g>\n  </svg>\n      ";
        // For the intructions
        function mkLedPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x + LED_PART_XOFF;
            var t = y + LED_PART_YOFF;
            var w = LED_PART_WIDTH;
            var h = LED_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-led", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(LED_PART)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkLedPart = mkLedPart;
        var LedView = /** @class */ (function () {
            function LedView(parsePinString) {
                this.color = "rgb(0,255,0)"; // green color by default
                this.parsePinString = parsePinString;
            }
            LedView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.pin = this.parsePinString(otherParams["name"] || otherParams["pin"]);
                this.bus = bus;
                this.initDom();
                this.updateState();
            };
            LedView.prototype.initDom = function () {
                this.element = pxsim.svg.elt("g");
                var image = new DOMParser().parseFromString(LED_PART, "image/svg+xml").querySelector("svg");
                pxsim.svg.hydrate(image, {
                    class: "sim-led", width: LED_PART_WIDTH, height: LED_PART_HEIGHT,
                });
                this.led = image.getElementById('LED');
                this.text = image.getElementById('tspan4522');
                this.element.appendChild(image);
            };
            LedView.prototype.moveToCoord = function (xy) {
                visuals.translateEl(this.element, [xy[0] + LED_PART_XOFF, xy[1] + LED_PART_YOFF]);
            };
            LedView.prototype.updateTheme = function () {
            };
            LedView.prototype.updateState = function () {
                if (this.currentValue === this.pin.value && this.currentMode == this.pin.mode)
                    return;
                this.currentValue = this.pin.value;
                this.currentMode = this.pin.mode;
                var style = this.led.style;
                if (this.currentMode & pxsim.PinFlags.Digital) {
                    style.fill = this.currentValue ? "#00ff00" : "#ffffff";
                    style.opacity = "0.9";
                    this.text.textContent = this.currentValue ? "1" : "0";
                }
                else {
                    style.fill = "#00ff00";
                    style.opacity = (0.1 + Math.max(0, Math.min(1023, this.currentValue)) / 1023 * 0.8).toString();
                    this.text.textContent = "~" + this.currentValue;
                }
            };
            return LedView;
        }());
        visuals.LedView = LedView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        function createMicroServoElement() {
            return pxsim.svg.parseString("\n        <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"svg2\" width=\"112.188\" height=\"299.674\">\n          <g id=\"layer1\" stroke-linecap=\"round\" stroke-linejoin=\"round\" transform=\"scale(0.8)\">\n            <path id=\"path8212\" fill=\"#0061ff\" stroke-width=\"6.6\" d=\"M.378 44.61v255.064h112.188V44.61H.378z\"/>\n            <path id=\"crankbase\" fill=\"#00f\" stroke-width=\"6.6\" d=\"M56.57 88.047C25.328 88.047 0 113.373 0 144.615c.02 22.352 11.807 42.596 32.238 51.66.03 3.318.095 5.24.088 7.938 0 13.947 11.307 25.254 25.254 25.254 13.947 0 25.254-11.307 25.254-25.254-.006-2.986-.415-5.442-.32-8.746 19.487-9.45 30.606-29.195 30.625-50.852 0-31.24-25.33-56.568-56.57-56.568z\"/>\n            <path id=\"lowertip\" fill=\"#00a2ff\" stroke-width=\"2\" d=\"M.476 260.78v38.894h53.82v-10.486a6.82 6.566 0 0 1-4.545-6.182 6.82 6.566 0 0 1 6.82-6.566 6.82 6.566 0 0 1 6.82 6.566 6.82 6.566 0 0 1-4.545 6.182v10.486h53.82V260.78H.475z\"/>\n            <path id=\"uppertip\" fill=\"#00a2ff\" stroke-width=\"2\" d=\"M112.566 83.503V44.61h-53.82v10.487a6.82 6.566 0 0 1 4.544 6.18 6.82 6.566 0 0 1-6.818 6.568 6.82 6.566 0 0 1-6.82-6.567 6.82 6.566 0 0 1 4.546-6.18V44.61H.378v38.893h112.188z\"/>\n            <path id=\"VCC\" fill=\"red\" stroke-width=\"2\" d=\"M53.72 21.93h5.504v22.627H53.72z\"/>\n            <path id=\"LOGIC\" fill=\"#fc0\" stroke-width=\"2\" d=\"M47.3 21.93h5.503v22.627H47.3z\"/>\n            <path id=\"GND\" fill=\"#a02c2c\" stroke-width=\"2\" d=\"M60.14 21.93h5.505v22.627H60.14z\"/>\n            <path id=\"connector\" stroke-width=\"2\" d=\"M45.064 0a1.488 1.488 0 0 0-1.488 1.488v24.5a1.488 1.488 0 0 0 1.488 1.487h22.71a1.488 1.488 0 0 0 1.49-1.488v-24.5A1.488 1.488 0 0 0 67.774 0h-22.71z\"/>\n            <g id=\"crank\" transform=\"translate(0 -752.688)\">\n              <path id=\"arm\" fill=\"#ececec\" stroke=\"#000\" stroke-width=\"1.372\" d=\"M47.767 880.88c-4.447 1.162-8.412 8.278-8.412 18.492s3.77 18.312 8.412 18.494c8.024.314 78.496 5.06 78.51-16.952.012-22.013-74.377-21.117-78.51-20.035z\"/>\n              <circle id=\"path8216\" cx=\"56.661\" cy=\"899.475\" r=\"8.972\" fill=\"gray\" stroke-width=\"2\"/>\n            </g>\n          </g>\n        </svg>\n                    ").firstElementChild;
        }
        function mkMicroServoPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            return { el: createMicroServoElement(), x: xy[0], y: xy[1], w: 112.188, h: 299.674 };
        }
        visuals.mkMicroServoPart = mkMicroServoPart;
        var MicroServoView = /** @class */ (function () {
            function MicroServoView() {
                this.style = "";
                this.overElement = undefined;
                this.defs = [];
                this.currentAngle = 0;
                this.targetAngle = 0;
                this.lastAngleTime = 0;
            }
            MicroServoView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.state = state;
                this.pin = this.state.props.servos[pxsim.readPin(otherParams["name"] || otherParams["pin"])];
                this.bus = bus;
                this.defs = [];
                this.initDom();
                this.updateState();
            };
            MicroServoView.prototype.initDom = function () {
                this.element = createMicroServoElement();
                this.crankEl = this.element.querySelector("#crank");
                this.crankTransform = this.crankEl.getAttribute("transform");
            };
            MicroServoView.prototype.moveToCoord = function (xy) {
                var x = xy[0], y = xy[1];
                visuals.translateEl(this.element, [x, y]);
            };
            MicroServoView.prototype.updateState = function () {
                this.targetAngle = 180.0 - this.state.getPin(this.pin).servoAngle;
                if (this.targetAngle != this.currentAngle) {
                    var now = pxsim.U.now();
                    var cx = 56.661;
                    var cy = 899.475;
                    var speed = 300; // 0.1s/60 degree
                    var dt = Math.min(now - this.lastAngleTime, 50) / 1000;
                    var delta = this.targetAngle - this.currentAngle;
                    this.currentAngle += Math.min(Math.abs(delta), speed * dt) * (delta > 0 ? 1 : -1);
                    this.crankEl.setAttribute("transform", this.crankTransform
                        + (" rotate(" + this.currentAngle + ", " + cx + ", " + cy + ")"));
                    this.lastAngleTime = now;
                    setTimeout(function () { return pxsim.runtime.updateDisplay(); }, 20);
                }
            };
            MicroServoView.prototype.updateTheme = function () {
            };
            return MicroServoView;
        }());
        visuals.MicroServoView = MicroServoView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var NeoPixelMode;
    (function (NeoPixelMode) {
        NeoPixelMode[NeoPixelMode["RGB"] = 1] = "RGB";
        NeoPixelMode[NeoPixelMode["RGBW"] = 2] = "RGBW";
        NeoPixelMode[NeoPixelMode["RGB_RGB"] = 3] = "RGB_RGB";
        NeoPixelMode[NeoPixelMode["DotStar"] = 4] = "DotStar";
    })(NeoPixelMode || (NeoPixelMode = {}));
    var CommonNeoPixelState = /** @class */ (function () {
        function CommonNeoPixelState() {
            this.mode = NeoPixelMode.RGB; // GRB
        }
        Object.defineProperty(CommonNeoPixelState.prototype, "length", {
            get: function () {
                return this.buffer ? (this.buffer.length / this.stride) | 0 : 0;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(CommonNeoPixelState.prototype, "stride", {
            get: function () {
                return this.mode == NeoPixelMode.RGBW || this.mode == NeoPixelMode.DotStar ? 4 : 3;
            },
            enumerable: true,
            configurable: true
        });
        CommonNeoPixelState.prototype.pixelColor = function (pixel) {
            var offset = pixel * this.stride;
            // RBG
            switch (this.mode) {
                case NeoPixelMode.RGBW:
                    return [this.buffer[offset + 1], this.buffer[offset], this.buffer[offset + 2], this.buffer[offset + 3]];
                case NeoPixelMode.RGB_RGB:
                    return [this.buffer[offset], this.buffer[offset + 1], this.buffer[offset + 2]];
                case NeoPixelMode.DotStar:
                    return [this.buffer[offset + 3], this.buffer[offset + 2], this.buffer[offset + 1]];
                default:
                    return [this.buffer[offset + 1], this.buffer[offset + 0], this.buffer[offset + 2]];
            }
        };
        return CommonNeoPixelState;
    }());
    pxsim.CommonNeoPixelState = CommonNeoPixelState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var light;
    (function (light) {
        // Currently only modifies the builtin pixels
        function sendBuffer(pin, clk, mode, b) {
            var state = pxsim.neopixelState(pin.id);
            state.mode = mode & 0xff; // TODO RGBW support
            state.buffer = b.data;
            pxsim.runtime.queueDisplayUpdate();
        }
        light.sendBuffer = sendBuffer;
    })(light = pxsim.light || (pxsim.light = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var PHOTOCELL_PART_XOFF = -8;
        var PHOTOCELL_PART_YOFF = -7;
        var PHOTOCELL_PART_WIDTH = 68;
        var PHOTOCELL_PART_HEIGHT = 180;
        var PHOTOCELL_PART = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"Layer_1\" viewBox=\"0 0 33.6 90\" width=\"33.599998\" height=\"90\">\n    <path id=\"path9\" d=\"M12.7 60.500002l1.2 1.4h-1l-2.4-1.4v-34.6c0-.3.5-.5 1.1-.5.6 0 1.1.2 1.1.5z\" class=\"st1\" fill=\"#8c8c8c\"/>\n    <path id=\"path11\" d=\"M3.4 61.900002h1.905509L4.8.700002c-.003304-.399986-.5-.7-1.1-.7-.6 0-1.1.3-1.1.7z\" class=\"st1\" fill=\"#8c8c8c\"/>\n    <text id=\"text4514\" y=\"11.124916\" x=\"14.103056\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" font-weight=\"400\" font-size=\"7.744442\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#666\" stroke-width=\".968055\">\n      <tspan y=\"11.124916\" x=\"14.103056\" id=\"tspan4512\">10k\u03A9</tspan>\n    </text>\n    <text style=\"line-height:1.25;-inkscape-font-specification:consolas\" x=\"1.868053\" y=\"77.579796\" id=\"text4524\" font-weight=\"400\" font-size=\"32.793365\" font-family=\"consolas\" letter-spacing=\"0\" word-spacing=\"0\" stroke-width=\".819834\">\n    <tspan id=\"tspan4522\" x=\"1.868053\" y=\"77.579796\" font-size=\"10.931121\"></tspan>\n    </text>\n    <path id=\"rect41\" class=\"st1\" fill=\"#8c8c8c\" d=\"M11.6 15.800001h21.700001v1.9H11.6z\"/>\n    <path class=\"st10\" id=\"rect45\" fill=\"none\" d=\"M12 15.800001h3.2v1.9H12z\"/>\n    <path class=\"st11\" d=\"M19 13.900002c-.3-.2-.6-.3-.9-.3h-1.4c-.3 0-.5.3-.5.7v4.9c0 .4.2.7.5.7h1.4c.3 0 .6-.1.9-.3.3-.2.6-.3.9-.3h5c.3 0 .6.1.9.3h.1c.3.2.6.3.9.3h1.4c.3 0 .5-.3.5-.7v-4.9c0-.4-.2-.7-.5-.7h-1.4c-.3 0-.6.1-.9.3h-.1c-.3.2-.6.3-.9.3h-5c-.2 0-.5-.1-.9-.3z\" id=\"path47\" fill=\"#d6bf90\"/>\n    <path class=\"st12\" d=\"M28.4 17.400002c-.1.1-.1.2-.2.3-.3.5-.7.8-1.2.8s-.9-.1-1.4-.3c-.6-.1-1.1-.1-1.7-.1-2 0-3.9 0-5.9.2-.4.1-.8 0-1.1-.1-.2-.1-.4-.2-.5-.5v1.5c0 .2.1.3.2.3H18c.3 0 .6-.1.9-.3.3-.2.7-.3 1.1-.3h5c.4 0 .8.1 1.1.3.3.1.6.2.8.2h1.4c.1 0 .2-.1.2-.3v-1.9c0 .1-.1.2-.1.2z\" id=\"path49\" fill=\"#aa936b\"/>\n    <g id=\"g51\" transform=\"translate(0 -1.099998)\">\n      <path class=\"st13\" id=\"rect53\" fill=\"#ad9f4e\" d=\"M27.200001 14.7h.7v6.2h-.7z\"/>\n      <path class=\"st14\" id=\"rect55\" opacity=\".4\" d=\"M27.200001 17.799999h.7v2.5h-.7z\"/>\n      <path class=\"st15\" id=\"rect57\" opacity=\".5\" fill=\"#ff3\" d=\"M27.200001 15h.7v1.3h-.7z\"/>\n      <path class=\"st16\" id=\"rect59\" opacity=\".5\" fill=\"#fff\" d=\"M27.200001 15.3h.7v.7h-.7z\"/>\n    </g>\n    <path class=\"st17\" id=\"rect61\" fill=\"#ff9700\" d=\"M23.1 14.200002h1.3v5.1h-1.3z\"/>\n    <path class=\"st18\" id=\"rect63\" d=\"M20.6 14.200002h1.3v5.1h-1.3z\"/>\n    <path class=\"st18\" d=\"M19.3 14.000002c-.1 0-.1-.1-.2-.1-.3-.2-.6-.3-.9-.3H18v6.3h.1c.3 0 .6-.1.9-.3.1 0 .1-.1.2-.1v-5.5z\" id=\"path65\" fill=\"#aa4518\"/>\n    <path class=\"st19\" d=\"M18.7 14.600002c.4.1.8.2 1.2.2H21c1.2-.1 2.4-.1 3.6 0 .4 0 .9 0 1.3-.1.3-.1.6-.2.8-.3.6-.2 1.2-.3 1.8-.2 0-.1-.1-.3-.2-.3h-1.4c-.3 0-.6.1-.9.3-.3.2-.7.3-1.1.3h-5c-.4 0-.8-.1-1.1-.3-.3-.1-.6-.2-.8-.2h-1.4c-.1 0-.2.1-.2.3v.2c.8-.1 1.5 0 2.3.1z\" id=\"path67\" opacity=\".74\" fill=\"#fffdfa\"/>\n    <ellipse id=\"path4569\" ry=\"5.949258\" rx=\"6.745286\" cy=\"64.610916\" cx=\"8.085964\" fill=\"#aa4518\" stroke-width=\"3.558676\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <ellipse id=\"path4569-5\" ry=\"5.488401\" rx=\"6.222764\" cy=\"64.652809\" cx=\"8.024301\" fill=\"#e7e1df\" stroke-width=\"3.283004\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <ellipse id=\"path4607\" cx=\"3.393591\" cy=\"65\" rx=\".628443\" ry=\"1.016842\" fill=\"#4d4d4d\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <ellipse id=\"path4607-3\" cx=\"12.568855\" cy=\"65\" rx=\".628443\" ry=\"1.016842\" fill=\"#4d4d4d\" stroke-width=\"4\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>\n    <path d=\"M5.865466 60.253708c2.521642.258451 5.042396.51681 4.411086.820414-.63131.303603-4.416986.652835-4.224443.970671.192542.317835 4.36002.604044 4.24887.991436-.111149.387393-4.504242.87629-4.482809 1.204577.021434.328287 4.454339.49583 4.535187.914613.08085.418783-4.193489 1.089267-4.318738 1.529318-.125249.44005 3.895722.649476 4.19647 1.008916.300747.359441-3.121579.869298-3.749962 1.183637-.628384.314339 1.535952.433028 3.699646.551682\" id=\"path4630\" fill=\"none\" stroke=\"#9e4c34\" stroke-width=\".245669\" stroke-linecap=\"round\"/>\n  </svg>\n            ";
        // For the intructions
        function mkPhotoCellPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x + PHOTOCELL_PART_XOFF;
            var t = y + PHOTOCELL_PART_YOFF;
            var w = PHOTOCELL_PART_WIDTH;
            var h = PHOTOCELL_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-led", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(PHOTOCELL_PART)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkPhotoCellPart = mkPhotoCellPart;
        var PhotoCellView = /** @class */ (function () {
            function PhotoCellView(parsePinString) {
                this.color = "rgb(0,255,0)"; // green color by default
                this.parsePinString = parsePinString;
            }
            PhotoCellView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.pin = this.parsePinString(otherParams["name"] || otherParams["pin"]);
                this.bus = bus;
                this.initDom();
                this.updateState();
            };
            PhotoCellView.prototype.initDom = function () {
                var _this = this;
                this.element = pxsim.svg.elt("g");
                var image = new DOMParser().parseFromString(PHOTOCELL_PART, "image/svg+xml").querySelector("svg");
                pxsim.svg.hydrate(image, {
                    class: "sim-led", width: PHOTOCELL_PART_WIDTH, height: PHOTOCELL_PART_HEIGHT,
                });
                //this.led = image.getElementById('LED') as SVGPathElement;
                this.text = image.getElementById('tspan4522');
                this.element.appendChild(image);
                // TODO: slider
                this.element.onclick = function () {
                    _this.pin.value += 256;
                    _this.pin.value = _this.pin.value % 1024;
                    pxsim.runtime.queueDisplayUpdate();
                };
            };
            PhotoCellView.prototype.moveToCoord = function (xy) {
                visuals.translateEl(this.element, [xy[0] + PHOTOCELL_PART_XOFF, xy[1] + PHOTOCELL_PART_YOFF]);
            };
            PhotoCellView.prototype.updateTheme = function () {
            };
            PhotoCellView.prototype.updateState = function () {
                if (this.currentValue === this.pin.value && this.currentMode == this.pin.mode)
                    return;
                this.currentValue = this.pin.value;
                this.currentMode = this.pin.mode;
                this.text.textContent = "~" + this.currentValue;
            };
            return PhotoCellView;
        }());
        visuals.PhotoCellView = PhotoCellView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var pins;
    (function (pins) {
        var CommonPin = /** @class */ (function (_super) {
            __extends(CommonPin, _super);
            function CommonPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return CommonPin;
        }(pxsim.Pin));
        pins.CommonPin = CommonPin;
        var DigitalInOutPin = /** @class */ (function (_super) {
            __extends(DigitalInOutPin, _super);
            function DigitalInOutPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return DigitalInOutPin;
        }(CommonPin));
        pins.DigitalInOutPin = DigitalInOutPin;
        var AnalogInOutPin = /** @class */ (function (_super) {
            __extends(AnalogInOutPin, _super);
            function AnalogInOutPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return AnalogInOutPin;
        }(CommonPin));
        pins.AnalogInOutPin = AnalogInOutPin;
        var PwmOnlyPin = /** @class */ (function (_super) {
            __extends(PwmOnlyPin, _super);
            function PwmOnlyPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return PwmOnlyPin;
        }(CommonPin));
        pins.PwmOnlyPin = PwmOnlyPin;
        var PwmPin = /** @class */ (function (_super) {
            __extends(PwmPin, _super);
            function PwmPin() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return PwmPin;
        }(CommonPin));
        pins.PwmPin = PwmPin;
        function markUsed(pin) {
            if (pin && !pin.used) {
                pin.used = true;
                pxsim.runtime.queueDisplayUpdate();
            }
        }
        pins.markUsed = markUsed;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var DigitalInOutPinMethods;
    (function (DigitalInOutPinMethods) {
        function digitalRead(name) {
            pxsim.pins.markUsed(name);
            return name.digitalReadPin();
        }
        DigitalInOutPinMethods.digitalRead = digitalRead;
        /**
        * Set a pin or connector value to either 0 or 1.
        * @param value value to set on the pin, 1 eg,0
        */
        function digitalWrite(name, value) {
            pxsim.pins.markUsed(name);
            name.digitalWritePin(value);
        }
        DigitalInOutPinMethods.digitalWrite = digitalWrite;
        /**
        * Configures this pin to a digital input, and generates events where the timestamp is the duration
        * that this pin was either ``high`` or ``low``.
        */
        function onPulsed(name, high, body) {
            pxsim.pins.markUsed(name);
            onEvent(name, high ? 4 /* DEVICE_PIN_EVT_PULSE_HI */ : 5 /* DEVICE_PIN_EVT_PULSE_LO */, body);
        }
        DigitalInOutPinMethods.onPulsed = onPulsed;
        function onEvent(name, ev, body) {
            pxsim.pins.markUsed(name);
            name.onEvent(ev, body);
        }
        DigitalInOutPinMethods.onEvent = onEvent;
        /**
        * Returns the duration of a pulse in microseconds
        * @param value the value of the pulse (default high)
        * @param maximum duration in micro-seconds
        */
        function pulseIn(name, high, maxDuration) {
            if (maxDuration === void 0) { maxDuration = 2000000; }
            pxsim.pins.markUsed(name);
            var pulse = high ? 4 /* DEVICE_PIN_EVT_PULSE_HI */ : 5 /* DEVICE_PIN_EVT_PULSE_LO */;
            // Always return default value, can't simulate
            return 500;
        }
        DigitalInOutPinMethods.pulseIn = pulseIn;
        /**
        * Configures the pull of this pin.
        * @param pull one of the mbed pull configurations: PullUp, PullDown, PullNone
        */
        function setPull(name, pull) {
            pxsim.pins.markUsed(name);
            name.setPull(pull);
        }
        DigitalInOutPinMethods.setPull = setPull;
        /**
         * Get the pin state (pressed or not). Requires to hold the ground to close the circuit.
         * @param name pin used to detect the touch
         */
        function isPressed(name) {
            pxsim.pins.markUsed(name);
            return name.isTouched();
        }
        DigitalInOutPinMethods.isPressed = isPressed;
    })(DigitalInOutPinMethods = pxsim.DigitalInOutPinMethods || (pxsim.DigitalInOutPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var AnalogInPinMethods;
    (function (AnalogInPinMethods) {
        /**
         * Read the connector value as analog, that is, as a value comprised between 0 and 1023.
         */
        function analogRead(name) {
            pxsim.pins.markUsed(name);
            return name.analogReadPin();
        }
        AnalogInPinMethods.analogRead = analogRead;
    })(AnalogInPinMethods = pxsim.AnalogInPinMethods || (pxsim.AnalogInPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var AnalogOutPinMethods;
    (function (AnalogOutPinMethods) {
        /**
     * Set the connector value as analog. Value must be comprised between 0 and 1023.
     * @param value value to write to the pin between ``0`` and ``1023``. eg:1023,0
     */
        function analogWrite(name, value) {
            pxsim.pins.markUsed(name);
            name.analogWritePin(value);
        }
        AnalogOutPinMethods.analogWrite = analogWrite;
    })(AnalogOutPinMethods = pxsim.AnalogOutPinMethods || (pxsim.AnalogOutPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var PwmOnlyPinMethods;
    (function (PwmOnlyPinMethods) {
        function analogSetPeriod(name, micros) {
            pxsim.pins.markUsed(name);
            name.analogSetPeriod(micros);
        }
        PwmOnlyPinMethods.analogSetPeriod = analogSetPeriod;
        function servoWrite(name, value) {
            pxsim.pins.markUsed(name);
            name.servoWritePin(value);
        }
        PwmOnlyPinMethods.servoWrite = servoWrite;
        function servoSetPulse(name, micros) {
            pxsim.pins.markUsed(name);
            name.servoSetPulse(name.id, micros);
        }
        PwmOnlyPinMethods.servoSetPulse = servoSetPulse;
    })(PwmOnlyPinMethods = pxsim.PwmOnlyPinMethods || (pxsim.PwmOnlyPinMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pins;
    (function (pins) {
        function pinByCfg(key) {
            var pin = pxsim.pxtcore.getPinCfg(key);
            pins.markUsed(pin);
            return pin;
        }
        pins.pinByCfg = pinByCfg;
        function pulseDuration() {
            // bus last event timestamp
            return 500;
        }
        pins.pulseDuration = pulseDuration;
        function createBuffer(sz) {
            return pxsim.BufferMethods.createBuffer(sz);
        }
        pins.createBuffer = createBuffer;
        function createI2C(sda, scl) {
            var b = pxsim.board();
            pins.markUsed(sda);
            pins.markUsed(scl);
            return b && b.edgeConnectorState && b.edgeConnectorState.createI2C(sda, scl);
        }
        pins.createI2C = createI2C;
        function createSPI(mosi, miso, sck) {
            var b = pxsim.board();
            pins.markUsed(mosi);
            pins.markUsed(miso);
            pins.markUsed(sck);
            return b && b.edgeConnectorState && b.edgeConnectorState.createSPI(mosi, miso, sck);
        }
        pins.createSPI = createSPI;
    })(pins = pxsim.pins || (pxsim.pins = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var I2CMethods;
    (function (I2CMethods) {
        function readBuffer(i2c, address, size, repeat) {
            return pxsim.control.createBuffer(0);
        }
        I2CMethods.readBuffer = readBuffer;
        function writeBuffer(i2c, address, buf, repeat) {
            return 0;
        }
        I2CMethods.writeBuffer = writeBuffer;
    })(I2CMethods = pxsim.I2CMethods || (pxsim.I2CMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var SPIMethods;
    (function (SPIMethods) {
        function write(device, value) {
            return device.write(value);
        }
        SPIMethods.write = write;
        function transfer(device, command, response) {
            device.transfer(command, response);
        }
        SPIMethods.transfer = transfer;
        function setFrequency(device, frequency) {
            device.setFrequency(frequency);
        }
        SPIMethods.setFrequency = setFrequency;
        function setMode(device, mode) {
            device.setMode(mode);
        }
        SPIMethods.setMode = setMode;
    })(SPIMethods = pxsim.SPIMethods || (pxsim.SPIMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var SerialDeviceMethods;
    (function (SerialDeviceMethods) {
        function setTxBufferSize(device, size) {
            device.setTxBufferSize(size);
        }
        SerialDeviceMethods.setTxBufferSize = setTxBufferSize;
        function setRxBufferSize(device, size) {
            device.setRxBufferSize(size);
        }
        SerialDeviceMethods.setRxBufferSize = setRxBufferSize;
        function read(device) {
            return device.read();
        }
        SerialDeviceMethods.read = read;
        function readBuffer(device) {
            return device.readBuffer();
        }
        SerialDeviceMethods.readBuffer = readBuffer;
        function writeBuffer(device, buffer) {
            device.writeBuffer(buffer);
        }
        SerialDeviceMethods.writeBuffer = writeBuffer;
        function setBaudRate(device, rate) {
            device.setBaudRate(rate);
        }
        SerialDeviceMethods.setBaudRate = setBaudRate;
        function redirect(device, tx, rx, rate) {
            device.redirect(tx, rx, rate);
        }
        SerialDeviceMethods.redirect = redirect;
        function onEvent(device, event, handler) {
            device.onEvent(event, handler);
        }
        SerialDeviceMethods.onEvent = onEvent;
        function onDelimiterReceived(device, delimiter, handler) {
            device.onDelimiterReceived(delimiter, handler);
        }
        SerialDeviceMethods.onDelimiterReceived = onDelimiterReceived;
    })(SerialDeviceMethods = pxsim.SerialDeviceMethods || (pxsim.SerialDeviceMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var serial;
    (function (serial) {
        function internalCreateSerialDevice(tx, rx, id) {
            var b = pxsim.board();
            return b && b.edgeConnectorState ? b.edgeConnectorState.createSerialDevice(tx, rx, id) : new pxsim.SerialDevice(tx, rx, id);
        }
        serial.internalCreateSerialDevice = internalCreateSerialDevice;
    })(serial = pxsim.serial || (pxsim.serial = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function neopixelState(pinId) {
        return pxsim.board().neopixelState(pinId);
    }
    pxsim.neopixelState = neopixelState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var SWITCH_PART_XOFF = -1;
        var SWITCH_PART_YOFF = -30;
        var SWITCH_PART_WIDTH = 100;
        var SWITCH_PART_HEIGHT = 100;
        var SWITCH_PART_PIN_DIST = 15;
        var SWITCH_PART_SVG_OFF = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100mm\" height=\"100mm\" viewBox=\"0 0 100 100\" id=\"svg8\">\n    <g id=\"layer1\" transform=\"translate(0 -197)\">\n      <rect id=\"rect4508-3\" width=\"6.054\" height=\"32.94\" x=\"43.381\" y=\"210.817\" rx=\"2.811\" fill=\"#666\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4508-3-3\" width=\"6.054\" height=\"32.94\" x=\"58.321\" y=\"210.817\" rx=\"2.811\" fill=\"#666\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4508\" width=\"6.054\" height=\"32.94\" x=\"28.44\" y=\"210.817\" rx=\"2.811\" fill=\"#666\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4485\" width=\"100.542\" height=\"40.611\" y=\"237.763\" rx=\"3.432\" stroke=\"#000\" stroke-width=\".309\"/>\n      <rect id=\"rect4487\" width=\"60.587\" height=\"18.323\" x=\"7.977\" y=\"248.907\" rx=\"2.46\" fill=\"#b3b3b3\" stroke=\"#000\" stroke-width=\".262\"/>\n      <rect id=\"rect4487-7\" width=\"53.273\" height=\"10.029\" x=\"11.2\" y=\"253.384\" rx=\"2.163\" fill=\"#999\" stroke=\"#000\" stroke-width=\".182\"/>\n      <rect id=\"handle\" width=\"19.243\" height=\"30.007\" x=\"11.924\" y=\"256.572\" rx=\"3.432\" fill=\"#4d4d4d\" stroke=\"#000\" stroke-width=\".309\"/>\n      <text style=\"line-height:1.25\" x=\"71.848\" y=\"259.158\" id=\"text\" transform=\"scale(.97895 1.0215)\" font-weight=\"400\" font-size=\"17.409\" font-family=\"sans-serif\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#fff\" stroke-width=\".435\">\n        <tspan id=\"tspan4558\" x=\"71.848\" y=\"259.158\" style=\"-inkscape-font-specification:Consolas\" font-family=\"Consolas\">OFF</tspan>\n      </text>\n    </g>\n  </svg>\n  ";
        var SWITCH_PART_SVG_ON = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"100mm\" height=\"100mm\" viewBox=\"0 0 100 100\" id=\"svg8\">\n  <g id=\"layer1\" transform=\"translate(0 -197)\">\n    <g id=\"g4509\" transform=\"matrix(1.14409 0 0 1.19383 -7.582 -50.118)\">\n      <rect rx=\"2.457\" y=\"218.57\" x=\"44.544\" height=\"27.592\" width=\"5.292\" id=\"rect4508-3\" fill=\"#666\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"2.457\" y=\"218.57\" x=\"57.604\" height=\"27.592\" width=\"5.292\" id=\"rect4508-3-3\" fill=\"#666\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"2.457\" y=\"218.57\" x=\"31.485\" height=\"27.592\" width=\"5.292\" id=\"rect4508\" fill=\"#666\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"3\" y=\"241.141\" x=\"6.627\" height=\"34.018\" width=\"87.879\" id=\"rect4485\" fill=\"#450\" stroke=\"#000\" stroke-width=\".265\"/>\n      <rect rx=\"2.15\" y=\"250.476\" x=\"13.6\" height=\"15.348\" width=\"52.957\" id=\"rect4487\" fill=\"#b3b3b3\" stroke=\"#000\" stroke-width=\".224\"/>\n      <rect rx=\"1.89\" y=\"254.226\" x=\"16.417\" height=\"8.4\" width=\"46.564\" id=\"rect4487-7\" fill=\"#999\" stroke=\"#000\" stroke-width=\".156\"/>\n      <rect rx=\"3\" y=\"256.897\" x=\"46.189\" height=\"25.135\" width=\"16.82\" id=\"handle\" fill=\"#4d4d4d\" stroke=\"#000\" stroke-width=\".265\"/>\n      <text id=\"text\" y=\"263.731\" x=\"68.105\" style=\"line-height:1.25\" font-weight=\"400\" font-size=\"14.896\" font-family=\"sans-serif\" letter-spacing=\"0\" word-spacing=\"0\" fill=\"#fff\" stroke-width=\".372\">\n        <tspan style=\"-inkscape-font-specification:Consolas\" y=\"263.731\" x=\"68.105\" id=\"tspan4558\" font-family=\"Consolas\">ON</tspan>\n      </text>\n    </g>\n  </g>\n</svg>\n";
        // For the intructions
        function mkSideSwitchPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x + SWITCH_PART_XOFF;
            var t = y + SWITCH_PART_YOFF;
            var w = SWITCH_PART_WIDTH;
            var h = SWITCH_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-led", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(SWITCH_PART_SVG_OFF)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkSideSwitchPart = mkSideSwitchPart;
        var ToggleComponentVisual = /** @class */ (function () {
            function ToggleComponentVisual(parsePinString) {
                var _this = this;
                this.currentlyOn = false;
                this.element = pxsim.svg.elt("g");
                this.element.onclick = function () {
                    if (_this.state) {
                        _this.state.toggle();
                        pxsim.runtime.queueDisplayUpdate();
                    }
                };
                this.onElement = this.initImage(SWITCH_PART_SVG_ON);
                this.offElement = this.initImage(SWITCH_PART_SVG_OFF);
                this.element.appendChild(this.offElement);
                this.parsePinString = parsePinString;
            }
            ToggleComponentVisual.prototype.moveToCoord = function (xy) {
                var to = [xy[0] + SWITCH_PART_XOFF, xy[1] + SWITCH_PART_YOFF];
                visuals.translateEl(this.element, to);
            };
            ToggleComponentVisual.prototype.init = function (bus, state, svgEl, otherParams) {
                this.state = state(this.parsePinString(otherParams["pin"]));
                this.updateState();
            };
            ToggleComponentVisual.prototype.updateState = function () {
                if (this.state.on() === this.currentlyOn) {
                    return;
                }
                this.currentlyOn = this.state.on();
                if (this.state.on()) {
                    this.element.removeChild(this.offElement);
                    this.element.appendChild(this.onElement);
                }
                else {
                    this.element.removeChild(this.onElement);
                    this.element.appendChild(this.offElement);
                }
            };
            ToggleComponentVisual.prototype.updateTheme = function () { };
            ToggleComponentVisual.prototype.initImage = function (svgData) {
                var image = "data:image/svg+xml," + encodeURIComponent(svgData);
                var imgAndSize = visuals.mkImageSVG({
                    image: image,
                    width: SWITCH_PART_WIDTH,
                    height: SWITCH_PART_HEIGHT,
                    imageUnitDist: SWITCH_PART_PIN_DIST,
                    targetUnitDist: visuals.PIN_DIST
                });
                return imgAndSize.el;
            };
            return ToggleComponentVisual;
        }());
        visuals.ToggleComponentVisual = ToggleComponentVisual;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var ToggleState = /** @class */ (function () {
        function ToggleState(pin) {
            this.pin = pin;
        }
        ToggleState.prototype.toggle = function () {
            var on = !!this.pin.value;
            this.pin.setValue(on ? 0 : 1023);
        };
        ToggleState.prototype.on = function () {
            return this.pin.value > 0;
        };
        return ToggleState;
    }());
    pxsim.ToggleState = ToggleState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var gamepad;
    (function (gamepad) {
        function setButton(index, up) {
            // TODO
        }
        gamepad.setButton = setButton;
        function move(index, x, y) {
            // TODO
        }
        gamepad.move = move;
        function setThrottle(index, value) {
            // TODO
        }
        gamepad.setThrottle = setThrottle;
    })(gamepad = pxsim.gamepad || (pxsim.gamepad = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var network;
    (function (network) {
        function infraredSendPacket(buf) {
            var state = pxsim.getInfraredState();
            state.send(buf);
        }
        network.infraredSendPacket = infraredSendPacket;
        function infraredPacket() {
            var state = pxsim.getInfraredState();
            return state.packet;
        }
        network.infraredPacket = infraredPacket;
        function onInfraredPacket(body) {
            var state = pxsim.getInfraredState();
            state.listen(body);
        }
        network.onInfraredPacket = onInfraredPacket;
        function onInfraredError(body) {
            var state = pxsim.getInfraredState();
            state.listenError(body);
        }
        network.onInfraredError = onInfraredError;
    })(network = pxsim.network || (pxsim.network = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var InfraredState = /** @class */ (function () {
        function InfraredState() {
            // notify view that a packet was received
            this.packetReceived = false;
            this.IR_COMPONENT_ID = 0x2042;
            this.IR_PACKET_EVENT = 0x2;
            this.IR_PACKET_ERROR_EVENT = 0x3;
        }
        InfraredState.prototype.send = function (buf) {
            pxsim.Runtime.postMessage({
                type: "irpacket",
                packet: buf.data,
                broadcast: true
            });
        };
        InfraredState.prototype.listen = function (body) {
            pxsim.pxtcore.registerWithDal(this.IR_COMPONENT_ID, this.IR_PACKET_EVENT, body);
        };
        InfraredState.prototype.listenError = function (body) {
            pxsim.pxtcore.registerWithDal(this.IR_COMPONENT_ID, this.IR_PACKET_ERROR_EVENT, body);
        };
        InfraredState.prototype.receive = function (buf) {
            this.packet = new pxsim.RefBuffer(buf);
            this.packetReceived = true;
            pxsim.board().bus.queue(this.IR_COMPONENT_ID, this.IR_PACKET_EVENT);
        };
        return InfraredState;
    }());
    pxsim.InfraredState = InfraredState;
    function getInfraredState() {
        return pxsim.board().irState;
    }
    pxsim.getInfraredState = getInfraredState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var JD_SERIAL_EVT_DATA_READY = 1;
    var JacDacState = /** @class */ (function () {
        function JacDacState(board) {
            var _this = this;
            this.running = false;
            this.eventId = 100; // ?
            this.board = board;
            this.packetQueue = [];
            board.addMessageListener(function (msg) { return _this.processMessage(msg); });
        }
        JacDacState.prototype.start = function () {
            this.running = true;
        };
        JacDacState.prototype.stop = function () {
            this.running = false;
        };
        JacDacState.prototype.isConnected = function () {
            return this.running;
        };
        JacDacState.prototype.isRunning = function () {
            return this.running;
        };
        JacDacState.prototype.getState = function () {
            return 0;
        };
        JacDacState.prototype.getPacket = function () {
            var b = this.packetQueue.shift();
            if (!b)
                return undefined;
            var buf = pxsim.BufferMethods.createBuffer(b.length);
            for (var i = 0; i < buf.data.length; ++i)
                buf.data[i] = b[i];
            //console.log("jd> recv " + pxsim.BufferMethods.toHex(buf));
            return buf;
        };
        JacDacState.prototype.sendPacket = function (buf) {
            //console.log("jd> send " + pxsim.BufferMethods.toHex(buf));
            pxsim.Runtime.postMessage({
                type: "jacdac",
                broadcast: true,
                packet: pxsim.BufferMethods.getBytes(buf)
            });
        };
        JacDacState.prototype.processMessage = function (msg) {
            var b = pxsim.board();
            if (!this.running || !b)
                return;
            if (msg && msg.type == "jacdac") {
                var jdmsg = msg;
                this.packetQueue.push(jdmsg.packet);
                b.bus.queue(this.eventId, JD_SERIAL_EVT_DATA_READY);
            }
        };
        JacDacState.prototype.getDiagnostics = function () {
            // TODO
            return undefined;
        };
        return JacDacState;
    }());
    pxsim.JacDacState = JacDacState;
    function getJacDacState() {
        return pxsim.board().jacdacState;
    }
    pxsim.getJacDacState = getJacDacState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var jacdac;
    (function (jacdac) {
        /**
         * Gets the physical layer component id
         **/
        function __physId() {
            var state = pxsim.getJacDacState();
            return state ? state.eventId : -1;
        }
        jacdac.__physId = __physId;
        /**
         * Write a buffer to the jacdac physical layer.
         **/
        function __physSendPacket(buf) {
            var state = pxsim.getJacDacState();
            if (state)
                state.sendPacket(buf);
        }
        jacdac.__physSendPacket = __physSendPacket;
        /**
         * Reads a packet from the queue. NULL if queue is empty
         **/
        function __physGetPacket() {
            var state = pxsim.getJacDacState();
            return state ? state.getPacket() : undefined;
        }
        jacdac.__physGetPacket = __physGetPacket;
        /**
         * Returns the connection state of the JACDAC physical layer.
         **/
        function __physIsConnected() {
            var state = pxsim.getJacDacState();
            return state && state.isConnected();
        }
        jacdac.__physIsConnected = __physIsConnected;
        /**
         * Indicates if the bus is running
         **/
        function __physIsRunning() {
            var state = pxsim.getJacDacState();
            return state && state.isRunning();
        }
        jacdac.__physIsRunning = __physIsRunning;
        /**
         * Starts the JACDAC physical layer.
         **/
        function __physStart() {
            var state = pxsim.getJacDacState();
            if (state)
                state.start();
        }
        jacdac.__physStart = __physStart;
        /**
         * Stops the JACDAC physical layer.
         **/
        function __physStop() {
            var state = pxsim.getJacDacState();
            if (state)
                state.stop();
        }
        jacdac.__physStop = __physStop;
        function __physGetDiagnostics() {
            var state = pxsim.getJacDacState();
            return state && state.getDiagnostics();
        }
        jacdac.__physGetDiagnostics = __physGetDiagnostics;
    })(jacdac = pxsim.jacdac || (pxsim.jacdac = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var keyboard;
    (function (keyboard) {
        var events = [
            "press",
            "up",
            "down"
        ];
        function __type(s) {
            console.log("kb: type " + s);
        }
        keyboard.__type = __type;
        function __key(c, event) {
            console.log("kb: key " + c + " " + events[event]);
        }
        keyboard.__key = __key;
        function __mediaKey(key, event) {
            console.log("kb: media " + key + " " + events[event]);
        }
        keyboard.__mediaKey = __mediaKey;
        function __functionKey(key, event) {
            console.log("kb: function " + key + " " + events[event]);
        }
        keyboard.__functionKey = __functionKey;
    })(keyboard = pxsim.keyboard || (pxsim.keyboard = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var LCDState = /** @class */ (function () {
        function LCDState(lines, columns) {
            if (lines === void 0) { lines = 2; }
            if (columns === void 0) { columns = 16; }
            this.lines = 0;
            this.columns = 0;
            this.backLightColor = "#6e7d6e";
            this.cursor = false;
            this.display = false;
            this.blink = false;
            this.sensorUsed = false;
            this.lines = lines;
            this.columns = columns;
            this.clear();
        }
        LCDState.prototype.clear = function () {
            var s = "";
            for (var i = 0; i < this.columns; ++i)
                s += " ";
            this.text = [];
            for (var i = 0; i < this.lines; ++i)
                this.text.push(s);
            this.cursorPos = [0, 0];
        };
        LCDState.prototype.setUsed = function () {
            if (!this.sensorUsed) {
                this.sensorUsed = true;
                pxsim.runtime.queueDisplayUpdate();
            }
        };
        return LCDState;
    }());
    pxsim.LCDState = LCDState;
    function lcdState() {
        return pxsim.board().lcdState;
    }
    pxsim.lcdState = lcdState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var lcd;
    (function (lcd) {
        var _LCD_CLEARDISPLAY = 0x01;
        var _LCD_RETURNHOME = 0x02;
        var _LCD_ENTRYMODESET = 0x04;
        var _LCD_DISPLAYCONTROL = 0x08;
        var _LCD_CURSORSHIFT = 0x10;
        var _LCD_FUNCTIONSET = 0x20;
        var _LCD_SETCGRAMADDR = 0x40;
        var _LCD_SETDDRAMADDR = 0x80;
        // Entry flags
        var _LCD_ENTRYLEFT = 0x02;
        var _LCD_ENTRYSHIFTDECREMENT = 0x00;
        // Control flags
        var _LCD_DISPLAYON = 0x04;
        var _LCD_CURSORON = 0x02;
        var _LCD_CURSOROFF = 0x00;
        var _LCD_BLINKON = 0x01;
        var _LCD_BLINKOFF = 0x00;
        var _LCD_ROW_OFFSETS = [0x00, 0x40, 0x14, 0x54];
        function __write8(value, char_mode) {
            var b = pxsim.lcdState();
            if (!b)
                return;
            b.setUsed();
            if (char_mode) {
                var c = b.cursorPos[0];
                var r = b.cursorPos[1];
                var s = b.text[r];
                if (s !== undefined && c >= 0 && c < s.length) {
                    b.text[r] = s.substring(0, c) + pxsim.String_.fromCharCode(value) + s.substring(c + 1);
                    b.cursorPos[0]++;
                }
            }
            else {
                if (value & _LCD_SETDDRAMADDR) {
                    value = ~(~value | _LCD_SETDDRAMADDR);
                    // setCursorPosition
                    // this._write8(_LCD_SETDDRAMADDR | column + _LCD_ROW_OFFSETS[row])
                    for (var i = _LCD_ROW_OFFSETS.length - 1; i >= 0; i--) {
                        if (((value & _LCD_ROW_OFFSETS[i]) == _LCD_ROW_OFFSETS[i]) || i == 0) {
                            b.cursorPos[0] = value - _LCD_ROW_OFFSETS[i];
                            b.cursorPos[1] = i;
                            break;
                        }
                    }
                }
                else if (value == _LCD_CLEARDISPLAY) {
                    b.clear();
                }
                else if ((value & _LCD_DISPLAYCONTROL) == _LCD_DISPLAYCONTROL) {
                    b.display = (value & _LCD_DISPLAYON) == _LCD_DISPLAYON;
                    b.cursor = (value & _LCD_CURSORON) == _LCD_CURSORON;
                    b.blink = (value & _LCD_BLINKON) == _LCD_BLINKON;
                }
                else if (value == _LCD_RETURNHOME) {
                    b.cursorPos = [0, 0];
                }
            }
            pxsim.runtime.queueDisplayUpdate();
        }
        lcd.__write8 = __write8;
    })(lcd = pxsim.lcd || (pxsim.lcd = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        // For the intructions
        function mkLCDPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x;
            var t = y;
            var w = LCD_PART_WIDTH;
            var h = LCD_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-lcd", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(LCD_PART)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkLCDPart = mkLCDPart;
        var LCDView = /** @class */ (function () {
            function LCDView() {
            }
            LCDView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.state = state;
                this.bus = bus;
                this.initDom();
                this.updateState();
            };
            LCDView.prototype.initDom = function () {
                this.element = pxsim.svg.elt("g");
                this.image = new DOMParser().parseFromString(LCD_PART, "image/svg+xml").querySelector("svg");
                pxsim.svg.hydrate(this.image, {
                    class: "sim-lcd", width: LCD_PART_WIDTH, height: LCD_PART_HEIGHT,
                });
                this.screen = this.image.getElementById('ecran');
                this.backlight = this.image.getElementById('backlight');
                this.backlight.style.fill = "#6e7d6e";
                this.element.appendChild(this.image);
            };
            LCDView.prototype.setChar = function (column, line, value) {
                var _case = this.image.getElementById("case" + line + "" + column + "_text");
                _case.innerHTML = value.charAt(0);
            };
            LCDView.prototype.moveToCoord = function (xy) {
                visuals.translateEl(this.element, [xy[0], xy[1]]);
            };
            LCDView.prototype.updateTheme = function () {
            };
            LCDView.prototype.updateState = function () {
                for (var line = 0; line < this.state.lines; line++) {
                    for (var column = 0; column < this.state.columns; column++) {
                        if (!!this.state.text && !!this.state.text[line] && !!this.state.text[line][column])
                            this.setChar(column, line, this.state.text[line][column]);
                    }
                }
                this.backlight.style.fill = this.state.backLightColor;
            };
            return LCDView;
        }());
        visuals.LCDView = LCDView;
        var LCD_PART_WIDTH = 322.79001;
        var LCD_PART_HEIGHT = 129.27348;
        var LCD_PART = "\n    <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"LCD\" width=\"322.8\" height=\"129.3\" viewBox=\"0 0 322.8 129.3\">\n    <defs id=\"defs2284\">\n      <style id=\"style2282\">\n        .cls-textCase{fill:#000;fill-opacity:.8;font-family:monospace;font-weight:100;font-size:24px}.cls-case{fill:#fff;fill-opacity:.1}\n      </style>\n    </defs>\n    <path id=\"rect4820\" fill=\"#6767ff\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".7\" d=\"M.3.3h322.1v128.6H.3z\"/>\n    <path id=\"path132\" fill=\"#303030\" stroke-width=\".9\" d=\"M308.6 93c-1 0-1.9-.8-1.9-1.8V57.7c0-1 .9-1.8 1.9-1.8V29h-.9l-2.9-2.6v-1H18v1L15.1 29h-1V56h.1c1 0 1.9.8 1.9 1.8v33.5c0 1-.8 1.8-1.9 1.8v26.9h1l2.8 2.6v1h286.8v-1l2.9-2.6h1V93z\"/>\n    <g id=\"g140\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"backlight\" d=\"M319.6 118.3a6 6 0 0 1-6 6h-269a6 6 0 0 1-6-6v-60a6 6 0 0 1 6-6h269a6 6 0 0 1 6 6z\" class=\"cls-backlight\"/>\n      <g id=\"g138\" opacity=\".2\">\n        <path id=\"path136\" fill=\"#22420d\" d=\"M319.6 58.3v60-60zm-275-6a6 6 0 0 0-6 6v60a6 6 0 0 0 6 6H48a6 6 0 0 1-6-6v-58a6 6 0 0 1 6-6h270c-1-1.1-2.6-2-4.4-2h-269z\"/>\n      </g>\n    </g>\n    <g id=\"g146\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path142\" fill=\"#1a1a1a\" d=\"M322 40.5c0-1-.8-2-1.9-2h-282c-1.1 0-2 1-2 2v1.1c0 1.1.9 2 2 2h282c1 0 2-.9 2-2v-1z\"/>\n      <path id=\"path144\" fill=\"#424242\" d=\"M321 42.3c0-.7-.6-1.3-1.3-1.3h-281c-.9 0-1.5.6-1.5 1.3 0 .7.6 1.3 1.4 1.3h281c.8 0 1.5-.6 1.5-1.3z\"/>\n    </g>\n    <g id=\"g152\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path148\" fill=\"#1a1a1a\" d=\"M322 134c0-1-.8-1.9-1.9-1.9h-282c-1.1 0-2 .9-2 2v1c0 1.1.9 2 2 2h282c1 0 2-.9 2-2v-1z\"/>\n      <path id=\"path150\" fill=\"#424242\" d=\"M321 135.8c0-.7-.6-1.3-1.3-1.3h-281c-.9 0-1.5.6-1.5 1.3 0 .8.6 1.3 1.4 1.3h281c.8 0 1.5-.5 1.5-1.3z\"/>\n    </g>\n    <g id=\"g158\" fill-opacity=\"0\" stroke=\"#f2f2f2\" stroke-linecap=\"round\" stroke-opacity=\".2\" stroke-width=\".2\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path154\" d=\"M27 37.4l3.2-3\"/>\n      <path id=\"path156\" d=\"M30.2 143.3l-3.1-3.1\"/>\n    </g>\n    <g id=\"g164\" fill-opacity=\"0\" stroke=\"#f2f2f2\" stroke-linecap=\"round\" stroke-opacity=\".2\" stroke-width=\".2\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path160\" d=\"M332.1 37.4l-3.1-3\"/>\n      <path id=\"path162\" d=\"M329 143.3l3-3.1\"/>\n    </g>\n    <path id=\"path166\" fill-opacity=\"0\" stroke=\"#1a1a1a\" stroke-opacity=\".4\" stroke-width=\"1.3\" d=\"M296.5 101.4c0 2.8-2.6 5.2-5.7 5.2H33c-3 0-5.6-2.4-5.6-5.2v-53c0-2.8 2.5-5.2 5.6-5.2h258c3 0 5.6 2.4 5.6 5.2z\"/>\n    <g id=\"ecran\" transform=\"matrix(1.02697 0 0 1.04868 -20.3 -17.7)\">\n      <path id=\"case10\" fill=\"#fff\" fill-opacity=\".1\" d=\"M52.9 88.8h14.8v24.4H52.9z\" class=\"cls-case\"/>\n      <path id=\"case11\" fill=\"#fff\" fill-opacity=\".1\" d=\"M68.7 88.8h14.8v24.4H68.7z\" class=\"cls-case\"/>\n      <path id=\"case12\" fill=\"#fff\" fill-opacity=\".1\" d=\"M84.6 88.8h14.8v24.4H84.5z\" class=\"cls-case\"/>\n      <path id=\"case13\" fill=\"#fff\" fill-opacity=\".1\" d=\"M100.4 88.8h14.8v24.4h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case14\" fill=\"#fff\" fill-opacity=\".1\" d=\"M116.3 88.8H131v24.4h-14.7z\" class=\"cls-case\"/>\n      <path id=\"case15\" fill=\"#fff\" fill-opacity=\".1\" d=\"M132 88.8H147v24.4H132z\" class=\"cls-case\"/>\n      <path id=\"case16\" fill=\"#fff\" fill-opacity=\".1\" d=\"M148 88.8h14.7v24.4H148z\" class=\"cls-case\"/>\n      <path id=\"case17\" fill=\"#fff\" fill-opacity=\".1\" d=\"M163.8 88.8h14.8v24.4h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case18\" fill=\"#fff\" fill-opacity=\".1\" d=\"M179.6 88.8h14.8v24.4h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case19\" fill=\"#fff\" fill-opacity=\".1\" d=\"M195.5 88.8h14.7v24.4h-14.7z\" class=\"cls-case\"/>\n      <path id=\"case110\" fill=\"#fff\" fill-opacity=\".1\" d=\"M211.3 88.8h14.8v24.4h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case111\" fill=\"#fff\" fill-opacity=\".1\" d=\"M227.1 88.8H242v24.4h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case112\" fill=\"#fff\" fill-opacity=\".1\" d=\"M243 88.8h14.8v24.4H243z\" class=\"cls-case\"/>\n      <path id=\"case113\" fill=\"#fff\" fill-opacity=\".1\" d=\"M258.8 88.8h14.8v24.4h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case114\" fill=\"#fff\" fill-opacity=\".1\" d=\"M274.7 88.8h14.7v24.4h-14.7z\" class=\"cls-case\"/>\n      <path id=\"case115\" fill=\"#fff\" fill-opacity=\".1\" d=\"M290.5 88.8h14.8v24.4h-14.8z\" class=\"cls-case\"/>\n      <text id=\"case10_text\" x=\"52.9\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case11_text\" x=\"68.7\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case12_text\" x=\"84.6\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case13_text\" x=\"100.4\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case14_text\" x=\"116.3\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case15_text\" x=\"132.1\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case16_text\" x=\"147.9\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case17_text\" x=\"163.8\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case18_text\" x=\"179.6\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case19_text\" x=\"195.5\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case110_text\" x=\"211.3\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case111_text\" x=\"227.1\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case112_text\" x=\"243\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case113_text\" x=\"258.8\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case114_text\" x=\"274.7\" y=\"112.9\" class=\"cls-textCase\"/>\n      <text id=\"case115_text\" x=\"290.5\" y=\"112.9\" class=\"cls-textCase\"/>\n      <path id=\"case00\" fill=\"#fff\" fill-opacity=\".1\" d=\"M52.9 63.5h14.8v24.3H52.9z\" class=\"cls-case\"/>\n      <path id=\"case01\" fill=\"#fff\" fill-opacity=\".1\" d=\"M68.7 63.5h14.8v24.3H68.7z\" class=\"cls-case\"/>\n      <path id=\"case02\" fill=\"#fff\" fill-opacity=\".1\" d=\"M84.6 63.5h14.8v24.3H84.5z\" class=\"cls-case\"/>\n      <path id=\"case03\" fill=\"#fff\" fill-opacity=\".1\" d=\"M100.4 63.5h14.8v24.3h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case04\" fill=\"#fff\" fill-opacity=\".1\" d=\"M116.3 63.5H131v24.3h-14.7z\" class=\"cls-case\"/>\n      <path id=\"case05\" fill=\"#fff\" fill-opacity=\".1\" d=\"M132 63.5H147v24.3H132z\" class=\"cls-case\"/>\n      <path id=\"case06\" fill=\"#fff\" fill-opacity=\".1\" d=\"M148 63.5h14.7v24.3H148z\" class=\"cls-case\"/>\n      <path id=\"case07\" fill=\"#fff\" fill-opacity=\".1\" d=\"M163.8 63.5h14.8v24.3h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case08\" fill=\"#fff\" fill-opacity=\".1\" d=\"M179.6 63.5h14.8v24.3h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case09\" fill=\"#fff\" fill-opacity=\".1\" d=\"M195.5 63.5h14.7v24.3h-14.7z\" class=\"cls-case\"/>\n      <path id=\"case010\" fill=\"#fff\" fill-opacity=\".1\" d=\"M211.3 63.5h14.8v24.3h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case011\" fill=\"#fff\" fill-opacity=\".1\" d=\"M227.1 63.5H242v24.3h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case012\" fill=\"#fff\" fill-opacity=\".1\" d=\"M243 63.5h14.8v24.3H243z\" class=\"cls-case\"/>\n      <path id=\"case013\" fill=\"#fff\" fill-opacity=\".1\" d=\"M258.8 63.5h14.8v24.3h-14.8z\" class=\"cls-case\"/>\n      <path id=\"case014\" fill=\"#fff\" fill-opacity=\".1\" d=\"M274.7 63.5h14.7v24.3h-14.7z\" class=\"cls-case\"/>\n      <path id=\"case015\" fill=\"#fff\" fill-opacity=\".1\" d=\"M290.5 63.5h14.8v24.3h-14.8z\" class=\"cls-case\"/>\n      <text id=\"case00_text\" x=\"52.9\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case01_text\" x=\"68.7\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case02_text\" x=\"84.6\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case03_text\" x=\"100.4\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case04_text\" x=\"116.3\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case05_text\" x=\"132.1\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case06_text\" x=\"147.9\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case07_text\" x=\"163.8\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case08_text\" x=\"179.6\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case09_text\" x=\"195.5\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case010_text\" x=\"211.3\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case011_text\" x=\"227.1\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case012_text\" x=\"243\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case013_text\" x=\"258.8\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case014_text\" x=\"274.7\" y=\"87.5\" class=\"cls-textCase\"/>\n      <text id=\"case015_text\" x=\"290.5\" y=\"87.5\" class=\"cls-textCase\"/>\n    </g>\n    <g id=\"g238\" fill=\"#606060\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path234\" d=\"M25.8 109.3v30.6h.4v-30.7h-.4z\"/>\n      <path id=\"path236\" d=\"M26.2 67.5V36.7h-.4v30.7h.4z\"/>\n    </g>\n    <g id=\"g248\" fill=\"#212121\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path244\" d=\"M25.5 67.3h.4V36.8h-.5v30.6z\"/>\n      <path id=\"path246\" d=\"M25.5 109.3h-.1V140h.5v-30.6h-.4z\"/>\n    </g>\n    <path id=\"path250\" fill=\"#212121\" stroke-width=\".9\" d=\"M18 123.1h286.8v.5H18z\"/>\n    <path id=\"path252\" fill=\"#606060\" stroke-width=\".9\" d=\"M18 122.8h286.8v.3H18z\"/>\n    <g id=\"g258\" fill=\"#212121\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path254\" d=\"M332.7 109.3h-.4v30.6h.5v-30.6z\"/>\n      <path id=\"path256\" d=\"M332.7 67.3V36.7h-.4v30.7h.4z\"/>\n    </g>\n    <g id=\"g264\" fill=\"#606060\" transform=\"matrix(.95829 0 0 .88143 -10.2 -3.4)\">\n      <path id=\"path260\" d=\"M332 109.2v30.7h.3v-30.6l-.4-.1z\"/>\n      <path id=\"path262\" d=\"M332.3 67.4V36.7h-.4v30.8l.4-.1z\"/>\n    </g>\n    <path id=\"GND2\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M12 8h9.7v9.7H12z\"/>\n    <path id=\"LCD_DATALINE5\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M175 8h9.7v9.7H175z\"/>\n    <path id=\"rect4824-7\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M145.3 8h9.7v9.7h-9.7z\"/>\n    <path id=\"rect4824-1\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M130.5 8h9.7v9.7h-9.7z\"/>\n    <path id=\"rect4824-2\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M115.7 8h9.7v9.7h-9.7z\"/>\n    <path id=\"rect4824-24\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M100.9 8h9.7v9.7h-9.7z\"/>\n    <path id=\"LCD_ENABLE\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M86.1 8h9.7v9.7h-9.7z\"/>\n    <path id=\"rw\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M71.2 8h9.7v9.7h-9.7z\"/>\n    <path id=\"LCD_RESET\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M56.4 8h9.7v9.7h-9.7z\"/>\n    <path id=\"GND4\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M41.6 8h9.7v9.7h-9.7z\"/>\n    <path id=\"VCC2\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M26.8 8h9.7v9.7h-9.7z\"/>\n    <path id=\"LCD_DATALINE6\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M189.8 8h9.7v9.7h-9.7z\"/>\n    <path id=\"LCD_DATALINE4\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M160.1 8h9.7v9.7h-9.7z\"/>\n    <path id=\"VCC\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M219.4 8h9.7v9.7h-9.7z\"/>\n    <path id=\"LCD_DATALINE7\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M204.6 8h9.7v9.7h-9.7z\"/>\n    <path id=\"GND\" stroke=\"#fff\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".6\" d=\"M234.2 8h9.7v9.7h-9.7z\"/>\n  </svg>\n        ";
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function lightLevel() {
            var b = pxsim.lightSensorState();
            b.setUsed();
            return b.getLevel();
        }
        input.lightLevel = lightLevel;
        function onLightConditionChanged(condition, body) {
            var b = pxsim.lightSensorState();
            b.setUsed();
            pxsim.pxtcore.registerWithDal(b.id, condition, body);
        }
        input.onLightConditionChanged = onLightConditionChanged;
        function setLightThreshold(condition, value) {
            var b = pxsim.lightSensorState();
            b.setUsed();
            switch (condition) {
                case 1 /* SENSOR_THRESHOLD_LOW */:
                    b.setLowThreshold(value);
                    break;
                case 2 /* SENSOR_THRESHOLD_HIGH */:
                    b.setHighThreshold(value);
                    break;
            }
        }
        input.setLightThreshold = setLightThreshold;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function lightSensorState() {
        return pxsim.board().lightSensorState;
    }
    pxsim.lightSensorState = lightSensorState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var input;
    (function (input) {
        function soundLevel() {
            var b = pxsim.microphoneState();
            if (!b)
                return 0;
            b.setUsed();
            return b.getLevel();
        }
        input.soundLevel = soundLevel;
        function onLoudSound(body) {
            var b = pxsim.microphoneState();
            if (!b)
                return;
            b.setUsed();
            pxsim.pxtcore.registerWithDal(b.id, 2 /* LEVEL_THRESHOLD_HIGH */, body);
        }
        input.onLoudSound = onLoudSound;
        function setLoudSoundThreshold(value) {
            var b = pxsim.microphoneState();
            if (!b)
                return;
            b.setUsed();
            b.setHighThreshold(value);
        }
        input.setLoudSoundThreshold = setLoudSoundThreshold;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function microphoneState() {
        return pxsim.board().microphoneState;
    }
    pxsim.microphoneState = microphoneState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var music;
    (function (music) {
        function playInstructions(b) {
            return pxsim.AudioContextManager.playInstructionsAsync(b);
        }
        music.playInstructions = playInstructions;
        function queuePlayInstructions(when, b) {
            pxsim.AudioContextManager.queuePlayInstructions(when, b);
        }
        music.queuePlayInstructions = queuePlayInstructions;
        function stopPlaying() {
            pxsim.AudioContextManager.muteAllChannels();
        }
        music.stopPlaying = stopPlaying;
        function forceOutput(mode) { }
        music.forceOutput = forceOutput;
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var mouse;
    (function (mouse) {
        function setButton(button, down) {
        }
        mouse.setButton = setButton;
        function move(x, y) {
        }
        mouse.move = move;
        function turnWheel(w) {
        }
        mouse.turnWheel = turnWheel;
    })(mouse = pxsim.mouse || (pxsim.mouse = {}));
})(pxsim || (pxsim = {}));
/*
namespace pxsim {
    export class NetSocket {
        constructor(public ws: WebSocket) { }
        send(data: string): void {
            this.ws.send(data);
        }
        close(): void {
            this.ws.close();
        }
        onOpen(handler: RefAction): void {
            this.ws.onopen = () => {
                const r = pxsim.runtime;
                if (r) r.runFiberAsync(handler).done();
            }
        }
        onClose(handler: pxsim.RefAction): void {
            this.ws.onclose = () => {
                const r = pxsim.runtime;
                if (r) r.runFiberAsync(handler).done();
            }
        }
        onError(handler: RefAction): void {
            this.ws.onerror = () => {
                const r = pxsim.runtime;
                if (r) r.runFiberAsync(handler).done();
            }
        }
        onMessage(handler: RefAction): void {
            this.ws.onmessage = (ev: MessageEvent) => {
                const r = pxsim.runtime;
                if (r) r.runFiberAsync(handler, ev.data).done();
            }
        }
    }

    export class Net {
        connect(host: string, port: number): NetSocket {
            // ignore port
            const r = pxsim.runtime;
            if (!r) return undefined;
            const ws = r.createWebSocket(`${host}::443/$iothub/websocket`);
            return new NetSocket(ws);
        }
    }
}

namespace pxsim.azureiot {
    export function createAzureNet(): Net {
        return new Net();
    }
}

namespace pxsim.NetMethods {
    export function connect(net: Net, host: string, port: number): NetSocket {
        return net.connect(host, port);
    }
}

namespace pxsim.SocketMethods {
    export function send(ws: pxsim.NetSocket, data: string): void {
        ws.send(data);
    }
    export function close(ws: pxsim.NetSocket): void {
        ws.close();
    }
    export function onOpen(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onOpen(handler);
    }
    export function onClose(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onClose(handler);
    }
    export function onError(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onError(handler);
    }
    export function onMessage(ws: pxsim.NetSocket, handler: RefAction): void {
        ws.onMessage(handler);
    }
}*/ 
var pxsim;
(function (pxsim) {
    var AudioState = /** @class */ (function () {
        function AudioState() {
            this.outputDestination_ = 0;
            this.volume = 100;
            this.playing = false;
        }
        AudioState.prototype.startPlaying = function () {
            this.playing = true;
        };
        AudioState.prototype.stopPlaying = function () {
            this.playing = false;
        };
        AudioState.prototype.isPlaying = function () {
            return this.playing;
        };
        return AudioState;
    }());
    pxsim.AudioState = AudioState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var music;
    (function (music) {
        function noteFrequency(note) {
            return note;
        }
        music.noteFrequency = noteFrequency;
        function setOutput(mode) {
            var audioState = pxsim.getAudioState();
            audioState.outputDestination_ = mode;
        }
        music.setOutput = setOutput;
        function setVolume(volume) {
            var audioState = pxsim.getAudioState();
            audioState.volume = Math.max(0, 1024, volume * 4);
        }
        music.setVolume = setVolume;
        function setPitchPin(pin) {
            var audioState = pxsim.getAudioState();
            audioState.pitchPin_ = pin;
        }
        music.setPitchPin = setPitchPin;
        function setTone(buffer) {
            // TODO: implement set tone in the audio context
        }
        music.setTone = setTone;
        function enableAmp(enabled) {
            // TODO
        }
        music.enableAmp = enableAmp;
        function playTone(frequency, ms) {
            var b = pxsim.board();
            if (!b)
                return;
            var audioState = pxsim.getAudioState();
            var currentOutput = audioState.outputDestination_;
            audioState.startPlaying();
            pxsim.runtime.queueDisplayUpdate();
            pxsim.AudioContextManager.tone(frequency, 1);
            var cb = pxsim.getResume();
            if (ms <= 0)
                cb();
            else {
                pxsim.runtime.schedule(function () {
                    pxsim.AudioContextManager.stop();
                    audioState.stopPlaying();
                    pxsim.runtime.queueDisplayUpdate();
                    cb();
                }, ms);
            }
        }
        music.playTone = playTone;
        function getPitchPin() {
            var audioState = pxsim.getAudioState();
            if (!audioState.pitchPin_) {
                audioState.pitchPin_ = pxsim.board().getDefaultPitchPin();
            }
            return audioState.pitchPin_;
        }
    })(music = pxsim.music || (pxsim.music = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function getAudioState() {
        return pxsim.board().audioState;
    }
    pxsim.getAudioState = getAudioState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var encoders;
    (function (encoders) {
        var ROT_EV_CHANGED = 0x2233;
        function createRotaryEncoder(pinA, pinB) {
            return new RotaryEncoder(pinA, pinB, 0);
        }
        encoders.createRotaryEncoder = createRotaryEncoder;
        var RotaryEncoder = /** @class */ (function () {
            function RotaryEncoder(pinA, pinB, position) {
                this.pinA = pinA;
                this.pinB = pinB;
                this.position = position;
            }
            Object.defineProperty(RotaryEncoder.prototype, "id", {
                get: function () {
                    return this.pinA.id;
                },
                enumerable: true,
                configurable: true
            });
            RotaryEncoder.prototype.onChanged = function (handler) {
                pxsim.control.internalOnEvent(this.id, ROT_EV_CHANGED, handler);
            };
            return RotaryEncoder;
        }());
        encoders.RotaryEncoder = RotaryEncoder;
    })(encoders = pxsim.encoders || (pxsim.encoders = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var RotaryEncoderMethods;
    (function (RotaryEncoderMethods) {
        function onChanged(encoder, handler) {
            encoder.onChanged(handler);
        }
        RotaryEncoderMethods.onChanged = onChanged;
        function position(encoder) {
            return encoder.position;
        }
        RotaryEncoderMethods.position = position;
    })(RotaryEncoderMethods = pxsim.RotaryEncoderMethods || (pxsim.RotaryEncoderMethods = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var RefImage = /** @class */ (function (_super) {
        __extends(RefImage, _super);
        function RefImage(w, h, bpp) {
            var _this = _super.call(this) || this;
            _this.dirty = true;
            _this.isStatic = false;
            _this.data = new Uint8Array(w * h);
            _this._width = w;
            _this._height = h;
            _this._bpp = bpp;
            return _this;
        }
        RefImage.prototype.scan = function (mark) { };
        RefImage.prototype.gcKey = function () { return "Image"; };
        RefImage.prototype.gcSize = function () { return 4 + (this.data.length + 3 >> 3); };
        RefImage.prototype.gcIsStatic = function () { return this.isStatic; };
        RefImage.prototype.pix = function (x, y) {
            return (x | 0) + (y | 0) * this._width;
        };
        RefImage.prototype.inRange = function (x, y) {
            return 0 <= (x | 0) && (x | 0) < this._width &&
                0 <= (y | 0) && (y | 0) < this._height;
        };
        RefImage.prototype.color = function (c) {
            return c & 0xff;
        };
        RefImage.prototype.clamp = function (x, y) {
            x |= 0;
            y |= 0;
            if (x < 0)
                x = 0;
            else if (x >= this._width)
                x = this._width - 1;
            if (y < 0)
                y = 0;
            else if (y >= this._height)
                y = this._height - 1;
            return [x, y];
        };
        RefImage.prototype.makeWritable = function () {
            this.dirty = true;
        };
        RefImage.prototype.toDebugString = function () {
            return this._width + "x" + this._height;
        };
        return RefImage;
    }(pxsim.RefObject));
    pxsim.RefImage = RefImage;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var ImageMethods;
    (function (ImageMethods) {
        function XX(x) { return (x << 16) >> 16; }
        function YY(x) { return x >> 16; }
        function width(img) { return img._width; }
        ImageMethods.width = width;
        function height(img) { return img._height; }
        ImageMethods.height = height;
        function isMono(img) { return img._bpp == 1; }
        ImageMethods.isMono = isMono;
        function setPixel(img, x, y, c) {
            img.makeWritable();
            if (img.inRange(x, y))
                img.data[img.pix(x, y)] = img.color(c);
        }
        ImageMethods.setPixel = setPixel;
        function getPixel(img, x, y) {
            if (img.inRange(x, y))
                return img.data[img.pix(x, y)];
            return 0;
        }
        ImageMethods.getPixel = getPixel;
        function fill(img, c) {
            img.makeWritable();
            img.data.fill(img.color(c));
        }
        ImageMethods.fill = fill;
        function fillRect(img, x, y, w, h, c) {
            img.makeWritable();
            var _a = img.clamp(x + w - 1, y + h - 1), x2 = _a[0], y2 = _a[1];
            _b = img.clamp(x, y), x = _b[0], y = _b[1];
            var p = img.pix(x, y);
            w = x2 - x + 1;
            h = y2 - y + 1;
            var d = img._width - w;
            c = img.color(c);
            while (h-- > 0) {
                for (var i = 0; i < w; ++i)
                    img.data[p++] = c;
                p += d;
            }
            var _b;
        }
        ImageMethods.fillRect = fillRect;
        function _fillRect(img, xy, wh, c) {
            fillRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        ImageMethods._fillRect = _fillRect;
        function mapRect(img, x, y, w, h, c) {
            if (c.data.length < 16)
                return;
            img.makeWritable();
            var _a = img.clamp(x + w - 1, y + h - 1), x2 = _a[0], y2 = _a[1];
            _b = img.clamp(x, y), x = _b[0], y = _b[1];
            var p = img.pix(x, y);
            w = x2 - x + 1;
            h = y2 - y + 1;
            var d = img._width - w;
            while (h-- > 0) {
                for (var i = 0; i < w; ++i) {
                    img.data[p] = c.data[img.data[p]];
                    p++;
                }
                p += d;
            }
            var _b;
        }
        ImageMethods.mapRect = mapRect;
        function _mapRect(img, xy, wh, c) {
            mapRect(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        ImageMethods._mapRect = _mapRect;
        function equals(img, other) {
            if (!other || img._bpp != other._bpp || img._width != other._width || img._height != other._height) {
                return false;
            }
            var imgData = img.data;
            var otherData = other.data;
            var len = imgData.length;
            for (var i = 0; i < len; i++) {
                if (imgData[i] != otherData[i]) {
                    return false;
                }
            }
            return true;
        }
        ImageMethods.equals = equals;
        function getRows(img, x, dst) {
            x |= 0;
            if (!img.inRange(x, 0))
                return;
            var dp = 0;
            var len = Math.min(dst.data.length, (img._width - x) * img._height);
            var sp = x;
            var hh = 0;
            while (len--) {
                if (hh++ >= img._height) {
                    hh = 0;
                    sp = ++x;
                }
                dst.data[dp++] = img.data[sp];
                sp += img._width;
            }
        }
        ImageMethods.getRows = getRows;
        function setRows(img, x, src) {
            x |= 0;
            if (!img.inRange(x, 0))
                return;
            var sp = 0;
            var len = Math.min(src.data.length, (img._width - x) * img._height);
            var dp = x;
            var hh = 0;
            while (len--) {
                if (hh++ >= img._height) {
                    hh = 0;
                    dp = ++x;
                }
                img.data[dp] = src.data[sp++];
                dp += img._width;
            }
        }
        ImageMethods.setRows = setRows;
        function clone(img) {
            var r = new pxsim.RefImage(img._width, img._height, img._bpp);
            r.data.set(img.data);
            return r;
        }
        ImageMethods.clone = clone;
        function flipX(img) {
            img.makeWritable();
            var w = img._width;
            var h = img._height;
            for (var i = 0; i < h; ++i) {
                img.data.subarray(i * w, (i + 1) * w).reverse();
            }
        }
        ImageMethods.flipX = flipX;
        function flipY(img) {
            img.makeWritable();
            var w = img._width;
            var h = img._height;
            var d = img.data;
            for (var i = 0; i < w; ++i) {
                var top_1 = i;
                var bot = i + (h - 1) * w;
                while (top_1 < bot) {
                    var c = d[top_1];
                    d[top_1] = d[bot];
                    d[bot] = c;
                    top_1 += w;
                    bot -= w;
                }
            }
        }
        ImageMethods.flipY = flipY;
        function transposed(img) {
            var w = img._width;
            var h = img._height;
            var d = img.data;
            var r = new pxsim.RefImage(h, w, img._bpp);
            var n = r.data;
            var src = 0;
            for (var i = 0; i < h; ++i) {
                var dst = i;
                for (var j = 0; j < w; ++j) {
                    n[dst] = d[src++];
                    dst += w;
                }
            }
            return r;
        }
        ImageMethods.transposed = transposed;
        function copyFrom(img, from) {
            if (img._width != from._width || img._height != from._height ||
                img._bpp != from._bpp)
                return;
            img.data.set(from.data);
        }
        ImageMethods.copyFrom = copyFrom;
        function scroll(img, dx, dy) {
            img.makeWritable();
            dx |= 0;
            dy |= 0;
            if (dx != 0) {
                var img2 = clone(img);
                img.data.fill(0);
                drawTransparentImage(img, img2, dx, dy);
            }
            else if (dy < 0) {
                dy = -dy;
                if (dy < img._height)
                    img.data.copyWithin(0, dy * img._width);
                else
                    dy = img._height;
                img.data.fill(0, (img._height - dy) * img._width);
            }
            else if (dy > 0) {
                if (dy < img._height)
                    img.data.copyWithin(dy * img._width, 0);
                else
                    dy = img._height;
                img.data.fill(0, 0, dy * img._width);
            }
            // TODO implement dx
        }
        ImageMethods.scroll = scroll;
        function replace(img, from, to) {
            to &= 0xf;
            var d = img.data;
            for (var i = 0; i < d.length; ++i)
                if (d[i] == from)
                    d[i] = to;
        }
        ImageMethods.replace = replace;
        function doubledX(img) {
            var w = img._width;
            var h = img._height;
            var d = img.data;
            var r = new pxsim.RefImage(w * 2, h, img._bpp);
            var n = r.data;
            var dst = 0;
            for (var src = 0; src < d.length; ++src) {
                var c = d[src];
                n[dst++] = c;
                n[dst++] = c;
            }
            return r;
        }
        ImageMethods.doubledX = doubledX;
        function doubledY(img) {
            var w = img._width;
            var h = img._height;
            var d = img.data;
            var r = new pxsim.RefImage(w, h * 2, img._bpp);
            var n = r.data;
            var src = 0;
            var dst0 = 0;
            var dst1 = w;
            for (var i = 0; i < h; ++i) {
                for (var j = 0; j < w; ++j) {
                    var c = d[src++];
                    n[dst0++] = c;
                    n[dst1++] = c;
                }
                dst0 += w;
                dst1 += w;
            }
            return r;
        }
        ImageMethods.doubledY = doubledY;
        function doubled(img) {
            return doubledX(doubledY(img));
        }
        ImageMethods.doubled = doubled;
        function drawImageCore(img, from, x, y, clear, check) {
            x |= 0;
            y |= 0;
            var w = from._width;
            var h = from._height;
            var sh = img._height;
            var sw = img._width;
            if (x + w <= 0)
                return false;
            if (x >= sw)
                return false;
            if (y + h <= 0)
                return false;
            if (y >= sh)
                return false;
            if (clear)
                fillRect(img, x, y, from._width, from._height, 0);
            else if (!check)
                img.makeWritable();
            var len = x < 0 ? Math.min(sw, w + x) : Math.min(sw - x, w);
            var fdata = from.data;
            var tdata = img.data;
            for (var p = 0; h--; y++, p += w) {
                if (0 <= y && y < sh) {
                    var dst = y * sw;
                    var src = p;
                    if (x < 0)
                        src += -x;
                    else
                        dst += x;
                    for (var i = 0; i < len; ++i) {
                        var v = fdata[src++];
                        if (v) {
                            if (check) {
                                if (tdata[dst])
                                    return true;
                            }
                            else {
                                tdata[dst] = v;
                            }
                        }
                        dst++;
                    }
                }
            }
            return false;
        }
        function drawImage(img, from, x, y) {
            drawImageCore(img, from, x, y, true, false);
        }
        ImageMethods.drawImage = drawImage;
        function drawTransparentImage(img, from, x, y) {
            drawImageCore(img, from, x, y, false, false);
        }
        ImageMethods.drawTransparentImage = drawTransparentImage;
        function overlapsWith(img, other, x, y) {
            return drawImageCore(img, other, x, y, false, true);
        }
        ImageMethods.overlapsWith = overlapsWith;
        function drawLineLow(img, x0, y0, x1, y1, c) {
            var dx = x1 - x0;
            var dy = y1 - y0;
            var yi = img._width;
            if (dy < 0) {
                yi = -yi;
                dy = -dy;
            }
            var D = 2 * dy - dx;
            dx <<= 1;
            dy <<= 1;
            c = img.color(c);
            var ptr = img.pix(x0, y0);
            for (var x = x0; x <= x1; ++x) {
                img.data[ptr] = c;
                if (D > 0) {
                    ptr += yi;
                    D -= dx;
                }
                D += dy;
                ptr++;
            }
        }
        function drawLineHigh(img, x0, y0, x1, y1, c) {
            var dx = x1 - x0;
            var dy = y1 - y0;
            var xi = 1;
            if (dx < 0) {
                xi = -1;
                dx = -dx;
            }
            var D = 2 * dx - dy;
            dx <<= 1;
            dy <<= 1;
            c = img.color(c);
            var ptr = img.pix(x0, y0);
            for (var y = y0; y <= y1; ++y) {
                img.data[ptr] = c;
                if (D > 0) {
                    ptr += xi;
                    D -= dy;
                }
                D += dx;
                ptr += img._width;
            }
        }
        function _drawLine(img, xy, wh, c) {
            drawLine(img, XX(xy), YY(xy), XX(wh), YY(wh), c);
        }
        ImageMethods._drawLine = _drawLine;
        function drawLine(img, x0, y0, x1, y1, c) {
            x0 |= 0;
            y0 |= 0;
            x1 |= 0;
            y1 |= 0;
            if (x1 < x0) {
                drawLine(img, x1, y1, x0, y0, c);
                return;
            }
            var w = x1 - x0;
            var h = y1 - y0;
            if (h == 0) {
                if (w == 0)
                    setPixel(img, x0, y0, c);
                else
                    fillRect(img, x0, y0, w + 1, 1, c);
                return;
            }
            if (w == 0) {
                if (h > 0)
                    fillRect(img, x0, y0, 1, h + 1, c);
                else
                    fillRect(img, x0, y1, 1, -h + 1, c);
                return;
            }
            if (x1 < 0 || x0 >= img._width)
                return;
            if (x0 < 0) {
                y0 -= (h * x0 / w) | 0;
                x0 = 0;
            }
            if (x1 >= img._width) {
                var d = (img._width - 1) - x1;
                y1 += (h * d / w) | 0;
                x1 = img._width - 1;
            }
            if (y0 < y1) {
                if (y0 >= img._height || y1 < 0)
                    return;
                if (y0 < 0) {
                    x0 -= (w * y0 / h) | 0;
                    y0 = 0;
                }
                if (y1 >= img._height) {
                    var d = (img._height - 1) - y1;
                    x1 += (w * d / h) | 0;
                    y1 = img._height;
                }
            }
            else {
                if (y1 >= img._height || y0 < 0)
                    return;
                if (y1 < 0) {
                    x1 -= (w * y1 / h) | 0;
                    y1 = 0;
                }
                if (y0 >= img._height) {
                    var d = (img._height - 1) - y0;
                    x0 += (w * d / h) | 0;
                    y0 = img._height;
                }
            }
            img.makeWritable();
            if (h < 0) {
                h = -h;
                if (h < w)
                    drawLineLow(img, x0, y0, x1, y1, c);
                else
                    drawLineHigh(img, x1, y1, x0, y0, c);
            }
            else {
                if (h < w)
                    drawLineLow(img, x0, y0, x1, y1, c);
                else
                    drawLineHigh(img, x0, y0, x1, y1, c);
            }
        }
        ImageMethods.drawLine = drawLine;
        function drawIcon(img, icon, x, y, color) {
            var img2 = icon.data;
            if (!pxsim.image.isValidImage(icon))
                return;
            if (img2[1] != 1)
                return; // only mono
            var w = pxsim.image.bufW(img2);
            var h = pxsim.image.bufH(img2);
            var byteH = pxsim.image.byteHeight(h, 1);
            x |= 0;
            y |= 0;
            var sh = img._height;
            var sw = img._width;
            if (x + w <= 0)
                return;
            if (x >= sw)
                return;
            if (y + h <= 0)
                return;
            if (y >= sh)
                return;
            img.makeWritable();
            var p = 8;
            color = img.color(color);
            var screen = img.data;
            for (var i = 0; i < w; ++i) {
                var xxx = x + i;
                if (0 <= xxx && xxx < sw) {
                    var dst = xxx + y * sw;
                    var src = p;
                    var yy = y;
                    var end = Math.min(sh, h + y);
                    if (y < 0) {
                        src += ((-y) >> 3);
                        yy += ((-y) >> 3) * 8;
                    }
                    var mask = 0x01;
                    var v = img2[src++];
                    while (yy < end) {
                        if (yy >= 0 && (v & mask)) {
                            screen[dst] = color;
                        }
                        mask <<= 1;
                        if (mask == 0x100) {
                            mask = 0x01;
                            v = img2[src++];
                        }
                        dst += sw;
                        yy++;
                    }
                }
                p += byteH;
            }
        }
        ImageMethods.drawIcon = drawIcon;
        function _drawIcon(img, icon, xy, color) {
            drawIcon(img, icon, XX(xy), YY(xy), color);
        }
        ImageMethods._drawIcon = _drawIcon;
        function fillCircle(img, cx, cy, r, c) {
            var x = r - 1;
            var y = 0;
            var dx = 1;
            var dy = 1;
            var err = dx - (r << 1);
            while (x >= y) {
                fillRect(img, cx + x, cy - y, 1, 1 + (y << 1), c);
                fillRect(img, cx + y, cy - x, 1, 1 + (x << 1), c);
                fillRect(img, cx - x, cy - y, 1, 1 + (y << 1), c);
                fillRect(img, cx - y, cy - x, 1, 1 + (x << 1), c);
                if (err <= 0) {
                    y++;
                    err += dy;
                    dy += 2;
                }
                if (err > 0) {
                    x--;
                    dx += 2;
                    err += dx - (r << 1);
                }
            }
        }
        ImageMethods.fillCircle = fillCircle;
        function _fillCircle(img, cxy, r, c) {
            fillCircle(img, XX(cxy), YY(cxy), r, c);
        }
        ImageMethods._fillCircle = _fillCircle;
        function _blitRow(img, xy, from, xh) {
            blitRow(img, XX(xy), YY(xy), from, XX(xh), YY(xh));
        }
        ImageMethods._blitRow = _blitRow;
        function blitRow(img, x, y, from, fromX, fromH) {
            x |= 0;
            y |= 0;
            fromX |= 0;
            fromH |= 0;
            if (!img.inRange(x, 0) || !img.inRange(fromX, 0) || fromH <= 0)
                return;
            var fy = 0;
            var stepFY = ((from._width << 16) / fromH) | 0;
            var endY = y + fromH;
            if (endY > img._height)
                endY = img._height;
            if (y < 0) {
                fy += -y * stepFY;
                y = 0;
            }
            while (y < endY) {
                img.data[img.pix(x, y)] = from.data[from.pix(fromX, fy >> 16)];
                y++;
                fy += stepFY;
            }
        }
        ImageMethods.blitRow = blitRow;
    })(ImageMethods = pxsim.ImageMethods || (pxsim.ImageMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var image;
    (function (image) {
        function byteHeight(h, bpp) {
            if (bpp == 1)
                return h * bpp + 7 >> 3;
            else
                return ((h * bpp + 31) >> 5) << 2;
        }
        image.byteHeight = byteHeight;
        function isLegacyImage(buf) {
            if (!buf || buf.data.length < 5)
                return false;
            if (buf.data[0] != 0xe1 && buf.data[0] != 0xe4)
                return false;
            var bpp = buf.data[0] & 0xf;
            var sz = buf.data[1] * byteHeight(buf.data[2], bpp);
            if (4 + sz != buf.data.length)
                return false;
            return true;
        }
        function bufW(data) {
            return data[2] | (data[3] << 8);
        }
        image.bufW = bufW;
        function bufH(data) {
            return data[4] | (data[5] << 8);
        }
        image.bufH = bufH;
        function isValidImage(buf) {
            if (!buf || buf.data.length < 5)
                return false;
            if (buf.data[0] != 0x87)
                return false;
            if (buf.data[1] != 1 && buf.data[1] != 4)
                return false;
            var bpp = buf.data[1];
            var sz = bufW(buf.data) * byteHeight(bufH(buf.data), bpp);
            if (8 + sz != buf.data.length)
                return false;
            return true;
        }
        image.isValidImage = isValidImage;
        function create(w, h) {
            return new pxsim.RefImage(w, h, pxsim.getScreenState().bpp());
        }
        image.create = create;
        function ofBuffer(buf) {
            var src = buf.data;
            var srcP = 4;
            var w = 0, h = 0, bpp = 0;
            if (isLegacyImage(buf)) {
                w = src[1];
                h = src[2];
                bpp = src[0] & 0xf;
                // console.log("using legacy image")
            }
            else if (isValidImage(buf)) {
                srcP = 8;
                w = bufW(src);
                h = bufH(src);
                bpp = src[1];
            }
            if (w == 0 || h == 0)
                return null;
            var r = new pxsim.RefImage(w, h, bpp);
            var dst = r.data;
            r.isStatic = buf.isStatic;
            if (bpp == 1) {
                for (var i = 0; i < w; ++i) {
                    var dstP = i;
                    var mask = 0x01;
                    var v = src[srcP++];
                    for (var j = 0; j < h; ++j) {
                        if (mask == 0x100) {
                            mask = 0x01;
                            v = src[srcP++];
                        }
                        if (v & mask)
                            dst[dstP] = 1;
                        dstP += w;
                        mask <<= 1;
                    }
                }
            }
            else if (bpp == 4) {
                for (var i = 0; i < w; ++i) {
                    var dstP = i;
                    for (var j = 0; j < h >> 1; ++j) {
                        var v = src[srcP++];
                        dst[dstP] = v & 0xf;
                        dstP += w;
                        dst[dstP] = v >> 4;
                        dstP += w;
                    }
                    if (h & 1)
                        dst[dstP] = src[srcP++] & 0xf;
                    srcP = (srcP + 3) & ~3;
                }
            }
            return r;
        }
        image.ofBuffer = ofBuffer;
        function toBuffer(img) {
            var col = byteHeight(img._height, img._bpp);
            var sz = 8 + img._width * col;
            var r = new Uint8Array(sz);
            r[0] = 0x87;
            r[1] = img._bpp;
            r[2] = img._width & 0xff;
            r[3] = img._width >> 8;
            r[4] = img._height & 0xff;
            r[5] = img._height >> 8;
            var dstP = 8;
            var w = img._width;
            var h = img._height;
            var data = img.data;
            for (var i = 0; i < w; ++i) {
                if (img._bpp == 4) {
                    var p = i;
                    for (var j = 0; j < h; j += 2) {
                        r[dstP++] = ((data[p + 1] & 0xf) << 4) | ((data[p] || 0) & 0xf);
                        p += 2 * w;
                    }
                    dstP = (dstP + 3) & ~3;
                }
                else if (img._bpp == 1) {
                    var mask = 0x01;
                    var p = i;
                    for (var j = 0; j < h; j++) {
                        if (data[p])
                            r[dstP] |= mask;
                        mask <<= 1;
                        p += w;
                        if (mask == 0x100) {
                            mask = 0x01;
                            dstP++;
                        }
                    }
                    if (mask != 0x01)
                        dstP++;
                }
            }
            return new pxsim.RefBuffer(r);
        }
        image.toBuffer = toBuffer;
        function doubledIcon(buf) {
            var img = ofBuffer(buf);
            if (!img)
                return null;
            img = pxsim.ImageMethods.doubled(img);
            return toBuffer(img);
        }
        image.doubledIcon = doubledIcon;
    })(image = pxsim.image || (pxsim.image = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function updateScreen(img) {
            var state = pxsim.getScreenState();
            if (state)
                state.showImage(img);
        }
        pxtcore.updateScreen = updateScreen;
        function updateStats(s) {
            var state = pxsim.getScreenState();
            if (state)
                state.updateStats(s);
        }
        pxtcore.updateStats = updateStats;
        function setPalette(b) {
            var state = pxsim.getScreenState();
            if (state)
                state.setPalette(b);
        }
        pxtcore.setPalette = setPalette;
        function setupScreenStatusBar(barHeight) {
            var state = pxsim.getScreenState();
            if (state)
                state.setupScreenStatusBar(barHeight);
        }
        pxtcore.setupScreenStatusBar = setupScreenStatusBar;
        function updateScreenStatusBar(img) {
            var state = pxsim.getScreenState();
            if (state)
                state.updateScreenStatusBar(img);
        }
        pxtcore.updateScreenStatusBar = updateScreenStatusBar;
        function setScreenBrightness(b) {
            // I guess we could at least turn the screen off, when b==0,
            // otherwise, it probably doesn't make much sense to do anything.
            var state = pxsim.getScreenState();
            if (state)
                state.setScreenBrightness(b);
        }
        pxtcore.setScreenBrightness = setScreenBrightness;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function htmlColorToUint32(hexColor) {
        var ca = new Uint8ClampedArray(4);
        var ui = new Uint32Array(ca.buffer);
        var v = parseInt(hexColor.replace(/#/, ""), 16);
        ca[0] = (v >> 16) & 0xff;
        ca[1] = (v >> 8) & 0xff;
        ca[2] = (v >> 0) & 0xff;
        ca[3] = 0xff; // alpha
        // convert to uint32 using target endian
        return new Uint32Array(ca.buffer)[0];
    }
    var ScreenState = /** @class */ (function () {
        function ScreenState(paletteSrc, w, h) {
            if (w === void 0) { w = 0; }
            if (h === void 0) { h = 0; }
            this.width = 0;
            this.height = 0;
            this.lastImageFlushTime = 0;
            this.changed = true;
            this.brightness = 255;
            this.onChange = function () { };
            if (!paletteSrc)
                paletteSrc = ["#000000", "#ffffff"];
            this.palette = new Uint32Array(paletteSrc.length);
            for (var i = 0; i < this.palette.length; ++i) {
                this.palette[i] = htmlColorToUint32(paletteSrc[i]);
            }
            if (w) {
                this.width = w;
                this.height = h;
                this.screen = new Uint32Array(this.width * this.height);
                this.screen.fill(this.palette[0]);
            }
        }
        ScreenState.prototype.setScreenBrightness = function (b) {
            this.brightness = b | 0;
        };
        ScreenState.prototype.setPalette = function (buf) {
            var ca = new Uint8ClampedArray(4);
            var rd = new Uint32Array(ca.buffer);
            var src = buf.data;
            if (48 != src.length)
                pxsim.pxtrt.panic(911 /* PANIC_SCREEN_ERROR */);
            this.palette = new Uint32Array((src.length / 3) | 0);
            for (var i = 0; i < this.palette.length; ++i) {
                var p = i * 3;
                ca[0] = src[p + 0];
                ca[1] = src[p + 1];
                ca[2] = src[p + 2];
                ca[3] = 0xff; // alpha
                // convert to uint32 using target endian
                this.palette[i] = rd[0];
            }
        };
        ScreenState.prototype.bpp = function () {
            return this.palette.length > 2 ? 4 : 1;
        };
        ScreenState.prototype.didChange = function () {
            var res = this.changed;
            this.changed = false;
            return res;
        };
        ScreenState.prototype.maybeForceUpdate = function () {
            if (Date.now() - this.lastImageFlushTime > 200) {
                this.showImage(null);
            }
        };
        ScreenState.prototype.showImage = function (img) {
            pxsim.runtime.startPerfCounter(0);
            if (!img)
                img = this.lastImage;
            if (!img)
                return;
            if (this.width == 0) {
                this.width = img._width;
                this.height = img._height;
                this.screen = new Uint32Array(this.width * this.height);
            }
            this.lastImageFlushTime = Date.now();
            if (img == this.lastImage) {
                if (!img.dirty)
                    return;
            }
            else {
                this.lastImage = img;
            }
            this.changed = true;
            img.dirty = false;
            var src = img.data;
            var dst = this.screen;
            if (this.width != img._width || this.height != img._height || src.length != dst.length)
                pxsim.U.userError("wrong size");
            var p = this.palette;
            var mask = p.length - 1;
            for (var i = 0; i < src.length; ++i) {
                dst[i] = p[src[i] & mask];
            }
            this.onChange();
            pxsim.runtime.stopPerfCounter(0);
        };
        ScreenState.prototype.updateStats = function (stats) {
            this.stats = stats;
        };
        ScreenState.prototype.bindToSvgImage = function (lcd) {
            var _this = this;
            var screenCanvas = document.createElement("canvas");
            screenCanvas.width = this.width;
            screenCanvas.height = this.height;
            var ctx = screenCanvas.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            var imgdata = ctx.getImageData(0, 0, this.width, this.height);
            var arr = new Uint32Array(imgdata.data.buffer);
            var flush = function () {
                requested = false;
                ctx.putImageData(imgdata, 0, 0);
                lcd.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", screenCanvas.toDataURL());
            };
            var requested = false;
            this.onChange = function () {
                arr.set(_this.screen);
                // paint rect
                pxsim.runtime.queueDisplayUpdate();
                if (!requested) {
                    requested = true;
                    window.requestAnimationFrame(flush);
                }
            };
        };
        ScreenState.prototype.setupScreenStatusBar = function (barHeight) {
            // TODO
        };
        ScreenState.prototype.updateScreenStatusBar = function (img) {
            // TODO
        };
        return ScreenState;
    }());
    pxsim.ScreenState = ScreenState;
    function getScreenState() {
        return pxsim.board().screenState;
    }
    pxsim.getScreenState = getScreenState;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var visuals;
    (function (visuals) {
        var SCREEN_PART_WIDTH = 158.439;
        var SCREEN_PART_HEIGHT = 146.803;
        var SCREEN_PART = "\n  <svg xmlns=\"http://www.w3.org/2000/svg\" id=\"svg8\" width=\"158.439\" height=\"146.803\" viewBox=\"0 0 158.439 146.803\">\n  <g id=\"layer1\" transform=\"translate(-18.95 -27.866)\">\n    <path id=\"rect4487\" fill=\"#00f\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.306\" d=\"M19.603 28.519h157.133v145.497H19.603z\"/>\n    <image id=\"thescreen\" width=\"136.673\" height=\"109.33\" x=\"26.118\" y=\"61.528\" fill=\"#c8beb7\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\".427\"/>\n    <path id=\"GND\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M23.177 31.031h11.864v11.864H23.177z\"/>\n    <path id=\"VCC\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M37.119 31.031h11.864v11.864H37.119z\"/>\n    <path id=\"DISPLAY_DC\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M65.004 31.031h11.864v11.864H65.004z\"/>\n    <path id=\"DISPLAY_CS\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M78.947 31.031h11.864v11.864H78.947z\"/>\n    <path id=\"DISPLAY_MOSI\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M92.889 31.031h11.864v11.864H92.889z\"/>\n    <path id=\"DISPLAY_SCK\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M106.831 31.031h11.864v11.864h-11.864z\"/>\n    <path id=\"DISPLAY_MISO\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M120.774 31.031h11.864v11.864h-11.864z\"/>\n    <text id=\"text4619\" x=\"45.309\" y=\"-27.057\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617\" x=\"45.309\" y=\"-27.057\">Gnd</tspan>\n    </text>\n    <text id=\"text4619-4\" x=\"45.51\" y=\"-41.166\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3\" x=\"45.51\" y=\"-41.166\">VCC</tspan>\n    </text>\n    <text id=\"text4619-4-9\" x=\"45.17\" y=\"-69.274\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-1\" x=\"45.17\" y=\"-69.274\">D/C</tspan>\n    </text>\n    <text id=\"text4619-4-9-2\" x=\"45.225\" y=\"-83.064\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-1-5\" x=\"45.225\" y=\"-83.064\">CS</tspan>\n    </text>\n    <text id=\"text4619-4-9-8\" x=\"45.364\" y=\"-97.03\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-1-9\" x=\"45.364\" y=\"-97.03\">MOSI</tspan>\n    </text>\n    <text id=\"text4619-4-9-3\" x=\"45.163\" y=\"-110.996\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-1-7\" x=\"45.163\" y=\"-110.996\">SCK</tspan>\n    </text>\n    <text id=\"text4619-4-9-0\" x=\"46.078\" y=\"-138.962\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-1-72\" x=\"46.078\" y=\"-138.962\">BL</tspan>\n    </text>\n    <path id=\"DISPLAY_RST\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M51.062 31.031h11.864v11.864H51.062z\"/>\n    <text id=\"text4619-4-94\" x=\"44.972\" y=\"-55.132\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-6\" x=\"44.972\" y=\"-55.132\">RST</tspan>\n    </text>\n    <path id=\"DISPLAY_BL\" fill=\"#d4d4d4\" stroke=\"#000\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"3.139\" d=\"M134.638 31.031h11.864v11.864h-11.864z\"/>\n    <text id=\"text4619-4-9-0-6\" x=\"45.403\" y=\"-124.163\" fill=\"#fff\" stroke-width=\".226\" font-family=\"consolas\" font-size=\"6.63\" font-weight=\"400\" letter-spacing=\"0\" style=\"line-height:1.25;-inkscape-font-specification:consolas\" transform=\"rotate(90)\" word-spacing=\"0\">\n      <tspan id=\"tspan4617-3-1-72-8\" x=\"45.403\" y=\"-124.163\">MISO</tspan>\n    </text>\n  </g>\n</svg>\n  ";
        function mkScreenPart(xy) {
            if (xy === void 0) { xy = [0, 0]; }
            var x = xy[0], y = xy[1];
            var l = x;
            var t = y;
            var w = SCREEN_PART_WIDTH;
            var h = SCREEN_PART_HEIGHT;
            var img = pxsim.svg.elt("image");
            pxsim.svg.hydrate(img, {
                class: "sim-screen", x: l, y: t, width: w, height: h,
                href: pxsim.svg.toDataUri(SCREEN_PART)
            });
            return { el: img, x: l, y: t, w: w, h: h };
        }
        visuals.mkScreenPart = mkScreenPart;
        var ScreenView = /** @class */ (function () {
            function ScreenView() {
            }
            ScreenView.prototype.init = function (bus, state, svgEl, otherParams) {
                this.bus = bus;
                this.state = state;
                this.overElement = undefined;
                this.defs = [];
                this.lastLocation = [0, 0];
                var partSvg = pxsim.svg.parseString(SCREEN_PART);
                this.canvas = partSvg.getElementById('thescreen');
                this.element = pxsim.svg.elt("g");
                this.element.appendChild(partSvg.firstElementChild);
                this.state.bindToSvgImage(this.canvas);
            };
            ScreenView.prototype.moveToCoord = function (xy) {
                var x = xy[0], y = xy[1];
                var loc = [x, y];
                this.lastLocation = loc;
                this.updateLoc();
            };
            ScreenView.prototype.updateLoc = function () {
                var _a = this.lastLocation, x = _a[0], y = _a[1];
                visuals.translateEl(this.element, [x, y]);
            };
            ScreenView.prototype.updateState = function () { };
            ScreenView.prototype.updateTheme = function () { };
            return ScreenView;
        }());
        visuals.ScreenView = ScreenView;
    })(visuals = pxsim.visuals || (pxsim.visuals = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var settings;
    (function (settings) {
        var currSize = 0;
        var MAX_SIZE = 16 * 1024;
        function encodeKey(key) {
            return "S/" + key;
        }
        function allKeys() {
            var pref = encodeKey("");
            var st = pxsim.board().storedState;
            return Object.keys(st).filter(function (k) { return k.slice(0, pref.length) == pref; });
        }
        function userKeys() {
            return allKeys().filter(function (s) { return s[2] != "#"; });
        }
        function computeSize() {
            var sz = 0;
            var storage = pxsim.board().storedState;
            for (var _i = 0, _a = allKeys(); _i < _a.length; _i++) {
                var k = _a[_i];
                sz += k.length + storage[k].length;
            }
            currSize = sz;
        }
        function _set(key, buf) {
            key = encodeKey(key);
            var storage = pxsim.board().storedState;
            var prev = storage[key];
            var val = btoa(pxsim.U.uint8ArrayToString(buf.data));
            var newSize = prev == null
                ? currSize + key.length + val.length
                : currSize + val.length - prev.length;
            if (newSize > MAX_SIZE)
                return -1;
            pxsim.board().setStoredState(key, val);
            currSize = newSize;
            return 0;
        }
        settings._set = _set;
        function _remove(key) {
            key = encodeKey(key);
            var storage = pxsim.board().storedState;
            if (storage[key] == null)
                return -1;
            currSize -= key.length + storage[key].length;
            pxsim.board().setStoredState(key, null);
            return 0;
        }
        settings._remove = _remove;
        function _exists(key) {
            return _get(key) != undefined;
        }
        settings._exists = _exists;
        function _get(key) {
            key = encodeKey(key);
            var storage = pxsim.board().storedState;
            var val = storage[key];
            if (val == null)
                return undefined;
            return new pxsim.RefBuffer(pxsim.U.stringToUint8Array(atob(val)));
        }
        settings._get = _get;
        function _userClean() {
            for (var _i = 0, _a = userKeys(); _i < _a.length; _i++) {
                var k = _a[_i];
                pxsim.board().setStoredState(k, null);
            }
            computeSize();
            // if system keys take more than 25% of space, delete everything
            if (currSize > MAX_SIZE / 4) {
                for (var _b = 0, _c = allKeys(); _b < _c.length; _b++) {
                    var k = _c[_b];
                    pxsim.board().setStoredState(k, null);
                }
                computeSize();
            }
        }
        settings._userClean = _userClean;
        function _list(prefix) {
            var r = new pxsim.RefCollection();
            var emptyPref = encodeKey("");
            for (var _i = 0, _a = prefix[0] == "#" ? allKeys() : userKeys(); _i < _a.length; _i++) {
                var k = _a[_i];
                var n = k.slice(emptyPref.length);
                if (n.slice(0, prefix.length) != prefix)
                    continue;
                r.push(n);
            }
            return r;
        }
        settings._list = _list;
    })(settings = pxsim.settings || (pxsim.settings = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var StorageState = /** @class */ (function () {
        function StorageState() {
            this.files = {};
        }
        return StorageState;
    }());
    pxsim.StorageState = StorageState;
    function storageState() {
        return pxsim.board().storageState;
    }
    pxsim.storageState = storageState;
})(pxsim || (pxsim = {}));
// Auto-generated. Do not edit.
var pxsim;
(function (pxsim) {
    var storage;
    (function (storage) {
        function init() {
            // do nothing
        }
        storage.init = init;
        function appendBuffer(filename, data) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            if (!buf)
                buf = state.files[filename] = [];
            for (var i = 0; i < data.data.length; ++i)
                buf.push(data.data[i]);
        }
        storage.appendBuffer = appendBuffer;
        function overwriteWithBuffer(filename, data) {
            var state = pxsim.storageState();
            var buf = [];
            for (var i = 0; i < data.data.length; ++i)
                buf.push(data.data[i]);
            state.files[filename] = buf;
        }
        storage.overwriteWithBuffer = overwriteWithBuffer;
        function exists(filename) {
            var state = pxsim.storageState();
            return !!state.files[filename];
        }
        storage.exists = exists;
        function remove(filename) {
            var state = pxsim.storageState();
            delete state.files[filename];
        }
        storage.remove = remove;
        function size(filename) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            return buf ? buf.length : 0;
        }
        storage.size = size;
        function readAsBuffer(filename) {
            var state = pxsim.storageState();
            var buf = state.files[filename];
            return buf ? new pxsim.RefBuffer(Uint8Array.from(buf)) : undefined;
        }
        storage.readAsBuffer = readAsBuffer;
    })(storage = pxsim.storage || (pxsim.storage = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var SlideSwitchState = /** @class */ (function () {
        function SlideSwitchState() {
            this.left = false;
        }
        SlideSwitchState.prototype.setState = function (left) {
            if (this.left === left) {
                return;
            }
            else if (left) {
                pxsim.board().bus.queue(SlideSwitchState.id, 2 /* DEVICE_BUTTON_EVT_UP */);
            }
            else {
                pxsim.board().bus.queue(SlideSwitchState.id, 1 /* DEVICE_BUTTON_EVT_DOWN */);
            }
            this.left = left;
        };
        SlideSwitchState.prototype.isLeft = function () {
            return this.left;
        };
        SlideSwitchState.id = 3000 /*DEVICE_ID_BUTTON_SLIDE*/;
        return SlideSwitchState;
    }());
    pxsim.SlideSwitchState = SlideSwitchState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function onSwitchMoved(direction, body) {
            pxsim.pxtcore.registerWithDal(pxsim.SlideSwitchState.id, direction, body);
        }
        input.onSwitchMoved = onSwitchMoved;
        function switchRight() {
            var b = pxsim.board();
            var sw = b.slideSwitchState;
            return !sw.isLeft();
        }
        input.switchRight = switchRight;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    function thermometerState() {
        return pxsim.board().thermometerState;
    }
    pxsim.thermometerState = thermometerState;
    function setThermometerUnit(unit) {
        pxsim.board().thermometerUnitState = unit;
    }
    pxsim.setThermometerUnit = setThermometerUnit;
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var TemperatureUnit;
    (function (TemperatureUnit) {
        TemperatureUnit[TemperatureUnit["Celsius"] = 0] = "Celsius";
        TemperatureUnit[TemperatureUnit["Fahrenheit"] = 1] = "Fahrenheit";
    })(TemperatureUnit = pxsim.TemperatureUnit || (pxsim.TemperatureUnit = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var input;
    (function (input) {
        function temperature(unit) {
            var b = pxsim.thermometerState();
            b.setUsed();
            pxsim.setThermometerUnit(unit);
            var deg = b.getLevel();
            return unit == pxsim.TemperatureUnit.Celsius ? deg
                : ((deg * 18) / 10 + 32) >> 0;
        }
        input.temperature = temperature;
        function onTemperatureConditionChanged(condition, temperature, unit, body) {
            var b = pxsim.thermometerState();
            b.setUsed();
            pxsim.setThermometerUnit(unit);
            var t = unit == pxsim.TemperatureUnit.Celsius
                ? temperature
                : (((temperature - 32) * 10) / 18 >> 0);
            if (condition === 2 /* LEVEL_THRESHOLD_HIGH */) {
                b.setHighThreshold(t);
            }
            else {
                b.setLowThreshold(t);
            }
            pxsim.pxtcore.registerWithDal(b.id, condition, body);
        }
        input.onTemperatureConditionChanged = onTemperatureConditionChanged;
    })(input = pxsim.input || (pxsim.input = {}));
})(pxsim || (pxsim = {}));
var pxsim;
(function (pxsim) {
    var CapacitiveSensorState = /** @class */ (function () {
        function CapacitiveSensorState(mapping) {
            this.capacity = [];
            this.reading = [];
            this.mapping = mapping;
        }
        CapacitiveSensorState.prototype.getCap = function (pinId) {
            return this.mapping[pinId];
        };
        CapacitiveSensorState.prototype.readCap = function (pinId, samples) {
            var capId = this.getCap(pinId);
            return this.capacitiveSensor(capId, samples);
        };
        CapacitiveSensorState.prototype.isReadingPin = function (pinId, pin) {
            var capId = this.getCap(pinId);
            return this.reading[capId];
        };
        CapacitiveSensorState.prototype.isReading = function (capId) {
            return this.reading[capId];
        };
        CapacitiveSensorState.prototype.startReading = function (pinId, pin) {
            var capId = this.getCap(pinId);
            this.reading[capId] = true;
            pin.mode = pxsim.PinFlags.Analog | pxsim.PinFlags.Input;
            pin.mode |= pxsim.PinFlags.Analog;
        };
        CapacitiveSensorState.prototype.capacitiveSensor = function (capId, samples) {
            return this.capacity[capId] || 0;
        };
        CapacitiveSensorState.prototype.reset = function (capId) {
            this.capacity[capId] = 0;
            this.reading[capId] = false;
        };
        return CapacitiveSensorState;
    }());
    pxsim.CapacitiveSensorState = CapacitiveSensorState;
    var TouchButton = /** @class */ (function (_super) {
        __extends(TouchButton, _super);
        function TouchButton(pin) {
            var _this = _super.call(this, pin) || this;
            _this._threshold = 200;
            return _this;
        }
        TouchButton.prototype.setThreshold = function (value) {
            this._threshold = value;
        };
        TouchButton.prototype.threshold = function () {
            return this._threshold;
        };
        TouchButton.prototype.value = function () {
            return 0;
        };
        TouchButton.prototype.calibrate = function () {
        };
        return TouchButton;
    }(pxsim.CommonButton));
    pxsim.TouchButton = TouchButton;
    var TouchButtonState = /** @class */ (function () {
        function TouchButtonState(pins) {
            this.buttons = pins.map(function (pin) { return new TouchButton(pin); });
        }
        return TouchButtonState;
    }());
    pxsim.TouchButtonState = TouchButtonState;
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var pxtcore;
    (function (pxtcore) {
        function getTouchButton(id) {
            var state = pxsim.board().touchButtonState;
            var btn = state.buttons.filter(function (b) { return b.id == id; })[0];
            // simulator done somewhere else
            var io = pxsim.board().edgeConnectorState;
            if (io) {
                var pin = io.pins.filter(function (p) { return p.id == id; })[0];
                pxsim.pins.markUsed(pin);
            }
            return btn;
        }
        pxtcore.getTouchButton = getTouchButton;
    })(pxtcore = pxsim.pxtcore || (pxsim.pxtcore = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var TouchButtonMethods;
    (function (TouchButtonMethods) {
        function setThreshold(button, value) {
            button.setThreshold(value);
        }
        TouchButtonMethods.setThreshold = setThreshold;
        function threshold(button) {
            return button.threshold();
        }
        TouchButtonMethods.threshold = threshold;
        function value(button) {
            return button.value();
        }
        TouchButtonMethods.value = value;
        function calibrate(button) {
            button.calibrate();
        }
        TouchButtonMethods.calibrate = calibrate;
    })(TouchButtonMethods = pxsim.TouchButtonMethods || (pxsim.TouchButtonMethods = {}));
})(pxsim || (pxsim = {}));
(function (pxsim) {
    var AnalogInOutPinMethods;
    (function (AnalogInOutPinMethods) {
        function touchButton(name) {
            return pxsim.pxtcore.getTouchButton(name.id);
        }
        AnalogInOutPinMethods.touchButton = touchButton;
    })(AnalogInOutPinMethods = pxsim.AnalogInOutPinMethods || (pxsim.AnalogInOutPinMethods = {}));
})(pxsim || (pxsim = {}));
