export function crossProduct([x1, y1, z1], [x2, y2, z2]) {
    return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];
}

export function normalizeVector([x, y, z]) {
    const length = Math.sqrt(x * x + y * y + z * z);
    return length === 0 ? [x, y, z] : [x / length, y / length, z / length];
}

export function hypothenus(a, b) {
    return Math.sqrt(a * a + b * b);
}

export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

export function vectorDifference([x1, y1, z1], [x2, y2, z2]) {
    return [x1 - x2, y1 - y2, z1 - z2];
}