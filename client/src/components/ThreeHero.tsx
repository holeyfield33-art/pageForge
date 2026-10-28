import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { buildDust, buildScene, disposeObject, type SceneId } from "@/lib/scenes";

type Props = {
  primary: string;
  accent: string;
  secondary: string;
  scene: SceneId;
};

export default function ThreeHero({ primary, accent, secondary, scene }: Props) {
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

    scene3d.add(new THREE.AmbientLight(0xffffff, 1.35));
    const key = new THREE.DirectionalLight(new THREE.Color(primary), 3.5);
    key.position.set(-3.2, 4, 5);
    scene3d.add(key);
    const rim = new THREE.PointLight(new THREE.Color(accent), 28, 12);
    rim.position.set(3, -1.6, 3);
    scene3d.add(rim);

    const pivot = new THREE.Group();
    scene3d.add(pivot);
    const built = buildScene(scene, { primary, accent, secondary });
    pivot.add(built.root);
    const dust = buildDust(primary);
    pivot.add(dust);

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
      if (!running) renderFrame(lastT);
    };

    const start = performance.now();
    let lastT = 0;
    const renderFrame = (t: number) => {
      lastT = t;
      built.update(t);
      pivot.rotation.y += (pointerX + Math.sin(t * 0.18) * 0.06 - pivot.rotation.y) * 0.018;
      pivot.rotation.x += (pointerY + Math.cos(t * 0.135) * 0.045 - pivot.rotation.x) * 0.018;
      dust.rotation.y = -t * 0.027;
      renderer.render(scene3d, camera);
    };

    // Respect reduced-motion settings: draw one still frame, never animate.
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let running = false;
    let frameId = 0;
    const loop = () => {
      renderFrame((performance.now() - start) / 1000);
      frameId = window.requestAnimationFrame(loop);
    };
    const play = () => {
      if (running || reducedMotion) return;
      running = true;
      frameId = window.requestAnimationFrame(loop);
    };
    const pause = () => {
      running = false;
      window.cancelAnimationFrame(frameId);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();
    renderFrame(reducedMotion ? 2 : 0);

    // Stop rendering while the hero is scrolled out of view.
    const visibility = new IntersectionObserver(([entry]) => (entry?.isIntersecting ? play() : pause()));
    visibility.observe(canvas);

    return () => {
      pause();
      visibility.disconnect();
      observer.disconnect();
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerleave", onPointerLeave);
      disposeObject(scene3d);
      renderer.dispose();
    };
  }, [primary, accent, secondary, scene]);

  return (
    <div className={`three-hero ${webglFailed ? "three-hero--fallback" : ""}`} aria-hidden="true">
      <canvas ref={canvasRef} className="three-hero__canvas" />
      {webglFailed && <div className="three-hero__fallback-orb" />}
      <div className="three-hero__glow" />
    </div>
  );
}
