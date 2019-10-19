// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec3 a_Normal;\n' +        // Normal
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
    // Make the length of the normal 1.0
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

// Vertex shader for normal display
var vshader =
    'attribute vec4 a_Position;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'uniform mat4 u_ProjMatrix;\n' +
    'void main() {\n' +
    '  gl_Position = u_ProjMatrix * u_ViewMatrix * a_Position;\n' +
    '}\n';

// Fragment shader for normal display
var fshader =
    'precision mediump float;\n' +
    'void main() {\n' +
    '  gl_FragColor = vec4(0.0, 1.0, 1.0, 1.0);\n' +
    '}\n';

var points = []; // coordinates of all the points on cylinder
var colors = []; // colors of all the points on cylinder, default to be red
var n = []; // normals of all the polygons
var shown = []; // normals to be displyed
var toggle1 = 0, toggle2 = 0, toggle3 = 0; // detect the status of those three toggles
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
    var lineProgram = createProgram(gl, vshader, fshader);
    if (!cylinderProgram || !lineProgram) {
        console.log('Failed to create program');
        return -1;
    }

    // Get locations of all the variables for drawing a cylinder
    cylinderProgram.a_Position = gl.getAttribLocation(cylinderProgram, 'a_Position');
    cylinderProgram.a_Color = gl.getAttribLocation(cylinderProgram, 'a_Color');
    cylinderProgram.a_Normal = gl.getAttribLocation(cylinderProgram, 'a_Normal');
    cylinderProgram.u_ViewMatrix = gl.getUniformLocation(cylinderProgram, 'u_ViewMatrix');
    cylinderProgram.u_ProjMatrix = gl.getUniformLocation(cylinderProgram, 'u_ProjMatrix');
    cylinderProgram.u_LightColor = gl.getUniformLocation(cylinderProgram, 'u_LightColor');
    cylinderProgram.u_LightDirection = gl.getUniformLocation(cylinderProgram, 'u_LightDirection');
    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Normal < 0 ||
        cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 || cylinderProgram.u_LightColor < 0 || 
        cylinderProgram.u_LightDirection < 0) {
        console.log('Failed to locate variables for cylinder');
        return -1;
    }

    // Get location of all the variables for drawing normals
    lineProgram.a_Position = gl.getAttribLocation(lineProgram, 'a_Position');
    lineProgram.u_ViewMatrix = gl.getUniformLocation(lineProgram, 'u_ViewMatrix');
    lineProgram.u_ProjMatrix = gl.getUniformLocation(lineProgram, 'u_ProjMatrix');
    if (lineProgram.a_Position < 0 || lineProgram.u_ViewMatrix < 0 || lineProgram.u_ProjMatrix < 0) {
        console.log('Failed to locate variables for lines');
        return -1;
    }

    generate_tc(); // Initialize the array 'points' defined at line 46
    setColors(); // Initialize the array 'colors' at line 47
    setNormals(); // Initialize the array 'n' at line 48
    setViewNormals(); // Initialize the array 'shown' at line 49

    // From the names of the functions below,
    // you can easily known what they are doing.
    initPositions(gl, cylinderProgram, lineProgram, 0); // The last parameter '0' is to choose between two programs
    initColors(gl, cylinderProgram);
    initNormals(gl, cylinderProgram);
    initLightColor(gl, cylinderProgram);
    initLightDirection(gl, cylinderProgram);
    initMatrix(gl, cylinderProgram, lineProgram, 0, 0); // The last two parameters are to choose between programs and top/side view

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Display a default view
    var len = points.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, len);

    // Listen to toggle1, which is responsible for changing view
    var checkbox1 = document.getElementById('toggle1');
    checkbox1.addEventListener('change', function () {
        if (checkbox1.checked) {
            toggle1 = 1;
            setSideView(gl, cylinderProgram, lineProgram);
        } else {
            toggle1 = 0;
            setTopView(gl, cylinderProgram, lineProgram);
        }
    });

    // Toggle2, responsible for switching between flat shading and wireframe
    var checkbox2 = document.getElementById('toggle2');
    checkbox2.addEventListener('change', function () {
        if (checkbox2.checked) {
            toggle2 = 1;
            if (toggle1 == 0) {
                setTopView(gl, cylinderProgram, lineProgram);
            }
            else {
                setSideView(gl, cylinderProgram, lineProgram);
            }
        } else {
            toggle2 = 0;
            if (toggle1 == 0) {
                setTopView(gl, cylinderProgram, lineProgram);
            }
            else {
                setSideView(gl, cylinderProgram, lineProgram);
            }
        }
    });

    // Toggle3, for displaying normals
    var checkbox3 = document.getElementById('toggle3');
    checkbox3.addEventListener('change', function () {
        if (checkbox3.checked) {
            toggle3 = 1;
            if (toggle1 == 0) {
                setTopView(gl, cylinderProgram, lineProgram);
            }
            else {
                setSideView(gl, cylinderProgram, lineProgram);
            }
        } else {
            toggle3 = 0;
            if (toggle1 == 0) {
                setTopView(gl, cylinderProgram, lineProgram);
            }
            else {
                setSideView(gl, cylinderProgram, lineProgram);
            }
        }
    });
}

/* setTopView
 * input:
 * gl and two programs
 * output:
 * none
 * use:
 * Every time you click on a toggle, setTopView or setSideView will be called.
 * It will check the current toggles' status,
 * then decide how to draw(topview+flatshading/wireframe)
 * and what to draw(display cylinder/cylinder+normals).
 */
function setTopView(gl, cylinderProgram, lineProgram) {
    var len1 = points.length / 3;
    var len2 = shown.length / 3;
    if (toggle2 == 0 && toggle3 == 0) { // Draw a top view, flat shading cylinder without displaying normals
        initPositions(gl, cylinderProgram, lineProgram, 0); // The last parameter '0' is to choose cylinderProgram
        initColors(gl, cylinderProgram);
        initNormals(gl, cylinderProgram);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, lineProgram, 0, 0); // The last but one parameter is to choose cylinderProgram.
                                                            // The last parameter is to choose a top view.

        // Specify the color for clearing <canvas>
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, len1);
    }
    else if (toggle2 == 1 && toggle3 == 0) {
        initPositions(gl, cylinderProgram, lineProgram, 0);
        initColors(gl, cylinderProgram);
        initNormals(gl, cylinderProgram);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, lineProgram, 0, 0);

        // Specify the color for clearing <canvas>
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.LINE_STRIP, 0, len1);
    }
    else {
        if (toggle2 == 0) {
            initPositions(gl, cylinderProgram, lineProgram, 0);
            initColors(gl, cylinderProgram);
            initNormals(gl, cylinderProgram);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, lineProgram, 0, 0);

            // Specify the color for clearing <canvas>
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            // Clear color and depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.drawArrays(gl.TRIANGLES, 0, len1);

            initPositions(gl, cylinderProgram, lineProgram, 1);
            initMatrix(gl, cylinderProgram, lineProgram, 1, 0);

            gl.drawArrays(gl.LINES, 0, len2);
        }
        else {
            initPositions(gl, cylinderProgram, lineProgram, 0);
            initColors(gl, cylinderProgram);
            initNormals(gl, cylinderProgram);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, lineProgram, 0, 0);

            // Specify the color for clearing <canvas>
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            // Clear color and depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.drawArrays(gl.LINE_STRIP, 0, len1);

            initPositions(gl, cylinderProgram, lineProgram, 1);
            initMatrix(gl, cylinderProgram, lineProgram, 1, 0);

            gl.drawArrays(gl.LINES, 0, len2);
        }
    }
}

/* setSideView
 * input:
 * gl and two programs
 * output:
 * none
 * use:
 * Every time you click on a toggle, setTopView or setSideView will be called.
 * It will check the current toggles' status,
 * then decide how to draw(sideview+flatshading/wireframe)
 * and what to draw(display cylinder/cylinder+normals).
 */
function setSideView(gl, cylinderProgram, lineProgram) {
    var len1 = points.length / 3;
    var len2 = shown.length / 3;
    if (toggle2 == 0 && toggle3 == 0) {
        initPositions(gl, cylinderProgram, lineProgram, 0);
        initColors(gl, cylinderProgram);
        initNormals(gl, cylinderProgram);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, lineProgram, 0, 1);

        // Specify the color for clearing <canvas>
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.TRIANGLES, 0, len1);
    }
    else if (toggle2 == 1 && toggle3 == 0) {
        initPositions(gl, cylinderProgram, lineProgram, 0);
        initColors(gl, cylinderProgram);
        initNormals(gl, cylinderProgram);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, lineProgram, 0, 1);

        // Specify the color for clearing <canvas>
        gl.clearColor(1.0, 1.0, 1.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        // Clear color and depth buffer
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.drawArrays(gl.LINE_STRIP, 0, len1);
    }
    else {
        if (toggle2 == 0) {
            initPositions(gl, cylinderProgram, lineProgram, 0);
            initColors(gl, cylinderProgram);
            initNormals(gl, cylinderProgram);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, lineProgram, 0, 1);

            // Specify the color for clearing <canvas>
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            // Clear color and depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.drawArrays(gl.TRIANGLES, 0, len1);

            initPositions(gl, cylinderProgram, lineProgram, 1);
            initMatrix(gl, cylinderProgram, lineProgram, 1, 1);

            gl.drawArrays(gl.LINES, 0, len2);
        }
        else {
            initPositions(gl, cylinderProgram, lineProgram, 0);
            initColors(gl, cylinderProgram);
            initNormals(gl, cylinderProgram);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, lineProgram, 0, 1);

            // Specify the color for clearing <canvas>
            gl.clearColor(1.0, 1.0, 1.0, 1.0);
            gl.enable(gl.DEPTH_TEST);
            // Clear color and depth buffer
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            gl.drawArrays(gl.LINE_STRIP, 0, len1);

            initPositions(gl, cylinderProgram, lineProgram, 1);
            initMatrix(gl, cylinderProgram, lineProgram, 1, 1);

            gl.drawArrays(gl.LINES, 0, len2);
        }
    }
}

/* setViewNormals
 * input:
 * none
 * output:
 * none
 * use:
 * initialize normals to be displayed
 */
function setViewNormals() {
    var len = points.length;
    for (var i = 0; i < len; i += 3) {
        // The first 3 values pushed into the array are (x, y, z) of the starting point.
        shown.push(points[i]);
        shown.push(points[i + 1]);
        shown.push(points[i + 2]);
        // These 3 values are the ending point of the normal.
        shown.push(n[i] / 2 + points[i]);
        shown.push(n[i + 1] / 2 + points[i + 1]);
        shown.push(n[i + 2] / 2 + points[i + 2]);
    }
}

/* setColors
 * input:
 * none
 * output:
 * none
 * use:
 * initialize polygon's color, default to be red
 */
function setColors() {
    var len = points.length / 3;
    for (var i = 0; i < len; i++) {
        colors.push(1.0);
        colors.push(0.0);
        colors.push(0.0);
        colors.push(1.0);
    }
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
        var a = [points[i], points[i + 1], points[i + 2]];
        var b = [points[i + 3], points[i + 4], points[i + 5]];
        var c = [points[i + 6], points[i + 7], points[i + 8]];
        var ba = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        var bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
        var normalb = [];

        normalb.push(bc[1] * ba[2] - bc[2] * ba[1]);
        normalb.push(ba[0] * bc[2] - ba[2] * bc[0]);
        normalb.push(bc[0] * ba[1] - bc[1] * ba[0]);
        var lenb = Math.sqrt(Math.pow(normalb[0], 2) + Math.pow(normalb[1], 2) + Math.pow(normalb[2], 2));
        normalb[0] /= lenb;
        normalb[1] /= lenb;
        normalb[2] /= lenb;

        n = n.concat(normalb);
        n = n.concat(normalb);
        n = n.concat(normalb);
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
    var r1 = 0.05;
    var r2 = 0.1;
    var theta = Math.PI / 6;
    var height = 1;
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

/* initPositions
 * input:
 * gl and two programs
 * tag: 0 to use cylinderProgram, 1 to use lineProgram
 * output:
 * none
 * use:
 * initialize a_Position
 */
function initPositions(gl, cylinderProgram, lineProgram, tag) {
    if (tag == 0) {
        gl.useProgram(cylinderProgram);
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
        gl.vertexAttribPointer(cylinderProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(cylinderProgram.a_Position);
    }
    else {
        gl.useProgram(lineProgram);
        var normals = new Float32Array(shown);
        // Create a buffer object
        var normalbuffer = gl.createBuffer();
        if (!normalbuffer) {
            console.log('Failed to create the buffer object');
            return -1;
        }
        // Write the vertex coordinates and color to the buffer object
        gl.bindBuffer(gl.ARRAY_BUFFER, normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
        gl.vertexAttribPointer(lineProgram.a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(lineProgram.a_Position);
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
function initColors(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var vertexcolors = new Float32Array(colors);
    // Create a buffer object
    var colorbuffer = gl.createBuffer();
    if (!colorbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexcolors, gl.STATIC_DRAW);
    gl.vertexAttribPointer(cylinderProgram.a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(cylinderProgram.a_Color);
}

/* initNormals
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize a_Normal
 */
function initNormals(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var normals = new Float32Array(n);
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
 * gl, cylinderProgram, lineProgram
 * tag1: 0 to use cylinderProgram, 1 to use lineProgram
 * tag2: 0 to set the top view, 1 for a side view
 * output:
 * none
 * use:
 * initialize u_ViewMatrx and u_ProjMatrix
 */
function initMatrix(gl, cylinderProgram, lineProgram, tag1, tag2) {
    if (tag1 == 0) { // Currently cylinderProgram in use
        gl.useProgram(cylinderProgram);
        if (tag2 == 0) { // Draw from top view
            var viewMatrix = new Matrix4();
            viewMatrix.setLookAt(0, 0, 1, 0, 0, 0, 0, 1, 0);
            // Set the view matrix
            gl.uniformMatrix4fv(cylinderProgram.u_ViewMatrix, false, viewMatrix.elements);
            // Create the matrix to set the eye point, and the line of sight
            var projMatrix = new Matrix4();
            projMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
            // Pass the projection matrix to u_ProjMatrix
            gl.uniformMatrix4fv(cylinderProgram.u_ProjMatrix, false, projMatrix.elements);
        }
        else { // Draw from side view
            var viewMatrix = new Matrix4();
            viewMatrix.setLookAt(0, -1, 0.75, 0, 0, 0, 0, 1, 0);
            // Set the view matrix
            gl.uniformMatrix4fv(cylinderProgram.u_ViewMatrix, false, viewMatrix.elements);
            // Create the matrix to set the eye point, and the line of sight
            var projMatrix = new Matrix4();
            projMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
            // Pass the projection matrix to u_ProjMatrix
            gl.uniformMatrix4fv(cylinderProgram.u_ProjMatrix, false, projMatrix.elements);
        }
    }
    else {
        gl.useProgram(lineProgram);
        if (tag2 == 0) {
            var viewMatrix = new Matrix4();
            viewMatrix.setLookAt(0, 0, 1, 0, 0, 0, 0, 1, 0);
            // Set the view matrix
            gl.uniformMatrix4fv(lineProgram.u_ViewMatrix, false, viewMatrix.elements);
            // Create the matrix to set the eye point, and the line of sight
            var projMatrix = new Matrix4();
            projMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
            // Pass the projection matrix to u_ProjMatrix
            gl.uniformMatrix4fv(lineProgram.u_ProjMatrix, false, projMatrix.elements);
        }
        else {
            var viewMatrix = new Matrix4();
            viewMatrix.setLookAt(0, -1, 0.75, 0, 0, 0, 0, 1, 0);
            // Set the view matrix
            gl.uniformMatrix4fv(lineProgram.u_ViewMatrix, false, viewMatrix.elements);
            // Create the matrix to set the eye point, and the line of sight
            var projMatrix = new Matrix4();
            projMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
            // Pass the projection matrix to u_ProjMatrix
            gl.uniformMatrix4fv(lineProgram.u_ProjMatrix, false, projMatrix.elements);
        }
    }
}