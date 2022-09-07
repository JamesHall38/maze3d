import { useRef, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { GPUComputationRenderer } from 'three/examples/jsm/misc/GPUComputationRenderer.js'
import * as THREE from 'three'
import Rain from '../shaders/Rain'
import Water from '../shaders/Water'

const WIDTH = 128
const BOUNDS = 512
const SCALE = 200
const SPEED = 0.15

const fragmentHook = '#include <color_fragment>'
const fragColor = `
// if( vPosition.x < 0.005){
        // discard;
// }
diffuseColor.rgb = vec3(0.0,0.0,0.0);
`
const fragmentHook1 = '#include <common>'
const fragColor1 = `
// varying vec3 vPosition;
`

const Environment = () => {
    // Rain
    const rainRef = useRef()
    const points = useRef()
    const geometry = new THREE.BufferGeometry()
    // const count = 4

    // Water
    const { gl } = useThree()
    const gpuCompute = useRef()
    const heightmapVariable = useRef()
    const waterMesh = useRef()

    // const dropTime = 1
    // clock.getElapsedTime() * 10

    // Positions
    const positions = useRef(new Float32Array(3 * 4))
    // const posmap = useRef(new THREE.DataTexture(positions.current, 1, 1, THREE.RGBAFormat, THREE.FloatType))
    const drop0 = useRef(new THREE.Vector4(0.0, 0.0, 0.0, 1.0))
    const drop1 = useRef(new THREE.Vector4(0.0, 0.0, 0.0, 1.0))
    const drop2 = useRef(new THREE.Vector4(0.0, 0.0, 0.0, 1.0))
    const drop3 = useRef(new THREE.Vector4(0.0, 0.0, 0.0, 1.0))


    const calculatePositions = (uniforms) => {

        if (drop0.current.y < -0.5) {
            uniforms['mousePos'].value.set(drop0.current.x * SCALE, drop0.current.z * SCALE);
            const x = (Math.random() - 0.5) * 2.5
            const z = (Math.random() - 0.5) * 2.5
            drop0.current.x = x
            drop0.current.y = 2
            drop0.current.z = z
        }
        else {
            // uniforms['mousePos'].value.set(10000, 10000);
            drop0.current.y -= SPEED
        }
        if (drop1.current.y < -0.5) {
            const x = (Math.random() - 0.5) * 2.5
            const z = (Math.random() - 0.5) * 2.5
            uniforms['mousePos'].value.set(drop1.current.x * SCALE, drop1.current.z * SCALE);
            drop1.current.x = x
            drop1.current.y = 2.25
            drop1.current.z = z
        }
        else {
            // uniforms['mousePos'].value.set(10000, 10000);
            drop1.current.y -= SPEED
        }
        if (drop2.current.y < -0.5) {
            const x = (Math.random() - 0.5) * 2.5
            const z = (Math.random() - 0.5) * 2.5
            uniforms['mousePos'].value.set(drop2.current.x * SCALE, drop2.current.z * SCALE);
            drop2.current.x = x
            drop2.current.y = 2.5
            drop2.current.z = z
        }
        else {
            // uniforms['mousePos'].value.set(10000, 10000);
            drop2.current.y -= SPEED
        }
        if (drop3.current.y < -0.5) {
            const x = (Math.random() - 0.5) * 2.5
            const z = (Math.random() - 0.5) * 2.5
            uniforms['mousePos'].value.set(drop3.current.x * SCALE, drop3.current.z * SCALE);
            drop3.current.x = x
            drop3.current.y = 2.75
            drop3.current.z = z
        }
        else {
            // uniforms['mousePos'].value.set(10000, 10000);
            drop3.current.y -= SPEED
        }

        // for (let i = 0; i < 4; i++) {
        //     const i3 = i * 4
        //     if (positions.current[i3 + 1] < -0.5) {

        //         positions.current[i3] = (Math.random() - 0.5) * 2.5
        //         positions.current[i3 + 1] = 1
        //         positions.current[i3 + 2] = (Math.random() - 0.5) * 2.5

        //         console.log(positions.current[i3])
        //     }
        //     else {
        //         positions.current[i3 + 1] = positions.current[i3 + 1] - 0.01
        //     }
        // }
        // posmap.current.data = positions.current
        // posmap.current.needsUpdate = true
    }

    // for (let i = 0; i < count; i++) {
    // const i3 = i * 3
    // positions.current[i3] = (Math.random() - 0.5) * 2.5
    // positions.current[i3 + 1] = (Math.random() - 0.5) * 2.5
    // positions.current[i3 + 2] = (Math.random() - 0.5) * 2.5
    // }
    for (let i = 0; i < 4; i++) {
        const i3 = i * 3
        positions.current[i3] = i
        // positions.current[i3 + 1] = i
        // positions.current[i3 + 2] = (Math.random() - 0.5) * 2.5
    }


    // posmap.current.data = positions.current
    // posmap.current.needsUpdate = true

    // for (let i = 0; i < 12; i++) {
    //     positions.current[i] = i
    // }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions.current, 3))




    useEffect(() => {
        // Rain
        rainRef.current.depthWrite = false
        rainRef.current.blending = THREE.AdditiveBlending
        rainRef.current.vertexColors = true

        // Water
        gpuCompute.current = new GPUComputationRenderer(WIDTH, WIDTH, gl);
        const heightmap0 = gpuCompute.current.createTexture();
        heightmapVariable.current = gpuCompute.current.addVariable('heightmap', Water.heightMapFragmentShader, heightmap0);
        gpuCompute.current.setVariableDependencies(heightmapVariable.current, [heightmapVariable.current]);
        const error = gpuCompute.current.init();
        if (error !== null)
            console.error(error)

        const effectController = {
            mouseSize: 10.0,
            viscosity: 0.98
        }
        heightmapVariable.current.material.uniforms['mousePos'] = { value: new THREE.Vector2(10000, 10000) };
        heightmapVariable.current.material.uniforms['mouseSize'] = { value: effectController.mouseSize };
        heightmapVariable.current.material.uniforms['viscosityConstant'] = { value: effectController.viscosity };
    }, [gl])

    useFrame(({ camera, pointer, raycaster, clock }) => {


        // console.log(clock.elapsedTime)

        // Water
        const uniforms = heightmapVariable.current.material.uniforms;
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(waterMesh.current);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            uniforms['mousePos'].value.set(point.x * SCALE, point.z * SCALE);
        } else {
            uniforms['mousePos'].value.set(100000, 100000);
        }
        calculatePositions(uniforms)

        gpuCompute.current.compute();
        waterMesh.current.material.uniforms['heightmap'].value = gpuCompute.current.getCurrentRenderTarget(heightmapVariable.current).texture;
        // waterMesh.current.material.uniforms['posmap'] = { value: posmap.current }



        // Rain
        rainRef.current.uniforms.uTime = { value: clock.elapsedTime }
        rainRef.current.uniforms['drop0'].value = drop0.current
        rainRef.current.uniforms['drop1'].value = drop1.current
        rainRef.current.uniforms['drop2'].value = drop2.current
        rainRef.current.uniforms['drop3'].value = drop3.current
    })

    return (
        <>
            <mesh ref={waterMesh} scale={1 / SCALE} position={[0, -0.499, 0]} rotation={[- Math.PI / 2, 0, 0]} castShadow receiveShadow>
                <planeBufferGeometry args={[BOUNDS, BOUNDS, WIDTH - 1, WIDTH - 1]} />
                <shaderMaterial
                    uniforms={THREE.UniformsUtils.merge([THREE.ShaderLib['phong'].uniforms, { 'heightmap': { value: null } }])}
                    vertexShader={Water.waterVertexShader}
                    onBeforeCompile={(shader) => console.log(shader)}
                    fragmentShader={
                        THREE.ShaderChunk['meshphong_frag']
                            .replace(fragmentHook, `${fragmentHook}${fragColor}`)
                            .replace(fragmentHook1, `${fragmentHook1}${fragColor1}`)
                    }
                    lights />
            </mesh>
            <points ref={points} geometry={geometry}>
                <shaderMaterial
                    ref={rainRef}
                    vertexShader={Rain.vertexShader}
                    fragmentShader={Rain.fragmentShader}
                    uniforms={{
                        uTime: 0, uSize: 3000, posmap: { value: null },
                        drop0: { value: null },
                        drop1: { value: null },
                        drop2: { value: null },
                        drop3: { value: null }
                    }}
                />
            </points>
        </>
    )
}

export default Environment