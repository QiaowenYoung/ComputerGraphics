// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec3 a_Normal;\n' +        // Normal
    'uniform mat4 u_mvpMatrix;\n' +
    'uniform vec4 u_Translation;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_mvpMatrix * a_Position + u_Translation;\n' +
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

var Txl = [], Tyl = []; // (x, y) coordinates of a left click
var Txr = [], Tyr = []; // (x, y) coordinates of a right click
var countl = 0; // # of red trees
var countr = 0; // # of blue trees
// toggle1: 0 for top view, 1 for side view
// toggle2: 0 for ortho view, 1 for pers view
// toggle3: 0 for solid, 1 for wireframe
var toggle1 = 0, toggle2 = 0, toggle3 = 0;
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
    cylinderProgram.u_mvpMatrix = gl.getUniformLocation(cylinderProgram, 'u_mvpMatrix');
    cylinderProgram.u_Translation = gl.getUniformLocation(cylinderProgram, 'u_Translation');
    cylinderProgram.u_LightColor = gl.getUniformLocation(cylinderProgram, 'u_LightColor');
    cylinderProgram.u_LightDirection = gl.getUniformLocation(cylinderProgram, 'u_LightDirection');
    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Normal < 0 ||
        cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 || cylinderProgram.u_Translation < 0 ||
        cylinderProgram.u_LightColor < 0 || cylinderProgram.u_LightDirection < 0) {
        console.log('Failed to locate variables for cylinder');
        return -1;
    }
    /* end */

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    canvas.onmousedown = function (ev) { click(ev, gl, canvas, cylinderProgram) };

    var checkbox1 = document.getElementById('toggle1');
    checkbox1.addEventListener('change', function () {
        if (checkbox1.checked) {
            toggle1 = 1;
            setView(gl, cylinderProgram);
        } else {
            toggle1 = 0;
            setView(gl, cylinderProgram);
        }
    });

    var checkbox2 = document.getElementById('toggle2');
    checkbox2.addEventListener('change', function () {
        if (checkbox2.checked) {
            toggle2 = 1;
            setView(gl, cylinderProgram);
        } else {
            toggle2 = 0;
            setView(gl, cylinderProgram);
        }
    });

    var checkbox3 = document.getElementById('toggle3');
    checkbox3.addEventListener('change', function () {
        if (checkbox3.checked) {
            toggle3 = 1;
            setView(gl, cylinderProgram);
        } else {
            toggle3 = 0;
            setView(gl, cylinderProgram);
        }
    });

    var submit = document.getElementById('submit');
    submit.addEventListener('click', function () {
        setView(gl, cylinderProgram);
        // Change checkbox value based on the import
        if (toggle1 == 0) {
            checkbox1.checked = false;
        } else {
            checkbox1.checked = true;
        }
        if (toggle2 == 0) {
            checkbox2.checked = false;
        } else {
            checkbox2.checked = true;
        }
        if (toggle3 == 0) {
            checkbox3.checked = false;
        } else {
            checkbox3.checked = true;
        }
    });
}

/* save: refer to https://jsfiddle.net/4v26ebtp/
 * 
 * The basic thought is to store toggle1, toggle2, toggle3, Txl, Tyl, Txr, Tyr, countl, countr 
 * (can refer to line 32~39 for what these values mean) to test.txt.
 * For parsing convenience, the sequence of these values is set as:
 * toggle1, toggle2, toggle3, countl, Txl, Tyl, countr, Txr, Tyr.
 * In this way, when loading a scene, these values can be easily parsed and known.
 */
function fakeClick(obj) {
    var ev = document.createEvent("MouseEvents");
    ev.initMouseEvent("click", true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
    obj.dispatchEvent(ev);
}

function exportRaw(name, data) {
    var urlObject = window.URL || window.webkitURL || window;
    var export_blob = new Blob([data]);
    var save_link = document.createElementNS("http://www.w3.org/1999/xhtml", "a")
    save_link.href = urlObject.createObjectURL(export_blob);
    save_link.download = name;
    fakeClick(save_link);
}

function save() {
    var arr = [];
    arr.push(toggle1);
    arr.push(toggle2);
    arr.push(toggle3);
    arr.push(countl);
    arr = arr.concat(Txl);
    arr = arr.concat(Tyl);
    arr.push(countr);
    arr = arr.concat(Txr);
    arr = arr.concat(Tyr);
    exportRaw('test.txt', JSON.stringify(arr));
}

// Load: refer to https://blog.csdn.net/zdavb/article/details/50266215 on import files
function load() {
    var selectedFile = document.getElementById("files").files[0];
    var name = selectedFile.name;
    var size = selectedFile.size;
    console.log("filename: " + name + "size: " + size);

    var reader = new FileReader();
    reader.readAsText(selectedFile);

    reader.onload = function () {
        var l = this.result.length;
        var str = this.result.slice(1, l - 1);
        var arr = str.split(',');
        for (var i = 0; i < arr.length; i++) {
            arr[i] = parseFloat(arr[i]);
        }
        toggle1 = arr[0];
        toggle2 = arr[1];
        toggle3 = arr[2];
        countl = arr[3];
        var txl = arr.slice(4, countl + 4);
        var tyl = arr.slice(countl + 4, 2 * countl + 4);
        countr = arr[2 * countl + 4];
        var txr = arr.slice(2 * countl + 5, 2 * countl + 5 + countr);
        var tyr = arr.slice(2 * countl + 5 + countr, 2 * countl + 5 + 2 * countr);
        Txl = [];
        Tyl = [];
        Txr = [];
        Tyr = [];
        for (var i = 0; i < countl; i++) {
            Txl.push(txl[i]);
            Tyl.push(tyl[i]);
        }
        for (var i = 0; i < countr; i++) {
            Txr.push(txr[i]);
            Tyr.push(tyr[i]);
        }
    };
}

/* setView
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * draw a whole scene
 */
function setView(gl, cylinderProgram) {
    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < countl; i++) { // Draw red trees
        initPositions(gl, cylinderProgram, 0);
        initColors(gl, cylinderProgram, 0);
        initNormals(gl, cylinderProgram, 0);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, toggle1, toggle2);
        initTranslation(gl, cylinderProgram, Txl[i], Tyl[i], toggle2);
        var len = cylinderl.length / 3;
        if (toggle3 == 0) { // Flat shading
            gl.drawArrays(gl.TRIANGLES, 0, len);
        }
        else { // wireframe
            gl.drawArrays(gl.LINES, 0, len);
        }
    }
    for (var i = 0; i < countr; i++) { // Draw blue trees
        initPositions(gl, cylinderProgram, 1);
        initColors(gl, cylinderProgram, 1);
        initNormals(gl, cylinderProgram, 1);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, toggle1, toggle2);
        initTranslation(gl, cylinderProgram, Txr[i], Tyr[i], toggle2);
        var len = cylinderr.length / 3;
        if (toggle3 == 0) {
            gl.drawArrays(gl.TRIANGLES, 0, len);
        }
        else {
            gl.drawArrays(gl.LINES, 0, len);
        }
    }
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
    setView(gl, cylinderProgram);
}

/* initPositions
 * input:
 * gl, cylinderProgram
 * tag: 0 for left click, 1 for right click
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
 * tag: 0 for red tree, 1 for blue tree
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
 * tag: 0 for red tree, 1 for blue tree
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
 * tag1: 0 for top view, 1 for side view
 * tag2: 0 for ortho view, 1 for pers view
 * output:
 * none
 * use:
 * initialize u_mvpMatrix
 */
function initMatrix(gl, cylinderProgram, tag1, tag2) {
    gl.useProgram(cylinderProgram);
    var mvpMatrix = new Matrix4();
    if (tag1 == 0) { // Top view
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-100, 100, -100, 100, -1000, 1000);
            mvpMatrix.lookAt(0, 0, 100, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
        }
        else {
            mvpMatrix.setPerspective(90, 1, 100, 1000);
            mvpMatrix.lookAt(0, 0, 200, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
        }
    }
    else { // Side
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
            mvpMatrix.lookAt(0, -200, 75, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
        }
        else {
            mvpMatrix.setPerspective(90, 1, 100, 1000);
            mvpMatrix.lookAt(0, -200, 75, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
        }
    }
}

/* initTranslation
 * input:
 * gl, cylinderProgram
 * (tx, ty): coordinates of your mouse click
 * tag: 0 for ortho view, 1 for pers view
 * 
 * The tag here is to distinguish between ortho and pers view, for I find the (tx, ty) needed for them are different.
 * I am confused, though, for I think for both views I should multiply the (tx, ty) by a scaling const, like 200.
 * But the canvas shows that for ortho I do not need to do this. idk why:-)
 */
function initTranslation(gl, cylinderProgram, tx, ty, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        gl.uniform4f(cylinderProgram.u_Translation, tx, ty, 0.0, 0.0);
    }
    else {
        gl.uniform4f(cylinderProgram.u_Translation, 200 * tx, 200 * ty, 0.0, 0.0);
    }
}