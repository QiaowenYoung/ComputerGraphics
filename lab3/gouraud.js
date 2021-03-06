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
    'void main() {\n' +
    '  vec4 v_vertPos4 = u_mvpMatrix * a_Position;\n' +
    '  v_vertPos = vec3(v_vertPos4) / v_vertPos4.w;\n' +
    '  gl_Position = u_mvpMatrix * a_Position + u_Translation;\n' +
    // Make the length of the normal 1.0
    '  vec3 normal = normalize(a_Normal);\n' +
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

var map = []; // each element contains a point, its count, a tag for red or blue and its xy coordinates
var count = 0; // # of total trees
var tree = []; // clicked trees
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

    if (cylinderProgram.a_Position < 0 || cylinderProgram.a_Color < 0 || cylinderProgram.a_Color_2 < 0 ||
        cylinderProgram.a_Normal < 0 || cylinderProgram.u_ViewMatrix < 0 || cylinderProgram.u_ProjMatrix < 0 ||
        cylinderProgram.u_Translation < 0 || cylinderProgram.u_LightColor < 0 || cylinderProgram.u_LightDirection < 0 ||
        cylinderProgram.u_shininessVal < 0 || cylinderProgram.u_Clicked < 0) {
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
        if (ev.shiftKey == 1) {
            redraw(ev, gl, cylinderProgram);
        }
        else {
            click(ev, gl, canvas, cylinderProgram);
        }
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

    //setView(gl, cylinderProgram);
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
        else if (toggle3 == 1){
            rad[1].checked = true;
        }
        else{
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
function redraw(ev, gl, cylinderProgram) {
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    x = x - rect.left;
    y = rect.bottom - y;
    for (var i = 0; i < count; i++) {
        var newmap = map[i]; // newmap[0]: color, newmap[1]: left/right, newmap[2]: x coord, newmap[3]: y coord
        var color = newmap[0] / 255.0;
        gl.useProgram(cylinderProgram);
        initPositions(gl, cylinderProgram, newmap[1]);
        initColors(gl, cylinderProgram, newmap[1]);
        initLightColor(gl, cylinderProgram);
        initLightDirection(gl, cylinderProgram);
        initMatrix(gl, cylinderProgram, toggle1, toggle2);
        initTranslation(gl, cylinderProgram, newmap[2], newmap[3], toggle2);
        initGloss(gl, cylinderProgram, newmap[1]);
        initNormals(gl, cylinderProgram, newmap[1], 0);
        gl.uniform1i(cylinderProgram.u_Clicked, 1);
        gl.vertexAttrib4f(cylinderProgram.a_Color_2, color, 0.0, 0.0, 1.0);
        var len;
        if (newmap[1] == 0) {
            len = cylinderl.length / 3;
        }
        else {
            len = cylinderr.length / 3;
        }
        gl.drawArrays(gl.TRIANGLES, 0, len);
    }

    var pixels = new Uint8Array(4); // Array for storing the pixel value
    gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    for (var i = 0; i < count; i++) {
        var newmap = map[i];
        if (pixels[0] == newmap[0] && pixels[0] + pixels[1] + pixels[2] + pixels[3] != 0) { // get the clicked tree's info
            tree.push(newmap[1]);
            tree.push(newmap[2]);
            tree.push(newmap[3]);
            break;
        }
    }
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    draw(gl, cylinderProgram);
}

function draw(gl, cylinderProgram) {
    var bool = 1;
    for (var i = 0; i < count; i++) {
        var newmap = map[i];
        for (var j = 0; j < tree.length; j += 3) { // check if the current tree is clicked
            if (newmap[2] == tree[j + 1] && newmap[3] == tree[j + 2]) {
                bool = 0;
            }
        }
        if (bool == 1) { // if not clicked, draw this tree
            gl.useProgram(cylinderProgram);
            gl.uniform1i(cylinderProgram.u_Clicked, 0);
            initPositions(gl, cylinderProgram, newmap[1]);
            initColors(gl, cylinderProgram, newmap[1]);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            initTranslation(gl, cylinderProgram, newmap[2], newmap[3], toggle2);
            initGloss(gl, cylinderProgram, newmap[1]);
            var len;
            if (newmap[1] == 0) {
                len = cylinderl.length / 3;
            }
            else {
                len = cylinderr.length / 3;
            }
            if (toggle3 == 0) { // Flat shading
                initNormals(gl, cylinderProgram, newmap[1], 0);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 1) { // smooth
                initNormals(gl, cylinderProgram, newmap[1], 1);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 2) { // wireframe using flat shading normals
                initNormals(gl, cylinderProgram, newmap[1], 0);
                gl.drawArrays(gl.LINES, 0, len);
            }
        }
        bool = 1;
    }
    if (tree.length != 0) { // if there are clicked trees, draw them in a different way
        for (var i = 0; i < tree.length; i += 3) {
            gl.useProgram(cylinderProgram);
            gl.uniform1i(cylinderProgram.u_Clicked, 0);
            initPositions(gl, cylinderProgram, tree[i]);
            gl.vertexAttrib4f(cylinderProgram.a_Color, 0.0, 1.0, 0.0, 1.0);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram, toggle1, toggle2);
            initTranslation(gl, cylinderProgram, tree[i + 1], tree[i + 2], toggle2);
            gl.uniform1f(cylinderProgram.u_shininessVal, 1.0);
            var len;
            if (tree[i] == 0) {
                len = cylinderl.length / 3;
            }
            else {
                len = cylinderr.length / 3;
            }
            if (toggle3 == 0) { // Flat shading
                initNormals(gl, cylinderProgram, tree[i], 0);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 1) { // smooth
                initNormals(gl, cylinderProgram, tree[i], 1);
                gl.drawArrays(gl.TRIANGLES, 0, len);
            }
            else if (toggle3 == 2) { // wireframe using flat shading normals
                initNormals(gl, cylinderProgram, tree[i], 0);
                gl.drawArrays(gl.LINES, 0, len);
            }
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
    for(var i = 0; i < count; i++) {
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
        for(i = 4; i < 4 + count * 4; i += 4) {
            var newmap = [];
            newmap.push(arr[i]);
            newmap.push(arr[i + 1]);
            newmap.push(arr[i + 2]);
            newmap.push(arr[i + 3]);
            map.push(newmap);
        }
        tree = [];
        for (; i < arr.length; i++){
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
        newmap.push(0); // left click
        newmap.push(x);
        newmap.push(y);
        map.push(newmap);
    }
    else if (ev.button === 2) {
        var newmap = [];
        newmap.push((26 * count++) % 255); // color.r
        newmap.push(1); // right click
        newmap.push(x);
        newmap.push(y);
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
    //var modelview = new Float32Array(16);
    if (tag1 == 0) { // Top view
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
            mvpMatrix.lookAt(0, 0, 200, 0, 0, 0, 0, 1, 0);
            //mat4LookAt(modelview, 0, 0, 200, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
            //gl.uniformMatrix4fv(cylinderProgram.u_modelview, false, modelview.elements);
        }
        else {
            mvpMatrix.setPerspective(90, 1, 100, 1000);
            mvpMatrix.lookAt(0, 0, 200, 0, 0, 0, 0, 1, 0);
            //mat4LookAt(modelview, 0, 0, 200, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
            //gl.uniformMatrix4fv(cylinderProgram.u_modelview, false, modelview.elements);
        }
    }
    else { // Side
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
            mvpMatrix.lookAt(0, -200, 75, 0, 0, 0, 0, 1, 0);
            //mat4LookAt(modelview, 0, -200, 75, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
            //gl.uniformMatrix4fv(cylinderProgram.u_modelview, false, modelview.elements);
        }
        else {
            mvpMatrix.setPerspective(90, 1, 100, 1000);
            mvpMatrix.lookAt(0, -200, 75, 0, 0, 0, 0, 1, 0);
            //mat4LookAt(modelview, 0, -200, 75, 0, 0, 0, 0, 1, 0);
            gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
            //gl.uniformMatrix4fv(cylinderProgram.u_modelview, false, modelview.elements);
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

/* initGloss
 * input:
 * gl, cylinderProgram
 * tag: 0 for red trees, 1 for blue trees
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