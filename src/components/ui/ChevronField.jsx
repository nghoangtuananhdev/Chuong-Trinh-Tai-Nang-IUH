import { useEffect, useRef } from "react";

// Sắc xanh của các module (biến thể quanh #153898) và vàng ngọn lửa của logo.
const BLUES = [0x1a3ea4, 0x1c44b2, 0x163a9c, 0x2049ba, 0x12338c, 0x2552c6];
const GOLD = 0xf9b200;
const H = 1.133; // tỉ lệ cao/rộng của dải chevron trong logo IUH 2025
const NOTCH = 0.1975; // độ sâu khấc/đỉnh theo chiều cao

/** Cặp chevron xếp lồng như cột chữ H của logo; cỡ theo font-size, màu theo currentColor. */
export function ChevronMark({ className = "" }) {
  return (
    <span aria-hidden="true" className={`chev-stack ${className}`}>
      <span />
      <span />
    </span>
  );
}

/**
 * Trường chevron 3D (three.js) — module chevron của logo đùn khối, xếp tầng,
 * nổi lên theo con trỏ như có một ngọn đèn lướt qua. Không có chuột thì đèn tự lướt.
 * Trang trí thuần: aria-hidden, không nhận sự kiện; không có WebGL thì nền xanh vẫn đứng.
 */
export function ChevronField({ className = "", quality = "high" }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;
    let disposed = false;
    let cleanup = () => {};
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    import("three").then((THREE) => {
      if (disposed) return;
      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
      } catch {
        return; // không có WebGL: giữ nền xanh + hoa văn CSS
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, quality === "high" ? 1.75 : 1.25));
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      host.appendChild(renderer.domElement);
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;display:block";

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 24);

      // Dải chevron của logo: đỉnh nhọn trên, khấc dưới.
      const shape = new THREE.Shape();
      shape.moveTo(-0.5, -H / 2);
      shape.lineTo(0, -H / 2 + NOTCH * H);
      shape.lineTo(0.5, -H / 2);
      shape.lineTo(0.5, H / 2 - NOTCH * H);
      shape.lineTo(0, H / 2);
      shape.lineTo(-0.5, H / 2 - NOTCH * H);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: 0.2,
        bevelEnabled: true,
        bevelThickness: 0.04,
        bevelSize: 0.035,
        bevelSegments: 2,
      });
      geometry.translate(0, 0, -0.1);
      const material = new THREE.MeshStandardMaterial({ roughness: 0.42, metalness: 0.12 });

      const COL = 1.24;
      const ROW = H * (1 - NOTCH) + 0.16; // xếp lồng: đỉnh dưới vào khấc trên
      const cols = quality === "high" ? 30 : 20;
      const rows = quality === "high" ? 17 : 13;
      const count = cols * rows;
      const mesh = new THREE.InstancedMesh(geometry, material, count);
      const base = [];
      const color = new THREE.Color();
      let seed = 7;
      const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const i = c * rows + r;
          const x = (c - (cols - 1) / 2) * COL;
          const y = (r - (rows - 1) / 2) * ROW;
          base.push({ x, y, c, lift: 0 });
          const gold = rand() < 0.035 && c > cols * 0.45;
          color.setHex(gold ? GOLD : BLUES[Math.floor(rand() * BLUES.length)]);
          mesh.setColorAt(i, color);
        }
      }
      mesh.instanceColor.needsUpdate = true;

      const group = new THREE.Group();
      group.rotation.set(-0.42, 0.18, 0.06);
      group.add(mesh);
      scene.add(group);

      scene.add(new THREE.HemisphereLight(0xdbe5ff, 0x0a1a40, 1.1));
      const sun = new THREE.DirectionalLight(0xffffff, 1.4);
      sun.position.set(-8, 10, 12);
      scene.add(sun);
      const lamp = new THREE.PointLight(0xffe08a, 26, 10, 1.6);
      lamp.position.set(0, 0, 3);
      group.add(lamp);

      // Con trỏ → mặt phẳng của trường chevron.
      const plane = new THREE.Plane();
      const raycaster = new THREE.Raycaster();
      const ndc = new THREE.Vector2();
      const hit = new THREE.Vector3();
      const target = new THREE.Vector2(6, 1);
      const pointer = new THREE.Vector2(6, 1);
      let lastMove = -1e9;
      const onMove = (e) => {
        const rect = host.getBoundingClientRect();
        if (e.clientY < rect.top || e.clientY > rect.bottom) return;
        ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
        raycaster.setFromCamera(ndc, camera);
        plane.setFromNormalAndCoplanarPoint(
          new THREE.Vector3(0, 0, 1).applyQuaternion(group.quaternion),
          group.position,
        );
        if (raycaster.ray.intersectPlane(plane, hit)) {
          group.worldToLocal(hit);
          target.set(hit.x, hit.y);
          lastMove = performance.now();
        }
      };

      const view = { w: 10, h: 6 }; // nửa bề rộng/cao nhìn thấy trên mặt phẳng, để đèn tự lướt luôn trong khung
      const dummy = new THREE.Object3D();
      const start = performance.now();
      const layout = (t) => {
        const now = performance.now();
        if (now - lastMove > 2600) {
          // Đèn tự lướt khi không có chuột (máy chiếu, cảm ứng).
          target.set(Math.sin(t * 0.23) * view.w * 0.6 + view.w * 0.3, Math.sin(t * 0.37) * view.h * 0.45);
        }
        pointer.lerp(target, reduce ? 1 : 0.06);
        lamp.position.set(pointer.x, pointer.y, 2.6);
        for (let i = 0; i < count; i++) {
          const b = base[i];
          const dx = b.x - pointer.x;
          const dy = b.y - pointer.y;
          const d2 = dx * dx + dy * dy;
          const want = Math.exp(-d2 / 7) * 1.5;
          b.lift += (want - b.lift) * (reduce ? 1 : 0.12);
          const wave = reduce ? 0 : Math.sin(t * 0.7 + b.x * 0.32 + b.y * 0.27) * 0.12;
          const intro = reduce ? 1 : Math.min(1, Math.max(0, (t - b.c * 0.035) / 1.1));
          const e = 1 - Math.pow(1 - intro, 4);
          const d = Math.sqrt(d2) || 1;
          dummy.position.set(b.x, b.y - (1 - e) * 1.2, wave + b.lift - (1 - e) * 5);
          dummy.rotation.set((dy / d) * b.lift * -0.22, (dx / d) * b.lift * 0.22, 0);
          const s = 0.55 + 0.45 * e;
          dummy.scale.set(s, s, s);
          dummy.updateMatrix();
          mesh.setMatrixAt(i, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      };

      const resize = () => {
        const w = host.clientWidth || 1;
        const h = host.clientHeight || 1;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        // Thu khung cho màn hình hẹp để module không quá nhỏ.
        camera.position.z = w < 640 ? 17 : 24;
        camera.updateProjectionMatrix();
        view.h = Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
        view.w = view.h * camera.aspect;
      };
      resize();

      let raf = 0;
      let visible = true;
      const frame = () => {
        raf = 0;
        if (!visible || document.hidden) return;
        layout((performance.now() - start) / 1000);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      const kick = () => {
        if (!raf && !reduce) raf = requestAnimationFrame(frame);
      };

      const ro = new ResizeObserver(() => {
        resize();
        if (reduce) {
          layout(10);
          renderer.render(scene, camera);
        }
      });
      ro.observe(host);
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        if (visible) kick();
      });
      io.observe(host);
      document.addEventListener("visibilitychange", kick);
      if (reduce) {
        layout(10);
        renderer.render(scene, camera);
      } else {
        window.addEventListener("pointermove", onMove, { passive: true });
        kick();
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        ro.disconnect();
        io.disconnect();
        document.removeEventListener("visibilitychange", kick);
        window.removeEventListener("pointermove", onMove);
        geometry.dispose();
        material.dispose();
        mesh.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [quality]);

  return <div ref={hostRef} aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} />;
}
