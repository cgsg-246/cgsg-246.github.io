export function drawcapsule(capsuleradius = 0.68, cylinderHeight = 1.45, radialSegments = 44, heightSegments = 20, capSegments = 18) {
    const positions = [];
    const normals = [];
    const indices = [];
    const halfH = cylinderHeight * 0.5;
    const bottomY = -halfH;
    const topY = halfH;

    for (let i = 0; i <= heightSegments; i++) {
        const y = -halfH + (i / heightSegments) * cylinderHeight;
        for (let j = 0; j <= radialSegments; j++) {
            const theta = (j / radialSegments) * Math.PI * 2;
            const x = capsuleradius * Math.cos(theta);
            const z = capsuleradius * Math.sin(theta);
            positions.push(x, y, z);

            const nx = Math.cos(theta);
            const nz = Math.sin(theta);
            const len = Math.sqrt(nx * nx + nz * nz);
            normals.push(nx / len, 0, nz / len);
        }
    }
    for (let i = 0; i < heightSegments; i++) {
        for (let j = 0; j < radialSegments; j++) {
            const a = i * (radialSegments + 1) + j;
            const b = i * (radialSegments + 1) + j + 1;
            const c = (i + 1) * (radialSegments + 1) + j;
            const d = (i + 1) * (radialSegments + 1) + j + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    const startIdxBottom = positions.length / 3;
    const phiStart = -Math.PI / 2;
    let phiEnd = 0;
    for (let i = 0; i <= capSegments; i++) {
        const phi = phiStart + (i / capSegments) * (phiEnd - phiStart);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const yOff = bottomY + capsuleradius * sinPhi;
        for (let j = 0; j <= radialSegments; j++) {
            const theta = (j / radialSegments) * Math.PI * 2;
            const x = capsuleradius * cosPhi * Math.cos(theta);
            const z = capsuleradius * cosPhi * Math.sin(theta);
            positions.push(x, yOff, z);

            const nx = cosPhi * Math.cos(theta);
            const ny = sinPhi;
            const nz = cosPhi * Math.sin(theta);
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals.push(nx / len, ny / len, nz / len);
        }
    }
    for (let i = 0; i < capSegments; i++) {
        for (let j = 0; j < radialSegments; j++) {
            const a = startIdxBottom + i * (radialSegments + 1) + j;
            const b = startIdxBottom + i * (radialSegments + 1) + j + 1;
            const c = startIdxBottom + (i + 1) * (radialSegments + 1) + j;
            const d = startIdxBottom + (i + 1) * (radialSegments + 1) + j + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }

    const startIdxTop = positions.length / 3;
    const phiStartTop = 0;
    let phiEndTop = Math.PI / 2;
    for (let i = 0; i <= capSegments; i++) {
        const phi = phiStartTop + (i / capSegments) * (phiEndTop - phiStartTop);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        const yOff = topY + capsuleradius * sinPhi;
        for (let j = 0; j <= radialSegments; j++) {
            const theta = (j / radialSegments) * Math.PI * 2;
            const x = capsuleradius * cosPhi * Math.cos(theta);
            const z = capsuleradius * cosPhi * Math.sin(theta);
            positions.push(x, yOff, z);

            const nx = cosPhi * Math.cos(theta);
            const ny = sinPhi;
            const nz = cosPhi * Math.sin(theta);
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
            normals.push(nx / len, ny / len, nz / len);
        }
    }
    for (let i = 0; i < capSegments; i++) {
        for (let j = 0; j < radialSegments; j++) {
            const a = startIdxTop + i * (radialSegments + 1) + j;
            const b = startIdxTop + i * (radialSegments + 1) + j + 1;
            const c = startIdxTop + (i + 1) * (radialSegments + 1) + j;
            const d = startIdxTop + (i + 1) * (radialSegments + 1) + j + 1;
            indices.push(a, b, c);
            indices.push(b, d, c);
        }
    }
    return { positions, normals, indices };
}
