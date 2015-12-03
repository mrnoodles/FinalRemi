/**
 * Created by andres on 12-03-15.
 */

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
