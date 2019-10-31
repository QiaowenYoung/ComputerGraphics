var cylinderl = [], cylinderr = []; // cylinderl stores a tree created by a left click; cylinderr the right one
var positionsl = [], positionsr = [];
var ml = [], mr = []; // see in function generate_point
var nl = [], nr = [];

function main(){
    positionsl.push(0); positionsl.push(0); positionsl.push(0);
    positionsl.push(0); positionsl.push(0); positionsl.push(50);
    trees(1);
    positionsl = positionsl.concat(ml);
    positionsr.push(0); positionsr.push(0); positionsr.push(0);
    positionsr.push(0); positionsr.push(0); positionsr.push(40);
    trees(2);
    positionsr = positionsr.concat(mr);

    var l1 = positionsl.length;
    var l2 = positionsr.length;
    for (var i = 0; i < l1; i += 6) {
        var array = branch(positionsl[i], positionsl[i + 1], positionsl[i + 2], positionsl[i + 3], positionsl[i + 4], positionsl[i + 5]);
        cylinderl = cylinderl.concat(array);
    }
    for (var i = 0; i < l2; i += 6) {
        var array = branch(positionsr[i], positionsr[i + 1], positionsr[i + 2], positionsr[i + 3], positionsr[i + 4], positionsr[i + 5]);
        cylinderr = cylinderr.concat(array);
    }

    // Calculate normals for both left-click tree and right-click tree
    setNormals();
}


/* setNormals
 *
 * Thoughts:
 * I get every 3 points' coordinates, and in a CCW mark them as a, b, c.
 * Then, I calculate ba and bc, and do the cross product so I can get the normal for this plane.
 * In this way, I get all the coordinates for a left-click tree's normals and store them into the array "nl".
 * The right-click tree's normals are stored into "nr".
 */
function setNormals() {
    var l1 = cylinderl.length;
    var normall = [];
    for (var i = 0; i < l1; i += 9) {
        var a = [cylinderl[i], cylinderl[i + 1], cylinderl[i + 2]];
        var b = [cylinderl[i + 3], cylinderl[i + 4], cylinderl[i + 5]];
        var c = [cylinderl[i + 6], cylinderl[i + 7], cylinderl[i + 8]];
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

        normall = normall.concat(normalb);
        normall = normall.concat(a);
        normall = normall.concat(b);
        normall = normall.concat(c);
    }
    for (var i = 0; i < l1; i += 3) {
        var point = [cylinderl[i], cylinderl[i + 1], cylinderl[i + 2]];
        var normal = [0.0, 0.0, 0.0];
        var l = normall.length;
        for (var j = 0; j < l; j += 12) {
            if (normall[j + 3] == point[0] && normall[j + 4] == point[1] && normall[j + 5] == point[2]) {
                normal[0] += normall[j];
                normal[1] += normall[j + 1];
                normal[2] += normall[j + 2];
                continue;
            }
            if (normall[j + 6] == point[0] && normall[j + 7] == point[1] && normall[j + 8] == point[2]) {
                normal[0] += normall[j];
                normal[1] += normall[j + 1];
                normal[2] += normall[j + 2];
                continue;
            }
            if (normall[i + 9] == point[0] && normall[i + 10] == point[1] && normall[i + 11] == point[2]) {
                normal[0] += normall[j];
                normal[1] += normall[j + 1];
                normal[2] += normall[j + 2];
                continue;
            }
        }
        var len = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));
        if (len != 0) {
            normal[0] /= len;
            normal[1] /= len;
            normal[2] /= len;
        }
        nl = nl.concat(normal);
    }

    var l2 = cylinderr.length;
    var normalr = [];
    for (var i = 0; i < l2; i += 9) {
        var a = [cylinderr[i], cylinderr[i + 1], cylinderr[i + 2]];
        var b = [cylinderr[i + 3], cylinderr[i + 4], cylinderr[i + 5]];
        var c = [cylinderr[i + 6], cylinderr[i + 7], cylinderr[i + 8]];
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

        normalr = normalr.concat(normalb);
        normalr = normalr.concat(a);
        normalr = normalr.concat(b);
        normalr = normalr.concat(c);

    }
    for (var i = 0; i < l2; i += 3) {
        var point = [cylinderr[i], cylinderr[i + 1], cylinderr[i + 2]];
        var normal = [0.0, 0.0, 0.0];
        var l = normalr.length;
        for (var j = 0; j < l; j += 12) {
            if (normalr[j + 3] == point[0] && normalr[j + 4] == point[1] && normalr[j + 5] == point[2]) {
                normal[0] += normalr[j];
                normal[1] += normalr[j + 1];
                normal[2] += normalr[j + 2];
                continue;
            }
            if (normalr[j + 6] == point[0] && normalr[j + 7] == point[1] && normalr[j + 8] == point[2]) {
                normal[0] += normalr[j];
                normal[1] += normalr[j + 1];
                normal[2] += normalr[j + 2];
                continue;
            }
            if (normalr[j + 9] == point[0] && normalr[j + 10] == point[1] && normalr[j + 11] == point[2]) {
                normal[0] += normalr[j];
                normal[1] += normalr[j + 1];
                normal[2] += normalr[j + 2];
                continue;
            }
        }
        var len = Math.sqrt(Math.pow(normal[0], 2) + Math.pow(normal[1], 2) + Math.pow(normal[2], 2));
        if (len != 0) {
            normal[0] /= len;
            normal[1] /= len;
            normal[2] /= len;
        }
        nr = nr.concat(normal);
    }
}

function branch(x0, y0, z0, x1, y1, z1) {
    var array = [];
    var points = [];
    var vec = [x1 - x0, y1 - y0, z1 - z0];
    var height = Math.sqrt(Math.pow(vec[0], 2) + Math.pow(vec[1], 2) + Math.pow(vec[2], 2));
    var r1 = height / 20;
    var r2 = height / 10;
    var theta = Math.PI / 6;
    var topx = [], topy = [];
    var bottomx = [], bottomy = [];
    for (var i = 0; i < 12; i++) {
        var top_x = r1 * Math.cos(i * theta);
        var top_y = r1 * Math.sin(i * theta);
        var bottom_x = r2 * Math.cos(i * theta);
        var bottom_y = r2 * Math.sin(i * theta);
        topx.push(top_x);
        topy.push(top_y);
        bottomx.push(bottom_x);
        bottomy.push(bottom_y);
    }
    topx.push(topx[0]);
    topy.push(topy[0]);
    bottomx.push(bottomx[0]);
    bottomy.push(bottomy[0]);
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
    // normalize vec
    var la = Math.sqrt(Math.pow(axis[0], 2) + Math.pow(axis[1], 2) + Math.pow(axis[2], 2));
    if (la != 0) {
        axis[0] /= la;
        axis[1] /= la;
        axis[2] /= la;
    }

    var r_angle = Math.acos(0 * vec[0] + 0 * vec[1] + 1 * vec[2]);

    // rotational matrix
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
        // do rotation and translation
        array.push(m00 * x + m01 * y + m02 * z + x0);
        array.push(m10 * x + m11 * y + m12 * z + y0);
        array.push(m20 * x + m21 * y + m22 * z + z0);
    }
    return array;
}

/* trees:
 * input:
 * n: 1 for a red tree, other for a blue tree
 * output:
 * none
 * use:
 * fills the array positionsl/positionsr with all the points' coordinates 
 * for a left-click/right-click wireframe tree
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
 * l0: either 50 or 40
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