import { useRef, useState, Suspense, useEffect } from "react";
import {
  Canvas,
  useFrame,
  useThree,
} from "@react-three/fiber";
import {
  OrbitControls,
  Stars,
  useTexture,
  Html,
} from "@react-three/drei";
import { SRGBColorSpace, Vector3 } from "three";
import PlanetDossier from "./PlanetDossier";

const planets = [
  { name: "Mercury", size: 0.22, distance: 3.2, color: "#ffffff", texture: "/texture/mercury.jpg", speed: 0.9 },
  { name: "Venus", size: 0.38, distance: 4.5, color: "#ffffff", texture: "/texture/venus.jpg", speed: 0.65 },
  { name: "Earth", size: 0.42, distance: 6, color: "#ffffff", texture: "/texture/8k_earth_daymap.jpg", speed: 0.5 },
  { name: "Mars", size: 0.32, distance: 7.5, color: "#ffffff", texture: "/texture/mars.jpg", speed: 0.4 },
  { name: "Jupiter", size: 0.95, distance: 10.5, color: "#ffffff", texture: "/texture/jupiter.jpg", speed: 0.25 },
  { name: "Saturn", size: 0.78, distance: 13.5, color: "#ffffff", texture: "/texture/saturn.jpg", speed: 0.19 },
  { name: "Uranus", size: 0.58, distance: 16.5, color: "#ffffff", texture: "/texture/uranus.jpg", speed: 0.14 },
  { name: "Neptune", size: 0.56, distance: 19.5, color: "#ffffff", texture: "/texture/neptune.jpg", speed: 0.11 },
];


import { planetInfo } from "../data/planetData";



function SmoothDesktopZoom({ controlsRef, minDistance = 8, maxDistance = 100 }) {
  const { camera, gl } = useThree();
  const targetDistance = useRef(null);
  const tempDir = useRef(new Vector3());
  const tempDesired = useRef(new Vector3());

  useEffect(() => {
    const canvas = gl.domElement;

    // Desktop mouse wheel zoom
    const handleWheel = (event) => {
      const controls = controlsRef.current;
      if (!controls) return;

      event.preventDefault();

      const currentDistance = camera.position.distanceTo(
        controls.target
      );

      if (targetDistance.current === null) {
        targetDistance.current = currentDistance;
      }

      // Exponential zoom for natural mouse-wheel movement
      const zoomFactor = Math.exp(event.deltaY * 0.001);

      targetDistance.current = Math.max(
        minDistance,
        Math.min(maxDistance, targetDistance.current * zoomFactor)
      );
    };

    // Mobile / touch pinch-to-zoom
    let touchStartDist = 0;
    let touchBaseTargetDist = null;

    const handleTouchStart = (event) => {
      if (event.touches.length === 2) {
        const t1 = event.touches[0];
        const t2 = event.touches[1];
        touchStartDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        const controls = controlsRef.current;
        if (controls) {
          const currentDistance = camera.position.distanceTo(controls.target);
          if (targetDistance.current === null) {
            targetDistance.current = currentDistance;
          }
          touchBaseTargetDist = targetDistance.current;
        }
      }
    };

    const handleTouchMove = (event) => {
      if (event.touches.length === 2 && touchStartDist > 0 && touchBaseTargetDist !== null) {
        if (event.cancelable) event.preventDefault();

        const t1 = event.touches[0];
        const t2 = event.touches[1];
        const currentTouchDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);

        if (currentTouchDist > 0) {
          const pinchFactor = touchStartDist / currentTouchDist;
          targetDistance.current = Math.max(
            minDistance,
            Math.min(maxDistance, touchBaseTargetDist * pinchFactor)
          );
        }
      }
    };

    const handleTouchEnd = (event) => {
      if (event.touches.length < 2) {
        touchStartDist = 0;
        touchBaseTargetDist = null;
      }
    };

    canvas.addEventListener("wheel", handleWheel, {
      passive: false,
    });
    canvas.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    canvas.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    canvas.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
    canvas.addEventListener("touchcancel", handleTouchEnd, {
      passive: true,
    });

    return () => {
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("touchstart", handleTouchStart);
      canvas.removeEventListener("touchmove", handleTouchMove);
      canvas.removeEventListener("touchend", handleTouchEnd);
      canvas.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [camera, gl, controlsRef, minDistance, maxDistance]);

  useFrame((_, delta) => {
    const controls = controlsRef.current;
    if (!controls || targetDistance.current === null) return;

    const target = controls.target;
    tempDir.current.copy(camera.position).sub(target).normalize();
    tempDesired.current.copy(target).addScaledVector(tempDir.current, targetDistance.current);

    // Higher value = faster smoothing
    const smoothness = 7;
    const alpha = 1 - Math.exp(-smoothness * delta);

    camera.position.lerp(tempDesired.current, alpha);
  });

  return null;
}


function Sun() {
  const sunRef = useRef();
  const texture = useTexture("/texture/sun.jpg", (tex) => {
    tex.colorSpace = SRGBColorSpace;
  });

  useFrame((_, delta) => {
    sunRef.current.rotation.y += delta * 0.06;
  });

  return (
    <group>
      {/* Textured solar surface */}
      <mesh ref={sunRef}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial map={texture} />
      </mesh>

      {/* Warm light immediately around the Sun */}
      <mesh>
        <sphereGeometry args={[1.62, 48, 48]} />
        <meshBasicMaterial
          color="#ffb52e"
          transparent
          opacity={0.18}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* Soft golden halo */}
      <mesh>
        <sphereGeometry args={[1.95, 48, 48]} />
        <meshBasicMaterial
          color="#ff941f"
          transparent
          opacity={0.09}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* Faint outer glow */}
      <mesh>
        <sphereGeometry args={[2.5, 48, 48]} />
        <meshBasicMaterial
          color="#ff650d"
          transparent
          opacity={0.035}
          depthWrite={false}
          side={2}
        />
      </mesh>

      {/* Sunlight illuminating nearby planets */}
      <pointLight
        color="#ffdfa8"
        intensity={220}
        distance={100}
        decay={2}
      />
    </group>
  );
}




function Moon({ distance = 0.75 }) {
  const orbit = useRef();
  const moonRef = useRef();

  const texture = useTexture("/texture/moon.jpg", (tex) => {
    tex.colorSpace = SRGBColorSpace;
  });

  useFrame((_, delta) => {
    orbit.current.rotation.y += delta * 1.3;
    moonRef.current.rotation.y += delta * 0.08;
  });

  return (
    <group ref={orbit}>
      <mesh ref={moonRef} position={[distance, 0, 0]}>
        <sphereGeometry args={[0.12, 48, 48]} />
        <meshStandardMaterial
          map={texture}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}




function Planet({ planet, onSelect, isSelected }) {
  const orbit = useRef();
  const body = useRef();
  const [hovered, setHovered] = useState(false);
  const { size } = useThree();
  const isNarrow = size.width < 768;

  const texture = useTexture(planet.texture, (tex) => {
    tex.colorSpace = SRGBColorSpace;
  });

  useFrame((_, delta) => {
    orbit.current.rotation.y += delta * planet.speed * 0.18;
    body.current.rotation.y += delta * 0.5;
  });

  // Ensure cursor is restored if unmounted while hovered
  useEffect(() => {
    return () => {
      document.body.style.cursor = "auto";
    };
  }, []);

  const handlePointerOver = (event) => {
    event.stopPropagation();
    if (!isSelected) {
      setHovered(true);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "auto";
  };

  const handleClick = (event) => {
    event.stopPropagation();
    document.body.style.cursor = "auto";
    setHovered(false);
    if (onSelect && body.current) {
      onSelect({
        ...planet,
        planet,
        mesh: body.current,
      });
    }
  };

  return (
    <group ref={orbit}>
      <group position={[planet.distance, 0, 0]}>
        <mesh
          ref={body}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
          onClick={handleClick}
        >
          <sphereGeometry args={[planet.size, 64, 64]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.9}
            metalness={0}
          />
        </mesh>

        {hovered && !isSelected && (
          <Html
            position={[0, planet.size + (isNarrow ? 0.35 : 0.25), 0]}
            center
            distanceFactor={isNarrow ? 18 : 12}
            style={{ pointerEvents: "none" }}
          >
            <div className="planet-hover-label">
              <span className="planet-hover-name">
                {planet.name}
              </span>
              <span className="planet-hover-hint">
                CLICK OR TAP FOR INFO
              </span>
            </div>
          </Html>
        )}

        {planet.name === "Earth" && <Moon />}

        {planet.name === "Saturn" && (
          <mesh
            rotation={[Math.PI / 2.5, 0, 0]}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
          >
            <ringGeometry
              args={[planet.size * 1.25, planet.size * 1.9, 96]}
            />
            <meshStandardMaterial
              color="#c9b68e"
              side={2}
              transparent
              opacity={0.8}
              roughness={1}
            />
          </mesh>
        )}
      </group>
    </group>
  );
}


function PlanetPreview({ planet }) {
  const systemRef = useRef();
  const planetData = planet?.planet || planet;

  const texture = useTexture(planetData.texture, (tex) => {
    tex.colorSpace = SRGBColorSpace;
  });

  // Separate bands and gaps create Saturn's layered ring structure.
  const saturnBands = [
    { inner: 1.43, outer: 1.55, color: "#8d795d", opacity: 0.72 },
    { inner: 1.57, outer: 1.72, color: "#d8c7a2", opacity: 0.92 },
    { inner: 1.74, outer: 1.79, color: "#6f604d", opacity: 0.48 },
    { inner: 1.81, outer: 1.98, color: "#c8b58e", opacity: 0.84 },
    { inner: 2.00, outer: 2.08, color: "#776650", opacity: 0.62 },
    { inner: 2.10, outer: 2.28, color: "#dfd0ad", opacity: 0.88 },
    { inner: 2.31, outer: 2.39, color: "#9d8968", opacity: 0.7 },
    { inner: 2.42, outer: 2.55, color: "#d1bd95", opacity: 0.78 },
  ];

  useFrame((_, delta) => {
    if (systemRef.current) {
      systemRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={1.1} />
      <directionalLight position={[5, 4, 6]} intensity={3.0} />
      <pointLight position={[-4, -2, -3]} intensity={0.8} />

      <group ref={systemRef}>
        {/* Saturn's textured spherical body */}
        <mesh>
          <sphereGeometry args={[1.35, 96, 96]} />
          <meshStandardMaterial
            map={texture}
            roughness={0.95}
            metalness={0}
          />
        </mesh>

        {/* Layered ring system */}
        {planetData.name === "Saturn" &&
          saturnBands.map((band, index) => (
            <mesh
              key={index}
              rotation={[Math.PI / 2.5, 0, 0]}
            >
              <ringGeometry
                args={[band.inner, band.outer, 192]}
              />
              <meshStandardMaterial
                color={band.color}
                side={2}
                transparent
                opacity={band.opacity}
                roughness={1}
                metalness={0}
                depthWrite={false}
              />
            </mesh>
          ))}
      </group>
    </>
  );
}


function PlanetDetails({ selectedPlanet, onClose }) {
  const planet = selectedPlanet?.planet || selectedPlanet;
  const info = planet ? planetInfo[planet.name] : null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!planet || !info) return null;

  return (
    <section
      className="planet-details-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={`${planet.name} Scientific Research Dossier`}
    >
      <button
        className="planet-details-back"
        onClick={onClose}
        aria-label="Return to the solar system"
      >
        <span aria-hidden="true">←</span> SOLAR SYSTEM
      </button>

      <div className="planet-details-layout">
        {/* Left Column: Full Scientific Dossier */}
        <PlanetDossier planet={planet} info={info} />

        {/* Right Column: Sticky Live 3D Rotating Planet */}
        <div className="planet-details-visual">
          <div className="planet-preview-caption">
            <span>LIVE 3D MODEL</span>
            <span className="planet-live-dot" />
          </div>

          <Canvas
            camera={{ position: [0, 0, 5.5], fov: 38 }}
            dpr={[1, 2]}
            gl={{
              alpha: true,
              antialias: true,
              powerPreference: "high-performance",
            }}
          >
            <Suspense fallback={null}>
              <PlanetPreview planet={planet} />
            </Suspense>
          </Canvas>

          <p className="planet-preview-footer">
            ROTATING PLANETARY MODEL
          </p>
        </div>
      </div>
    </section>
  );
}


function OrbitRing({ distance }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[distance - 0.008, distance + 0.008, 160]} />
      <meshBasicMaterial
        color="#8293b5"
        transparent
        opacity={0.2}
        side={2}
      />
    </mesh>
  );
}

function SolarSystemScene({ selectedPlanet, onSelect }) {
  const controlsRef = useRef(null);
  const { camera, size } = useThree();
  const aspect = size.width / size.height;
  const prevAspect = useRef(aspect);
  const initialized = useRef(false);

  // Responsive camera framing calculations
  const baseDistance = 47.43; // Math.hypot(27, 39)
  const responsiveScale = aspect < 1.35 ? Math.min(2.8, 1.35 / Math.max(aspect, 0.42)) : 1;
  const initialDistance = baseDistance * responsiveScale;
  const minDistance = 8;
  const maxDistance = Math.max(100, Math.round(initialDistance * 1.6));

  // Explicit camera states: "idle" | "transitioning" | "tracking" | "returning"
  const [cameraState, setCameraState] = useState("idle");
  const cameraStateRef = useRef("idle");
  cameraStateRef.current = cameraState;

  // Stored offset direction for framing the selected planet
  const offsetDir = useRef(new Vector3(0, 0.4, 1).normalize());
  const tempTarget = useRef(new Vector3());
  const tempCamPos = useRef(new Vector3());

  // Initialize camera position based on screen aspect ratio
  useEffect(() => {
    if (!initialized.current) {
      const dirY = 27 / baseDistance;
      const dirZ = 39 / baseDistance;
      camera.position.set(0, dirY * initialDistance, dirZ * initialDistance);
      camera.lookAt(0, 0, 0);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      initialized.current = true;
      prevAspect.current = aspect;
    }
  }, [camera, initialDistance, aspect]);

  // Handle dynamic screen resizing / device orientation flip
  useEffect(() => {
    if (!initialized.current || cameraStateRef.current !== "idle") return;
    const aspectDiff = Math.abs(aspect - prevAspect.current);
    if (aspectDiff > 0.15) {
      const oldScale = prevAspect.current < 1.35 ? Math.min(2.8, 1.35 / Math.max(prevAspect.current, 0.42)) : 1;
      const newScale = aspect < 1.35 ? Math.min(2.8, 1.35 / Math.max(aspect, 0.42)) : 1;
      const ratio = newScale / oldScale;

      const controls = controlsRef.current;
      const target = controls?.target || new Vector3(0, 0, 0);
      const direction = camera.position.clone().sub(target).normalize();
      const currentDist = camera.position.distanceTo(target);
      const newDist = Math.max(minDistance, Math.min(maxDistance, currentDist * ratio));

      camera.position.copy(target).add(direction.multiplyScalar(newDist));
      if (controls?.update) controls.update();
      prevAspect.current = aspect;
    }
  }, [aspect, camera, minDistance, maxDistance]);

  // Handle selection changes: transitioning or returning
  useEffect(() => {
    if (!initialized.current) return;

    if (selectedPlanet) {
      // Pick viewing angle from current camera position relative to planet
      if (selectedPlanet.mesh) {
        selectedPlanet.mesh.getWorldPosition(tempTarget.current);
        const dir = camera.position.clone().sub(tempTarget.current);
        if (dir.lengthSq() < 0.001) {
          dir.set(0, 0.4, 1);
        }
        // Ensure comfortable elevation angle above the orbit plane
        if (Math.abs(dir.y) < dir.length() * 0.25) {
          dir.y = dir.length() * 0.35;
        }
        offsetDir.current.copy(dir.normalize());
      }
      setCameraState("transitioning");
    } else {
      // Initiate smooth return if we were previously transitioning or tracking
      if (cameraStateRef.current !== "idle") {
        setCameraState("returning");
      }
    }
  }, [selectedPlanet, camera]);

  // Unified per-frame animation and live tracking loop
  useFrame((_, delta) => {
    const controls = controlsRef.current;
    const currentState = cameraStateRef.current;

    if (currentState === "idle") {
      return;
    }

    if (currentState === "transitioning" || currentState === "tracking") {
      if (!selectedPlanet || !selectedPlanet.mesh) return;

      // 1. Get the LIVE world position of the orbiting planet this exact frame
      selectedPlanet.mesh.getWorldPosition(tempTarget.current);

      // 2. Compute camera distance based on planet radius
      const planetSize = selectedPlanet.size || selectedPlanet.planet?.size || 0.5;
      const followDistance = Math.max(planetSize * 7, 4.2);

      // 3. Compute live camera goal position following the planet
      tempCamPos.current
        .copy(tempTarget.current)
        .addScaledVector(offsetDir.current, followDistance);

      if (currentState === "transitioning") {
        // Smooth approach toward the moving planet
        const alpha = 1 - Math.exp(-3.5 * delta);
        camera.position.lerp(tempCamPos.current, alpha);

        if (controls) {
          controls.target.lerp(tempTarget.current, alpha);
          controls.update();
        }

        const camDist = camera.position.distanceTo(tempCamPos.current);
        const targetDist = controls ? controls.target.distanceTo(tempTarget.current) : 0;

        if (camDist < 0.06 && targetDist < 0.06) {
          camera.position.copy(tempCamPos.current);
          if (controls) {
            controls.target.copy(tempTarget.current);
            controls.update();
          }
          setCameraState("tracking");
        }
      } else {
        // Tracking state: tightly follow the planet around its orbit
        const trackAlpha = 1 - Math.exp(-12 * delta);
        camera.position.lerp(tempCamPos.current, trackAlpha);

        if (controls) {
          controls.target.copy(tempTarget.current);
          controls.update();
        }
      }
    } else if (currentState === "returning") {
      const dirY = 27 / baseDistance;
      const dirZ = 39 / baseDistance;
      tempCamPos.current.set(0, dirY * initialDistance, dirZ * initialDistance);
      tempTarget.current.set(0, 0, 0);

      const alpha = 1 - Math.exp(-3.5 * delta);
      camera.position.lerp(tempCamPos.current, alpha);

      if (controls) {
        controls.target.lerp(tempTarget.current, alpha);
        controls.update();
      }

      const camDist = camera.position.distanceTo(tempCamPos.current);
      const targetDist = controls ? controls.target.distanceTo(tempTarget.current) : 0;

      if (camDist < 0.04 && targetDist < 0.04) {
        camera.position.copy(tempCamPos.current);
        if (controls) {
          controls.target.copy(tempTarget.current);
          controls.update();
        }
        setCameraState("idle");
      }
    }
  });

  const fogNear = Math.max(38, initialDistance * 0.75);
  const fogFar = Math.max(85, initialDistance * 1.8);
  const starsRadius = Math.max(100, initialDistance * 1.5);

  return (
    <>
      <color attach="background" args={["#010104"]} />
      <fog attach="fog" args={["#010104", fogNear, fogFar]} />

      <ambientLight intensity={0.12} />

      <Stars
        radius={starsRadius}
        depth={60}
        count={5000}
        factor={3}
        saturation={0}
        fade
        speed={0.25}
      />

      <Sun />

      <Suspense fallback={null}>
        {planets.map((planet) => (
          <group key={planet.name}>
            <OrbitRing distance={planet.distance} />
            <Planet
              planet={planet}
              onSelect={onSelect}
              isSelected={selectedPlanet?.name === planet.name}
            />
          </group>
        ))}
      </Suspense>

      {cameraState === "idle" && (
        <SmoothDesktopZoom
          controlsRef={controlsRef}
          minDistance={minDistance}
          maxDistance={maxDistance}
        />
      )}

      <OrbitControls
        ref={controlsRef}
        enabled={cameraState === "idle"}
        enableDamping
        dampingFactor={0.08}
        enableZoom={false}
        minDistance={minDistance}
        maxDistance={maxDistance}
        enablePan={false}
      />
    </>
  );
}

export default function SolarSystem() {
  const [selectedPlanet, setSelectedPlanet] = useState(null);

  const handleSelectPlanet = (planetData) => {
    setSelectedPlanet({
      ...planetData,
      planet: planetData.planet || planetData,
    });
  };

  const handleClose = () => {
    setSelectedPlanet(null);
  };

  return (
    <div className="solar-system-shell">
      <Canvas
        camera={{ position: [0, 27, 39], fov: 48 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance",
        }}
      >
        <SolarSystemScene
          selectedPlanet={selectedPlanet}
          onSelect={handleSelectPlanet}
        />
      </Canvas>

      {selectedPlanet && (
        <PlanetDetails
          selectedPlanet={selectedPlanet}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
