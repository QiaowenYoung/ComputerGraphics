// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'uniform vec4 u_Translation;\n' +
    'void main() {\n' +
    '  gl_Position =  a_Position + u_Translation;\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =
    '#ifdef GL_ES\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform vec4 u_FragColor;\n' +
    'void main() {\n' +
    '  gl_FragColor = u_FragColor;\n' +
    '}\n';

var positionsl = [], positionsr = [];
var ml = [], mr = [];
var colorsl = [], colorsr = [];
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

    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    // Set the vertex coordinates and color (the blue triangle is in the front)
    canvas.onmousedown = function (ev) { click(ev, gl, canvas) };

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev, gl, canvas) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    if (ev.button === 0) {
        countl++;
        Txl.push(x); Tyl.push(y);
        positionsl = [];
        positionsl.push(0); positionsl.push(0); positionsl.push(0);
        positionsl.push(0); positionsl.push(0); positionsl.push(0.5);
        colorsl.push([1.0, 0.0, 0.0, 1]);
        ml = [];
        trees(1);
        positionsl = positionsl.concat(ml);
    }
    else if (ev.button === 2) {
        countr++;
        Txr.push(x); Tyr.push(y);
        positionsr = [];
        positionsr.push(0); positionsr.push(0); positionsr.push(0);
        positionsr.push(0); positionsr.push(0); positionsr.push(0.4);
        colorsr.push([0.0, 0.0, 1.0, 1]);
        mr = [];
        trees(2);
        positionsr = positionsr.concat(mr);
    }

    var verticespl = new Float32Array(positionsl);
    var verticespr = new Float32Array(positionsr);


    // Create a buffer object
    var positionbufferl = gl.createBuffer();
    if (!positionbufferl) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbufferl);
    gl.bufferData(gl.ARRAY_BUFFER, verticespl, gl.STATIC_DRAW);
    // Assign the buffer object to a_Position and enable the assignment
    var a_Positionl = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Positionl < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Positionl, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Positionl);

    // Pass the translation distance to the vertex shader
    var u_Translationl = gl.getUniformLocation(gl.program, 'u_Translation');
    if (!u_Translationl) {
        console.log('Failed to get the storage location of u_Translation');
        return;
    }

    // Get the storage location of u_FragColor
    var u_FragColorl = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColorl) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    var lenl = positionsl.length / 3;

    for (var i = 0; i < countl; i++) {
        var rgbal = colorsl[i];
        gl.uniform4f(u_Translationl, Txl[i], Tyl[i], 0.0, 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColorl, rgbal[0], rgbal[1], rgbal[2], rgbal[3]);
        // Draw the lines
        gl.drawArrays(gl.LINES, 0, lenl);
    }

    // Create a buffer object
    var positionbufferr = gl.createBuffer();
    if (!positionbufferr) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbufferr);
    gl.bufferData(gl.ARRAY_BUFFER, verticespr, gl.STATIC_DRAW);
    // Assign the buffer object to a_Position and enable the assignment
    var a_Positionr = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Positionr < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Positionr, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Positionr);

    // Pass the translation distance to the vertex shader
    var u_Translationr = gl.getUniformLocation(gl.program, 'u_Translation');
    if (!u_Translationr) {
        console.log('Failed to get the storage location of u_Translation');
        return;
    }

    // Get the storage location of u_FragColor
    var u_FragColorr = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColorr) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    var lenr = positionsr.length / 3;

    for (var i = 0; i < countr; i++) {
        var rgbar = colorsr[i];
        gl.uniform4f(u_Translationr, Txr[i], Tyr[i], 0.0, 0.0);
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColorr, rgbar[0], rgbar[1], rgbar[2], rgbar[3]);
        // Draw the lines
        gl.drawArrays(gl.LINES, 0, lenr);
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
        generate_tree(0, 0, 0, 0, 0, 0.5, 3, 4, 0.5, 1);
    }
    else {
        generate_tree(0, 0, 0, 0, 0, 0.4, 5, 6, 0.4, 2);
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
    v.push(m00 * x + m10 * y + m20 * z);
    v.push(m01 * x + m11 * y + m21 * z);
    v.push(m02 * x + m12 * y + m22 * z);

    // Do translation:
    v[0] = v[0] + x1;
    v[1] = v[1] + y1;
    v[2] = v[2] + z1;

    return v;
}