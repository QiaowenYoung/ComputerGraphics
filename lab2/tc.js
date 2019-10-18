// Vertex shader program
var VSHADER_SOURCE =
    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Color;\n' +
    'attribute vec3 a_Normal;\n' +        // Normal
    'uniform mat4 u_MvpMatrix;\n' +
    'uniform vec3 u_LightColor;\n' +     // Light color
    'uniform vec3 u_LightDirection;\n' + // Light direction (in the world coordinate, normalized)
    'varying vec4 v_Color;\n' +
    'void main() {\n' +
    '  gl_Position = u_MvpMatrix * a_Position ;\n' +
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

var points = [];
var colors = [];
var n = [];
var shown = [];
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
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to intialize shaders.');
        return;
    }

    /* decide positions */
    generate_tc(); // generate points stored in the array points
    var vertices = new Float32Array(points);
    // Create a buffer object
    var positionbuffer = gl.createBuffer();
    if (!positionbuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Write the vertex coordinates and color to the buffer object
    gl.bindBuffer(gl.ARRAY_BUFFER, positionbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    // Assign the buffer object to a_Position and enable the assignment
    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    /* end */

    /* decide colors of the polygon itself */
    setColors();
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
    // Assign the buffer object to a_Position and enable the assignment
    var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
    if (a_Color < 0) {
        console.log('Failed to get the storage location of a_Color');
        return -1;
    }
    gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Color);
    /* end */

    /* decide normals */
    setNormals();
    var normals = new Float32Array(n);
    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, normals, gl.STATIC_DRAW);
    var normalLocation = gl.getAttribLocation(gl.program, "a_Normal");
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    // Turn on the normal attribute
    gl.enableVertexAttribArray(normalLocation);
    // Put normals data into buffer
    /* end */

    /* decide light color */
    var colorLocation = gl.getUniformLocation(gl.program, "u_LightColor");
    // Set the color to use
    gl.uniform3fv(colorLocation, [1.0, 1.0, 1.0]); // white
    /* end */

    /* decide direction of light */
    var LightDirectionLocation =
        gl.getUniformLocation(gl.program, "u_LightDirection");
    var lightDirection = new Vector3([1.0, 1.0, 1.0]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(LightDirectionLocation, lightDirection.elements);
    /* end */

    // Specify the color for clearing <canvas>
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // Clear color and depth buffer
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    /* decide default view direction */
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }
    // Set the eye point and the viewing volume
    var mvpMatrix = new Matrix4();
    //mvpMatrix.setPerspective(150, canvas.width / canvas.height, 1, 100);
    mvpMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
    mvpMatrix.setLookAt(0, 0, 1, 0, 0, 0, 0, 1, 0);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    /* end */

    var len = points.length / 3;
    gl.drawArrays(gl.TRIANGLES, 0, len);

    /* decide u_MvpMatrix */
    var checkbox1 = document.getElementById('toggle1');
    checkbox1.addEventListener('change', function () {
        if (checkbox1.checked) {
            toggle1 = 1;
            setSideView(gl);
        } else {
            toggle1 = 0;
            setTopView(gl);
        }
    });

    var checkbox2 = document.getElementById('toggle2');
    checkbox2.addEventListener('change', function () {
        if (checkbox2.checked) {
            toggle2 = 1;
            if (toggle1 == 0) {
                setTopView(gl);
            }
            else {
                setSideView(gl);
            }
        } else {
            toggle2 = 0;
            if (toggle1 == 0) {
                setTopView(gl);
            }
            else {
                setSideView(gl);
            }
        }
    });

    var checkbox3 = document.getElementById('toggle3');
    checkbox3.addEventListener('change', function () {
        if (checkbox3.checked) {
            toggle3 = 1;
            if (toggle1 == 0) {
                setTopView(gl);
            }
            else {
                setSideView(gl);
            }
        } else {
            toggle3 = 0;
            if (toggle1 == 0) {
                setTopView(gl);
            }
            else {
                setSideView(gl);
            }
        }
    });
}

/* showNormals
 * input:
 * gl
 * output:
 * none
 * use:
 * display normals for each polygon plane
 */
function showNormals(gl) {
    var len = points.length;
    for (var i = 0; i < len; i++) {
        shown.push(n[i] + points[i]);
    }
}

/* setColors
 * input:
 * none
 * output:
 * none
 * use:
 * initialize values of polygon's color
 */
function setColors() {
    var len = points.length / 3;
    for (var i = 0; i < len; i++) {
        colors.push(1.0);
        colors.push(0.0);
        colors.push(0.0);
        colors.push(1.0);
    }
}

/* setTopView
 * input:
 * gl
 * output:
 * none
 * use:
 * change view to top
 */
function setTopView(gl) {
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }
    // Set the eye point and the viewing volume
    var mvpMatrix = new Matrix4();
    mvpMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
    mvpMatrix.setLookAt(0, 0, 1, 0, 0, 0, 0, 1, 0);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var len = points.length / 3;
    if (toggle2 == 0 && toggle3 == 0) {
        gl.drawArrays(gl.TRIANGLES, 0, len);
    }
    else if (toggle2 == 1 && toggle3 == 0) {
        gl.drawArrays(gl.LINE_STRIP, 0, len);
    }
}

/* setSideView
 * input:
 * gl
 * output:
 * none
 * use:
 * change view to side
 */
function setSideView(gl) {
    // Get the storage location of u_MvpMatrix
    var u_MvpMatrix = gl.getUniformLocation(gl.program, 'u_MvpMatrix');
    if (!u_MvpMatrix) {
        console.log('Failed to get the storage location of u_MvpMatrix');
        return;
    }
    // Set the eye point and the viewing volume
    var mvpMatrix = new Matrix4();
    mvpMatrix.setOrtho(-1, 1, -1, 1, -2, 2);
    mvpMatrix.setLookAt(0, -1, 0.75, 0, 0, 0, 0, 1, 0);
    // Pass the model view projection matrix to u_MvpMatrix
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    var len = points.length / 3;
    if (toggle2 == 0 && toggle3 == 0) {
        gl.drawArrays(gl.TRIANGLES, 0, len);
    }
    else if (toggle2 == 1 && toggle3 == 0) {
        gl.drawArrays(gl.LINE_STRIP, 0, len);
    }
}

/* setNormals:
 * input:
 * none
 * output:
 * none
 * use:
 * calculate normals of each polygon and store them in the array n
 */
function setNormals() {
    var len = points.length;
    for (var i = 0; i < len; i += 9) {
        var a = [points[i], points[i + 1], points[i + 2]];
        var b = [points[i + 3], points[i + 4], points[i + 5]];
        var c = [points[i + 6], points[i + 7], points[i + 8]];
        var ac = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
        var ab = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        var ba = [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
        var bc = [c[0] - b[0], c[1] - b[1], c[2] - b[2]];
        var ca = [a[0] - c[0], a[1] - c[1], a[2] - c[2]];
        var cb = [b[0] - c[0], b[1] - c[1], b[2] - c[2]];
        var normala = [];
        var normalb = [];
        var normalc = [];

        normala.push(ab[1] * ac[2] - ab[2] * ac[1]);
        normala.push(ac[0] * ab[2] - ac[2] * ab[0]);
        normala.push(ab[0] * ac[1] - ab[1] * ac[0]);
        var lena = Math.sqrt(Math.pow(normala[0], 2) + Math.pow(normala[1], 2) + Math.pow(normala[2], 2));
        normala[0] /= lena;
        normala[1] /= lena;
        normala[2] /= lena;

        normalb.push(bc[1] * ba[2] - bc[2] * ba[1]);
        normalb.push(ba[0] * bc[2] - ba[2] * bc[0]);
        normalb.push(bc[0] * ba[1] - bc[1] * ba[0]);
        var lenb = Math.sqrt(Math.pow(normalb[0], 2) + Math.pow(normalb[1], 2) + Math.pow(normalb[2], 2));
        normalb[0] /= lenb;
        normalb[1] /= lenb;
        normalb[2] /= lenb;

        normalc.push(ca[1] * cb[2] - ca[2] * cb[1]);
        normalc.push(cb[0] * ca[2] - cb[2] * ca[0]);
        normalc.push(ca[0] * cb[1] - ca[1] * cb[0]);
        var lenc = Math.sqrt(Math.pow(normalc[0], 2) + Math.pow(normalc[1], 2) + Math.pow(normalc[2], 2));
        normalc[0] /= lenc;
        normalc[1] /= lenc;
        normalc[2] /= lenc;

        n = n.concat(normala);
        n = n.concat(normalb);
        n = n.concat(normalc);
    }
}

/* generate_tc:
 * input:
 * none
 * output:
 * an array storing all the coordinates required for a tapered cyindar
 * use:
 * fill the array "points" with all the coordinates need for a tapered cylindar
 * this cylindar is located at (0, 0)
 */
function generate_tc() {
    var r1 = 0.05;
    var r2 = 0.1;
    var theta = Math.PI / 6;
    var height = 1;
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
        points.push(topx[i]);
        points.push(topy[i]);
        points.push(height);
        points.push(bottomx[i]);
        points.push(bottomy[i]);
        points.push(0.0);
        points.push(topx[i + 1]);
        points.push(topy[i + 1]);
        points.push(height);
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
}