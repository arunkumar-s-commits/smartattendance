/**
 * Face recognition utilities (browser-side only)
 * Uses face-api.js with TensorFlow.js backend
 */

// Euclidean distance between two face descriptors
export function euclideanDistance(d1: number[], d2: number[]): number {
  if (d1.length !== d2.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < d1.length; i++) {
    sum += Math.pow(d1[i] - d2[i], 2);
  }
  return Math.sqrt(sum);
}

// Check if two face embeddings match (threshold: 0.55 for stricter matching)
export function facesMatch(embedding1: number[], embedding2: number[], threshold = 0.55): boolean {
  const distance = euclideanDistance(embedding1, embedding2);
  return distance < threshold;
}

// Convert Float32Array to regular array for JSON serialization
export function descriptorToArray(descriptor: Float32Array): number[] {
  return Array.from(descriptor);
}

// Convert regular array back to Float32Array
export function arrayToDescriptor(arr: number[]): Float32Array {
  return new Float32Array(arr);
}
