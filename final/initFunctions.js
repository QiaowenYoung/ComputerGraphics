// This file contains all the initialize work.

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
            mvpMatrix.setPerspective(90 + zooming, 1, 10, 1000);
        }
        mvpMatrix.lookAt(200 * panx, 200 * pany, 200 + camera1, 200 * panx, 200 * pany, 0, 0, 1, 0);
    }
    else { // Side
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        }
        else {
            mvpMatrix.setPerspective(90 + zooming, 1, 10, 1000);
        }
        mvpMatrix.lookAt(200 * panx, -200 / camera2 + 200 * pany, 75 / camera2, 200 * panx, 200 * pany, 0, 0, 1, 0);
    }
    gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
}

function animate(angle) {
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
    // Update the current rotation angle (adjusted by the elapsed time)
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle % 360;
}

function initMatrix2(gl, cylinderProgram, tx, ty, tz) {
    gl.useProgram(cylinderProgram);
    var mvpMatrix = new Matrix4();
    var vpMatrix = new Matrix4();
    var modelMatrix = new Matrix4();
    currentAngle = animate(currentAngle);  // Update the rotation angle
    var angle = currentAngle * Math.PI / 180;
    if (toggle2 == 0) { //Ortho
        vpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        gl.uniform4f(cylinderProgram.u_Translation, 200 * (tx - selected[2]), 200 * (ty - selected[3]), tz, 0.0);
    }
    else {
        vpMatrix.setPerspective(90, 1, 10, 1000);
        gl.uniform4f(cylinderProgram.u_Translation, 200 * (tx - selected[2]), 200 * (ty - selected[3]), 200 * tz, 0.0);
    }
    var eyefromx = 0;
    var eyefromy = 0;
    var eyetox = 100 * Math.cos(angle);
    var eyetoy = 100 * Math.sin(angle);
    vpMatrix.lookAt(eyefromx, eyefromy, 80, eyetox, eyetoy, 80, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
}

function initMatrix3(gl, cylinderProgram, tx, ty, tz) {
    gl.useProgram(cylinderProgram);
    var mvpMatrix = new Matrix4();
    var vpMatrix = new Matrix4();
    var modelMatrix = new Matrix4();
    currentAngle = animate(currentAngle);
    var angle = currentAngle * Math.PI / 180;
    if (toggle2 == 0) { //Ortho
        vpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        gl.uniform4f(cylinderProgram.u_Translation, 200 * (tx - selected[2]), 200 * (ty - selected[3]), tz, 0.0);
    }
    else {
        vpMatrix.setPerspective(90, 1, 10, 1000);
        gl.uniform4f(cylinderProgram.u_Translation, 200 * (tx - selected[2]), 200 * (ty - selected[3]), 200 * tz, 0.0);
    }
    var eyefromx = 100 * Math.cos(angle);
    var eyefromy = 100 * Math.sin(angle);
    var eyetox = 0;
    var eyetoy = 0;
    vpMatrix.lookAt(eyefromx, eyefromy, 80, eyetox, eyetoy, 80, 0, 0, 1);
    mvpMatrix.set(vpMatrix).multiply(modelMatrix);
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
function initTranslation(gl, cylinderProgram, tx, ty, tz) {
    gl.useProgram(cylinderProgram);
    gl.uniform4f(cylinderProgram.u_Translation, 200 * tx, 200 * ty, 200 * tz, 0.0);
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


function initPositionsBG(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var vertices = new Float32Array(pos);
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

function initColorsBG(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    gl.vertexAttrib4f(cylinderProgram.a_Color, 102/255, 51/255, 0.0, 1.0);
}

function initNormalsBG(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var n = new Float32Array(ns);
    // Create a buffer to put normals in
    var normalBuffer = gl.createBuffer();
    if (!normalBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = normalBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, n, gl.STATIC_DRAW);
    gl.vertexAttribPointer(cylinderProgram.a_Normal, 3, gl.FLOAT, false, 0, 0);
    // Turn on the normal attribute
    gl.enableVertexAttribArray(cylinderProgram.a_Normal);
}

function initLightColorBG(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    gl.uniform3fv(cylinderProgram.u_LightColor, [1.0, 1.0, 1.0]); // white
}

function initLightDirectionBG(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    var lightDirection = new Vector3([1.0, 1.0, 1.0]);
    lightDirection.normalize();     // Normalize
    gl.uniform3fv(cylinderProgram.u_LightDirection, lightDirection.elements);
}

function initMatrixBG(gl, cylinderProgram, tag1, tag2) {
    gl.useProgram(cylinderProgram);
    var mvpMatrix = new Matrix4();
    if (tag1 == 0) { // Top view
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        }
        else {
            mvpMatrix.setPerspective(90 + zooming, 1, 10, 1000);
        }
        mvpMatrix.lookAt(0, 0, 200 + camera1, 0, 0, 0, 0, 1, 0);
    }
    else { // Side
        if (tag2 == 0) { //Ortho
            mvpMatrix.setOrtho(-200, 200, -200, 200, -1000, 1000);
        }
        else {
            mvpMatrix.setPerspective(90 + zooming, 1, 10, 1000);
        }
        mvpMatrix.lookAt(0, -200 / camera2, 75 / camera2, 0, 0, 0, 0, 1, 0);
    }
    gl.uniformMatrix4fv(cylinderProgram.u_mvpMatrix, false, mvpMatrix.elements);
}

function initGlossBG(gl, cylinderProgram) {
    gl.useProgram(cylinderProgram);
    gl.uniform1f(cylinderProgram.u_shininessVal, 20.0);
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

/* setHeight
 * input:
 * x, y: mouse posiitions
 * h: default to be 0.1 or -0.1, the increment of height of mouse position
 * output:
 * none
 * use:
 * modify pos array according to mouse position: 
 * when you move your mouse on canvas, the trace of your mouse will turn to hills or basins
 */
function setHeight(x, y, h) {
    x = x * 200;
    y = y * 200;
    var target = [];
    var tag = 1;
    for (var i = 0; i < pos.length; i += 3) {
        var r = Math.sqrt(Math.pow(pos[i] - x, 2) + Math.pow(pos[i + 1] - y, 2));
        if (r <= 10) {
            for (var j = 0; j < target.length; j += 3){
                if (target[j] == pos[i] && target[j + 1] == pos[i + 1]){
                    tag = 0;
                }
            }
            if (tag == 1) {
                target.push(pos[i]);
                target.push(pos[i + 1]);
                target.push(pos[i + 2]);
            }
            tag = 1;
        }
    }
    for (var i = 0; i < target.length; i += 3) {
        var r = Math.sqrt(Math.pow(target[i] - x, 2) + Math.pow(target[i + 1] - y, 2));
        target[i + 2] += 200 * h * (10 - r) / 10;
    }
    for (var i = 0; i < target.length; i += 3) {
        for (var j = 0; j < pos.length; j += 3) {
            if (pos[j] == target[i] && pos[j + 1] == target[i + 1]) {
                pos[j + 2] = target[i + 2];
            }
        }
    }
}

function setPositionsBG(div) {
    // will divide the background into div ^ 2 grids
    pos = [];
    var grid = 400.0 / div; // side length of every grid
    for (var i = div; i > 0; i--) { // i: # of row, y coord
        for (var j = 0; j < div; j++) { // j: # of column, x coord
            pos.push(j * grid); pos.push(i * grid); pos.push(0);
            pos.push(j * grid); pos.push((i - 1) * grid); pos.push(0);
            pos.push((j + 1) * grid); pos.push(i * grid); pos.push(0);

            pos.push((j + 1) * grid); pos.push(i * grid); pos.push(0);
            pos.push(j * grid); pos.push((i - 1) * grid); pos.push(0);
            pos.push((j + 1) * grid); pos.push((i - 1) * grid); pos.push(0);
        }
    }
    for (var i = 0; i < pos.length; i += 3) {
        pos[i] -= 200;
        pos[i + 1] -= 200;
    }
}
function setNormalsBG() {
    var l = pos.length;
    var n = [];
    ns = [];
    for (var i = 0; i < l; i += 9) {
        var a = [pos[i], pos[i + 1], pos[i + 2]];
        var b = [pos[i + 3], pos[i + 4], pos[i + 5]];
        var c = [pos[i + 6], pos[i + 7], pos[i + 8]];
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
        n = n.concat(a);
        n = n.concat(b);
        n = n.concat(c);
    }
    for (var i = 0; i < l; i += 3) {
        var point = [pos[i], pos[i + 1], pos[i + 2]];
        var normal = [0.0, 0.0, 0.0];
        var l1 = n.length;
        for (var j = 0; j < l1; j += 12) {
            if (n[j + 3] == point[0] && n[j + 4] == point[1] && n[j + 5] == point[2]) {
                normal[0] += n[j];
                normal[1] += n[j + 1];
                normal[2] += n[j + 2];
                continue;
            }
            if (n[j + 6] == point[0] && n[j + 7] == point[1] && n[j + 8] == point[2]) {
                normal[0] += n[j];
                normal[1] += n[j + 1];
                normal[2] += n[j + 2];
                continue;
            }
            if (n[j + 9] == point[0] && n[j + 10] == point[1] && n[j + 11] == point[2]) {
                normal[0] += n[j];
                normal[1] += n[j + 1];
                normal[2] += n[j + 2];
                continue;
            }
        }
        var len = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));
        if (len != 0) {
            normal[0] /= len;
            normal[1] /= len;
            normal[2] /= len;
        }
        ns = ns.concat(normal);
    }
}

