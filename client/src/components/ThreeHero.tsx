import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

type Props = {
  primary: string;
  accent: string;
  scene: "orb" | "rings" | "crystal";
};

export default function ThreeHero({ primary, accent, scene }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      setWebglFailed(true);
      return;
    }

    setWebglFailed(false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene3d = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    camera.position.set(0, 0, 6.2);
    const root = new THREE.Group();
    scene3d.add(root);

    scene3d.add(new THREE.AmbientLight(0xffffff, 1.35));
    const key = new THREE.DirectionalLight(new THREE.Color(primary), 3.5);
    key.position.set(-3.2, 4, 5);
    scene3d.add(key);
    const rim = new THREE.PointLight(new THREE.Color(accent), 28, 12);
    rim.position.set(3, -1.6, 3);
    scene3d.add(rim);

    const geometry = scene === "rings"
      ? new THREE.TorusKnotGeometry(1.02, 0.29, 220, 32, 2, 3)
      : scene === "crystal"
        ? new THREE.OctahedronGeometry(1.28, 1)
        : new THREE.IcosahedronGeometry(1.24, 5);
    const heroMesh = new THREE.Mesh(
      geometry,
      new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(primary),
        metalness: scene === "crystal" ? 0.52 : 0.28,
        roughness: scene === "crystal" ? 0.16 : 0.24,
        clearcoat: 1,
        clearcoatRoughness: 0.12,
        iridescence: 0.76,
        iridescenceIOR: 1.32,
        iridescenceThicknessRange: [180, 640],
      }),
    );
    root.add(heroMesh);

    const orbit = new THREE.Mesh(
      new THREE.TorusGeometry(1.8, 0.014, 10, 160),
      new THREE.MeshStandardMaterial({ color: new THREE.Color(accent), metalness: 0.6, roughness: 0.2, transparent: true, opacity: 0.9 }),
    );
    orbit.rotation.set(0.9, 0.3, -0.35);
    root.add(orbit);

    const small = new THREE.Mesh(
      new THREE.SphereGeometry(0.22, 32, 24),
      new THREE.MeshPhysicalMaterial({ color: new THREE.Color(accent), metalness: 0.32, roughness: 0.15, clearcoat: 1, iridescence: 0.9 }),
    );
    small.position.set(1.58, 0.95, 0.55);
    root.add(small);

    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(84 * 3);
    for (let i = 0; i < 84; i += 1) {
      const radius = 2.0 + Math.random() * 1.15;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi) * 0.56;
    }
    particles.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dust = new THREE.Points(particles, new THREE.PointsMaterial({ color: new THREE.Color(primary), size: 0.023, transparent: true, opacity: 0.66, sizeAttenuation: true }));
    root.add(dust);

    let frame = 0;
    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointerX = ((event.clientX - rect.left) / Math.max(rect.width, 1) - 0.5) * 0.36;
      pointerY = ((event.clientY - rect.top) / Math.max(rect.height, 1) - 0.5) * 0.24;
    };
    const onPointerLeave = () => { pointerX = 0; pointerY = 0; };
    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);

    const resize = () => {
      const width = Math.max(canvas.clientWidth, 1);
      const height = Math.max(canvas.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const animate = () => {
      frame += 0.005;
      root.rotation.y += (pointerX + Math.sin(frame * 0.6) * 0.06 - root.rotation.y) * 0.018;
      root.rotation.x += (pointerY + Math.cos(frame * 0.45) * 0.045 - root.rotation.x) * 0.018;
      heroMesh.rotation.y += 0.0024;
      heroMesh.rotation.z = Math.sin(frame) * 0.075;
      orbit.rotation.z += 0.0012;
      small.position.y = 0.95 + Math.sin(frame * 1.7) * 0.12;
      dust.rotation.y -= 0.00045;
      renderer.render(scene3d, camera);
      frameId = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frameId);
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      geometry.dispose();
      particles.dispose();
      renderer.dispose();
      scene3d.traverse((object) => {
        if (object instanceof THREE.Mesh || object instanceof THREE.Points) {
          object.material.dispose();
        }
      });
    };
  }, [primary, accent, scene]);

  return (
    <div className={`three-hero ${webglFailed ? "three-hero--fallback" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="three-hero__canvas" />
      {webglFailed && <div className="three-hero__fallback-orb" />}
      <div className="three-hero__glow" />
    </div>
  );
}
