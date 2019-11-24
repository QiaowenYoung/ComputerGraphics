// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec4 a_Color_2;\n' +
    'attribute vec3 a_Normal;\n' +        // Normal
    'uniform mat4 u_NormalMatrix;\n' +   // Transformation matrix of the normal
    'uniform mat4 u_mvpMatrix;\n' +
    'uniform vec4 u_Translation;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'uniform vec3 u_LightPos;\n' + // Point light position
    'varying vec4 v_Color;\n' +
    'varying vec3 v_vertPos;\n' + // View Direction
    'uniform float u_shininessVal;\n' + // 20 or 5
    'uniform bool u_Clicked;\n' + // Mouse is pressed
    'uniform bool u_LightOff;\n' + // Turn on/off the point lighting
    'uniform mat4 u_scaleMatrix;\n' + // scale
    'uniform mat4 u_rotateMatrix_x;\n' + // rotate by x axis
    'uniform mat4 u_rotateMatrix_z;\n' + // rotate by z axis
    'uniform bool u_isTree;\n' + // to choose between drawing tree and drawing sphere
    'void main() {\n' +
    '   if(u_isTree) {\n' + // draw trees
    '       vec4 v_vertPos4 = u_mvpMatrix * u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position;\n' +
    '       v_vertPos = vec3(v_vertPos4) / v_vertPos4.w;\n' + // view direction
    '       gl_Position = u_mvpMatrix * u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation;\n' +
    // Make the length of the normal 1.0
    '       vec3 normal = normalize((u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * vec4(a_Normal,0.0)).xyz);\n' +
    // Dot product of the light direction and the orientation of a surface (the normal)
    '       float nDotL = max(dot(normalize(u_LightDirection), normal), 0.0);\n' +
    // Calculate the color due to diffuse reflection
    '       vec3 diffuse = u_LightColor * a_Color.rgb * nDotL;\n' +
    // Calculate specular
    '       float specular = 0.0;\n' +
    '       if(nDotL > 0.0) {\n' +
    '           vec3 R = reflect(-normalize(u_LightDirection), normal);\n' +
    '           vec3 V = normalize(-v_vertPos);\n' +
    '           float specAngle = max(dot(R, V), 0.0);\n' +
    '           specular = pow(specAngle, u_shininessVal);\n' +
    '       }\n' +
    '       vec3 s = vec3(1.0, 1.0, 1.0) * vec3(1.0, 1.0, 1.0) * specular;\n' +

    // Point light
    '       vec3 lightDirection2 = normalize(u_LightPos - vec3(u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation));\n' +
    '       vec3 normal2 = normalize((u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * vec4(a_Normal,0.0) + u_Translation).xyz);\n' +
    '       v_vertPos4 = u_mvpMatrix * u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation;\n' +
    '       v_vertPos = vec3(v_vertPos4) / v_vertPos4.w;\n' + // view direction
    '       float nDotL2 = max(dot(lightDirection2, normal2), 0.0);\n' +
    '       vec3 diffuse2 = vec3(0.5, 0.5, 1) * a_Color.rgb * nDotL2;\n' +
    '       float specular2 = 0.0;\n' +
    '       if(nDotL2 > 0.0) {\n' +
    '           vec3 R2 = reflect(-lightDirection2, normal);\n' +
    '           vec3 V2 = normalize(-v_vertPos);\n' +
    '           float specAngle2 = max(dot(R2, V2), 0.0);\n' +
    '           specular2 = pow(specAngle2, u_shininessVal);\n' +
    '       }\n' +
    '       vec3 s2 = vec3(0.5, 0.5, 1.0) * vec3(1.0, 1.0, 1.0) * specular2;\n' +

    '       v_Color = vec4(diffuse + s, a_Color.a);\n' +

    '       if (!u_LightOff) {\n' + // u_LightOff == 0, meaning that the light is turned on
    '           v_Color = vec4(diffuse + diffuse2 + s + s2, a_Color.a);\n' +
    '       }\n' +

    '       if (u_Clicked) {\n' + //  Draw in the selected color if mouse is pressed
    '           v_Color = a_Color_2;\n' +
    '       }\n' +
    '   }\n' +

    '   else {\n' + // draw sphere
    '       vec4 color = vec4(1.0, 1.0, 0.0, 1.0);\n' + // Sphere color
    '       if (u_LightOff) {\n' +
    '           color = vec4(0.5, 0.5, 0.0, 1.0);\n' + // if turned off, make it a little darker
    '       }\n' +
    '       gl_Position = u_mvpMatrix * a_Position + u_Translation;\n' +
    // Calculate a normal to be fit with a model matrix, and make it 1.0 in length
    '       vec3 normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal, 0.0)));\n' +
    // Calculate the light direction and make it 1.0 in length
    '       vec3 lightDirection = normalize(u_LightDirection);\n' +
    // The dot product of the light direction and the normal
    '       float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    // Calculate the color due to diffuse reflection
    '       vec3 diffuse = u_LightColor * color.rgb * nDotL;\n' +
    '       float specular = 0.0;\n' +
    '       if(nDotL > 0.0) {\n' +
    '           vec3 R = reflect(-lightDirection, normal);\n' +
    '           vec3 V = normalize(-vec3(u_mvpMatrix * a_Position));\n' +
    '           float specAngle = max(dot(R, V), 0.0);\n' +
    '           specular = pow(specAngle, 20.0);\n' +
    '       }\n' +
    '       vec3 s = vec3(1.0, 1.0, 1.0) * vec3(1.0, 1.0, 1.0) * specular;\n' +

    '       v_Color = vec4(diffuse + s, color.a);\n' +

    '       if (u_Clicked) {\n' +
    '           v_Color = a_Color_2;\n' +
    '       }\n' +
    '   }\n' +
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

/* map
 * each element in map is an array, storing info of a tree
 * for each array in map:
 * array[0]: color.r
 * 1: is/isn't being clicked
 * 2: red/blue tree
 * 3: x
 * 4: y
 * 5: z
 * 6: scaling factor
 * 7: rotational angle by x axis
 * 8: rotational angle by z axis
 */
var map = [];
var count = 0; // # of total trees

/* selected
 * contains the selected tree's info
 * selected[0]: the tree's id in map
 * 1: red/blue tree
 * 2: x
 * 3: y
 * 4: z
 * 5: scaling factor
 * 6: rotational angle by x axis
 * 7: rotational angle by z axis
 */
var selected = [];
var offx1, offy1; // offset used when translate
var offx2, offy2; // offset used when rotate
var offz; // offset used when translate in the z direction
var x0, y0; // original coord of a tree, used in translation
var isMoving = 0; // represent whether you are doing a translation op
var isRotating = 0; // whether you are rotating a tree
var isUp = 0; // whether you are translating the tree in the z direction
var zooming = 0.0; // zoom in/out
var camera1 = 0.0; // camera1 position
var camera2 = 1.0; // camera2 position
var isCamera = 0; // whether you are changing camera's position
var isPanning = 0;
var Transx, Transy;
var panx = 0, pany = 0;
var isDb = 0;
var isE = 0;

var scale = new Float32Array([ // scaling matrix
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

var rotate_x = new Float32Array([ // rotational matrix: by x axis
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

var rotate_z = new Float32Array([ // rotational matrix: by z axis
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
]);

// toggle1: 0 for top view, 1 for side view
// toggle2: 0 for ortho view, 1 for pers view
// toggle3: 0 for flat, 1 for smooth, 2 for wireframe
var toggle1 = 0, toggle2 = 0, toggle3 = 0;

var positions = []; // positions of points on the sphere
var indices = []; // indices of sphere points
var colora = 255; // the rgba.a component of the sphere, useful when picking
var selected_s = [0.0, 0.0]; // the xy offset of sphere
var is_selected_s = 0; // 0: sphere is not selected, 1: sphere is selected
var isMoving_s = 0; // 0: sphere is not moving, 1: sphere is moving
var offxs, offys; // offset used when translating sphere
var xs0, ys0; // offset used when translating sphere
var is_clicked_s = 0; // 0: sphere is not clicked, 1: sphere is clicked

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
    cylinderProgram.u_LightOff = gl.getUniformLocation(cylinderProgram, 'u_LightOff');
    cylinderProgram.u_rotateMatrix_x = gl.getUniformLocation(cylinderProgram, 'u_rotateMatrix_x');
    cylinderProgram.u_rotateMatrix_z = gl.getUniformLocation(cylinderProgram, 'u_rotateMatrix_z');
    cylinderProgram.u_scaleMatrix = gl.getUniformLocation(cylinderProgram, 'u_scaleMatrix');
    cylinderProgram.u_NormalMatrix = gl.getUniformLocation(cylinderProgram, 'u_NormalMatrix');
    cylinderProgram.u_isTree = gl.getUniformLocation(cylinderProgram, 'u_isTree');
    cylinderProgram.u_LightPos = gl.getUniformLocation(cylinderProgram, 'u_LightPos');

    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Color_2 < 0 ||
        cylinderProgram.a_Normal < 0 || cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 ||
        cylinderProgram.u_Translation < 0 || cylinderProgram.u_LightColor < 0 || cylinderProgram.u_LightDirection < 0 ||
        cylinderProgram.u_shininessVal < 0 || cylinderProgram.u_Clicked < 0 || cylinderProgram.u_rotateMatrix_x < 0 ||
        cylinderProgram.u_rotateMatrix_z < 0 || cylinderProgram.u_scaleMatrix < 0 || cylinderProgram.u_NormalMatrix < 0 ||
        cylinderProgram.u_isTree < 0 || cylinderProgram.u_LightPos < 0 || cylinderProgram.u_LightOff < 0) {
        console.log('Failed to locate variables for cylinder');
        return -1;
    }
    /* end */

    setPositions();

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw(gl, cylinderProgram);

    canvas.ondblclick = function (ev) { // yaw
        redraw(ev, gl, canvas, cylinderProgram);
        if (selected.length != 0) { // double click on a tree
            isDb = 1;
            currentAngle = 0;
        }
        //draw(gl,cylinderProgram);
        //dbclick(gl, cylinderProgram);
        var dbclick = function () {
            draw(gl, cylinderProgram);
            requestAnimationFrame(dbclick);
        }
        dbclick();
    }

    canvas.addEventListener('keydown', dokeydown, false);
    function dokeydown(ev) {
        if (ev.keyCode == 69 && selected.length != 0 && isE == 0) {
            isE = 1;
            currentAngle = 0;
            console.log(1);
        }
        else if (ev.keyCode == 69 && selected.length != 0 && isE == 1) {
            isE = 0; // press "e" again to change view to normal mode
        }
        var presse = function () {
            draw(gl, cylinderProgram);
            requestAnimationFrame(presse);
        }
        presse();
    }

    canvas.onmousedown = function (ev) {
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
        if (selected.length != 0 && ev.button == 0) { // translation of a tree
            console.log('translation: mousedown');
            isMoving = 1;
            offx1 = x;
            offy1 = y;

            /* Save the original coord of your mouse click:
             *
             * This is to distinguish whether your click indicates deselecting a tree,
             * or translating the selected tree.
             * So, if the canvas detects that for a mousedown and a mouseup,
             * your mouse click coords are the same,
             * it means that you want to deselect the current tree.
             * Or, it means that you want to translate the current tree.
             */
            x0 = x;
            y0 = y;
            /* end */
        }
        else if (selected.length != 0 && ev.button == 2) { // rotation
            console.log('rotate: mousedown');
            isRotating = 1;
            offx2 = x;
            offy2 = y;
        }
        else if (selected.length == 0 && ev.button == 0) { // translation of the sphere or create a tree here or select a tree
            is_clicked_s = decideClickOn(ev, gl, cylinderProgram);
            if (is_clicked_s == 1) { // if the mouse is on sphere
                isMoving_s = 1; // the sphere is ready to be moved
            }
            else if (is_clicked_s == 2) { // the mouse is on blank; set camera ready to be moved
                isPanning = 1;
                Transx = x;
                Transy = y;
            }
            offxs = x;
            offys = y;
            xs0 = x;
            ys0 = y;
        }
        else if (ev.which == 2 && selected.length != 0) { // middle clickdown
            console.log('middle click');
            offz = y;
            isUp = 1;
        }
        else if (ev.which == 2 && selected.length == 0) { // middle click and scroll
            isCamera = 1;
        }
        else {
            click(ev, gl, canvas, cylinderProgram); // right click to generate blue tree
        }
    };

    canvas.onmousemove = function (ev) {
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
        if (isMoving) { // translation
            console.log('translation: mousemove');
            selected[2] += x - offx1;
            selected[3] += y - offy1;

            /* Update offx1 and offy1 every time the canvas detects a mousemove,
             * so that the translation is realtime.
             */
            offx1 = x;
            offy1 = y;
            draw(gl, cylinderProgram);
        }
        if (isMoving_s && is_clicked_s) { // translation of the sphere
            selected_s[0] += x - offxs;
            selected_s[1] += y - offys;
            offxs = x;
            offys = y;
            draw(gl, cylinderProgram);
        }
        if (isPanning) {
            /*for (var i = 0; i < count; i++) {
                var newmap = map[i];
                newmap[3] -= x - Transx;
                newmap[4] -= y - Transy;
            }*/
            panx += x - Transx;
            pany += y - Transy;
            Transx = x;
            Transy = y;
            draw(gl, cylinderProgram);
        }
        if (isUp) {
            selected[4] += (offz - y) / 5;
            offz = y;
            draw(gl, cylinderProgram);
        }
        if (isRotating == 1) { // rotation
            console.log('rotation: mousemove');
            /* Here I compare the original offsets of horizontal and vertical movement.
             * If the horizontal movement is larger than the vertical one, 
             * do a rotation by z axis.
             * Else, do a rotation by x axis.
             */
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
        else if (isRotating == 2) { // rotate by x axis
            console.log('rotation: mousemove, rotate by x axis');
            /* I multiply the movement of your mouse with 2*PI,
             * to transfer the movement into radius.
             */
            selected[6] = selected[6] + 2 * Math.PI * (y - offy2);
            offy2 = y;
            draw(gl, cylinderProgram);
        }
        else if (isRotating == 3) { // rotate by z axis
            console.log('rotation: mousemove, rotate by z axis');
            selected[7] = selected[7] - 2 * Math.PI * (x - offx2);
            offx2 = x;
            draw(gl, cylinderProgram);
        }
    }

    canvas.onmouseup = function (ev) {
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
        y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
        if (ev.button == 0 && selected.length != 0 && isMoving == 1) { // translation ends
            console.log('translation: mouseup');
            isMoving = 0;
            if (x0 == x && y0 == y) { // the click means to deselecte the tree; see explanations in line 178~186
                isDb = 0;
                isE = 0;
                redraw(ev, gl, canvas, cylinderProgram);
            }
        }
        else if (ev.button == 2 && selected.length != 0 && isRotating != 0) { // rotation ends
            console.log('rotation: mouseup');
            isRotating = 0;
        }
        else if (ev.button == 0) { // translation of the sphere ends or turn on/off the sphere or create a new tree
            isMoving_s = 0;
            isPanning = 0;
            if (xs0 == x && ys0 == y) { // click means to turn on/off the sphere or create a new tree
                redraw(ev, gl, canvas, cylinderProgram);
            }
        }
        else if (ev.which == 2 && selected.length != 0 && isUp == 1) { // translation in z direction ends
            console.log('middle up');
            isUp = 0;
        }
        else if (ev.which == 2 && selected.length == 0 && isCamera == 1) {
            console.log('camera moving end');
            isCamera = 0;
        }
    }

    document.onmousewheel = function (ev) { // scaling
        var d = ev.wheelDelta;
        if (selected.length != 0) {
            console.log('scaling');
            selected[5] = selected[5] - selected[5] * d / 5000;
        }
        else if (isCamera) { // move camera
            console.log('camera moving');
            if (toggle1 == 0) { // top view
                camera1 = camera1 + d / 200;
            }
            else {
                camera2 = camera2 - camera2 * d / 5000;
                if (camera2 <= 0.001) {
                    camera2 = 0.001;
                }
            }
        }
        else { // zooming
            console.log('zooming');
            zooming = zooming + d / 200;
            /* The following modifications are to avoid scenes that are above common sense.
             * After the fov goes beyond (0, 180], the trees will be transformed reversely.
             * For example, if you zoom in too much, without modifications to fov, 
             * trees will be zoomed out due to fov out of reasonable range.
             */
            if (90 + zooming <= 0) {
                zooming = -89;
            }
            if (90 + zooming >= 180) {
                zooming = 90;
            }
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

function decideClickOn(ev, gl, cylinderProgram) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    var tag = 0;
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
        initLightPos(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, toggle1, toggle2);
        initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5], toggle2);
        initGloss(gl, cylinderProgram, newmap[2]);
        initNormals(gl, cylinderProgram, newmap[2], 0);
        gl.uniform1i(cylinderProgram.u_Clicked, 1);
        gl.uniform1i(cylinderProgram.u_isTree, 1); // draw trees
        gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
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
    drawSphere(gl, cylinderProgram);

    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (pixels[0] + pixels[1] + pixels[2] + pixels[3] == 1020) { // click on blank
        tag = 2;
    }
    if (pixels[0] + pixels[1] + pixels[2] + pixels[3] != 1020) { // click on tree or sphere
        if (pixels[0] == 255) { // click on sphere
            tag = 1;
        }
    }
    draw(gl, cylinderProgram);
    return tag; // 0: tree, 1: sphere, 2: blank
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
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);
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
        initLightPos(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, toggle1, toggle2);
        initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5], toggle2);
        initGloss(gl, cylinderProgram, newmap[2]);
        initNormals(gl, cylinderProgram, newmap[2], 0);
        gl.uniform1i(cylinderProgram.u_Clicked, 1);
        gl.uniform1i(cylinderProgram.u_isTree, 1); // draw trees
        gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
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
    drawSphere(gl, cylinderProgram);

    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    if (pixels[0] + pixels[1] + pixels[2] + pixels[3] == 1020) {
        is_clicked_s = 0;
        // click on blank, need to check current tree and store its status back to map
        if (selected.length != 0) { // deselect a tree
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

    else { // click on tree or sphere
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
            if (selected.length != 0) {
                is_clicked_s = 0;
            }
            if (selected.length == 0) { // click is not on a tree, but on the sphere
                is_clicked_s = 1;
                if (is_selected_s == 0) {
                    console.log('turn off the light');
                    is_selected_s = 1;
                }
                else {
                    console.log('turn on the light');
                    is_selected_s = 0;
                }
            }
        }
    }
    draw(gl, cylinderProgram);
}

function draw(gl, cylinderProgram) {
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    initMatrix(gl, cylinderProgram, toggle1, toggle2);
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
            gl.uniform1i(cylinderProgram.u_isTree, 1);
            gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
            initPositions(gl, cylinderProgram, newmap[2]);
            initColors(gl, cylinderProgram, newmap[2]);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initLightPos(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            if (isDb) {
                initMatrix2(gl, cylinderProgram);
            }
            if (isE) {
                initMatrix3(gl, cylinderProgram);
            }
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
        else if (isDb == 0) { // the tree is being selected and not yaw
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
            gl.uniform1i(cylinderProgram.u_isTree, 1);
            gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
            initPositions(gl, cylinderProgram, selected[1]);
            gl.vertexAttrib4f(cylinderProgram.a_Color, 0.0, 1.0, 0.0, 1.0);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initLightPos(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            if (isE) {
                initMatrix3(gl, cylinderProgram);
            }
            initTranslation(gl, cylinderProgram, selected[2], selected[3], selected[4], toggle2);
            gl.uniform1f(cylinderProgram.u_shininessVal, 1.0);
            initScale(gl, cylinderProgram);
            initRotate(gl, cylinderProgram);
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
    drawSphere(gl, cylinderProgram);
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
    arr.push(is_selected_s);
    arr = arr.concat(selected_s);
    for (var i = 0; i < count; i++) {
        var newmap = map[i];
        for (var j = 0; j < 9; j++) {
            v.push(newmap[j]);
        }
    }
    arr = arr.concat(v);
    arr = arr.concat(selected);
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
        is_selected_s = arr[4];
        selected_s = [];
        selected_s.push(arr[5]);
        selected_s.push(arr[6]);
        map = [];
        var i;
        for (i = 7; i < 7 + count * 9; i += 9) {
            var newmap = [];
            for (var j = 0; j < 9; j++) {
                newmap.push(arr[i + j]);
            }
            map.push(newmap);
        }
        selected = [];
        for (; i < arr.length; i++) {
            selected.push(arr[i]);
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
        newmap.push(0.0); // z
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

/* initLightPos
 * input:
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize cylinderProgram.u_LightPos using the point light's (x, y) coordinates
 */
function initLightPos(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);

    /* lightPos[0] and lightPos[1] store the (x, y) coordinates of the light source
     * I need to multiply them with the canvas's dimensions to make the light position right.
     */
    var lightPos = new Vector3([-100 + 200 * selected_s[0], -100 + 200 * selected_s[1], 0]);
    gl.uniform3fv(cylinderProgram.u_LightPos, lightPos.elements);
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
        }
        else {
            mvpMatrix.setPerspective(90 + zooming, 1, 100, 1000);
        }
        mvpMatrix.lookAt(200 * panx, 200 * pany, 200 + camera1, 200 * panx, 200 * pany, 0, 0, 1, 0);
    }
    else { // Side
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        }
        else {
            mvpMatrix.setPerspective(90 + zooming, 1, 100, 1000);
        }
        mvpMatrix.lookAt(200 * panx, -200 / camera2 + 200 * pany, 75 / camera2, 200 * panx, 200 * pany, 0, 0, 1, 0);
    }
    gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
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

/* initScale
 * input: 
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize cylinderProgram.u_scaleMatrix using the array "scale" (line133)
 */
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

function drawSphere(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);

    // Set the vertex coordinates and the normal
    var n = initVertexBuffers(gl, cylinderProgram);
    if (n < 0) {
        console.log('Failed to set the vertex information');
        return;
    }

    gl.uniform1i(cylinderProgram.u_isTree, 0);
    gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
    gl.uniform3f(cylinderProgram.u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(cylinderProgram.u_LightDirection, 1.0, 1.0, 1.0);
    gl.vertexAttrib4f(cylinderProgram.a_Color_2, colora, 0.0, 0.0, 1.0);

    var modelMatrix = new Matrix4();  // Model matrix
    var normalMatrix = new Matrix4(); // Transformation matrix for normals

    // Calculate the view projection matrix
    if (toggle2 == 0) { // ortho view
        gl.uniform4f(cylinderProgram.u_Translation, -0.5 + selected_s[0], -0.5 + selected_s[1], 0, 0);
    }
    else { // top + pers
        gl.uniform4f(cylinderProgram.u_Translation, -100 + 200 * selected_s[0], -100 + 200 * selected_s[1], 0, 0);
    }

    // Calculate the matrix to transform the normal based on the model matrix
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    // Pass the transformation matrix for normals to u_NormalMatrix
    gl.uniformMatrix4fv(cylinderProgram.u_NormalMatrix, false, normalMatrix.elements);

    // Draw the cube(Note that the 3rd argument is the gl.UNSIGNED_SHORT)
    gl.drawElements(gl.TRIANGLES, n, gl.UNSIGNED_SHORT, 0);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
}

function initVertexBuffers(gl, cylinderProgram) { // Create a sphere
    gl.useProgram(cylinderProgram);

    // Write the vertex property to buffers (coordinates and normals)
    // Same data can be used for vertex and normal
    // In order to make it intelligible, another buffer is prepared separately
    if (!initArrayBuffer(gl, cylinderProgram, cylinderProgram.a_Position, new Float32Array(positions), gl.FLOAT, 3)) return -1;
    if (!initArrayBuffer(gl, cylinderProgram, cylinderProgram.a_Normal, new Float32Array(positions), gl.FLOAT, 3)) return -1;

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Write the indices to the buffer object
    var indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    return indices.length;
}

function initArrayBuffer(gl, program, a_attribute, data, type, num) {
    gl.useProgram(program);
    // Create a buffer object
    var buffer = gl.createBuffer();
    if (!buffer) {
        console.log('Failed to create the buffer object');
        return false;
    }
    // Write date into the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    // Assign the buffer object to the attribute variable
    gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    gl.enableVertexAttribArray(a_attribute);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return true;
}

/* setPositions
 * input:
 * none
 * output:
 * none
 * use:
 * calculate the positions and indices for the sphere
 */
function setPositions() {
    var SPHERE_DIV = 13;
    var r = 5;

    var i, ai, si, ci;
    var j, aj, sj, cj;
    var p1, p2;

    // Generate coordinates
    for (j = 0; j <= SPHERE_DIV; j++) {
        aj = j * Math.PI / SPHERE_DIV;
        sj = Math.sin(aj);
        cj = Math.cos(aj);
        for (i = 0; i <= SPHERE_DIV; i++) {
            ai = i * 2 * Math.PI / SPHERE_DIV;
            si = Math.sin(ai);
            ci = Math.cos(ai);

            positions.push(r * si * sj);  // X
            positions.push(r * cj);       // Y
            positions.push(r * ci * sj);  // Z
        }
    }

    // Generate indices
    for (j = 0; j < SPHERE_DIV; j++) {
        for (i = 0; i < SPHERE_DIV; i++) {
            p1 = j * (SPHERE_DIV + 1) + i;
            p2 = p1 + (SPHERE_DIV + 1);

            indices.push(p1);
            indices.push(p2);
            indices.push(p1 + 1);

            indices.push(p1 + 1);
            indices.push(p2);
            indices.push(p2 + 1);
        }
    }
}

// Rotation angle (degrees/second)
var ANGLE_STEP = 30.0;
// Last time that this function was called
var g_last = Date.now();
function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

var currentAngle = 0.0;  // Current rotation angle
function initMatrix2(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var mvpMatrix = new Matrix4();
    var vpMatrix = new Matrix4();
    var modelMatrix = new Matrix4();
    currentAngle = animate(currentAngle);  // Update the rotation angle
    var angle = currentAngle * Math.PI / 180;
    if (toggle2 == 0) { //Ortho
        vpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        vpMatrix.lookAt(200 * selected[2], 200 * selected[3], 0, 200 * Math.cos(angle), 200 * Math.cos(angle), 0, 0, 0, 1);
    }
    else {
        vpMatrix.setPerspective(90, 1, 100, 1000);
        vpMatrix.lookAt(200 * selected[2], 200 * selected[3], 0, 200 * Math.cos(angle), 200 * Math.cos(angle), 0, 0, 0, 1);
    }
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
}

function initMatrix3(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var mvpMatrix = new Matrix4();
    var vpMatrix = new Matrix4();
    var modelMatrix = new Matrix4();
    currentAngle = animate(currentAngle);
    var angle = currentAngle * Math.PI / 180;
    if (toggle2 == 0) { //Ortho
        vpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        vpMatrix.lookAt(400 * selected[2] + 100 * Math.cos(angle), 400 * selected[3] + 100 * Math.sin(angle), 0, 400 * selected[2], 400 * selected[3], 0, 0, 0, 1);
    }
    else {
        vpMatrix.setPerspective(90, 1, 10, 1000);
        vpMatrix.lookAt(400 * selected[2] + 100 * Math.cos(angle), 400 * selected[3] + 100 * Math.sin(angle), 0, 400 * selected[2], 400 * selected[3], 0, 0, 0, 1);
    }
    // Calculate the model matrix
    //modelMatrix.setRotate(currentAngle, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
}