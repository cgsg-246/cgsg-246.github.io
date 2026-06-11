import { Pane } from 'tweakpane';

let gl;
let startTime;
let param = {
    first: null,
    second: null,
    zoom: 1
};
let color1Loc;
let color2Loc;
let zoomLoc;
let offset = { x: 0.0, y: 0.0 };
let zoom = 1.0;


function initGL(canvas) {
    gl = canvas.getContext("webgl2");
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}

const shaderFs = `#version 300 es
precision highp float;
layout (location = 0) out vec4 o_color;

uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_zoom;

uniform vec2 u_offset; 

const vec2 SCREEN_RES = vec2(500.0, 500.0);

void main() {
    vec2 st = (gl_FragCoord.xy * 2.0 - SCREEN_RES) / SCREEN_RES.y;   
    vec2 Z = st / u_zoom + u_offset;
    
    vec2 C = vec2(0.4 + 0.1 * sin(u_time * 0.5), 0.19 + 0.1 * cos(u_time * 0.3));
    int n = 0;

    while (Z.x * Z.x + Z.y * Z.y < 256.0 && n < 255)
    {
        Z = vec2(Z.x * Z.x - Z.y * Z.y, Z.y * Z.x * 2.0) + C;
        n++;
    }

    vec3 finalColor;

    if (n == 255) {
        finalColor = vec3(0.0);
    } else {
        float log_zn = log(Z.x * Z.x + Z.y * Z.y) / 2.0;
        float nu = log(log_zn / log(2.0)) / log(2.0);
        float smooth_n = float(n) + 1.0 - nu;
        
        float t = smooth_n / 255.0;
        float edgeMask = smoothstep(0.0, 0.05, t); 

        float coordFactor = gl_FragCoord.x / SCREEN_RES.x;
        vec3 gradient = mix(u_color1, u_color2, coordFactor);

        finalColor = gradient * t * edgeMask;
    }

    o_color = vec4(finalColor, 1.0);
}`

const shaderVs = `#version 300 es
precision highp float;

layout (location = 0) in vec2 a_pos;

void main() {
    gl_Position = vec4(a_pos, 0, 1);
}`;

function getShader(shaderStr, type) {
    const shader = gl.createShader(type);

    gl.shaderSource(shader, shaderStr);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
    }

    return shader;
}

let u_time_location;
let OutOfset;

function initShaders() {

    const vs = getShader(shaderFs, gl.FRAGMENT_SHADER);
    const fs = getShader(shaderVs, gl.VERTEX_SHADER);

    const program = gl.createProgram();
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        alert("Program linkage error");
    }

    gl.useProgram(program);

    u_time_location = gl.getUniformLocation(program, "u_time");
    color1Loc = gl.getUniformLocation(program, "u_color1");
    color2Loc = gl.getUniformLocation(program, "u_color2");
    zoomLoc = gl.getUniformLocation(program, "u_zoom");
    OutOfset = gl.getUniformLocation(program, "u_offset");
}

let vertexBuffer;
function initBuffer() {
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    let vertices = [-1, 3, -1, -1, 3, -1];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vertices),
        gl.STATIC_DRAW
    );
}

function drawScene() {
    gl.clearColor(0, 0, 0, 1);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    let timeFromStart = new Date().getMilliseconds() - startTime;

    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform1f(u_time_location, timeFromStart / 1000.0);
    gl.uniform3fv(color1Loc, new Float32Array(param.first));
    gl.uniform3fv(color2Loc, new Float32Array(param.second));
    gl.uniform1f(zoomLoc, zoom);
    gl.uniform2f(OutOfset, offset.x, offset.y);

    gl.drawArrays(gl.TRIANGLES, 0, 3);
    window.requestAnimationFrame(drawScene);
}

export function Start() {
    let canvas = document.getElementById("webgl-canvas");

    let PARAMS = {
        color1: "#a87687",
        color2: "#ffffff",
    };
    const pane = new Pane();
    pane.addBinding(PARAMS, "color1");
    pane.addBinding(PARAMS, "color2");

    const hexToVec3 = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16) / 255;
        const g = parseInt(hex.slice(3, 5), 16) / 255;
        const b = parseInt(hex.slice(5, 7), 16) / 255;
        return [r, g, b];
    };

    param.first = hexToVec3(PARAMS.color1);
    param.second = hexToVec3(PARAMS.color2);

    pane.on('change', () => {
        param.first = hexToVec3(PARAMS.color1);
        param.second = hexToVec3(PARAMS.color2);
    });

    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };

    const CANVAS_WIDTH = canvas.width;
    const CANVAS_HEIGHT = canvas.height;

    function getNormalizedMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        return {
            x: (mouseX * 2.0 - CANVAS_WIDTH) / CANVAS_HEIGHT,
            y: ((CANVAS_HEIGHT - mouseY) * 2.0 - CANVAS_HEIGHT) / CANVAS_HEIGHT // инверсия Y, так как в WebGL Y идет вверх
        };
    }

    canvas.addEventListener("mousedown", (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        offset.x -= (deltaX * 2.0) / CANVAS_HEIGHT / zoom;
        offset.y += (deltaY * 2.0) / CANVAS_HEIGHT / zoom;

        previousMousePosition = { x: e.clientX, y: e.clientY };

    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });

    canvas.addEventListener("wheel", (e) => {
        e.preventDefault();

        const mousePos = getNormalizedMousePos(e);
        const beforeZoomX = mousePos.x / zoom + offset.x;
        const beforeZoomY = mousePos.y / zoom + offset.y;

        const zoomFactor = 1.1;
        if (e.deltaY < 0) {
            zoom *= zoomFactor;
        } else {
            zoom /= zoomFactor;
        }

        zoom = Math.max(0.1, Math.min(zoom, 100000.0));

        offset.x = beforeZoomX - mousePos.x / zoom;
        offset.y = beforeZoomY - mousePos.y / zoom;


    }, { passive: false });

    initGL(canvas);
    initShaders();
    initBuffer();

    startTime = new Date().getMilliseconds();
    drawScene();
}