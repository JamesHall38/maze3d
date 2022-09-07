import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const WIDTH = 128 * 2
const BOUNDS = WIDTH * 2

const initialChunk = `
uniform sampler2D heightmap;  
varying vec2 vUv;   
`
const hook0 = 'void main() {'
const chunk0 = `
    vUv = uv;     
    vec2 cellSize = vec2( 1.0 / ${WIDTH}.0, 1.0 / ${WIDTH}.0 );  
`
const hook1 = '#include <color_vertex>'
const chunk1 = `
    vec3 objectNormal = vec3(
        ( texture2D( heightmap, uv + vec2( - cellSize.x, 0 ) ).x - texture2D( heightmap, uv + vec2( cellSize.x, 0 ) ).x ) * ${WIDTH}.0 / ${BOUNDS}.0,
        ( texture2D( heightmap, uv + vec2( 0, - cellSize.y ) ).x - texture2D( heightmap, uv + vec2( 0, cellSize.y ) ).x ) * ${WIDTH}.0 / ${BOUNDS}.0,
        1.0 ); 
`
const hook2 = '#include <defaultnormal_vertex>'
const chunk2 = `
    vNormal = normalize( transformedNormal ); 
    vec4 map = texture2D( heightmap, uv );
    vec3 transformed = vec3( position.x + map.z, position.y + map.y, map.x );
`
const fragmentHook = '#include <color_fragment>'
const wallColor = `
// diffuseColor.rgb = vec3(0.1,0.1,0.5);
diffuseColor.rgb = vec3(0.01,0.01,0.01);
`

const visitedColor = `
diffuseColor.rgb = vec3(0.8,0.8,0.8);`
const pathColor = `
diffuseColor.rgb = vec3(0.2,0.0,0.0);`

const MazeShader = ({ color }) => {
    return (
        <shaderMaterial
            vertexShader={
                `${initialChunk}
                    ${THREE.ShaderChunk['meshphong_vert']
                    .replace(hook0, `${hook0}${chunk0}`)
                    .replace(hook1, `${hook1}${chunk1}`)
                    .replace(hook2, `${hook2}${chunk2}`)
                    .replace('#include <begin_vertex>', '')
                    .replace('#include <beginnormal_vertex>', '')
                }`}
            fragmentShader={
                THREE.ShaderChunk['meshphong_frag']
                    .replace(fragmentHook, `${fragmentHook}${color}`)}
            uniforms={THREE.UniformsUtils.merge([
                THREE.ShaderLib['phong'].uniforms,
                { 'heightmap': { value: null } }
            ])}
            lights
        />
    )
}


const Maze = ({ grid, animateWall, setMountedMaze, heightmap0, heightmap1, heightmap2, controls }) => {
    const mouseDown = useRef(false)
    const isDragging = useRef(false)
    const removeWalls = useRef(false)
    const firstToggle = useRef(false)

    const wallMesh = useRef()
    const visitedMesh = useRef()
    const pathMesh = useRef()
    const raycastRef = useRef()

    function handleToggleWall(x, y) {   ///  <-----------
        if (!mouseDown.current) return

        const row = Math.round((255 / 2 + x * 200) / 255 * 40)
        const col = Math.round((255 / 2 - y * 200) / 255 * 40)

        if (firstToggle.current === false) {
            removeWalls.current = grid[row][col].isWall
            firstToggle.current = true
        }
        animateWall(row, col, removeWalls.current)
    }


    useEffect(() => {
        const handleMouseDown = () => {
            mouseDown.current = true
        }
        const handleMouseUp = () => {
            firstToggle.current = false
            mouseDown.current = false
            isDragging.current = false
            controls.current.enabled = true
        }
        setMountedMaze(true)

        document.addEventListener('mousedown', handleMouseDown)
        document.addEventListener('touchstart', handleMouseDown)
        document.addEventListener('mouseup', handleMouseUp)
        return () => {
            document.removeEventListener('mousedown', handleMouseDown)
            document.removeEventListener('touch', handleMouseDown)
            document.removeEventListener('mouseup', handleMouseUp)
        }
    }, [setMountedMaze, controls])

    useFrame(({ camera, pointer, raycaster }) => {
        raycaster.setFromCamera(pointer, camera);
        const intersects = raycaster.intersectObject(raycastRef.current);
        if (intersects.length > 0) {
            const point = intersects[0].point;
            handleToggleWall(point.x, point.z)
            controls.current.enableRotate = false

            // lastPos.set(point.x, point.y)
        }
        else if (!mouseDown.current) {
            controls.current.enableRotate = true
            isDragging.current = true
        }

        if (heightmap0) {
            wallMesh.current.material.uniforms['heightmap'].value = heightmap0.current
            visitedMesh.current.material.uniforms['heightmap'].value = heightmap1.current
            pathMesh.current.material.uniforms['heightmap'].value = heightmap2.current
        }
    })

    return (
        <group scale={[0.0025, 0.0025, 0.0025]}>
            <mesh ref={wallMesh} position={[0, -200, 0]} rotation={[- Math.PI / 2, 0, 0]}>
                <planeBufferGeometry args={[BOUNDS, BOUNDS, WIDTH, WIDTH]} />
                <MazeShader color={wallColor} />
            </mesh>
            <mesh ref={visitedMesh} position={[0, -200, 0]} rotation={[- Math.PI / 2, 0, 0]}>
                <planeBufferGeometry args={[BOUNDS, BOUNDS, WIDTH, WIDTH]} />
                <MazeShader color={visitedColor} />
            </mesh>
            <mesh ref={pathMesh} position={[0, -200, 0]} rotation={[- Math.PI / 2, 0, 0]}>
                <planeBufferGeometry args={[BOUNDS, BOUNDS, WIDTH, WIDTH]} />
                <MazeShader color={pathColor} />
            </mesh>
            <mesh ref={raycastRef} position={[0, -175, 0]} rotation={[- Math.PI / 2, 0, 0]}>
                <planeBufferGeometry args={[BOUNDS, BOUNDS, 2, 2]} />
                <meshStandardMaterial visible={false} />
            </mesh>
        </group >
    )
}


export default Maze