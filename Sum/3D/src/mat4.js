import { mat4 } from 'gl-matrix';

export let projectionMatrix = mat4.create();
export let viewMatrix = mat4.create();
export let modelMatrix = mat4.create();
export let mvpMatrix = mat4.create();

export let cameraAngleX = 0.35;
export let cameraAngleY = 0.9;
export let cameraDistance = 3.6; 

let isDragging = false;
let lastMouseX = 0, lastMouseY = 0;

export function initMouseControl(canvas) {
    canvas.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            isDragging = true;
            lastMouseX = e.clientX;
            lastMouseY = e.clientY;
            e.preventDefault();
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - lastMouseX;
        const deltaY = e.clientY - lastMouseY;

        const sensitivity = 0.005; 
        cameraAngleY += deltaX * sensitivity;
        cameraAngleX -= deltaY * sensitivity;

        const maxPitch = Math.PI / 2 - 0.01;
        if (cameraAngleX > maxPitch) cameraAngleX = maxPitch;
        if (cameraAngleX < -maxPitch) cameraAngleX = -maxPitch;

        lastMouseX = e.clientX;
        lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        console.log("Крутим колесо! DeltaY:", e.deltaY, "Текущая дистанция:", cameraDistance);
    
        const zoomSensitivity = 0.002;
        cameraDistance += e.deltaY * zoomSensitivity;
        
        const minDistance = 1.5;
        const maxDistance = 8.0;
        if (cameraDistance < minDistance) cameraDistance = minDistance;
        if (cameraDistance > maxDistance) cameraDistance = maxDistance;
    }, { passive: false });
}

export function updateProjection(gl) {
    const aspect = gl.canvas.width / gl.canvas.height;
    mat4.perspective(projectionMatrix, Math.PI / 4, aspect, 0.1, 10.0);
}

export function updateViewMatrix() {
    const x = cameraDistance * Math.sin(cameraAngleY) * Math.cos(cameraAngleX);
    const y = cameraDistance * Math.sin(cameraAngleX);
    const z = cameraDistance * Math.cos(cameraAngleY) * Math.cos(cameraAngleX);

    mat4.lookAt(viewMatrix, [x, y, z], [0, 0, 0], [0, 1, 0]);
}
