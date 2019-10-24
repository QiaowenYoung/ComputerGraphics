// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec3 a_Normal;\n' +        // Normal
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform vec4 u_Translation;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position + u_Translation;\n' +
    // Make the length of the normal 1.0
    //'  vec3 normal = normalize(a_Normal + u_Translation.xyz);\n' +
    '  vec3 normal = normalize(a_Normal);\n' +
    // Dot product of the light direction and the orientation of a surface (the normal)
    '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
    // Calculate the color due to diffuse reflection
    '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    '  v_Color = vec4(diffuse, a_Color.a);\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_FragColor = v_Color;\n' +
    '}\n';

var Txl = [], Tyl = [];
var Txr = [], Tyr = [];
var countl = 0;
var countr = 0;
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

    // Initialize two programs for respectively drawing cylinder and normals
    var cylinderProgram = createProgram(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!cylinderProgram) {
        console.log('Failed to create program');
        return -1;
    }

    // Get locations of all the variables for drawing a cylinder
    cylinderProgram.a_Position = gl.getAttribLocation(cylinderProgram, 'a_Position');
    cylinderProgram.a_Color = gl.getAttribLocation(cylinderProgram, 'a_Color');
    cylinderProgram.a_Normal = gl.getAttribLocation(cylinderProgram, 'a_Normal');
    cylinderProgram.u_ViewMatrix = gl.getUniformLocation(cylinderProgram, 'u_ViewMatrix');
    cylinderProgram.u_ProjMatrix = gl.getUniformLocation(cylinderProgram, 'u_ProjMatrix');
    cylinderProgram.u_Translation = gl.getUniformLocation(cylinderProgram, 'u_Translation');
    cylinderProgram.u_LightColor = gl.getUniformLocation(cylinderProgram, 'u_LightColor');
    cylinderProgram.u_LightDirection = gl.getUniformLocation(cylinderProgram, 'u_LightDirection');
    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Normal < 0 ||
        cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 || cylinderProgram.u_Translation < 0 ||
        cylinderProgram.u_LightColor < 0 || cylinderProgram.u_LightDirection < 0) {
        console.log('Failed to locate variables for cylinder');
        return -1;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    canvas.onmousedown = function (ev) { click(ev, gl, canvas, cylinderProgram) };
}

function click(ev, gl, canvas, cylinderProgram) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    if (ev.button === 0) {
        countl++;
        Txl.push(x); Tyl.push(y);
    }
    else if (ev.button === 2) {
        countr++;
        Txr.push(x); Tyr.push(y);
    }
    for (var i = 0; i < countl; i++) {
        drawCylinder(gl, cylinderProgram, Txl[i], Tyl[i], 0);
    }
    for (var i = 0; i < countr; i++) {
        drawCylinder(gl, cylinderProgram, Txr[i], Tyr[i], 1);
    }
}

function drawCylinder(gl, cylinderProgram, tx, ty, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        initPositions(gl, cylinderProgram, 0);
        initColors(gl, cylinderProgram, 0);
        initNormals(gl, cylinderProgram, 0);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram);
        initTranslation(gl, cylinderProgram, tx, ty);
        var len = cylinderl.length / 3;
        gl.drawArrays(gl.TRIANGLES, 0, len);
    }
    else {
        initPositions(gl, cylinderProgram, 1);
        initColors(gl, cylinderProgram, 1);
        initNormals(gl, cylinderProgram, 1);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram);
        initTranslation(gl, cylinderProgram, tx, ty);
        var len = cylinderr.length / 3;
        gl.drawArrays(gl.TRIANGLES, 0, len);
    }
}

/* initPositions
 * input:
 * gl and cylinderProgram
 * output:
 * none
 * use:
 * initialize a_Position
 */
function initPositions(gl, cylinderProgram, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        var vertices = new Float32Array(cylinderl);
        // Create a buffer object
        var positionbuffer = gl.createBuffer();
        if (!positionbuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Write the vertex coordinates and color to the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(cylinderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(cylinderProgram.a_Position);
    }
    else {
        var vertices = new Float32Array(cylinderr);
        // Create a buffer object
        var positionbuffer = gl.createBuffer();
        if (!positionbuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Write the vertex coordinates and color to the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
        gl.vertexAttribPointer(cylinderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(cylinderProgram.a_Position);
    }
}

/* initColors
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize a_Color
 */
function initColors(gl, cylinderProgram, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        gl.vertexAttrib4f(cylinderProgram.a_Color, 1.0, 0.0, 0.0, 1.0);
    }
    else {
        gl.vertexAttrib4f(cylinderProgram.a_Color, 0.0, 0.0, 1.0, 1.0);
    }
}

/* initNormals
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize a_Normal
 */
function initNormals(gl, cylinderProgram, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        var normals = new Float32Array(nl);
        // Create a buffer to put normals in
        var normalBuffer = gl.createBuffer();
        if (!normalBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        //var normalLocation = gl.getAttribLocation(gl.program, "a_Normal");
        gl.vertexAttribPointer(cylinderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
        // Turn on the normal attribute
        gl.enableVertexAttribArray(cylinderProgram.a_Normal);
    }
    else {
        var normals = new Float32Array(nr);
        // Create a buffer to put normals in
        var normalBuffer = gl.createBuffer();
        if (!normalBuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        //var normalLocation = gl.getAttribLocation(gl.program, "a_Normal");
        gl.vertexAttribPointer(cylinderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
        // Turn on the normal attribute
        gl.enableVertexAttribArray(cylinderProgram.a_Normal);
    }
}

/* initLightColor
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize u_LightColor
 */
function initLightColor(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    gl.uniform3fv(cylinderProgram.u_LightColor, [1.0, 1.0, 1.0]); // white
}

/* initLightDirection
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize u_LightDirection
 */
function initLightDirection(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var lightDirection = new Vector3([1.0, 1.0, 1.0]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(cylinderProgram.u_LightDirection, lightDirection.elements);
}

/* initMatrix
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize u_ViewMatrx and u_ProjMatrix
 */
function initMatrix(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0, 0, 200, 0, 0, 0, 0, 1, 0);
    // Set the view matrix
    gl.uniformMatrix4fv(cylinderProgram.u_ViewMatrix, false, viewMatrix.elements);
    // Create the matrix to set the eye point, and the line of sight
    var projMatrix = new Matrix4();
    projMatrix.setOrtho(-100, 100, -100, 100, -2000, 2000);
    // Pass the projection matrix to u_ProjMatrix
    gl.uniformMatrix4fv(cylinderProgram.u_ProjMatrix, false, projMatrix.elements);
}

/* initTranslation
 * input:
 * gl, cylinderProgram
 * (tx, ty): coordinates of your mouse click
 */
function initTranslation(gl, cylinderProgram, tx, ty) {
    gl.useProgram(cylinderProgram);
    gl.uniform4f(cylinderProgram.u_Translation, tx, ty, 0.0, 0.0);
}