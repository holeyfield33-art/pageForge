import * as THREE from "three";
import { SCENE_IDS, SCENE_LABELS, type SceneId } from "./blueprint";

/**
 * Procedural hero scenes. Everything is built from code: no model files, no
 * textures, no extra dependencies. Each scene takes the page theme colors and
 * returns a root object, a per-frame update, and a dispose.
 *
 * Randomness is seeded, so a page looks the same on every load.
 */

export { SCENE_IDS, SCENE_LABELS, type SceneId };

export type SceneColors = { primary: string; accent: string; secondary: string };

export interface BuiltScene {
  root: THREE.Object3D;
  /** t is elapsed seconds; called once per frame. */
  update(t: number): void;
}

export function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let x = state;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

function glossy(color: string, extra: Partial<THREE.MeshPhysicalMaterialParameters> = {}) {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.28,
    roughness: 0.24,
    clearcoat: 1,
    clearcoatRoughness: 0.12,
    iridescence: 0.76,
    iridescenceIOR: 1.32,
    iridescenceThicknessRange: [180, 640],
    ...extra,
  });
}

/** The original three heroes: one form, an orbit ring, and a small satellite. */
function classic(id: "orb" | "rings" | "crystal", c: SceneColors): BuiltScene {
  const root = new THREE.Group();
  const geometry = id === "rings"
    ? new THREE.TorusKnotGeometry(1.02, 0.29, 220, 32, 2, 3)
    : id === "crystal"
      ? new THREE.OctahedronGeometry(1.28, 1)
      : new THREE.IcosahedronGeometry(1.24, 5);
  const hero = new THREE.Mesh(geometry, glossy(c.primary, id === "crystal" ? { metalness: 0.52, roughness: 0.16 } : {}));
  root.add(hero);

  const orbit = new THREE.Mesh(
    new THREE.TorusGeometry(1.8, 0.014, 10, 160),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(c.accent), metalness: 0.6, roughness: 0.2, transparent: true, opacity: 0.9 }),
  );
  orbit.rotation.set(0.9, 0.3, -0.35);
  root.add(orbit);

  const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.22, 32, 24), glossy(c.accent, { metalness: 0.32, roughness: 0.15, iridescence: 0.9 }));
  satellite.position.set(1.58, 0.95, 0.55);
  root.add(satellite);

  return {
    root,
    update(t) {
      hero.rotation.y = t * 0.144;
      hero.rotation.z = Math.sin(t * 0.3) * 0.075;
      orbit.rotation.z = -0.35 + t * 0.072;
      satellite.position.y = 0.95 + Math.sin(t * 0.51) * 0.12;
    },
  };
}

/** A soft sphere whose surface ripples, for organic, wellness and beauty briefs. */
function blob(c: SceneColors): BuiltScene {
  const root = new THREE.Group();
  const geometry = new THREE.IcosahedronGeometry(1.22, 24);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;
  const base = Float32Array.from(position.array as Float32Array);
  const mesh = new THREE.Mesh(geometry, glossy(c.primary, { roughness: 0.18, iridescence: 0.9 }));
  root.add(mesh);

  const halo = new THREE.Mesh(
    new THREE.TorusGeometry(1.75, 0.01, 8, 160),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(c.accent), transparent: true, opacity: 0.55 }),
  );
  halo.rotation.set(1.25, 0, 0.2);
  root.add(halo);

  const v = new THREE.Vector3();
  return {
    root,
    update(t) {
      for (let i = 0; i < position.count; i += 1) {
        v.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]).normalize();
        const ripple = 0.11 * Math.sin(v.x * 3.1 + t * 0.9) * Math.cos(v.y * 2.7 + t * 0.7)
          + 0.06 * Math.sin(v.z * 4.3 - t * 1.1);
        v.multiplyScalar(1.22 * (1 + ripple));
        position.setXYZ(i, v.x, v.y, v.z);
      }
      position.needsUpdate = true;
      geometry.computeVertexNormals();
      mesh.rotation.y = t * 0.12;
      halo.rotation.z = 0.2 + t * 0.05;
    },
  };
}

/** A field of points moving like a signal, for data, analytics and audio briefs. */
function wave(c: SceneColors): BuiltScene {
  const root = new THREE.Group();
  const cols = 56;
  const rows = 30;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(cols * rows * 3);
  const colors = new Float32Array(cols * rows * 3);
  const from = new THREE.Color(c.primary);
  const to = new THREE.Color(c.accent);
  const mixed = new THREE.Color();
  for (let r = 0; r < rows; r += 1) {
    for (let k = 0; k < cols; k += 1) {
      const i = r * cols + k;
      positions[i * 3] = (k / (cols - 1) - 0.5) * 3.3;
      positions[i * 3 + 2] = (r / (rows - 1) - 0.5) * 2.2;
      mixed.copy(from).lerp(to, k / (cols - 1));
      colors.set([mixed.r, mixed.g, mixed.b], i * 3);
    }
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  const points = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.045, vertexColors: true, transparent: true, opacity: 0.95, sizeAttenuation: true }));
  points.rotation.set(0.7, -0.55, 0.12);
  root.add(points);
  const position = geometry.getAttribute("position") as THREE.BufferAttribute;

  return {
    root,
    update(t) {
      for (let i = 0; i < cols * rows; i += 1) {
        const x = positions[i * 3];
        const z = positions[i * 3 + 2];
        positions[i * 3 + 1] = 0.36 * Math.sin(x * 1.9 + t * 1.1) * Math.cos(z * 1.8 + t * 0.6)
          + 0.12 * Math.sin(x * 4.4 - t * 1.7);
      }
      position.needsUpdate = true;
      root.rotation.y = Math.sin(t * 0.2) * 0.12;
    },
  };
}

/** Slabs floating in a loose grid, for architecture, property and product briefs. */
function stack(c: SceneColors): BuiltScene {
  const root = new THREE.Group();
  const geometry = new THREE.BoxGeometry(0.62, 0.16, 0.62);
  const materials = [c.primary, c.secondary, c.accent].map((color, index) =>
    glossy(color, { iridescence: 0.4, metalness: 0.2 + index * 0.1 }));
  const slabs: { mesh: THREE.Mesh; y: number; phase: number }[] = [];
  const random = seededRandom(7);
  for (let level = 0; level < 4; level += 1) {
    for (let k = 0; k < 3; k += 1) {
      const mesh = new THREE.Mesh(geometry, materials[(level + k) % materials.length]);
      const y = (level - 1.5) * 0.52;
      mesh.position.set((k - 1) * 0.78 + (random() - 0.5) * 0.1, y, (random() - 0.5) * 0.5);
      mesh.rotation.y = (random() - 0.5) * 0.5;
      root.add(mesh);
      slabs.push({ mesh, y, phase: random() * Math.PI * 2 });
    }
  }
  root.rotation.set(0.42, -0.6, 0);
  return {
    root,
    update(t) {
      for (const { mesh, y, phase } of slabs) {
        mesh.position.y = y + Math.sin(t * 0.9 + phase) * 0.07;
        mesh.rotation.y += Math.sin(t * 0.3 + phase) * 0.0008;
      }
      root.rotation.y = -0.6 + Math.sin(t * 0.18) * 0.2;
    },
  };
}

/** Two strands joined by rungs, for science, health and biotech briefs. */
function helix(c: SceneColors): BuiltScene {
  const root = new THREE.Group();
  const steps = 30;
  const height = 2.2;
  const radius = 0.7;
  const bead = new THREE.SphereGeometry(0.085, 16, 12);
  const strandA = new THREE.InstancedMesh(bead, glossy(c.primary, { iridescence: 0.5 }), steps);
  const strandB = new THREE.InstancedMesh(bead, glossy(c.accent, { iridescence: 0.5 }), steps);
  const rungs = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.018, 0.018, 1, 6),
    new THREE.MeshStandardMaterial({ color: new THREE.Color(c.secondary), transparent: true, opacity: 0.7 }),
    steps,
  );
  const m = new THREE.Matrix4();
  const a = new THREE.Vector3();
  const b = new THREE.Vector3();
  const mid = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const q = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  for (let i = 0; i < steps; i += 1) {
    const y = (i / (steps - 1) - 0.5) * height;
    const angle = i * 0.48;
    a.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
    b.set(-a.x, y, -a.z);
    strandA.setMatrixAt(i, m.makeTranslation(a.x, a.y, a.z));
    strandB.setMatrixAt(i, m.makeTranslation(b.x, b.y, b.z));
    mid.copy(a).add(b).multiplyScalar(0.5);
    q.setFromUnitVectors(up, b.clone().sub(a).normalize());
    scale.set(1, a.distanceTo(b), 1);
    rungs.setMatrixAt(i, m.compose(mid, q, scale));
  }
  root.add(strandA, strandB, rungs);
  root.rotation.z = 0.35;
  return {
    root,
    update(t) {
      root.rotation.y = t * 0.35;
      root.position.y = Math.sin(t * 0.5) * 0.06;
    },
  };
}

/** Nodes joined by nearby links, for AI, network, developer and community briefs. */
function constellation(c: SceneColors): BuiltScene {
  const root = new THREE.Group();
  const random = seededRandom(42);
  const count = 64;
  const nodes: THREE.Vector3[] = [];
  for (let i = 0; i < count; i += 1) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const r = 1.1 + random() * 0.6;
    nodes.push(new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi) * 0.9, r * Math.sin(phi) * Math.sin(theta)));
  }
  const linePositions: number[] = [];
  for (let i = 0; i < count; i += 1) {
    for (let j = i + 1; j < count; j += 1) {
      if (nodes[i].distanceTo(nodes[j]) < 0.72) linePositions.push(...nodes[i].toArray(), ...nodes[j].toArray());
    }
  }
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(linePositions, 3));
  const lineMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color(c.secondary), transparent: true, opacity: 0.45 });
  root.add(new THREE.LineSegments(lineGeometry, lineMaterial));

  const nodeMesh = new THREE.InstancedMesh(new THREE.SphereGeometry(0.05, 12, 10), glossy(c.primary, { iridescence: 0.3 }), count);
  const m = new THREE.Matrix4();
  nodes.forEach((node, i) => nodeMesh.setMatrixAt(i, m.makeTranslation(node.x, node.y, node.z)));
  root.add(nodeMesh);

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.34, 3), glossy(c.accent, { iridescence: 0.9 }));
  root.add(core);
  return {
    root,
    update(t) {
      root.rotation.y = t * 0.1;
      root.rotation.x = Math.sin(t * 0.2) * 0.15;
      lineMaterial.opacity = 0.35 + Math.sin(t * 1.2) * 0.12;
      core.scale.setScalar(1 + Math.sin(t * 1.6) * 0.06);
    },
  };
}

export function buildScene(id: SceneId, colors: SceneColors): BuiltScene {
  switch (id) {
    case "orb":
    case "rings":
    case "crystal":
      return classic(id, colors);
    case "blob":
      return blob(colors);
    case "wave":
      return wave(colors);
    case "stack":
      return stack(colors);
    case "helix":
      return helix(colors);
    case "constellation":
      return constellation(colors);
  }
}

/** Ambient dust shared by every scene. */
export function buildDust(color: string, seed = 1): THREE.Points {
  const random = seededRandom(seed);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(84 * 3);
  for (let i = 0; i < 84; i += 1) {
    const radius = 2.0 + random() * 1.15;
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi) * 0.56;
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: new THREE.Color(color), size: 0.023, transparent: true, opacity: 0.66, sizeAttenuation: true }));
}

/** Free every geometry and material under an object. Shared ones are freed once. */
export function disposeObject(object: THREE.Object3D): number {
  const freed = new Set<{ dispose(): void }>();
  object.traverse((child) => {
    const node = child as THREE.Object3D & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
    if (node.geometry) freed.add(node.geometry);
    const materials = Array.isArray(node.material) ? node.material : node.material ? [node.material] : [];
    materials.forEach((material) => freed.add(material));
  });
  freed.forEach((item) => item.dispose());
  return freed.size;
}
