import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { MaterialFinish } from '../types';

interface ThreeCanvasProps {
  interactiveObject?: {
    type: 'headphones' | 'watch' | 'sculpture' | 'lamp' | 'abstract';
    finish: MaterialFinish;
  } | null;
  interactiveMode?: boolean;
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ interactiveObject, interactiveMode = false }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const animatedGroupRef = useRef<THREE.Group | null>(null);
  const inspectorGroupRef = useRef<THREE.Group | null>(null);
  const mouseRef = useRef<{ x: number; y: number; targetX: number; targetY: number }>({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
  });
  const isDraggingRef = useRef(false);
  const previousPointerPositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Subtle atmospheric fog to blend into light background
    scene.fog = new THREE.FogExp2('#F8F9FB', 0.04);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 10);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Environment Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.5);
    keyLight.position.set(5, 8, 5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf0f0f0, 1.2);
    fillLight.position.set(-6, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 2.0);
    rimLight.position.set(0, 5, -8);
    scene.add(rimLight);

    // Group for background floating geometric architecture
    const backgroundGroup = new THREE.Group();
    scene.add(backgroundGroup);
    animatedGroupRef.current = backgroundGroup;

    // Materials: Chrome, Ceramic White, Matte Obsidian, Brushed Steel
    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe8e8e8,
      metalness: 0.95,
      roughness: 0.12,
    });

    const ceramicWhiteMaterial = new THREE.MeshStandardMaterial({
      color: 0xfafafa,
      metalness: 0.1,
      roughness: 0.25,
    });

    const matteObsidianMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      metalness: 0.35,
      roughness: 0.75,
    });

    const brushedSteelMaterial = new THREE.MeshStandardMaterial({
      color: 0x888888,
      metalness: 0.85,
      roughness: 0.35,
    });

    // 1. Floating Chrome Torus / Ring (Architectural form on the right periphery)
    const torusGeometry = new THREE.TorusGeometry(2.4, 0.25, 32, 100);
    const torusMesh = new THREE.Mesh(torusGeometry, chromeMaterial);
    torusMesh.position.set(4.2, 1.2, -3.5);
    torusMesh.rotation.set(0.6, 0.4, 0.2);
    backgroundGroup.add(torusMesh);

    // 2. Smooth Ceramic White Sphere
    const sphereGeometry = new THREE.SphereGeometry(1.4, 64, 64);
    const sphereMesh = new THREE.Mesh(sphereGeometry, ceramicWhiteMaterial);
    sphereMesh.position.set(-4.5, -1.8, -4.0);
    backgroundGroup.add(sphereMesh);

    // 3. Matte Obsidian Cuboid Column
    const boxGeometry = new THREE.BoxGeometry(1.6, 3.2, 0.4);
    const boxMesh = new THREE.Mesh(boxGeometry, matteObsidianMaterial);
    boxMesh.position.set(-3.8, 2.5, -5.0);
    boxMesh.rotation.set(0.3, 0.5, -0.2);
    backgroundGroup.add(boxMesh);

    // 4. Polished Chrome Capsule/Cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(0.3, 0.3, 3.0, 32);
    const cylinderMesh = new THREE.Mesh(cylinderGeometry, chromeMaterial);
    cylinderMesh.position.set(4.8, -2.5, -4.5);
    cylinderMesh.rotation.set(-0.5, 0.2, 0.8);
    backgroundGroup.add(cylinderMesh);

    // 5. Delicate Satellite Spheres (Black & White pairs)
    const smallSphereGeo = new THREE.SphereGeometry(0.4, 32, 32);
    const sat1 = new THREE.Mesh(smallSphereGeo, matteObsidianMaterial);
    sat1.position.set(2.8, -0.6, -2.0);
    backgroundGroup.add(sat1);

    const sat2 = new THREE.Mesh(smallSphereGeo, brushedSteelMaterial);
    sat2.position.set(-2.2, 1.4, -2.5);
    backgroundGroup.add(sat2);

    const sat3 = new THREE.Mesh(smallSphereGeo, ceramicWhiteMaterial);
    sat3.position.set(3.4, 2.8, -3.0);
    backgroundGroup.add(sat3);

    // Inspector group for dedicated 3D product view
    const inspectorGroup = new THREE.Group();
    scene.add(inspectorGroup);
    inspectorGroupRef.current = inspectorGroup;
    inspectorGroup.position.set(0, 0, 2);
    inspectorGroup.visible = false;

    // Create interactive geometric proxy representation for inspectable products
    const createInspectorMesh = (finish: MaterialFinish) => {
      // Clear previous inspector children
      while (inspectorGroup.children.length > 0) {
        inspectorGroup.remove(inspectorGroup.children[0]);
      }

      let selectedMat = chromeMaterial;
      if (finish === 'ceramic-white') selectedMat = ceramicWhiteMaterial;
      else if (finish === 'matte-obsidian') selectedMat = matteObsidianMaterial;
      else if (finish === 'brushed-steel') selectedMat = brushedSteelMaterial;

      // Compound architectural 3D product showcase object
      const coreMesh = new THREE.Mesh(new THREE.TorusKnotGeometry(0.9, 0.28, 128, 32), selectedMat);
      inspectorGroup.add(coreMesh);

      const pedestalMesh = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 0.2, 48), matteObsidianMaterial);
      pedestalMesh.position.y = -1.6;
      inspectorGroup.add(pedestalMesh);

      const ringAccent = new THREE.Mesh(new THREE.TorusGeometry(1.85, 0.04, 16, 64), chromeMaterial);
      ringAccent.rotation.x = Math.PI / 2;
      ringAccent.position.y = -1.5;
      inspectorGroup.add(ringAccent);
    };

    createInspectorMesh('matte-obsidian');

    // Mouse movement handler for smooth parallax
    const handleMouseMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseRef.current.targetX = (event.clientX / innerWidth - 0.5) * 2;
      mouseRef.current.targetY = (event.clientY / innerHeight - 0.5) * 2;

      if (isDraggingRef.current && inspectorGroupRef.current && interactiveMode) {
        const deltaX = event.clientX - previousPointerPositionRef.current.x;
        const deltaY = event.clientY - previousPointerPositionRef.current.y;
        inspectorGroupRef.current.rotation.y += deltaX * 0.01;
        inspectorGroupRef.current.rotation.x += deltaY * 0.01;
      }
      previousPointerPositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseDown = (event: MouseEvent) => {
      isDraggingRef.current = true;
      previousPointerPositionRef.current = { x: event.clientX, y: event.clientY };
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse coordinates
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      if (!prefersReducedMotion && backgroundGroup) {
        // Slow architectural rotation
        torusMesh.rotation.x = elapsedTime * 0.08;
        torusMesh.rotation.y = elapsedTime * 0.12;

        sphereMesh.position.y = -1.8 + Math.sin(elapsedTime * 0.5) * 0.2;
        boxMesh.rotation.y = elapsedTime * 0.05;
        cylinderMesh.rotation.z = elapsedTime * 0.09;

        sat1.position.y = -0.6 + Math.sin(elapsedTime * 0.8) * 0.15;
        sat2.position.y = 1.4 + Math.cos(elapsedTime * 0.7) * 0.15;
        sat3.position.y = 2.8 + Math.sin(elapsedTime * 0.6) * 0.2;

        // Camera parallax
        camera.position.x = mouseRef.current.x * 0.6;
        camera.position.y = -mouseRef.current.y * 0.4;
        camera.lookAt(0, 0, 0);
      }

      if (inspectorGroup.visible && !isDraggingRef.current) {
        inspectorGroup.rotation.y += 0.008;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Context lost/restored safety
    const handleContextLost = (e: Event) => {
      e.preventDefault();
      cancelAnimationFrame(animationFrameId);
    };
    const handleContextRestored = () => {
      animate();
    };
    renderer.domElement.addEventListener('webglcontextlost', handleContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', handleContextRestored, false);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', handleContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', handleContextRestored);
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [interactiveMode]);

  // Handle updates to interactive inspectable object
  useEffect(() => {
    if (!inspectorGroupRef.current) return;

    if (interactiveObject) {
      inspectorGroupRef.current.visible = true;
      if (animatedGroupRef.current) {
        // Fade or push background objects further back so focal anchor remains on the inspected item
        animatedGroupRef.current.position.z = -3;
      }

      // Re-create mesh with active finish
      const finish = interactiveObject.finish;
      const group = inspectorGroupRef.current;
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }

      const mat =
        finish === 'ceramic-white'
          ? new THREE.MeshStandardMaterial({ color: 0xfafafa, metalness: 0.1, roughness: 0.2 })
          : finish === 'polished-chrome'
          ? new THREE.MeshStandardMaterial({ color: 0xe8e8e8, metalness: 0.95, roughness: 0.1 })
          : finish === 'brushed-steel'
          ? new THREE.MeshStandardMaterial({ color: 0x999999, metalness: 0.85, roughness: 0.35 })
          : new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.35, roughness: 0.75 });

      let geom: THREE.BufferGeometry;
      if (interactiveObject.type === 'headphones') {
        geom = new THREE.TorusGeometry(1.2, 0.22, 32, 100);
      } else if (interactiveObject.type === 'watch') {
        geom = new THREE.CylinderGeometry(1.2, 1.2, 0.3, 48);
      } else if (interactiveObject.type === 'lamp') {
        geom = new THREE.ConeGeometry(1.1, 1.8, 32);
      } else {
        geom = new THREE.TorusKnotGeometry(0.9, 0.28, 128, 32);
      }

      const mainMesh = new THREE.Mesh(geom, mat);
      group.add(mainMesh);

      // Base stand
      const stand = new THREE.Mesh(
        new THREE.CylinderGeometry(1.6, 1.8, 0.15, 48),
        new THREE.MeshStandardMaterial({ color: 0x181818, metalness: 0.4, roughness: 0.7 })
      );
      stand.position.y = -1.5;
      group.add(stand);
    } else {
      inspectorGroupRef.current.visible = false;
      if (animatedGroupRef.current) {
        animatedGroupRef.current.position.z = 0;
      }
    }
  }, [interactiveObject]);

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 pointer-events-none z-0 transition-opacity duration-700 ${
        interactiveMode ? 'pointer-events-auto' : ''
      }`}
      aria-hidden="true"
    />
  );
};
