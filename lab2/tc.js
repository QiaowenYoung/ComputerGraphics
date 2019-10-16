// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'attribute vec3 a_normal;\n' + // normal of the plane, I need to transfer data to it
    'varying vec3 v_normal;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '  v_normal = a_normal;\n' + // transfer to fragment shader program
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec3 v_normal;\n' +
    'uniform vec4 u_color;\n' + // color of light, default to be (1.0, 1.0, 1.0)
    'uniform vec3 u_reverseLightDirection;\n' + // direction of light
    'void main() {\n' +
    '  vec3 normal = normalize(v_normal);\n' +
    '  float light = dot(normal, u_reverseLightDirection);\n' +
    '  vec3 diffuse = u_color.rgb * vec3(1.0, 0.0, 0.0) * light;\n' +
    '  gl_FragColor = vec4(diffuse, 1.0);\n' +
    '}\n';

var points = [];
var n = [];
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');
    // Prevent the default setting for left/right click in the window
    canvas.oncontextmenu = function (ev) {
        ev.preventDefault();
    }
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    generate_tc(); // generate points stored in the array points

    /* decide positions */
    var vertices = new Float32Array(points);
    // Create a buffer object
    var positionbuffer = gl.createBuffer();
    if (!positionbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    /* end */

    /* decide u_MvpMatrix */
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }
    // Set the eye point and the viewing volume
    var mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(150, canvas.width / canvas.height, 1, 100);
    mvpMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    /* end*/

    /* decide normals */
    setNormals();
    var normals = new Float32Array(n);
    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    var normalLocation = gl.getAttribLocation(gl.program, "a_normal");
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);
    // Put normals data into buffer
    /* end */

    /* decide light color */
    var colorLocation = gl.getUniformLocation(gl.program, "u_color");
    // Set the color to use
    gl.uniform4fv(colorLocation, [1.0, 1.0, 1.0, 1.0]); // white
    /* end */

    /* decide direction of light */
    var reverseLightDirectionLocation =
        gl.getUniformLocation(gl.program, "u_reverseLightDirection");
    var lightDirection = new Vector3([1.0, 1.0, 1.0]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(reverseLightDirectionLocation, lightDirection.elements);
    /* end */

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var len = points.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, len);
}

/* setNormals:
 * input:
 * none
 * output:
 * none
 * use:
 * calculate normals of each polygon and store them in the array n
 */
function setNormals() {
    var len = points.length;
    for (var i = 0; i < len; i += 9) {
        var a = [points[0], points[1], points[2]];
        var b = [points[3], points[4], points[5]];
        var c = [points[6], points[7], points[8]];
        var ba = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        var bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
        var normal = [];
        normal.push(bc[1] * ba[2] - bc[2] * ba[1]);
        normal.push(ba[0] * bc[2] - ba[2] * bc[0]);
        normal.push(bc[0] * ba[1] - bc[1] * ba[0]);
        n = n.concat(normal);
        n = n.concat(normal);
        n = n.concat(normal);
    }
}

/* generate_tc:
 * input:
 * none
 * output:
 * an array storing all the coordinates required for a tapered cyindar
 * use:
 * fill the array "points" with all the coordinates need for a tapered cylindar
 * this cylindar is located at (0, 0)
 */
function generate_tc() {
    var r1 = 0.5;
    var r2 = 1;
    var theta = Math.PI / 6;
    var height = 10;
    var topx = [], topy = [];
    var bottomx = [], bottomy = [];
    for (var i = 0; i < 13; i++) {
        var top_x = r1 * Math.cos(i * theta);
        var top_y = r1 * Math.sin(i * theta);
        var bottom_x = r2 * Math.cos(i * theta);
        var bottom_y = r2 * Math.sin(i * theta);
        topx.push(top_x);
        topy.push(top_y);
        bottomx.push(bottom_x);
        bottomy.push(bottom_y);
    }
    for (var i = 0; i < 12; i++) {
        points.push(topx[i]);
        points.push(topy[i]);
        points.push(height);
        points.push(bottomx[i]);
        points.push(bottomy[i]);
        points.push(0.0);
        points.push(topx[i + 1]);
        points.push(topy[i + 1]);
        points.push(height);
        points.push(topx[i + 1]);
        points.push(topy[i + 1]);
        points.push(height);
        points.push(bottomx[i]);
        points.push(bottomy[i]);
        points.push(0.0);
        points.push(bottomx[i + 1]);
        points.push(bottomy[i + 1]);
        points.push(0.0);
    }
}

/* generate_color:
 * input:
 * (x0, y0, z0), (x1, y1, z1), (x2, y2, z2): points of a triangle in CCW
 * output:
 * an array that stores the rgb color of the plane constructed by these three points
 *//*
function generate_color(x0, y0, z0, x1, y1, z1, x2, y2, z2) {
var color = [];
var ba = [x0 - x1, y0 - y1, z0 - z1];
var bc = [x2 - x1, y2 - y1, z2 - z1];
// Do cross product of bc and ba
var normal = [];
normal.push(bc[1] * ba[2] - bc[2] * ba[1]);
normal.push(ba[0] * bc[2] - ba[2] * bc[0]);
normal.push(bc[0] * ba[1] - bc[1] * ba[0]);

// Calculate cos(theta): dot product of normalized normal and light
var light = [1.0, 1.0, 1.0];
var len1 = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));
var len2 = Math.sqrt(1 + 1 + 1);
normal[0] = normal[0] / len1;
normal[1] = normal[1] / len1;
normal[2] = normal[2] / len1;
light[0] = light[0] / len2;
light[1] = light[1] / len2;
light[2] = light[2] / len2;
var costheta = normal[0] * light[0] + normal[1] * light[1] + normal[2] * light[2];
}*/