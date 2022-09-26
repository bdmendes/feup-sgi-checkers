export function crossProduct([x1, y1, z1], [x2, y2, z2]) {
    return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];
}

export function normalizeVector([x, y, z]) {
    const length = Math.sqrt(x * x + y * y + z * z);
    return length === 0 ? [x, y, z] : [x / length, y / length, z / length];
}