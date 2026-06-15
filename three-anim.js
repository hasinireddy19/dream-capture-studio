function initThreeJSHands() {
    const container = document.getElementById('threejs-container');
    if (!container) return;
    container.innerHTML = ''; // Clear existing

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    
    const dirLight = new THREE.DirectionalLight(0xffaa55, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);

    // Low-poly material with flat shading (matching the brown/orange faces)
    const material = new THREE.MeshStandardMaterial({ 
        color: 0x8B4513, // SaddleBrown
        flatShading: true,
        roughness: 0.9,
        metalness: 0.1
    });

    // Wireframe overlay (matching the blue lines)
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x4488ff, 
        transparent: true, 
        opacity: 0.8 
    });

    // Apply mathematical noise to vertices to create a geometric low-poly look
    function createLowPolyMesh(geometry) {
        const positionAttribute = geometry.getAttribute('position');
        const vertex = new THREE.Vector3();
        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            // Math equations to perturb the vertices
            vertex.x += (Math.random() - 0.5) * 0.15;
            vertex.y += (Math.random() - 0.5) * 0.15;
            vertex.z += (Math.random() - 0.5) * 0.15;
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, material);
        const wireframe = new THREE.LineSegments(new THREE.WireframeGeometry(geometry), lineMaterial);
        mesh.add(wireframe);
        return mesh;
    }

    // Helper to create a stylized low-poly hand
    function createHand() {
        const handGroup = new THREE.Group();
        
        // Palm
        const palmGeo = new THREE.BoxGeometry(1.4, 1.6, 0.4, 4, 4, 2);
        const palm = createLowPolyMesh(palmGeo);
        palm.position.y = 0.8;
        handGroup.add(palm);

        // Fingers
        for(let i=0; i<4; i++) {
            const fingerGeo = new THREE.CylinderGeometry(0.15, 0.12, 1.4, 6, 3);
            const finger = createLowPolyMesh(fingerGeo);
            finger.position.set(-0.45 + (i * 0.3), 2.3, 0);
            handGroup.add(finger);
        }
        
        // Thumb
        const thumbGeo = new THREE.CylinderGeometry(0.18, 0.15, 0.9, 6, 3);
        const thumb = createLowPolyMesh(thumbGeo);
        thumb.position.set(0.8, 0.9, 0.2);
        thumb.rotation.z = -Math.PI / 4;
        handGroup.add(thumb);

        return handGroup;
    }

    const leftHand = createHand();
    const rightHand = createHand();
    
    // Mirror the right hand
    rightHand.scale.x = -1;

    // Initial positions (apart and tilted)
    leftHand.position.set(-3.5, -1, 0);
    leftHand.rotation.z = -0.5;
    
    rightHand.position.set(3.5, -1, 0);
    rightHand.rotation.z = 0.5;

    scene.add(leftHand);
    scene.add(rightHand);

    camera.position.z = 6.5;

    // Animation loop using math equations
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();
        
        // Math equation for sliding together over 1.5 seconds
        if (time < 1.5) {
            const t = time / 1.5;
            // Cubic ease out equation
            const ease = 1 - Math.pow(1 - t, 3);
            
            leftHand.position.x = -3.5 + (ease * 3.1); // Stops at -0.4
            leftHand.rotation.z = -0.5 + (ease * 0.5); // Straightens out
            
            rightHand.position.x = 3.5 - (ease * 3.1); // Stops at 0.4
            rightHand.rotation.z = 0.5 - (ease * 0.5); // Straightens out
            
            leftHand.rotation.y = ease * 0.2;
            rightHand.rotation.y = -ease * 0.2;

        } else {
            // Mathematical sine wave equation for breathing/pulsing effect
            const pulse = Math.sin((time - 1.5) * 4) * 0.03;
            leftHand.position.x = -0.4 + pulse;
            rightHand.position.x = 0.4 - pulse;

            // Gentle waving motion
            leftHand.rotation.x = Math.sin(time * 2) * 0.05;
            rightHand.rotation.x = Math.sin(time * 2) * 0.05;
        }

        // Slowly rotate the whole scene slightly for a 3D effect
        scene.rotation.y = Math.sin(time * 0.5) * 0.1;
        scene.rotation.x = Math.cos(time * 0.5) * 0.05;

        renderer.render(scene, camera);
    }

    animate();
}

document.addEventListener('DOMContentLoaded', initThreeJSHands);
