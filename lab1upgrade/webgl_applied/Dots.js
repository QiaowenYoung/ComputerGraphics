/* eslint no-console:0 consistent-return:0 */
"use strict";

function createShader(gl, type, source) {
    var shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    var program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    var success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}
var len;
var positions = [];  // The array for the position of a mouse press
var psize = [];
var colors = [];
function main() {
    // Get A WebGL context
    var canvas = document.getElementById("c");
    var gl = canvas.getContext("webgl");
    if (!gl) {
        return;
    }

    // Prevent the default setting for left/right click in the window
    canvas.oncontextmenu = function(ev){
        ev.preventDefault();
    }

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Get the strings for our GLSL shaders
    var vertexShaderSource = document.getElementById("2d-vertex-shader").text;
    var fragmentShaderSource = document.getElementById("2d-fragment-shader").text;

    // create GLSL shaders, upload the GLSL source, compile the shaders
    var vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    // Link the two shaders into a program
    var program = createProgram(gl, vertexShader, fragmentShader);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = function (ev) { click(ev, gl, canvas, program) };

    // Clear the canvas
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function click(ev, gl, canvas, program) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    // Store the coordinates to positions array
    positions.push(x);
    positions.push(y);

    if(ev.button === 0){
        psize.push(20.0);
        colors.push(1.0);
        colors.push(0.0);
        colors.push(0.0);
        colors.push(1.0);
    }
    else if(ev.button === 2){
        psize.push(10.0);
        colors.push(0.0);
        colors.push(0.0);
        colors.push(1.0);
        colors.push(1.0);
    }

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    len = positions.length;
    // Create a buffer and put three 2d clip space points in it
    var positionBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
    
    // look up where the vertex data needs to go.
    var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size1 = 2;          // 2 components per iteration
    var type1 = gl.FLOAT;   // the data is 32bit floats
    var normalize1 = false; // don't normalize the data
    var stride1 = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset1 = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionAttributeLocation, size1, type1, normalize1, stride1, offset1);
    
    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Create a buffer and put three 2d clip space points in it
    var sizeBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(psize), gl.DYNAMIC_DRAW);
    
    // look up where the vertex data needs to go.
    var sizeAttributeLocation = gl.getAttribLocation(program, "a_pointsize");
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size2 = 1;          // 2 components per iteration
    var type2 = gl.FLOAT;   // the data is 32bit floats
    var normalize2 = false; // don't normalize the data
    var stride2 = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset2 = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        sizeAttributeLocation, size2, type2, normalize2, stride2, offset2);
    
    // Turn on the attribute
    gl.enableVertexAttribArray(sizeAttributeLocation);

    // Create a buffer and put three 2d clip space points in it
    var colorBuffer = gl.createBuffer();

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.DYNAMIC_DRAW);
    
    // look up where the vertex data needs to go.
    var colorAttributeLocation = gl.getAttribLocation(program, "a_color");
    
    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    var size3 = 4;          // 4 components per iteration
    var type3 = gl.FLOAT;   // the data is 32bit floats
    var normalize3 = false; // don't normalize the data
    var stride3 = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset3 = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        colorAttributeLocation, size3, type3, normalize3, stride3, offset3);
    
    // Turn on the attribute
    gl.enableVertexAttribArray(colorAttributeLocation);
    
    // draw
    var primitiveType = gl.POINTS;
    var offset = 0;
    var count = len / 2;
    gl.drawArrays(primitiveType, offset, count);

}