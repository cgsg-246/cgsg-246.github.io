import { Pane } from 'tweakpane';
import * as MyLib from './mat4.js';
import { drawcapsule } from './drawcapsule.js';
import { drawScene, initShaders, initBuffer, getShader } from './draw.js';

export let gl;
export let startTime;

let shaderVs, shaderFs;

function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    if (!gl) {
        alert("WebGL 2 не поддерживается");
    }
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

export function Start() {
    let canvas = document.getElementById("webgl-canvas");
    initGL(canvas);

    let paramspane = { color: null };
    let PARAMS = {
        color: "#a87687"
    };

    const pane = new Pane();

    const hexToVec3 = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
    };

    paramspane.color = hexToVec3(PARAMS.color);

    pane.addBinding(PARAMS, "color").on('change', () => {
        paramspane.color = hexToVec3(PARAMS.color);
        drawScene(paramspane.color);
    });

    const geom = drawcapsule(0.68, 1.45, 44, 20, 18);

    shaderVs = getShader(`#version 300 es
    layout(location = 0) in vec3 a_position;
    layout(location = 1) in vec3 a_normal;
    uniform mat4 u_mvpMatrix;
    out vec3 v_normal;
    void main() {
        gl_Position = u_mvpMatrix * vec4(a_position, 1.0);
        v_normal = a_normal;
    }`, gl.VERTEX_SHADER, gl);

    shaderFs = getShader(`#version 300 es
    precision highp float;
    uniform vec3 u_color;
    in vec3 v_normal;
    out vec4 o_color;
    void main() {
        vec3 normal = normalize(v_normal);
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diff = max(dot(normal, lightDir), 0.0);
        vec3 ambient = 0.2 * u_color;
        vec3 diffuse = diff * u_color;
        o_color = vec4(ambient + diffuse, 1.0);
    }`, gl.FRAGMENT_SHADER, gl);

    initShaders(shaderVs, shaderFs, gl);
    initBuffer(geom);

    MyLib.updateProjection(gl);
    MyLib.initMouseControl(canvas); 

    startTime = performance.now();

    function renderLoop() {
        if (canvas.width !== canvas.clientWidth || canvas.height !== canvas.clientHeight) {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientHeight;
            gl.viewport(0, 0, canvas.width, canvas.height);
            MyLib.updateProjection(gl);
        }

        drawScene(paramspane.color);
        requestAnimationFrame(renderLoop);
    }

    requestAnimationFrame(renderLoop);
}