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
    'uniform bool u_isBG;\n' + // if currently drawing bg
    'void main() {\n' +
    '   if (u_isBG){\n' +
    '       gl_Position = u_mvpMatrix * a_Position;\n' +
    '       vec4 v_vertPos4 = u_mvpMatrix * a_Position;\n' +
    '       v_vertPos = vec3(v_vertPos4) / v_vertPos4.w;\n' + // view direction
    // Make the length of the normal 1.0
    '       vec3 normal = normalize(a_Normal);\n' +
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
    // point lighting
    '       vec3 lightDirection2 = normalize(u_LightPos - vec3(u_mvpMatrix * a_Position));\n' +
    '       vec3 normal2 = normalize(a_Normal);\n' +
    '       v_vertPos4 = u_mvpMatrix * a_Position;\n' +
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
    '   }\n' +
    '   else if(u_isTree) {\n' + // draw trees
    '       vec4 v_vertPos4 = u_mvpMatrix * (u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation);\n' +
    '       v_vertPos = vec3(v_vertPos4) / v_vertPos4.w;\n' + // view direction
    '       gl_Position = u_mvpMatrix * (u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation);\n' +
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
    '       v_vertPos4 = u_mvpMatrix * (u_rotateMatrix_x * u_rotateMatrix_z * u_scaleMatrix * a_Position + u_Translation);\n' +
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

    '   else if (!u_isTree){\n' + // draw sphere
    '       vec4 color = vec4(1.0, 1.0, 0.0, 1.0);\n' + // Sphere color
    '       if (u_LightOff) {\n' +
    '           color = vec4(0.5, 0.5, 0.0, 1.0);\n' + // if turned off, make it a little darker
    '       }\n' +
    '       gl_Position = u_mvpMatrix * (a_Position + u_Translation);\n' +
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
    '           vec3 V = normalize(-vec3(u_mvpMatrix * (a_Position + u_Translation)));\n' +
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
var isPanning = 0; // whether you are doing panning
var Transx, Transy; // use in panning, for animation
var panx = 0, pany = 0; // offset of your mouse during panning
var isDb = 0; // whether you double click a tree
var isE = 0; // whether you do examine work
var isModBG = 0; // whether you are modifying background

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

var pos = []; // points' coords of background
var ns = []; // normals of background

// Rotation angle (degrees/second)
var ANGLE_STEP = 30.0;
// Last time that this function was called
var g_last = Date.now();
var currentAngle = 0.0;  // Current rotation angle

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
    cylinderProgram.u_isBG = gl.getUniformLocation(cylinderProgram, 'u_isBG');

    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Color_2 < 0 ||
        cylinderProgram.a_Normal < 0 || cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 ||
        cylinderProgram.u_Translation < 0 || cylinderProgram.u_LightColor < 0 || cylinderProgram.u_LightDirection < 0 ||
        cylinderProgram.u_shininessVal < 0 || cylinderProgram.u_Clicked < 0 || cylinderProgram.u_rotateMatrix_x < 0 ||
        cylinderProgram.u_rotateMatrix_z < 0 || cylinderProgram.u_scaleMatrix < 0 || cylinderProgram.u_NormalMatrix < 0 ||
        cylinderProgram.u_isTree < 0 || cylinderProgram.u_LightPos < 0 || cylinderProgram.u_LightOff < 0 ||
        cylinderProgram.u_isBG < 0) {
        console.log('Failed to locate variables for cylinder');
        return -1;
    }
    /* end */

    setPositions(); // initialize sphere positions and normals
    setPositionsBG(20); // initialize background points coords

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    draw(gl, cylinderProgram);

    canvas.ondblclick = function (ev) { // yaw
        redraw(ev, gl, canvas, cylinderProgram);
        if (selected.length != 0) { // double click on a tree
            console.log('yaw');
            isDb = 1;
            currentAngle = 0;
        }
        var dbclick = function () {
            draw(gl, cylinderProgram);
            requestAnimationFrame(dbclick);
        }
        dbclick();
    }

    canvas.addEventListener('keydown', dokeydown, false);
    function dokeydown(ev) {
        if (ev.keyCode == 69 && selected.length != 0 && isE == 0) {
            console.log('examine');
            isE = 1;
            currentAngle = 0;
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
        if (ev.shiftKey == 1) {
            console.log('modifying background: start');
            isModBG = 1;
        }
        else if (ev.ctrlKey == 1) {
            console.log('modifying background: start');
            isModBG = 2;
        }
        else if (selected.length != 0 && ev.button == 0) { // translation of a tree
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
            console.log('move the camera in-n-out');
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
        if (isModBG == 1) {
            setHeight(x, y, 0.1);
            draw(gl, cylinderProgram);
        }
        if (isModBG == 2) {
            setHeight(x, y, -0.1);
            draw(gl, cylinderProgram);
        }
        if (isMoving) { // translation
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
            /* I multiply the movement of your mouse with 2*PI,
             * to transfer the movement into radius.
             */
            selected[6] = selected[6] + 2 * Math.PI * (y - offy2);
            offy2 = y;
            draw(gl, cylinderProgram);
        }
        else if (isRotating == 3) { // rotate by z axis
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
        if (isModBG == 1 || isModBG == 2) {
            console.log('modifying background: end')
            isModBG = 0;
        }
        else if (ev.button == 0 && selected.length != 0 && isMoving == 1) { // translation ends
            console.log('translation: mouseup');
            isMoving = 0;
            if (x0 == x && y0 == y) { // the click means to deselecte the tree
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
            console.log('panning or sphere moving end');
            isMoving_s = 0;
            isPanning = 0;
            if (xs0 == x && ys0 == y) { // click means to turn on/off the sphere or create a new tree or select a tree
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
    gl.useProgram(cylinderProgram);
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    var tag = 0;
    x = x - rect.left;
    y = rect.bottom - y;
    initMatrix(gl, cylinderProgram, toggle1, toggle2);
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
        initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5]);
        initGloss(gl, cylinderProgram, newmap[2]);
        initNormals(gl, cylinderProgram, newmap[2], 0);
        gl.uniform1i(cylinderProgram.u_Clicked, 1);
        gl.uniform1i(cylinderProgram.u_isTree, 1); // draw trees
        gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
        gl.uniform1i(cylinderProgram.u_isBG, 0);
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
    gl.uniform1i(cylinderProgram.u_Clicked, 1);
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
    gl.useProgram(cylinderProgram);
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = x - rect.left;
    y = rect.bottom - y;
    initMatrix(gl, cylinderProgram, toggle1, toggle2);
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
        initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5]);
        initGloss(gl, cylinderProgram, newmap[2]);
        initNormals(gl, cylinderProgram, newmap[2], 0);
        gl.uniform1i(cylinderProgram.u_Clicked, 1);
        gl.uniform1i(cylinderProgram.u_isTree, 1); // draw trees
        gl.uniform1i(cylinderProgram.u_LightOff, is_selected_s);
        gl.uniform1i(cylinderProgram.u_isBG, 0);
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
    gl.uniform1i(cylinderProgram.u_Clicked, 1);
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
    gl.useProgram(cylinderProgram);
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
            gl.uniform1i(cylinderProgram.u_isBG, 0);
            initPositions(gl, cylinderProgram, newmap[2]);
            initColors(gl, cylinderProgram, newmap[2]);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initLightPos(gl, cylinderProgram);
            initTranslation(gl, cylinderProgram, newmap[3], newmap[4], newmap[5]);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            if (isDb) {
                initMatrix2(gl, cylinderProgram);
            }
            if (isE) {
                initMatrix3(gl, cylinderProgram);
            }
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
        else { // the tree is being selected and not yaw
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
            gl.uniform1i(cylinderProgram.u_isBG, 0);
            initPositions(gl, cylinderProgram, selected[1]);
            gl.vertexAttrib4f(cylinderProgram.a_Color, 0.0, 1.0, 0.0, 1.0);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initLightPos(gl, cylinderProgram);
            initTranslation(gl, cylinderProgram, selected[2], selected[3], selected[4]);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            if (isDb) {
                initMatrix2(gl, cylinderProgram);
            }
            if (isE) {
                initMatrix3(gl, cylinderProgram);
            }
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
    gl.uniform1i(cylinderProgram.u_Clicked, 0);
    initLightPos(gl, cylinderProgram);
    initMatrix(gl, cylinderProgram, toggle1, toggle2);
    drawSphere(gl, cylinderProgram);
    drawBG(gl, cylinderProgram);
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
        newmap.push(x + panx); // x
        newmap.push(y + pany); // y
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
        newmap.push(x + panx); // x
        newmap.push(y + pany); // y
        newmap.push(0.0); // z
        newmap.push(1.0); // Scaling factor
        newmap.push(0.0); // rotational angle by x axis
        newmap.push(0.0); // rotational angle by z axis
        map.push(newmap);
    }
    draw(gl, cylinderProgram);
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
    gl.uniform1i(cylinderProgram.u_isBG, 0);
    gl.uniform3f(cylinderProgram.u_LightColor, 1.0, 1.0, 1.0);
    gl.uniform3f(cylinderProgram.u_LightDirection, 1.0, 1.0, 1.0);
    gl.vertexAttrib4f(cylinderProgram.a_Color_2, colora, 0.0, 0.0, 1.0);

    var modelMatrix = new Matrix4();  // Model matrix
    var normalMatrix = new Matrix4(); // Transformation matrix for normals

    // Calculate the view projection matrix
    gl.uniform4f(cylinderProgram.u_Translation, -100 + 200 * selected_s[0], -100 + 200 * selected_s[1], 0, 0);

    if (isDb) {
        initMatrix2(gl, cylinderProgram);
    }
    if (isE) {
        initMatrix3(gl, cylinderProgram);
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

function drawBG(gl, cylinderProgram) {
    setNormalsBG();
    gl.useProgram(cylinderProgram);
    gl.uniform1i(cylinderProgram.u_isBG, 1);
    initPositionsBG(gl, cylinderProgram);
    initColorsBG(gl, cylinderProgram);
    initNormalsBG(gl, cylinderProgram);
    initLightColorBG(gl, cylinderProgram);
    initLightDirectionBG(gl, cylinderProgram);
    initMatrixBG(gl, cylinderProgram, toggle1, toggle2);
    if (isDb) {
        initMatrix2(gl, cylinderProgram);
    }
    if (isE) {
        initMatrix3(gl, cylinderProgram);
    }
    initGlossBG(gl, cylinderProgram);
    gl.drawArrays(gl.TRIANGLES, 0, pos.length / 3);
}
