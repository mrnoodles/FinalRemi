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
    //var target = new THREE.Vector3(maze.w/2,maze.h/2,0)
    var target = new THREE.Vector3(0,0,0);
    cameras[0].position.set(
        target.x-d0*Math.cos(degToRad(el0))*Math.sin(degToRad(az0)),
        target.y-d0*Math.cos(degToRad(el0))*Math.cos(degToRad(az0)),
        target.z+d0*Math.sin(degToRad(el0)));
    cameras[0].up.set(0,0,1);
    cameras[0].lookAt(target);
    cameras[0].updateMatrixWorld();
    camerasHelpers[0].update();

    cameras[1].position.set(posx,posy, 0.85);
    // Euler angles in ZXY order:
    // First rotate az degrees around Z for the direction, then
    // rotate 90 deg around X to get the direction Z_camera pointing backward
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


createXYTile = function(x,y,z,materialIndex) {
    var geometry = new THREE.Geometry();

    var nvertices = geometry.vertices.length;
    geometry.vertices.push(
        new THREE.Vector3( x  , y  , z ),
        new THREE.Vector3( x+1, y  , z ),
        new THREE.Vector3( x+1, y+1, z ),
        new THREE.Vector3( x  , y+1, z )
    );

    //var nfaces = geometry.faces.length;
    geometry.faces.push(
        new THREE.Face3( nvertices, nvertices+1, nvertices+2, null, null, materialIndex),
        new THREE.Face3( nvertices, nvertices+2, nvertices+3, null, null, materialIndex)
    );

    // DONE: append UV coordinates to each vertex in each face
    geometry.faceVertexUvs[0].push(
        [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(1, 1)
        ],
        [
            new THREE.Vector2(0, 0),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(0, 1)
        ]
    );

    return geometry
};
createXZTile = function(x,y,z,materialIndex) {
    var geometry = new THREE.Geometry();

    var nvertices = geometry.vertices.length;
    geometry.vertices.push(
        new THREE.Vector3( x  , y  , z ),
        new THREE.Vector3( x+1, y  , z ),
        new THREE.Vector3( x+1, y, z+1 ),
        new THREE.Vector3( x  , y, z+1 )
    );


    //var nfaces = geometry.faces.length;
    geometry.faces.push(
        new THREE.Face3( nvertices+2, nvertices+1, nvertices, null, null, materialIndex),
        new THREE.Face3( nvertices+3, nvertices+2, nvertices, null, null, materialIndex)
    );

    // DONE: append UV coordinates to each vertex in each face
    geometry.faceVertexUvs[0].push(
        [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(1, 0),
            new THREE.Vector2(0, 0)
        ],
        [
            new THREE.Vector2(0, 1),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(0, 0)
        ]
    );

    return geometry
};
createYZTile = function(x,y,z,materialIndex) {
    var geometry = new THREE.Geometry();

    var nvertices = geometry.vertices.length;
    geometry.vertices.push(
        new THREE.Vector3( x  , y  , z ),
        new THREE.Vector3( x, y  , z+1 ),
        new THREE.Vector3( x, y+1, z+1 ),
        new THREE.Vector3( x  , y+1, z )
    );

    //var nfaces = geometry.faces.length;
    geometry.faces.push(

        new THREE.Face3( nvertices+3, nvertices+2, nvertices, null, null, materialIndex),
        new THREE.Face3( nvertices+2, nvertices+1, nvertices, null, null, materialIndex)
    );

    // DONE: append UV coordinates to each vertex in each face
    geometry.faceVertexUvs[0].push(
        [
            new THREE.Vector2(1, 0),
            new THREE.Vector2(1, 1),
            new THREE.Vector2(0, 0)
        ],
        [
            new THREE.Vector2(1, 1),
            new THREE.Vector2(0, 1),
            new THREE.Vector2(0, 0)
        ]
    );

    return geometry
};

createFloorGeometry = function() {
    var geometry = new THREE.Geometry();

    // DONE
    for (i=0; i<w;i++) {
        for (j=0; j<h; j++) {
            var tile = createXYTile(i, j, 0, 1);
            geometry.merge(tile, new THREE.Matrix4(), 0);
        }
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    return geometry;
};
createWallGeometry = function() {
    var geometry = new THREE.Geometry();
    var tile;
    var i;
    // DONE

    for (i=0; i<w; i++) {
        tile = createXZTile(i, 0, 0, 2);
        geometry.merge(tile, new THREE.Matrix4(), 0);

        tile = createXZTile(i, h, 0, 2);
        geometry.merge(tile, new THREE.Matrix4(), 0);
    }

    for (i=0; i<h; i++) {
        tile = createYZTile(0, i, 0, 2);
        geometry.merge(tile, new THREE.Matrix4(), 0);

        tile = createYZTile(w, i, 0, 2);
        geometry.merge(tile, new THREE.Matrix4(), 0);
    }

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    return geometry;
};


// Global variables for the View

var renderer;
var scene, camera;
var cameraId;

var cameras = [];
var camerasHelpers = [];
var axisHelper, plane;

var planeMesh, tileMesh, floorMesh, wallMesh;


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
    //renderer.setClearColor(0x000000)

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

    /* Helpers: additional objects in the scene useful for debugging */
    // Invisible by default

    for (var i=0; i<cameras.length; i++) {
        camerasHelpers[i] = new THREE.CameraHelper(cameras[i]);
        camerasHelpers[i].visible = false; // Set to true to show cameras positions
        scene.add( camerasHelpers[i] )
    }

    axisHelper = new THREE.AxisHelper( 1 ); // Axis length = 2
    axisHelper.material.linewidth = 7;
    axisHelper.position.set(0,0,0);
    scene.add( axisHelper );


    var geometry, material;// Tmp variables

    // Remove this plane once floor tiles are ok
    geometry = new THREE.PlaneGeometry( w,h, w,h );
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(w/2,h/2,0) );
    material = new THREE.MeshBasicMaterial( {color: 0x606060, wireframe: true, linewidth: 1} );
    planeMesh = new THREE.Mesh( geometry, material );
    //scene.add( planeMesh );


    /* Load textures and create materials */

    var tex, texn = new Array(), materials = [];

    // DONE: Define materials[i] for i=0..3

    texn[0] = THREE.ImageUtils.loadTexture("../textures/crateUV.jpg");
    texn[1] = THREE.ImageUtils.loadTexture("../textures/floor1.png");
    texn[2] = THREE.ImageUtils.loadTexture("../textures/brick-c.jpg");

    materials[0] = new THREE.MeshPhongMaterial({map:texn[0], side: THREE.DoubleSide});
    materials[1] = new THREE.MeshPhongMaterial({map:texn[1], side: THREE.DoubleSide});
    materials[2] = new THREE.MeshPhongMaterial({map:texn[2], side: THREE.DoubleSide});

    //materials[1] = null;
    //materials[2] = null;/

    // DONE: Define multimaterial
    var multimaterial = new THREE.MeshFaceMaterial(materials);


    /* Create maze mesh */

    // DONE: replace uniform color by crateUV texture

    /*
    H1
     */
    //This adds texture to a single floor tile
    //geometry = createXYTile(0,0,0, 0);
    //tex = THREE.ImageUtils.loadTexture("textures/crateUV.jpg");
    //material = new THREE.MeshPhongMaterial({map:tex});
    //testtile = new THREE.Mesh(geometry, material);
    //scene.add(testtile);
    /*
    H1
    */




    //material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
    //tileMesh = new THREE.Mesh( geometry, material );
    //scene.add(tileMesh);

    // DONE: add XZ and YZ tiles


    /*
     H2
     */
    //This adds texture to a XZ wall tile
    //geometry = createXZTile(0,0,0, 0);
    //tex = THREE.ImageUtils.loadTexture("textures/crateUV.jpg");
    //material = new THREE.MeshPhongMaterial({map:tex});
    //testtile = new THREE.Mesh(geometry, material);
    //scene.add(testtile);

    //This adds texture to a YZ wall tile
    //geometry = createYZTile(0,0,0, 0);
    tex = THREE.ImageUtils.loadTexture("../textures/crateUV.jpg");
    material = new THREE.MeshPhongMaterial({map:tex, side: THREE.DoubleSide});
    //testtile = new THREE.Mesh(geometry, material);
    //scene.add(testtile);
    /*
     H2
     */


    // DONE: complete createFloorGeometry function
     geometry = createFloorGeometry();
     mesh = new THREE.Mesh( geometry, multimaterial );
     scene.add( mesh );

    // DONE: complete createWallGeometry function
    geometry = createWallGeometry();
    wallMesh = new THREE.Mesh( geometry, multimaterial );
    scene.add( wallMesh );

    // Helper to see the walls from cameras[2] top view
    //wire = new THREE.WireframeHelper( wallMesh, 0x0000ff );
    //wire.material.linewidth = 3
    //scene.add( wire );


    /* Create hero mesh */

    posx = 1;
    posy = 1;

    /*
    geometry = new THREE.BoxGeometry(0.5,0.3,0.6);
    geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,0.3));
    geometry.merge( new THREE.SphereGeometry(0.2,20,20), new THREE.Matrix4().makeTranslation(0,0,0.8), 0 );
    material = new THREE.MeshPhongMaterial( {color: 0xff0000} );
    hero = new THREE.Mesh( geometry, material );
    scene.add( hero );
    */

    // DONE: replace box and sphere hero with mesh loaded from JSON file
    THREE.Loader.Handlers.add( /\.dds$/i, new THREE.DDSLoader() );
    var loader = new THREE.JSONLoader();
    var onJSONLoaded = function ( geometry, materials ) {
        hero = new THREE.Mesh( geometry, new THREE.MeshFaceMaterial( materials ) );
        var rx = new THREE.Matrix4().rotateX(degToRad(90));
        var rz = new THREE.Matrix4().rotateZ(degToRad(180));
        var s = new THREE.Matrix4().scale(new THREE.Vector3(0.005,0.005,0.005));

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
