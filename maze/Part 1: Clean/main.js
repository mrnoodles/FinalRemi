/**
 * Created by andres on 11-29-15.
 */

// GUI

var params = {
    'az0': -20.0,
    'el0': 30.0,
    'd0' : 8.0
};
var gui;
function initGUI() {
    gui = new dat.GUI({ autoPlace: true });

    gui.add(params, 'az0').min(-180).max(+180).listen();
    gui.add(params, 'el0').min(-90).max(+90).listen();
    gui.add(params, 'd0').min(+1).max(+100).listen();
}

// Animation

var lastTime = 0, elapsed = 0;
function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) { elapsed = (timeNow - lastTime)/1000; }
    lastTime = timeNow;

    /* Hero collision detection */
    var d2 = dx*dx + dy*dy;
    if (d2>0) {
        // If we are moving, check for collisions
        // DONE
        var pos = new THREE.Vector3(posx, posy, 0.5);
        var dir = new THREE.Vector3(dx, dy, 0);
        var raycaster = new THREE.Raycaster(pos, dir, 0, 1);
        var intersects = raycaster.intersectObject((wallMesh));
        if(intersects.length > 0) {
            dx=0;
            dy=0;
        }
    }

    /* Update Hero Position */
    var velocity = 1/0.4;      // Move 1 unit in 0.4s
    var anglevelocity = 360/2; // Turn 360 deg in 2s
    posx += dx * elapsed * velocity;
    posy += dy * elapsed * velocity;
    az   += daz * elapsed * anglevelocity;

    hero.position.set(posx,posy, 0);
    hero.rotation.set(0,0,degToRad(az),"ZXY");

    /* Cameras update */

    var az0 = params.az0, el0 = params.el0, d0 = params.d0;

    // Uncomment to look at maze center instead of origin
    var target = new THREE.Vector3(w/2,h/2,0);
    //var target = new THREE.Vector3(0,0,0);
    cameras[0].position.set(
        target.x-d0*Math.cos(degToRad(el0))*Math.sin(degToRad(az0)),
        target.y-d0*Math.cos(degToRad(el0))*Math.cos(degToRad(az0)),
        target.z+d0*Math.sin(degToRad(el0))
    );
    cameras[0].up.set(0,0,1);
    cameras[0].lookAt(target);
    cameras[0].updateMatrixWorld();
    camerasHelpers[0].update();

    cameras[1].position.set(posx,posy, 0.85);
    cameras[1].rotation.set(degToRad(90),0,degToRad(az),"ZXY");
    cameras[1].updateMatrixWorld();
    camerasHelpers[1].update();
}

function tick() {
    requestAnimationFrame(tick);
    handleKeys();
    animate();
    renderer.render(scene, camera);
}


// Global variables for the Model

/* Plane dimensions */
var w = 5, h = 6;
/* Hero position */
var posx = 1, posy = 1, az = 0;
/* Hero motion */
var dx=0,dy=0,daz=0;

// Global variables for the View

var renderer;
var scene, camera;
var cameraId;

var cameras = [];
var camerasHelpers = [];
var axisHelper, plane;

var wallMesh;


function webGLStart() {

    /* Initialize WebGL renderer and create scene */

    var canvas = document.getElementById("canvas");
    renderer = new THREE.WebGLRenderer({
        'canvas': canvas,
        maxLights: 6,
        preserveDrawingBuffer: true,
        shadowMapEnabled: true  // Remove if performance issues
    });
    renderer.setClearColor(0xffffff);

    scene = new THREE.Scene();

    /* Create cameras */
    // Note: look in animate() for the setting of cameras position and orientation
    cameras[0] = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 0.005, 100);
    cameras[1] = new THREE.PerspectiveCamera( 100, canvas.width / canvas.height, 0.005, 100);
    var W = Math.max(w, h);
    cameras[2] = new THREE.OrthographicCamera( -1, W+1, W+1, -1, -10, 10);

    // Define current camera
    cameraId = 0;
    camera = cameras[cameraId];

    for (var i=0; i<cameras.length; i++) {
        camerasHelpers[i] = new THREE.CameraHelper(cameras[i]);
        camerasHelpers[i].visible = false; // Set to true to show cameras positions
        //scene.add( camerasHelpers[i] )
    }

    axisHelper = new THREE.AxisHelper( 1 ); // Axis length = 2
    axisHelper.material.linewidth = 7;
    axisHelper.position.set(0,0,0);
    //scene.add( axisHelper );


    var geometry;


    /* Load textures and create materials */
    var texn = [], materials = [];

    texn[0] = THREE.ImageUtils.loadTexture("../textures/crateUV.jpg");
    texn[1] = THREE.ImageUtils.loadTexture("../textures/floor1.png");
    texn[2] = THREE.ImageUtils.loadTexture("../textures/brick-c.jpg");

    materials[0] = new THREE.MeshPhongMaterial({map:texn[0], side: THREE.DoubleSide});
    materials[1] = new THREE.MeshPhongMaterial({map:texn[1], side: THREE.DoubleSide});
    materials[2] = new THREE.MeshPhongMaterial({map:texn[2], side: THREE.DoubleSide});

    var multimaterial = new THREE.MeshFaceMaterial(materials);

    /* World meshes */
    geometry = createFloorGeometry();
    mesh = new THREE.Mesh( geometry, multimaterial );
    scene.add( mesh );

    geometry = createWallGeometry();
    wallMesh = new THREE.Mesh( geometry, multimaterial );
    scene.add( wallMesh );


    /* Hero loading */
    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    var loader = new THREE.JSONLoader();
    var onJSONLoaded = function ( geometry, materials ) {
        hero = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );

        var eu = new THREE.Vector3(degToRad(90), degToRad(180), degToRad(0));

        eu.order = "XYZ";

        var m = new THREE.Matrix4().makeRotationFromEuler(eu).scale(new THREE.Vector3(0.005, 0.005, 0.005));
        //m.multiplyMatrices(rx, rz);
        //var m = THREE.Matrix4.multiplyMatrices(s, THREE.Matrix4.multiplyMatrices(rx, rz));

        hero.geometry.applyMatrix(m);

        scene.add( hero );
    };
    loader.load( '../obj/male02/Male02_dds.js', onJSONLoaded);


    /* Create lights */
    var light = new THREE.AmbientLight( 0x808080 ); // soft white light
    scene.add( light );

    var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
    directionalLight.position.set( -2,2, 5 );
    scene.add( directionalLight );


    /* Create Controllers */
    initMouse(canvas);
    initKeyboard(canvas);
    initGUI();

    // Start rendering loop
    tick();
}
