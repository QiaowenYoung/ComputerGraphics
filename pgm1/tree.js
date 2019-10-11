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
var colorsl= [], colorsr = [];
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
    canvas.onmousedown = function(ev){ click(ev, gl, canvas) };

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

    if(ev.button === 0){
        countl++;
        Txl.push(x); Tyl.push(y);
        positionsl = [];
        positionsl.push(0); positionsl.push(0); positionsl.push(0);
        positionsl.push(0); positionsl.push(0); positionsl.push(0.5);
        colorsl.push([1.0, 0.0, 0.0, 1,0]);
        ml = [];
        trees(1);
        positionsl = positionsl.concat(ml);
    }
    else if(ev.button === 2){
        countr++;
        Txr.push(x); Tyr.push(y);
        positionsr = [];
        positionsr.push(0); positionsr.push(0); positionsr.push(0);
        positionsr.push(0); positionsr.push(0); positionsr.push(0.4);
        colorsr.push([0.0, 0.0, 1.0, 1,0]);
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
function trees(n){
    if(n === 1){
        generate_tree(0, 0, 0.5, 3, 4, 0.5, 0, 1);
    }
    else{
        generate_tree(0, 0, 0.4, 5, 6, 0.4, 0, 2);
    }
}

/* generate_tree:
 * input:
 * 
 * output: a tree generated with the rule "str", located at (0, 0)
 * 
 * Based on DLR algorithm, every point, except leaf points, will stretch out 3 braches. So, for leaves, just push them into the array.
 * For a branch, I will do recursion on its leaves one by one.
 * In this way, no need to use "1a0b0c0" to generate a tree.
 */
function generate_tree(x, y, z, level_now, level, l0, alpha0, tag){
    if(level_now === 0){
        var v1 = generate_point(x, y, z, level - level_now, l0, alpha0, 0, Math.PI/4);
        var v2 = generate_point(x, y, z, level - level_now, l0, alpha0, Math.PI*2/3, Math.PI/4);
        var v3 = generate_point(x, y, z, level - level_now, l0, alpha0, Math.PI*4/3, Math.PI/4);
        if (tag === 1) {
            ml.push(x); ml.push(y); ml.push(z);
            ml = ml.concat(v1);
            ml.push(x); ml.push(y); ml.push(z);
            ml = ml.concat(v2);
            ml.push(x); ml.push(y); ml.push(z);
            ml = ml.concat(v3);
        }
        else{
            mr.push(x); mr.push(y); mr.push(z);
            mr = mr.concat(v1);
            mr.push(x); mr.push(y); mr.push(z);
            mr = mr.concat(v2);
            mr.push(x); mr.push(y); mr.push(z);
            mr = mr.concat(v3);
        }
    }
    else{
        var v1 = generate_point(x, y, z, level - level_now, l0, alpha0, 0, Math.PI/4);
        var v2 = generate_point(x, y, z, level - level_now, l0, alpha0, Math.PI*2/3, Math.PI/4);
        var v3 = generate_point(x, y, z, level - level_now, l0, alpha0, Math.PI*4/3, Math.PI/4);
        if(tag === 1){
            ml.push(x); ml.push(y); ml.push(z);
            ml = ml.concat(v1);
            generate_tree(v1[0], v1[1], v1[2], level_now - 1, level, l0, alpha0+0, tag);
            ml.push(x); ml.push(y); ml.push(z);
            ml = ml.concat(v2);
            generate_tree(v2[0], v2[1], v2[2], level_now - 1, level, l0, alpha0+Math.PI*2/3, tag);
            ml.push(x); ml.push(y); ml.push(z);
            ml = ml.concat(v3);
            generate_tree(v3[0], v3[1], v3[2], level_now - 1, level, l0, alpha0+Math.PI*4/3, tag);
        }
        else{
            mr.push(x); mr.push(y); mr.push(z);
            mr = mr.concat(v1);
            generate_tree(v1[0], v1[1], v1[2], level_now - 1, level, l0, alpha0+0, tag);
            mr.push(x); mr.push(y); mr.push(z);
            mr = mr.concat(v2);
            generate_tree(v2[0], v2[1], v2[2], level_now - 1, level, l0, alpha0+Math.PI*2/3, tag);
            mr.push(x); mr.push(y); mr.push(z);
            mr = mr.concat(v3);
            generate_tree(v3[0], v3[1], v3[2], level_now - 1, level, l0, alpha0+Math.PI*4/3, tag);
        }
    }
}

/* generate_point:
 * input:
 * x0, y0, z0: starting point
 * level_now: recursion level, from 0 to either 4 or 6
 * l0: segment length, either 0.5 or 0.4
 * alpha0: current direction's angle with XOY plane
 * alpha: rotation angle
 * beta: another rotation angle
 * output:
 * the next point's (x, y, z)
 * 
 * The basic logic is that when level_now is 0, I just need to rotate (0, 0, 1) by y_axis beta
 * and by z_axis alpha, and then I can get the direction of next point.
 * But when level_now is 2, I will need to rotate (0, 0, 1) by y_axis 2*beta and by z_axis alpha0+alpha.
 * That's because my current branch is not parallel with z_axis. It has some angle to z_axis.
 */
function generate_point(x0, y0, z0, level_now, l0, alpha0, alpha, beta){
    var x, y, z;
    var alpha1 = alpha0+alpha;
    var beta1 = level_now*beta;
    var l = l0/Math.pow(2, level_now);
    var v = [];
    x = x0 + l * Math.sin(beta1) * Math.cos(alpha1);
    y = y0 + l * Math.sin(beta1) * Math.sin(alpha1);
    z = z0 + l * Math.cos(beta1);
    v.push(x); v.push(y); v.push(z);
    return v;
}