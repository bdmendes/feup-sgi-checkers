/**
 * Calculate the cross product between two vectors
 * @export
 * @param {*} [x1, y1, z1]
 * @param {*} [x2, y2, z2]
 * @return {*} 
 */
export function crossProduct([x1, y1, z1], [x2, y2, z2]) {
    return [y1 * z2 - z1 * y2, z1 * x2 - x1 * z2, x1 * y2 - y1 * x2];
}

/**
 * Normalization of a vector 
 * @export
 * @param {*} [x, y, z]
 * @return {*} 
 */
export function normalizeVector([x, y, z]) {
    const length = Math.sqrt(x * x + y * y + z * z);
    return length === 0 ? [x, y, z] : [x / length, y / length, z / length];
}

/**
 * Calculate the hypothenus of a triangle
 * @export
 * @param {*} a
 * @param {*} b
 * @return {*} 
 */
export function hypothenus(a, b) {
    return Math.sqrt(a * a + b * b);
}

/**
 * Covert degrees to radians
 * @export
 * @param {*} degrees
 * @return {*} 
 */
export function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

/**
 * Calculate difference between two vectors
 * @export
 * @param {*} [x1, y1, z1]
 * @param {*} [x2, y2, z2]
 * @return {*} 
 */
export function vectorDifference([x1, y1, z1], [x2, y2, z2]) {
    return [x1 - x2, y1 - y2, z1 - z2];
}

/**
 * Convert miliseconds to seconds without losing precision
 * @export
 * @param {*} milis miliseconds
 * @return {*} seconds
 */
export function milisToSeconds(milis) {
    return milis / 1000;
}

/**
 * Calculate the distance between two points
 * @param {*} x1 
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 * @returns 
 */
export function distanceBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}