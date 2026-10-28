import * as THREE from "three";
import { describe, expect, it } from "vitest";
import { buildDust, buildScene, disposeObject, SCENE_IDS, SCENE_LABELS, seededRandom } from "./scenes";

const COLORS = { primary: "#a78bfa", accent: "#d8ff76", secondary: "#c4b5fd" };

function snapshot(root: THREE.Object3D): number[] {
  const values: number[] = [];
  root.updateMatrixWorld(true);
  root.traverse((child) => {
    values.push(...child.matrixWorld.elements);
    const geometry = (child as THREE.Mesh).geometry;
    const position = geometry?.getAttribute("position");
    if (position) values.push(...Array.from(position.array as Float32Array).slice(0, 30));
  });
  return values;
}

describe.each(SCENE_IDS)("scene %s", (id) => {
  it("has a label", () => {
    expect(SCENE_LABELS[id]).toBeTruthy();
  });

  it("builds visible content and animates without NaN", () => {
    const scene = buildScene(id, COLORS);
    let drawable = 0;
    scene.root.traverse((child) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Points || child instanceof THREE.LineSegments) drawable += 1;
    });
    expect(drawable).toBeGreaterThan(0);
    for (const t of [0, 0.5, 3, 60]) scene.update(t);
    expect(snapshot(scene.root).every(Number.isFinite)).toBe(true);
  });

  it("is deterministic for the same time", () => {
    const a = buildScene(id, COLORS);
    const b = buildScene(id, COLORS);
    a.update(2.5);
    b.update(2.5);
    expect(snapshot(a.root)).toEqual(snapshot(b.root));
  });

  it("frees its geometries and materials", () => {
    const scene = buildScene(id, COLORS);
    let disposed = 0;
    scene.root.traverse((child) => {
      const node = child as THREE.Mesh;
      node.geometry?.addEventListener("dispose", () => { disposed += 1; });
    });
    expect(disposeObject(scene.root)).toBeGreaterThan(0);
    expect(disposed).toBeGreaterThan(0);
  });
});

describe("shared pieces", () => {
  it("seeded random repeats and stays in [0, 1)", () => {
    const a = seededRandom(3);
    const b = seededRandom(3);
    const values = Array.from({ length: 50 }, () => a());
    expect(values).toEqual(Array.from({ length: 50 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it("dust is the same on every load", () => {
    const one = buildDust("#ffffff").geometry.getAttribute("position").array;
    const two = buildDust("#ffffff").geometry.getAttribute("position").array;
    expect(Array.from(one)).toEqual(Array.from(two));
  });
});
