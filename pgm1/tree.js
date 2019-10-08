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

var colors = [];
var positions = [];
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

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Register function (event handler) to be called on a mouse press
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

    // Store the coordinates to positions array
    positions.push(x);
    positions.push(y);
    positions.push(0);
    positions.push(x);
    positions.push(y);
    positions.push(50);
    

    if (ev.button === 0){
        colors.push(1.0);
        colors.push(0.0);
        colors.push(0.0);
        colors.push(1.0);
    }
    else if(ev.button === 2){
        colors.push(0.0);
        colors.push(0.0);
        colors.push(1.0);
        colors.push(1.0);
    }
    

    // Create a buffer object
    var positionBuffer = gl.createBuffer();
    if (!positionBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    var colorBuffer = gl.createBuffer();
    if (!colorBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    // Assign the buffer object to a_Color and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);

    // Get the storage location of u_ViewMatrix
    var u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    if (!u_ViewMatrix) {
        console.log('Failed to get the storage locations of u_ViewMatrix');
        return;
    }

    // Set the matrix to be used for to set the camera view
    var viewMatrix = new Matrix4();
    viewMatrix.setLookAt(0, 0, 1, 0, 0, 0, 0, 0, 1);

    // Set the view matrix
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

    var len = positions.length / 6;

    // Draw the lines
    gl.drawArrays(gl.LINES, 0, len);
}

function tree1(x, y){
    var m;
    m.push(x); m.push(y); m.push(0);
    m.push(x); m.push(y); m.push(50);
    m.push(x); m.push(y); m.push(50);
    var r1 = tree(x, y, 0, x, y, 1, x, y, 0, x, y, 50);
    for (var i = 0; i < 3; i++){
        var vec = r1[i];
        for (var j = 0; j < 3; j++){
            m.push(vec[j]);
        }
        m.push(x); m.push(y); m.push(50);
    }
    
}

function tree(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4){
    var beta = 45*Math.PI/180;
    var alpha1 = 0;
    var alpha2 = 120*Math.PI/180;
    var alpha3 = 240*Math.PI/180;
    var m;
    m.push(generate(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, alpha1, beta));
    m.push(generate(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, alpha2, beta));
    m.push(generate(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, alpha3, beta));
    return m;
}

function generate(x1, y1, z1, x2, y2, z2, x3, y3, z3, x4, y4, z4, alpha, beta){
    var x, y, z, u, t, v, a, b, c, m, n, p;
    var nx, ny, nz;
    x = x2-x1; y = y2-y1; z = z2-z1;
    a = x4-x3; b = y4-y3; c = z4-z3;
    var len = sqrt(x^2+y^2+z^2);
    var len1 = sqrt(a^2+b^2+c^2);
    x = x/len; y = y/len; z = z/len;
    nz.push(x); nz.push(y); nz.push(z);
    a = a/len1*sqrt(2);
    b = b/len1*sqrt(2);
    c = c/len1*sqrt(2);
    m = a-x; n = b-y; p = c-z;
    m = -m; n = -n; p = -p;
    nx.push(m); nx.push(n); nx.push(p);
    //ny = nz x nx
    ny.push(nz[1]*nx[2]-nz[2]*nx[1]);
    ny.push(-(nz[0]*nx[2]-nz[2]*nx[0]));
    ny.push(nz[0]*nx[1]-nz[1]*nx[0]);

    u = 0; t = 0; v = 1;
    u = u*sin(beta)+v*cos(beta);
    t = 0;
    v = u*cos(beta)-v*sin(beta);

    u = u*cos(alpha)-t*sin(alpha);
    t = u*sin(alpha)+t*cos(alpha);
    v = v;

    var vec = [u, t, v];
    var vec0 = [x2, y2, z2];
    vec = vec[0]*nx+vec[1]*ny+vec[2]*nz;
    vec = vec/(sqrt((vec[0])^2+(vec[1])^2+(vec[2])^2));
    vec = vec*len/2;
    vec = vec + vec0;

    return vec;
}