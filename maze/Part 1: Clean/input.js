/**
 * Created by andres on 11-30-15.
 */

// Mouse controls

var mouseState = 0;
var mouse = new THREE.Vector2();

function initMouse(canvas) {
    canvas.onmousemove = handleMouseMove;
    canvas.onmousedown = handleMouseDown;
    canvas.onmouseleave = function() {mouseState = 0; mouse.x=0; mouse.y=0};
}
function handleMouseDown(event) {
    // Get mouse position in normalized coordinates [-1, +1]
    var rect = event.target.getBoundingClientRect();
    mouse.x = (event.clientX - rect.left) / (rect.right-rect.left) * 2 - 1;
    mouse.y = -(event.clientY - rect.top) / (rect.bottom-rect.top) * 2 + 1;
    console.log(mouse)
}
function handleMouseMove(event) {
}

// Keyboard controls

var currentlyPressedKeys = {};

function initKeyboard(canvas, onKeyDown, onKeyUp) {
    // add tabindex attribute to canvas to allow it getting keyboard focus
    // Same as declaring <canvas tag='webgl-canvas' tabindex='1'></canvas> in HTML
    canvas.setAttribute('tabindex',1);
    // Give focus to canvas by default and each time mouse enters
    // to improve user experience by handling keyboard out of the box
    canvas.focus();
    canvas.onmouseenter = (function () {canvas.focus()});
    //canvas.onmouseleave = (function () {canvas.blur()});

    canvas.onkeydown = handleKeyDown;
    canvas.onkeyup = handleKeyUp;
}
function handleKeyDown(event) {
    var keyCode = event.keyCode;
    currentlyPressedKeys[keyCode] = true;

    // Display pressed keys for debugging. Comment if too verbose
    console.log('KeyDown: keycode = '+keyCode.toString());

    if (keyCode == 37 || keyCode == 38 || keyCode == 39 || keyCode == 40) {
        // Arrow keys: prevent default handling (i.e. avoid scrolling)
        event.preventDefault();
        // Arrows are handled using polling in handleKeys
    } else if (event.key == 'v') {
        // Change current camera
        cameraId = (cameraId+1)%3;
        camera = cameras[cameraId];
        console.log('cameraId = '+cameraId.toString()+", camera = ",cameras[cameraId]);
        //var messagebox = document.getElementById("messagebox");
        messagebox.innerHTML = 'Camera '+cameraId;
    }
    if (event.key == 'c') {
        // Check victory
    }
}
function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
    /* Camera 0 controls */
    if (currentlyPressedKeys[73] /* I */) { params.el0 += 2 }
    if (currentlyPressedKeys[75] /* K */) { params.el0 -= 2 }
    if (currentlyPressedKeys[74] /* J */) { params.az0 -= 2 }
    if (currentlyPressedKeys[76] /* L */) { params.az0 += 2 }
    if (currentlyPressedKeys[85] /* U */) { params.d0 *= 1.05 }
    if (currentlyPressedKeys[79] /* O */) { params.d0 /= 1.05 }
    if (params.el0>90) params.el0=90;
    else if (params.el0<-90) params.el0=-90;
    if (params.az0>180) params.az0-=360;
    else if (params.az0<-180) params.az0+=360;

    /* Hero control */
    daz = 0;  // Rotation control
    if (currentlyPressedKeys[37] /* Left */) { daz = 1 }
    if (currentlyPressedKeys[39] /* Right */) { daz = -1 }
    dx = 0; dy = 0;  // Position control
    if (currentlyPressedKeys[38] /* Up */) {
        dx = -Math.sin(degToRad(az));
        dy = Math.cos(degToRad(az));
    }
    if (currentlyPressedKeys[40] /* Down */) {
        dx = Math.sin(degToRad(az));
        dy = -Math.cos(degToRad(az));
    }

    /* WARNING: Setting cameras and hero new position is done in animate() */
}
