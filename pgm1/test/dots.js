// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'uniform mat4 u_ViewMatrix;\n' +
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_ViewMatrix * a_Position;\n' +
    '  v_Color = a_Color;\n' +
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

var positions = [];
var colors = [];
function main() {
    // Retrieve <canvas> element
    var canvas = document.getElementById('webgl');

    // Prevent the default setting for left/right click in the window
    canvas.oncontextmenu = function(ev){
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

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function (ev) { click(ev, gl, canvas) };

    // Specify the color for clearing <canvas>
    gl.clearColor(1, 1, 1, 1);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}
var c = 0;
function click(ev, gl, canvas) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    if(ev.button === 0){
        positions = positions.concat(trees(x, y, 1));
        var len = positions.length;
        len /= 3; // calculate the number of total points
        for(var i = 0; i < len; i++){
            colors.push(1.0);
            colors.push(0.0);
            colors.push(0.0);
            colors.push(1.0);
        }
    }
    else if(ev.button === 2){
        positions = positions.concat(trees(x, y, 2));
        var len = positions.length;
        len /= 3;
        for(var i = 0; i < len; i++){
            colors.push(0.0);
            colors.push(0.0);
            colors.push(1.0);
            colors.push(1.0);
        }
    }

    // Create a buffer object
    var positionbuffer = gl.createBuffer();
    if (!positionbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    //var FSIZE = verticesColors.BYTES_PER_ELEMENT;
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    //gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    // Create a buffer object
    var colorbuffer = gl.createBuffer();
    if (!colorbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    //gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // Unbind the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    // Get the storage location of u_ViewMatrix
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage locations of u_ViewMatrix');
        return;
    }

    // Set the matrix to be used for to set the camera view
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0, 0, 75, 0, 0, 0, -1, 0, 0);

    // Set the view matrix
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = positions.length;
    // Draw the rectangle
    gl.drawArrays(gl.LINES, 0, len/3);
}

/* trees:
 * input:
 * x, y: coordinate of your click
 * n: 1 to choose red tree, 2 to choose blue tree
 * output:
 * an array that stores all the coordinates to be passed to buffer
 */
function trees(x, y, n){
    var str1 = generate_expression(4, "");
    var str2 = generate_expression(6, "");
    if(n === 1){
        return generate_tree(x, y, str1, 50);
    }
    else{
        return generate_tree(x, y, str2, 40);
    }
}

/* generate_tree:
 * input:
 * x, y: coordinate of your click
 * str: rules that the program will follow
 * l: the default starting length of segment
 * output:
 * an array that stores all the coordinates to be passed to buffer
 */
function generate_tree(x, y, str, l){
    var len = str.length;
    var stack = [];
    var m = [];
    m.push(x); m.push(y); m.push(0);
    m.push(x); m.push(y); m.push(l);
    for(var i = 0; i < len;){
        if(str[i] === '1'){
            var j;
            stack.push([x-Math.sqrt(2)*l, y, -Math.sqrt(2)*l]);
            stack.push([x, y, 0]);
            stack.push([x, y, l]);
            for(j = i; j < len && str[j] === '1'; j++);
            i = j;
            continue;
        }
        else if(str[i] === 'a'){
            var l = stack.length;
            var s0 = stack[l-3];
            var s1 = stack[l-2];
            var s2 = stack[l-1];
            var alpha = 0*Math.PI/180;
            var beta = 45*Math.PI/180;
            var v = generate_point(s0[0], s0[1], s0[2], s1[0], s1[1], s1[2], 
                s2[0], s2[1], s2[2], alpha, beta);
            if(str[i+1] === '1'){
                m = m.concat(s2);
                m = m.concat(v);
                stack.push(v);
                var j;
                for(j = i+1; j < len && str[j] === '1'; j++);
                i = j;
                continue;
            }
            else{
                m = m.concat(s2);
                m = m.concat(v);
                i = i+2;
                continue;
            }
        }
        else if(str[i] === 'b'){
            var l = stack.length;
            var s0 = stack[l-3];
            var s1 = stack[l-2];
            var s2 = stack[l-1];
            var alpha = 120*Math.PI/180;
            var beta = 45*Math.PI/180;
            var v = generate_point(s0[0], s0[1], s0[2], s1[0], s1[1], s1[2], 
                s2[0], s2[1], s2[2], alpha, beta);
            if(str[i+1] === '1'){
                m = m.concat(s2);
                m = m.concat(v);
                stack.push(v);
                var j;
                for(j = i+1; j < len && str[j] === '1'; j++);
                i = j;
                continue;
            }
            else{
                m = m.concat(s2);
                m = m.concat(v);
                i = i+2;
                continue;
            }
        }
        else if(str[i] === 'c'){
            var l = stack.length;
            var s0 = stack[l-3];
            var s1 = stack[l-2];
            var s2 = stack[l-1];
            var alpha = 240*Math.PI/180;
            var beta = 45*Math.PI/180;
            var v = generate_point(s0[0], s0[1], s0[2], s1[0], s1[1], s1[2], 
                s2[0], s2[1], s2[2], alpha, beta);
            if(str[i+1] === '1'){
                m = m.concat(s2);
                m = m.concat(v);
                stack.push(v);
                var j;
                for(j = i+1; j < len && str[j] === '1'; j++);
                i = j;
                continue;
            }
            else{
                m = m.concat(s2);
                m = m.concat(v);
                i = i+2;
                stack.pop();
                continue;
            }
        }
    }
    return m;
}

/* generate_point:
 * input:
 * x0, y0, z0: grandfather of current point
 * x1, y1, z1: father of current point
 * x2, y2, z2: current point
 * alpha: rotation angle1
 * beta: rotation angle2
 * output:
 * an array of the coordinate of next point to be generated
 */
function generate_point(x0, y0, z0, x1, y1, z1, x2, y2, z2, alpha, beta){
    c++;
    var v0 = [x1-x0, y1-y0, z1-z0]; // father vector
    var v1 = [x2-x1, y2-y1, z2-z1]; // current vector
    var nx = [];
    var ny = [];
    var nz = [];

    // calculate the (nx, ny, nz) for the current space
    var l0 = Math.sqrt(Math.pow((x1-x0),2)+Math.pow((y1-y0),2)+Math.pow((z1-z0),2));
    var l1 = Math.sqrt(Math.pow((x2-x1),2)+Math.pow((y2-y1),2)+Math.pow((z2-z1),2));
    // standardize v0 and v1
    v0[0] = v0[0]/l0;
    v0[1] = v0[1]/l0;
    v0[2] = v0[2]/l0;
    v1[0] = v1[0]/l1;
    v1[1] = v1[1]/l1;
    v1[2] = v1[2]/l1;

    nz.push(v1[0]);
    nz.push(v1[1]);
    nz.push(v1[2]);
    nx.push(Math.sqrt(2)*v0[0]-v1[0]);
    nx.push(Math.sqrt(2)*v0[1]-v1[1]);
    nx.push(Math.sqrt(2)*v0[2]-v1[2]);
    ny.push(nz[1]*nx[2]-nx[2]*nx[1]);
    ny.push(nz[2]*nx[0]-nx[2]*nz[0]);
    ny.push(nz[0]*nx[1]-nx[0]*nz[1]);
    
    // rotate by y'_axis for beta, then by z'_axis for alpha
    var u0, t0, v0, u, t, v;
    u0 = 0; t0 = 0; v0 = 1;
    u = v0*Math.sin(beta)+u0*Math.cos(beta);
    t = t0;
    v = v0*Math.cos(beta)-u0*Math.sin(beta);

    u0 = u; t0 = t; v0 = v;
    u = u0*Math.cos(alpha)-t0*Math.sin(alpha);
    t = u0*Math.sin(alpha)+t0*Math.cos(alpha);
    v = v0;
    
    // change base vectors from [nx, ny, nz] to [X, Y, Z]
    var x = u*nx[0]+t*ny[0]+v*nz[0];
    var y = u*nx[1]+t*ny[1]+v*nz[1];
    var z = u*nx[2]+t*ny[2]+v*nz[2];
    x = x*(l1/2)+x2;
    y = y*(l1/2)+y2;
    z = z*(l1/2)+z2;
    var vec = [x, y, z];
    console.log(`vec[${c}]: ${vec}`);
    return vec;
}

/* generate_expression:
 * input:
 * n: recursion times
 * str: result from the last recursion
 * output:
 * a string that represents rules
 */
function generate_expression(n, str){
    var str_next = "";
    if(n === 0){
        return str;
    }
    else if(str === ""){
        str_next = "0";
        return generate_expression(n, str_next);
    }
    else {
        for (var i = 0; i < str.length; i++) {
            if (str[i] === '0') {
                str_next += "1a0b0c0";
            }
            else if (str[i] === '1') {
                str_next += "11";
            }
            else if (str[i] === 'a') {
                str_next += "a";
            }
            else if (str[i] === 'b') {
                str_next += "b";
            }
            else if (str[i] === 'c') {
                str_next += "c";
            }
        }
        return generate_expression(n - 1, str_next);
    }
}