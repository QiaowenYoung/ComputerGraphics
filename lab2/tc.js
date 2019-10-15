// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_MvpMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'void main() {\n' +
    '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
    '}\n';

var points = [];
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

    generate_tc();

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

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }
    // Set the eye point and the viewing volume
    var mvpMatrix = new Matrix4();
    mvpMatrix.setPerspective(150, canvas.width/canvas.height, 1, 100);
    mvpMatrix.lookAt(5, 0, 0, 0, 0, 0, 0, 0, 1);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var len = points.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, len);
    //gl.drawElements(gl.TRIANGLES, len, gl.UNSIGNED_BYTE, 0);
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