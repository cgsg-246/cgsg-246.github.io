import { mat4 } from 'gl-matrix';

export let projectionMatrix = mat4.create();
export let viewMatrix = mat4.create();
export let modelMatrix = mat4.create();
export let mvpMatrix = mat4.create();

export let cameraAngleX = 0.35;
export let cameraAngleY = 0.9;
export let isDragging = false;
export let lastMouseX = 0, lastMouseY = 0;
export const cameraDistance = 3.6;

export function initMouseControl(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            e.preventDefault();
        }
    });
    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
        }
    });
}

export function updateProjection(gl) {
    const aspect = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 10.0);
}

export function updateViewMatrix() {
    const x = cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
    const y = cameraDistance * Math.sin(cameraAngleX);
    const z = cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);

    const cosX = Math.cos(cameraAngleX);
    const upY = cosX >= 0 ? 1 : -1;

    mat4.lookAt(viewMatrix, [x, y, z], [0, 0, 0], [0, upY, 0]);
}