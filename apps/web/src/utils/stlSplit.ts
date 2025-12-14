import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export type SplitGeometryOptions = {
	mergeTolerance?: number;
	maxFaces?: number;
	maxParts?: number;
};

function ensureIndexed(geometry: any, mergeTolerance: number) {
	let indexed = geometry;
	if (!indexed.index) {
		indexed = mergeVertices(indexed, mergeTolerance);
	}
	if (!indexed.index) {
		indexed = indexed.toNonIndexed();
		indexed = mergeVertices(indexed, mergeTolerance);
	}
	return indexed;
}

/**
 * STL has no part metadata. This splitter groups triangles into parts by connectivity (shared vertices).
 * Works best when parts are disconnected solids in the STL.
 */
export function splitGeometryByConnectivity(
	geometryInput: any,
	options: SplitGeometryOptions = {},
) {
	const maxParts = options.maxParts ?? 200;
	const maxFaces = options.maxFaces ?? 250_000;

	const base = geometryInput.clone();
	base.computeBoundingBox();
	const diag = (() => {
		const size = new THREE.Vector3();
		base.boundingBox?.getSize(size);
		return size.length() || 1;
	})();

	// Many STL exports don't share vertices exactly. Use a tolerance relative to model size.
	const defaultTol = diag * 0.01;
	let mergeTolerance = options.mergeTolerance ?? defaultTol;

	for (let attempt = 0; attempt < 6; attempt++) {
		const geometry = ensureIndexed(base.clone(), mergeTolerance);
		geometry.computeBoundingBox();
		geometry.computeBoundingSphere();

		const index = geometry.index;
		if (!index) return [geometry];

		const indexArray = index.array as ArrayLike<number>;
		const faceCount = Math.floor(indexArray.length / 3);
		if (faceCount <= 1) return [geometry];
		if (faceCount > maxFaces) {
			// Safety: avoid locking up the main thread on very large meshes.
			return [geometry];
		}

		// Build vertex->faces adjacency
		const vertexToFaces: number[][] = [];
		for (let f = 0; f < faceCount; f++) {
			const a = indexArray[f * 3 + 0] as number;
			const b = indexArray[f * 3 + 1] as number;
			const c = indexArray[f * 3 + 2] as number;
			(vertexToFaces[a] ??= []).push(f);
			(vertexToFaces[b] ??= []).push(f);
			(vertexToFaces[c] ??= []).push(f);
		}

		const visited = new Uint8Array(faceCount);
		const components: number[][] = [];

		for (let f = 0; f < faceCount; f++) {
			if (visited[f]) continue;
			visited[f] = 1;

			const stack = [f];
			const faces: number[] = [];

			while (stack.length) {
				const cur = stack.pop()!;
				faces.push(cur);

				const ia = indexArray[cur * 3 + 0] as number;
				const ib = indexArray[cur * 3 + 1] as number;
				const ic = indexArray[cur * 3 + 2] as number;

				const neigh = [
					...(vertexToFaces[ia] ?? []),
					...(vertexToFaces[ib] ?? []),
					...(vertexToFaces[ic] ?? []),
				];
				for (const nf of neigh) {
					if (visited[nf]) continue;
					visited[nf] = 1;
					stack.push(nf);
				}
			}

			components.push(faces);
			if (components.length > maxParts) break;
		}

		if (components.length <= 1) return [geometry];
		if (components.length > maxParts) {
			// Too many tiny "components" usually means the STL isn't welded; try a bigger tolerance.
			mergeTolerance *= 2;
			continue;
		}

		// Create a BufferGeometry per component
		const position = geometry.getAttribute('position') as any;
		const normal = geometry.getAttribute('normal') as any | undefined;

		const result: any[] = [];
		for (const faces of components) {
		const vertexMap = new Map<number, number>();
		const positions: number[] = [];
		const normals: number[] = [];
		const newIndex: number[] = [];

		const remapVertex = (oldIndex: number) => {
			const existing = vertexMap.get(oldIndex);
			if (existing != null) return existing;
			const next = vertexMap.size;
			vertexMap.set(oldIndex, next);
			positions.push(
				position.getX(oldIndex),
				position.getY(oldIndex),
				position.getZ(oldIndex),
			);
			if (normal) {
				normals.push(
					normal.getX(oldIndex),
					normal.getY(oldIndex),
					normal.getZ(oldIndex),
				);
			}
			return next;
		};

		for (const f of faces) {
			const a = indexArray[f * 3 + 0] as number;
			const b = indexArray[f * 3 + 1] as number;
			const c = indexArray[f * 3 + 2] as number;
			newIndex.push(remapVertex(a), remapVertex(b), remapVertex(c));
		}

		const g = new THREE.BufferGeometry();
		g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
		if (normal) g.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
		g.setIndex(newIndex);
		g.computeVertexNormals();
		g.computeBoundingBox();
		g.computeBoundingSphere();
			result.push(g);
		}

		// Sort parts by size (biggest first) to make UI more predictable.
		result.sort((a, b) => {
			const va = a.boundingBox?.getSize(new THREE.Vector3()).length() ?? 0;
			const vb = b.boundingBox?.getSize(new THREE.Vector3()).length() ?? 0;
			return vb - va;
		});

		return result;
	}

	// Fallback: if we still couldn't get a reasonable split, return as one mesh.
	return [ensureIndexed(base.clone(), mergeTolerance)];
}
