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

var cylinder = [];
var colors = [];
var n = [];
var positionsl = [], positionsr = [];
var ml = [], mr = [];
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

    // After the following steps, positionsl and positionsr will store all the coordinates
    // needed for a left click tree and a right click tree
    positionsl.push(0); positionsl.push(0); positionsl.push(0);
    positionsl.push(0); positionsl.push(0); positionsl.push(50);
    trees(1);
    positionsl = positionsl.concat(ml);
    positionsr.push(0); positionsr.push(0); positionsr.push(0);
    positionsr.push(0); positionsr.push(0); positionsr.push(40);
    trees(2);
    positionsr = positionsr.concat(mr);

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    canvas.onmousedown = function (ev) { click(ev, gl, canvas, cylinderProgram) };
}

function click(ev, gl, canvas, cylinderProgram){
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
    for(var i = 0; i < countl; i++){
        drawCylinder(gl, cylinderProgram, Txl[i], Tyl[i], 0);
    }
    for(var i = 0; i < countr; i++){
        drawCylinder(gl, cylinderProgram, Txr[i], Tyr[i], 1);
    }

}

function drawCylinder(gl, cylinderProgram, tx, ty, tag) {
    gl.useProgram(cylinderProgram);
    if (tag == 0) {
        var l = positionsl.length;
        for (var i = 0; i < l; i += 6) {
            cylinder = [];
            colors = [];
            n = [];
            branch(positionsl[i], positionsl[i + 1], positionsl[i + 2], positionsl[i + 3], positionsl[i + 4], positionsl[i + 5]);
            setColors(0);
            setNormals();
            initPositions(gl, cylinderProgram);
            initColors(gl, cylinderProgram);
            initNormals(gl, cylinderProgram);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram);
            initTranslation(gl, cylinderProgram, tx, ty);
            // Display a default view
            var len = cylinder.length / 3;
            gl.drawArrays(gl.TRIANGLES, 0, len);
        }
    }
    else{
        var l = positionsr.length;
        for (var i = 0; i < l; i += 6) {
            cylinder = [];
            colors = [];
            n = [];
            branch(positionsr[i], positionsr[i + 1], positionsr[i + 2], positionsr[i + 3], positionsr[i + 4], positionsr[i + 5]);
            setColors(1);
            setNormals();
            initPositions(gl, cylinderProgram);
            initColors(gl, cylinderProgram);
            initNormals(gl, cylinderProgram);
            initLightColor(gl, cylinderProgram);
            initLightDirection(gl, cylinderProgram);
            initMatrix(gl, cylinderProgram);
            initTranslation(gl, cylinderProgram, tx, ty);
            // Display a default view
            var len = cylinder.length / 3;
            gl.drawArrays(gl.TRIANGLES, 0, len);
        }
    }
}

function setNormals() {
    var len = cylinder.length;
    for (var i = 0; i < len; i += 9) {
        var a = [cylinder[i], cylinder[i + 1], cylinder[i + 2]];
        var b = [cylinder[i + 3], cylinder[i + 4], cylinder[i + 5]];
        var c = [cylinder[i + 6], cylinder[i + 7], cylinder[i + 8]];
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

function setColors(tag) {
    var len = cylinder.length / 3;
    if (tag == 0) {
        for (var i = 0; i < len; i++) {
            colors.push(1.0);
            colors.push(0.0);
            colors.push(0.0);
            colors.push(1.0);
        }
    }
    if (tag == 1) {
        for (var i = 0; i < len; i++) {
            colors.push(0.0);
            colors.push(0.0);
            colors.push(1.0);
            colors.push(1.0);
        }
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
function initPositions(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var vertices = new Float32Array(cylinder);
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
 * gl, cylinderProgram
 * output:
 * none
 * use:
 * initialize u_ViewMatrx and u_ProjMatrix
 */
function initMatrix(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(200, 200, 0, 0, 0, 0, 0, 0, 1);
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
function initTranslation(gl, cylinderProgram, tx, ty){
    gl.useProgram(cylinderProgram);
    gl.uniform4f(cylinderProgram.u_Translation, tx, ty, 0.0, 0.0);
}

/* branch
 * input:
 * (x0, y0, z0): starting point of this branch
 * (x1, y1, z1): ending point of this branch
 * output:
 * none
 * use:
 * store every cylinder's points' coordinates into an array
 * For every branch, the starting point will be the center of the bottom of a tapered cylinder.
 * The ending point will be the top's center. I will need to calculate all the 24 points for these cylinder.
 */
function branch(x0, y0, z0, x1, y1, z1) {
    var points = [];
    var vec = [x1 - x0, y1 - y0, z1 - z0];
    var height = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
    var r1 = height / 20;
    var r2 = height / 10;
    var theta = Math.PI / 6;
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
        points.push(topx[i + 1]);
        points.push(topy[i + 1]);
        points.push(height);
        points.push(topx[i]);
        points.push(topy[i]);
        points.push(height);
        points.push(bottomx[i]);
        points.push(bottomy[i]);
        points.push(0.0);
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

    // Now the array "points" stores all the points coordinates of a cylinder at (0,0,0)
    // I will need to transform it to vec
    // For the array "points", I will need to retrieve every 3 elements to locate a point's coordinates, 
    // namely the vector's direction.
    // Then, use a transform matrix.

    // normalize vec
    vec[0] /= height;
    vec[1] /= height;
    vec[2] /= height;

    // rotate (0,0,1) to vec
    // rotate by axis, r_angle
    var axis = [];
    axis.push(-vec[1]);
    axis.push(vec[0]);
    axis.push(0);
    var la = Math.sqrt(Math.pow(axis[0], 2) + Math.pow(axis[1], 2) + Math.pow(axis[2], 2));
    if (la != 0) {
        axis[0] /= la;
        axis[1] /= la;
        axis[2] /= la;
    }

    var r_angle = Math.acos(0 * vec[0] + 0 * vec[1] + 1 * vec[2]);
    var m00 = Math.pow(axis[0], 2) * (1 - Math.cos(r_angle)) + Math.cos(r_angle);
    var m01 = axis[0] * axis[1] * (1 - Math.cos(r_angle)) - axis[2] * Math.sin(r_angle);
    var m02 = axis[0] * axis[2] * (1 - Math.cos(r_angle)) + axis[1] * Math.sin(r_angle);
    var m10 = axis[0] * axis[1] * (1 - Math.cos(r_angle)) + axis[2] * Math.sin(r_angle);
    var m11 = Math.pow(axis[1], 2) * (1 - Math.cos(r_angle)) + Math.cos(r_angle);
    var m12 = axis[1] * axis[2] * (1 - Math.cos(r_angle)) - axis[0] * Math.sin(r_angle);
    var m20 = axis[0] * axis[2] * (1 - Math.cos(r_angle)) - axis[1] * Math.sin(r_angle);
    var m21 = axis[1] * axis[2] * (1 - Math.cos(r_angle)) + axis[0] * Math.sin(r_angle);
    var m22 = Math.pow(axis[2], 2) * (1 - Math.cos(r_angle)) + Math.cos(r_angle);

    var l = points.length;
    for (var i = 0; i < l; i += 3) {
        var x = points[i];
        var y = points[i + 1];
        var z = points[i + 2];
        cylinder.push(m00 * x + m01 * y + m02 * z + x0);
        cylinder.push(m10 * x + m11 * y + m12 * z + y0);
        cylinder.push(m20 * x + m21 * y + m22 * z + z0);
    }
}

/* trees:
 * input:
 * n: 1 for a red tree, other for a blue tree
 * output:
 * an array that stores all the points' coordinates
 */
function trees(n) {
    if (n === 1) {
        generate_tree(0, 0, 0, 0, 0, 50, 3, 4, 50, 1);
    }
    else {
        generate_tree(0, 0, 0, 0, 0, 40, 5, 6, 40, 2);
    }
}

/* generate_tree:
 * input:
 * (x0, y0, z0): father of the current node
 * (x1, y1, z1): curent node
 * level_now: current recursion level, from 0 to either 4 or 6
 * level: either 4 or 6
 * l0: either 0.5 or 0.4
 * tag: 1 to represent a red tree, 2 for a blue one
 * output: a tree generated and located at (0, 0)
 * 
 * Based on DLR algorithm, every point, except leaf points, will stretch out 3 braches. So, for leaves, just push them into the array.
 * For a branch, I will do recursion on its leaves one by one
 */
function generate_tree(x0, y0, z0, x1, y1, z1, level_now, level, l0, tag) {
    if (level_now === 0) {
        var v1 = generate_point(x0, y0, z0, x1, y1, z1, level - level_now, l0, 0, Math.PI / 4);
        var v2 = generate_point(x0, y0, z0, x1, y1, z1, level - level_now, l0, Math.PI * 2 / 3, Math.PI / 4);
        var v3 = generate_point(x0, y0, z0, x1, y1, z1, level - level_now, l0, Math.PI * 4 / 3, Math.PI / 4);
        if (tag === 1) {
            ml.push(x1); ml.push(y1); ml.push(z1);
            ml = ml.concat(v1);
            ml.push(x1); ml.push(y1); ml.push(z1);
            ml = ml.concat(v2);
            ml.push(x1); ml.push(y1); ml.push(z1);
            ml = ml.concat(v3);
        }
        else {
            mr.push(x1); mr.push(y1); mr.push(z1);
            mr = mr.concat(v1);
            mr.push(x1); mr.push(y1); mr.push(z1);
            mr = mr.concat(v2);
            mr.push(x1); mr.push(y1); mr.push(z1);
            mr = mr.concat(v3);
        }
    }
    else {
        var v1 = generate_point(x0, y0, z0, x1, y1, z1, level - level_now, l0, 0, Math.PI / 4);
        var v2 = generate_point(x0, y0, z0, x1, y1, z1, level - level_now, l0, Math.PI * 2 / 3, Math.PI / 4);
        var v3 = generate_point(x0, y0, z0, x1, y1, z1, level - level_now, l0, Math.PI * 4 / 3, Math.PI / 4);
        if (tag === 1) {
            ml.push(x1); ml.push(y1); ml.push(z1);
            ml = ml.concat(v1);
            generate_tree(x1, y1, z1, v1[0], v1[1], v1[2], level_now - 1, level, l0, tag);
            ml.push(x1); ml.push(y1); ml.push(z1);
            ml = ml.concat(v2);
            generate_tree(x1, y1, z1, v2[0], v2[1], v2[2], level_now - 1, level, l0, tag);
            ml.push(x1); ml.push(y1); ml.push(z1);
            ml = ml.concat(v3);
            generate_tree(x1, y1, z1, v3[0], v3[1], v3[2], level_now - 1, level, l0, tag);
        }
        else {
            mr.push(x1); mr.push(y1); mr.push(z1);
            mr = mr.concat(v1);
            generate_tree(x1, y1, z1, v1[0], v1[1], v1[2], level_now - 1, level, l0, tag);
            mr.push(x1); mr.push(y1); mr.push(z1);
            mr = mr.concat(v2);
            generate_tree(x1, y1, z1, v2[0], v2[1], v2[2], level_now - 1, level, l0, tag);
            mr.push(x1); mr.push(y1); mr.push(z1);
            mr = mr.concat(v3);
            generate_tree(x1, y1, z1, v3[0], v3[1], v3[2], level_now - 1, level, l0, tag);
        }
    }
}

/* generate_point:
 * input:
 * x0, y0, z0: starting point's father point
 * x1, y1, z1: starting point
 * level_now: recursion level, from 0 to either 4 or 6
 * l0: segment length, either 0.5 or 0.4
 * alpha: rotation angle
 * beta: another rotation angle
 * output:
 * the next point's (x, y, z)
 * 
 * I need the current branch's direction and its starting point to calculate the next point's position.
 * I use matrix multiplication to achieve this. First, get a vector that is rotated around z axis.
 * Then, rotate this vector to where it should be. So I will need the axis it rotates by and the rotational angle.
 * The axis can be calculated by cross product from z axis and current branch's direction.
 * The rotational angle can be calculated by dot product from them.
 */
function generate_point(x0, y0, z0, x1, y1, z1, level_now, l0, alpha, beta) {
    var x, y, z;
    var l = l0 / Math.pow(2, level_now);
    var v = [];
    var vec = [];
    vec.push(x1 - x0);
    vec.push(y1 - y0);
    vec.push(z1 - z0);

    // This (x, y, z) currently surrounds z axis.
    // I will need to rotate it to make it surround vec
    x = l * Math.sin(beta) * Math.cos(alpha);
    y = l * Math.sin(beta) * Math.sin(alpha);
    z = l * Math.cos(beta);

    // Then I need to rotate this (x, y, z) by an axis to some degree
    // The axis can be calculated by doing cross product from (0, 0, 1) with vec/||vec||.
    var len = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
    vec[0] = vec[0] / len;
    vec[1] = vec[1] / len;
    vec[2] = vec[2] / len;
    // (0, 0, 1) and vec, cross product, use determinant:
    // | i       j        k |
    // | 0       0        1 | = (-vec[1])i + (vec[0])j
    // |vec[0] vec[1] vec[2]|
    var axis = [];
    axis.push(-vec[1]);
    axis.push(vec[0]);
    axis.push(0);

    var la = Math.sqrt(Math.pow(axis[0], 2) + Math.pow(axis[1], 2) + Math.pow(axis[2], 2));
    if (la != 0) {
        axis[0] /= la;
        axis[1] /= la;
        axis[2] /= la;
    }

    // Now, I will rotate (x, y, z) by that axis
    // I need a rotational angle. It can be calculated by a dot product
    // cos(r_angle) = (0, 0, 1).*(vec[0], vec[1], vec[2])/(1*1);
    var r_angle = Math.acos(0 * vec[0] + 0 * vec[1] + 1 * vec[2]);

    // Here is the rotation matrix I google and get from http://blog.atelier39.org/cg/463.html
    var m00 = Math.pow(axis[0], 2) * (1 - Math.cos(r_angle)) + Math.cos(r_angle);
    var m01 = axis[0] * axis[1] * (1 - Math.cos(r_angle)) - axis[2] * Math.sin(r_angle);
    var m02 = axis[0] * axis[2] * (1 - Math.cos(r_angle)) + axis[1] * Math.sin(r_angle);
    var m10 = axis[0] * axis[1] * (1 - Math.cos(r_angle)) + axis[2] * Math.sin(r_angle);
    var m11 = Math.pow(axis[1], 2) * (1 - Math.cos(r_angle)) + Math.cos(r_angle);
    var m12 = axis[1] * axis[2] * (1 - Math.cos(r_angle)) - axis[0] * Math.sin(r_angle);
    var m20 = axis[0] * axis[2] * (1 - Math.cos(r_angle)) - axis[1] * Math.sin(r_angle);
    var m21 = axis[1] * axis[2] * (1 - Math.cos(r_angle)) + axis[0] * Math.sin(r_angle);
    var m22 = Math.pow(axis[2], 2) * (1 - Math.cos(r_angle)) + Math.cos(r_angle);

    // Do matrix multiplication:
    v.push(m00 * x + m01 * y + m02 * z);
    v.push(m10 * x + m11 * y + m12 * z);
    v.push(m20 * x + m21 * y + m22 * z);

    // Do translation:
    v[0] = v[0] + x1;
    v[1] = v[1] + y1;
    v[2] = v[2] + z1;

    return v;
}