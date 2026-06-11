import { mat4 } from 'gl-matrix';
import * as MyLib from './mat4.js';

let Uniforms = {
    u_time_location: null,
    u_color_loc: null,
    u_mvpMatrixLoc: null,
    indexCount: null,
    vao: null
};

let gl;

export function LoadSheder(url) {
    return fetch(url)
        .then(response => response.ok ? response.text() : null)
        .catch(() => null);
}

export function getShader(shaderStr, type, GL) {
    gl = GL;
    const shader = gl.createShader(type);
    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }
    return shader;
}

export function initShaders(shaderVs, shaderFs, GL) {
    gl = GL;
    const program = gl.createProgram();
    gl.attachShader(program, shaderVs);
    gl.attachShader(program, shaderFs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Program linkage error");
    }

    gl.useProgram(program);
    Uniforms.u_time_location = gl.getUniformLocation(program, "u_time");
    Uniforms.u_color_loc = gl.getUniformLocation(program, "u_color");
    Uniforms.u_mvpMatrixLoc = gl.getUniformLocation(program, "u_mvpMatrix");
}

export function drawScene(color) {
    if (!gl) return;

    gl.clearColor(0.07, 0.09, 0.14, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    MyLib.updateViewMatrix();
    mat4.identity(MyLib.modelMatrix);

    mat4.multiply(MyLib.mvpMatrix, MyLib.projectionMatrix, MyLib.viewMatrix);
    mat4.multiply(MyLib.mvpMatrix, MyLib.mvpMatrix, MyLib.modelMatrix);

    gl.uniformMatrix4fv(Uniforms.u_mvpMatrixLoc, false, MyLib.mvpMatrix);
    gl.uniform3fv(Uniforms.u_color_loc, color);

    gl.bindVertexArray(Uniforms.vao);
    gl.drawElements(gl.TRIANGLES, Uniforms.indexCount, gl.UNSIGNED_INT, 0);
    gl.bindVertexArray(null);
}

export function initBuffer(geom) {
    if (!gl) return;

    const positions = geom.positions;
    const normals = geom.normals;
    const indices = geom.indices;
    Uniforms.indexCount = indices.length;

    Uniforms.vao = gl.createVertexArray();
    gl.bindVertexArray(Uniforms.vao);

    let vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

    let normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

    let indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(indices), gl.STATIC_DRAW);

    gl.bindVertexArray(null);
}
