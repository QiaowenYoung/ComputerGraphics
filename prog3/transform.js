// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Color_2;\n' +
    'attribute vec3 a_Normal;\n' +        // Normal
    'uniform mat4 u_mvpMatrix;\n' +
    'uniform vec4 u_Translation;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'varying vec4 v_Color;\n' +
    'varying vec3 v_vertPos;\n' + // View Direction
    'uniform float u_shininessVal;\n' + // 20 or 5
    'uniform bool u_Clicked;\n' + // Mouse is pressed
    'uniform mat4 u_scaleMatrix;\n' + // scale
    'uniform mat4 u_rotateMatrix_x;\n' + // rotate by x axis
    'uniform mat4 u_rotateMatrix_z;\n' + // rotate by z axis
    'void main() {\n' +
    '  vec4 v_vertPos4 = u_mvpMatrix * u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position;\n' +
    '  v_vertPos = vec3(v_vertPos4) / v_vertPos4.w;\n' +
    '  gl_Position = u_mvpMatrix * u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation;\n' +
    // Make the length of the normal 1.0
    '  vec3 normal = normalize((u_rotateMatrix_x * u_rotateMatrix_z * vec4(a_Normal,0.0)).xyz);\n' +
    // Dot product of the light direction and the orientation of a surface (the normal)
    '  float nDotL = max(dot(u_LightDirection, normal), 0.0);\n' +
    // Calculate the color due to diffuse reflection
    '  vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    // Calculate specular
    '  float specular = 0.0;\n' +
    '  if(nDotL > 0.0) {\n' +
    '    vec3 R = reflect(-u_LightDirection, normal);\n' +
    '    vec3 V = normalize(-v_vertPos);\n' +
    '    float specAngle = max(dot(R, V), 0.0);\n' +
    '    specular = pow(specAngle, u_shininessVal);\n' +
    '  }\n' +
    '  v_Color = vec4(diffuse + vec3(1.0, 1.0, 1.0) * vec3(1.0, 1.0, 1.0) * specular, a_Color.a);\n' +
    '  if (u_Clicked) {\n' + //  Draw in the selected color if mouse is pressed
    '    v_Color = a_Color_2;\n' +
    '  }\n' +
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

var map = []; // each element contains a point
var count = 0; // # of total trees
var selected = []; // current selected tree
var offx1, offy1;
var offx2, offy2;
var x0, y0;
var isMoving = 0;
var isRotating = 0;
var isUp = 0;

var scale = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

var rotate_x = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

var rotate_z = new Float32Array([
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

// toggle1: 0 for top view, 1 for side view
// toggle2: 0 for ortho view, 1 for pers view
// toggle3: 0 for flat, 1 for smooth, 2 for wireframe
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
    cylinderProgram.a_Color_2 = gl.getAttribLocation(cylinderProgram, 'a_Color_2');
    cylinderProgram.a_Normal = gl.getAttribLocation(cylinderProgram, 'a_Normal');
    cylinderProgram.u_mvpMatrix = gl.getUniformLocation(cylinderProgram, 'u_mvpMatrix');
    cylinderProgram.u_Translation = gl.getUniformLocation(cylinderProgram, 'u_Translation');
    cylinderProgram.u_LightColor = gl.getUniformLocation(cylinderProgram, 'u_LightColor');
    cylinderProgram.u_LightDirection = gl.getUniformLocation(cylinderProgram, 'u_LightDirection');
    cylinderProgram.u_shininessVal = gl.getUniformLocation(cylinderProgram, 'u_shininessVal');
    cylinderProgram.u_Clicked = gl.getUniformLocation(cylinderProgram, 'u_Clicked');
    cylinderProgram.u_rotateMatrix_x = gl.getUniformLocation(cylinderProgram, 'u_rotateMatrix_x');
    cylinderProgram.u_rotateMatrix_z = gl.getUniformLocation(cylinderProgram, 'u_rotateMatrix_z');
    cylinderProgram.u_scaleMatrix = gl.getUniformLocation(cylinderProgram, 'u_scaleMatrix');

    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Color_2 < 0 ||
        cylinderProgram.a_Normal < 0 || cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 ||
        cylinderProgram.u_Translation < 0 || cylinderProgram.u_LightColor < 0 || cylinderProgram.u_LightDirection < 0 ||
        cylinderProgram.u_shininessVal < 0 || cylinderProgram.u_Clicked < 0 || cylinderProgram.u_rotateMatrix_x < 0 ||
        cylinderProgram.u_rotateMatrix_z < 0 || cylinderProgram.u_scaleMatrix < 0) {
        console.log('Failed to locate variables for cylinder');
        return -1;
    }
    /* end */

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    canvas.onmousedown = function (ev) {
        if (selected.length != 0 && ev.button == 0) {
            console.log('translation: mousedown');
            isMoving = 1;
            var x = ev.clientX; // x coordinate of a mouse pointer
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            offx1 = x;
            offy1 = y;
            x0 = x;
            y0 = y;
        }
        else if (selected.length != 0 && ev.button == 2) {
            console.log('rotate: mousedown');
            isRotating = 1;
            var x = ev.clientX; // x coordinate of a mouse pointer
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            offx2 = x;
            offy2 = y;
        }
        else if (ev.which == 2) { // middle clickdown
            console.log('middle click');
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            offz = y;
            y1 = y;
            isUp = 1;
        }
        else {
            console.log('left click');
            redraw(ev, gl, canvas, cylinderProgram);
        }
    };

    canvas.onmousemove = function (ev) {
        if (isMoving) {
            console.log('translation: mousemove');
            var x = ev.clientX; // x coordinate of a mouse pointer
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            selected[2] += x - offx1;
            selected[3] += y - offy1;
            offx1 = x;
            offy1 = y;
            draw(gl, cylinderProgram);
        }
        if (isRotating == 1) {
            console.log('rotation: mousemove');
            var x = ev.clientX; // x coordinate of a mouse pointer
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            if (Math.abs(x - offx2) == Math.abs(y - offy2)) {
                isRotating = 1;
            }
            else if (Math.abs(x - offx2) < Math.abs(y - offy2)) { // rotate by x
                selected[6] = selected[6] - 2 * Math.PI * (y - offy2);
                isRotating = 2;
            }
            else if (Math.abs(x - offx2) > Math.abs(y - offy2)) { // rotate by z
                selected[7] = selected[7] + 2 * Math.PI * (x - offx2);
                isRotating = 3;
            }
            offx2 = x;
            offy2 = y;
            draw(gl, cylinderProgram);
        }
        else if(isRotating == 2){
            console.log('rotation: mousemove, rotate by x axis');
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            selected[6] = selected[6] + 2 * Math.PI * (y - offy2);
            offy2 = y;
            draw(gl, cylinderProgram);
        }
        else if(isRotating == 3) {
            console.log('rotation: mousemove, rotate by z axis');
            var x = ev.clientX; // x coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            selected[7] = selected[7] - 2 * Math.PI * (x - offx2);
            offx2 = x;
            draw(gl, cylinderProgram);
        }
    }

    canvas.onmouseup = function (ev) {
        if (ev.button == 0 && selected.length != 0 && isMoving == 1) {
            console.log('translation: mouseup');
            isMoving = 0;
            var x = ev.clientX; // x coordinate of a mouse pointer
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            selected[2] += x - offx1;
            selected[3] += y - offy1;
            offx1 = x;
            offy1 = y;
            if(x0 == x && y0 == y) {
                redraw(ev, gl, canvas, cylinderProgram);
            }
            else{
                draw(gl, cylinderProgram);
            }
        }
        else if (ev.button == 2 && selected.length != 0 && isRotating != 0) {
            console.log('rotation: mouseup');
            var x = ev.clientX; // x coordinate of a mouse pointer
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            if(isRotating == 2){
                selected[6] = selected[6] + 2 * Math.PI * (y - offy2);
                offy2 = y;
            }
            else if(isRotating == 3) {
                selected[7] = selected[7] - 2 * Math.PI * (x - offx2);
                offx2 = x;
            }
            isRotating = 0;
            draw(gl, cylinderProgram);
        }
        else if (ev.which == 2 && selected.length != 0 && isUp == 1) {
            console.log('middle up');
            var y = ev.clientY; // y coordinate of a mouse pointer
            var rect = ev.target.getBoundingClientRect();

            y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
            selected[4] += (offz - y) / 200;
            offz = y;
            isUp = 0;
            draw(gl, cylinderProgram);
        }
    }

    document.onmousewheel = function (ev) {
        var d = ev.wheelDelta;
        if (selected.length != 0) {
            console.log('scaling');
            selected[5] = selected[5] + selected[5] * d / 5000;
        }
        draw(gl, cylinderProgram);
    };

    var checkbox1 = document.getElementById('toggle1');
    checkbox1.addEventListener('change', function () {
        if (checkbox1.checked) {
            toggle1 = 1;
            draw(gl, cylinderProgram);
        } else {
            toggle1 = 0;
            draw(gl, cylinderProgram);
        }
    });

    var checkbox2 = document.getElementById('toggle2');
    checkbox2.addEventListener('change', function () {
        if (checkbox2.checked) {
            toggle2 = 1;
            draw(gl, cylinderProgram);
        } else {
            toggle2 = 0;
            draw(gl, cylinderProgram);
        }
    });

    draw(gl, cylinderProgram);

    var rad = document.form.tree;
    rad[0].addEventListener('change', function () {
        toggle3 = 0;
        draw(gl, cylinderProgram);
    });
    rad[1].addEventListener('change', function () {
        toggle3 = 1;
        draw(gl, cylinderProgram);
    });
    rad[2].addEventListener('change', function () {
        toggle3 = 2;
        draw(gl, cylinderProgram);
    });

    var submit = document.getElementById('submit');
    submit.addEventListener('click', function () {
        draw(gl, cylinderProgram);
        // Change radio value based on the import
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
            rad[0].checked = true;
        }
        else if (toggle3 == 1) {
            rad[1].checked = true;
        }
        else {
            rad[2].checked = true;
        }
    });
}

/* redraw
 * input:
 * ev, gl, cylinderProgram
 * output:
 * none
 * use:
 * redraw the scene after a shift+click
 */
function redraw(ev, gl, canvas, cylinderProgram) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = x - rect.left;
    y = rect.bottom - y;
    for (var i = 0; i < count; i++) {
        // redraw all the trees using different colors
        var newmap = map[i];
        var color = newmap[0] / 255.0;
        var s = newmap[6];
        scale = new Float32Array([
            s, 0.0, 0.0, 0.0,
            0.0, s, 0.0, 0.0,
            0.0, 0.0, s, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        var c_x = Math.cos(newmap[7]);
        var s_x = Math.sin(newmap[7]);
        rotate_x = new Float32Array([
            1.0, 0.0, 0.0, 0.0,
            0.0, c_x, -s_x, 0.0,
            0.0, s_x, c_x, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        var c_z = Math.cos(newmap[8]);
        var s_z = Math.sin(newmap[8]);
        rotate_z = new Float32Array([
            c_z, -s_z, 0.0, 0.0,
            s_z, c_z, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            0.0, 0.0, 0.0, 1.0
        ]);

        gl.useProgram(cylinderProgram);
        initPositions(gl, cylinderProgram, newmap[2]);
        initColors(gl, cylinderProgram, newmap[2]);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, toggle1, toggle2);
        initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5], toggle2);
        initGloss(gl, cylinderProgram, newmap[2]);
        initNormals(gl, cylinderProgram, newmap[2], 0);
        gl.uniform1i(cylinderProgram.u_Clicked, 1);
        gl.vertexAttrib4f(cylinderProgram.a_Color_2, color, 0.0, 0.0, 1.0);
        initScale(gl, cylinderProgram);
        initRotate(gl, cylinderProgram);
        var len;
        if (newmap[2] == 0) {
            len = cylinderl.length / 3;
        }
        else {
            len = cylinderr.length / 3;
        }
        if (toggle3 == 0) { // Flat shading
            initNormals(gl, cylinderProgram, newmap[2], 0);
            gl.drawArrays(gl.TRIANGLES, 0, len);
        }
        else if (toggle3 == 1) { // smooth
            initNormals(gl, cylinderProgram, newmap[2], 1);
            gl.drawArrays(gl.TRIANGLES, 0, len);
        }
        else if (toggle3 == 2) { // wireframe using flat shading normals
            initNormals(gl, cylinderProgram, newmap[2], 0);
            gl.drawArrays(gl.LINES, 0, len);
        }
    }

    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (pixels[0] + pixels[1] + pixels[2] + pixels[3] == 1020) {
        // click on blank, need to check current tree and store its status back to map
        if (selected.length != 0) {
            var newmap = map[selected[0]]; // get the selected tree in map
            // update selected tree's status
            map[selected[0]] = [];
            newmap[1] = 0;
            newmap[3] = selected[2]; // update x
            newmap[4] = selected[3]; // update y
            newmap[5] = selected[4]; // update z
            newmap[6] = selected[5]; // update scaling factor
            newmap[7] = selected[6]; // update rotational angle by x axis
            newmap[8] = selected[7]; // update rotational angle by z axis
            map[selected[0]] = newmap;
            selected = [];
        }
        else {
            console.log('create a tree')
            click(ev, gl, canvas, cylinderProgram);
        }
    }

    if (selected.length == 0) { // no other tree currently selected
        for (var i = 0; i < count; i++) {
            var newmap = map[i];
            if (pixels[0] == newmap[0] && pixels[0] + pixels[1] + pixels[2] + pixels[3] != 1020) { // get the clicked tree's info
                console.log('select a tree');
                selected.push(i); // id in map
                selected.push(newmap[2]); // left or right
                selected.push(newmap[3]); // x
                selected.push(newmap[4]); // y
                selected.push(newmap[5]); // z
                selected.push(newmap[6]); // scaling factor
                selected.push(newmap[7]); // rotational angle by x axis
                selected.push(newmap[8]); // rotational angle by z axis
                newmap[1] = 1; // currently selected
                map[i] = [];
                map[i] = newmap;
                break;
            }
        }
    }
    draw(gl, cylinderProgram);
}

function draw(gl, cylinderProgram) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < count; i++) {
        var newmap = map[i];
        if (newmap[1] == 0) {
            var s = newmap[6];
            scale = new Float32Array([
                s, 0.0, 0.0, 0.0,
                0.0, s, 0.0, 0.0,
                0.0, 0.0, s, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);

            var c_x = Math.cos(newmap[7]);
            var s_x = Math.sin(newmap[7]);
            rotate_x = new Float32Array([
                1.0, 0.0, 0.0, 0.0,
                0.0, c_x, -s_x, 0.0,
                0.0, s_x, c_x, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);

            var c_z = Math.cos(newmap[8]);
            var s_z = Math.sin(newmap[8]);
            rotate_z = new Float32Array([
                c_z, -s_z, 0.0, 0.0,
                s_z, c_z, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);

            gl.useProgram(cylinderProgram);
            gl.uniform1i(cylinderProgram.u_Clicked, 0);
            initPositions(gl, cylinderProgram, newmap[2]);
            initColors(gl, cylinderProgram, newmap[2]);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5], toggle2);
            initGloss(gl, cylinderProgram, newmap[2]);
            initScale(gl, cylinderProgram);
            initRotate(gl, cylinderProgram);
            var len;
            if (newmap[2] == 0) {
                len = cylinderl.length / 3;
            }
            else {
                len = cylinderr.length / 3;
            }
            if (toggle3 == 0) { // Flat shading
                initNormals(gl, cylinderProgram, newmap[2], 0);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 1) { // smooth
                initNormals(gl, cylinderProgram, newmap[2], 1);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 2) { // wireframe using flat shading normals
                initNormals(gl, cylinderProgram, newmap[2], 0);
                gl.drawArrays(gl.LINES, 0, len);
            }
        }
        else { // current tree is being selected
            var s = selected[5];
            scale = new Float32Array([
                s, 0.0, 0.0, 0.0,
                0.0, s, 0.0, 0.0,
                0.0, 0.0, s, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);
            var c_x = Math.cos(selected[6]);
            var s_x = Math.sin(selected[6]);
            rotate_x = new Float32Array([
                1.0, 0.0, 0.0, 0.0,
                0.0, c_x, -s_x, 0.0,
                0.0, s_x, c_x, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);

            var c_z = Math.cos(selected[7]);
            var s_z = Math.sin(selected[7]);
            rotate_z = new Float32Array([
                c_z, -s_z, 0.0, 0.0,
                s_z, c_z, 0.0, 0.0,
                0.0, 0.0, 1.0, 0.0,
                0.0, 0.0, 0.0, 1.0
            ]);

            gl.useProgram(cylinderProgram);
            gl.uniform1i(cylinderProgram.u_Clicked, 0);
            initPositions(gl, cylinderProgram, selected[1]);
            gl.vertexAttrib4f(cylinderProgram.a_Color, 0.0, 1.0, 0.0, 1.0);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            initTranslation(gl, cylinderProgram, selected[2], selected[3], selected[4], toggle2);
            gl.uniform1f(cylinderProgram.u_shininessVal, 1.0);
            initScale(gl, cylinderProgram);
            initRotate(gl, cylinderProgram)
            var len;
            if (selected[1] == 0) {
                len = cylinderl.length / 3;
            }
            else {
                len = cylinderr.length / 3;
            }
            if (toggle3 == 0) { // Flat shading
                initNormals(gl, cylinderProgram, selected[1], 0);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 1) { // smooth
                initNormals(gl, cylinderProgram, selected[1], 1);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 2) { // wireframe using flat shading normals
                initNormals(gl, cylinderProgram, selected[1], 0);
                gl.drawArrays(gl.LINES, 0, len);
            }
            var newmap = map[selected[0]]; // get the selected tree in map
            // update selected tree's status
            map[selected[0]] = [];
            newmap[1] = 1;
            newmap[3] = selected[2]; // update x
            newmap[4] = selected[3]; // update y
            newmap[5] = selected[4]; // update z
            newmap[6] = selected[5]; // update scaling factor
            newmap[7] = selected[6]; // update rotational angle by x axis
            newmap[8] = selected[7]; // update rotational angle by z axis
            map[selected[0]] = newmap;
        }
    }
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
    var v = [];
    arr.push(toggle1);
    arr.push(toggle2);
    arr.push(toggle3);
    arr.push(count);
    for (var i = 0; i < count; i++) {
        var newmap = map[i];
        v.push(newmap[0]);
        v.push(newmap[1]);
        v.push(newmap[2]);
        v.push(newmap[3]);
    }
    arr = arr.concat(v);
    arr = arr.concat(tree);
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
        count = arr[3];
        map = [];
        var i;
        for (i = 4; i < 4 + count * 4; i += 4) {
            var newmap = [];
            newmap.push(arr[i]);
            newmap.push(arr[i + 1]);
            newmap.push(arr[i + 2]);
            newmap.push(arr[i + 3]);
            map.push(newmap);
        }
        tree = [];
        for (; i < arr.length; i++) {
            tree.push(arr[i]);
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
        var newmap = [];
        newmap.push((26 * count++) % 255); // color.r
        newmap.push(0); // 0 indicates that the point has not been clicked
        newmap.push(0); // left click
        newmap.push(x); // x
        newmap.push(y); // y
        newmap.push(0.0); // z
        newmap.push(1.0); // Scaling factor
        newmap.push(0.0); // rotational angle by x axis
        newmap.push(0.0); // rotational angle by z axis
        map.push(newmap);
    }
    else if (ev.button === 2) {
        var newmap = [];
        newmap.push((26 * count++) % 255); // color.r
        newmap.push(0); // 0 indicates that the point has not been clicked
        newmap.push(1); // right click
        newmap.push(x); // x
        newmap.push(y); // y
        newmap.push(0.7); // z
        newmap.push(1.0); // Scaling factor
        newmap.push(0.0); // rotational angle by x axis
        newmap.push(0.0); // rotational angle by z axis
        map.push(newmap);
    }
    draw(gl, cylinderProgram);
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
 * tag1: 0 for red tree, 1 for blue tree
 * tag2: 0 for flat shading normals, 1 for smooth shading normals
 * output:
 * none
 * use:
 * initialize a_Normal
 */
function initNormals(gl, cylinderProgram, tag1, tag2) {
    gl.useProgram(cylinderProgram);
    if (tag1 == 0) {
        if (tag2 == 0) {
            var normals = new Float32Array(nnl);
            // Create a buffer to put normals in
            var normalBuffer = gl.createBuffer();
            if (!normalBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
            gl.vertexAttribPointer(cylinderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
            // Turn on the normal attribute
            gl.enableVertexAttribArray(cylinderProgram.a_Normal);
        }
        else {
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
            gl.vertexAttribPointer(cylinderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
            // Turn on the normal attribute
            gl.enableVertexAttribArray(cylinderProgram.a_Normal);
        }
    }
    else {
        if (tag2 == 0) {
            var normals = new Float32Array(nnr);
            // Create a buffer to put normals in
            var normalBuffer = gl.createBuffer();
            if (!normalBuffer) {
                console.log('Failed to create the buffer object');
                return -1;
            }
            // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
            gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
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
            gl.vertexAttribPointer(cylinderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
            // Turn on the normal attribute
            gl.enableVertexAttribArray(cylinderProgram.a_Normal);
        }
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
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
            mvpMatrix.lookAt(0, 0, 200, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
        }
        else {
            mvpMatrix.setPerspective(90, 1, 1, 1000);
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
            mvpMatrix.setPerspective(90, 1, 1, 1000);
            mvpMatrix.lookAt(0, -200, 75, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
        }
    }
}

/* initTranslation
 * input:
 * gl, cylinderProgram
 * (tx, ty, tz): translation offset
 * tag: 0 for ortho view, 1 for pers view
 * output:
 * none
 * use:
 * use (tx, ty, tz) to initialize u_Translation in shader
 */
function initTranslation(gl, cylinderProgram, tx, ty, tz, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        gl.uniform4f(cylinderProgram.u_Translation, tx, ty, tz, 0.0);
    }
    else {
        gl.uniform4f(cylinderProgram.u_Translation, 200 * tx, 200 * ty, 200 * tz, 0.0);
    }
}

/* initGloss
 * input:
 * gl, cylinderProgram
 * tag: 0 for red trees, 1 for blue trees
 * output:
 * none
 * use:
 * use 5.0 or 20.0 for cylinderProgram.u_shininessVal
 */
function initGloss(gl, cylinderProgram, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        gl.uniform1f(cylinderProgram.u_shininessVal, 5.0);
    }
    else {
        gl.uniform1f(cylinderProgram.u_shininessVal, 20.0);
    }
}

function initScale(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    gl.uniformMatrix4fv(cylinderProgram.u_scaleMatrix, false, scale);
}

/* initRotate
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * use arrays rotate_x and rotate_z to initialize rotational matrix in shaders
 */
function initRotate(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    gl.uniformMatrix4fv(cylinderProgram.u_rotateMatrix_x, false, rotate_x);
    gl.uniformMatrix4fv(cylinderProgram.u_rotateMatrix_z, false, rotate_z);
}