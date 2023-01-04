import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const WIDTH = 128
const BOUNDS = 512

const initialChunk = `
uniform sampler2D heightmap;
uniform sampler2D clippingmap;  
varying vec2 vUv;   
varying vec3 vPosition;
varying vec3 vNormal;
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
vPosition = transformed;
    `
const fragmentHook = '#include <color_fragment>'
const pathColor = `
    vec4 map = texture2D( clippingmap, vUv );
    // if( vPosition.z <= 0.0
    //     && vPosition.z != -10.0
    //     && vPosition.z != -30.0
    //     && vPosition.z != -50.0
    //     && vPosition.z != -70.0
    //     && vPosition.z != -90.0
    //     ){
    //     discard;
    // }

    // if(map.x != 0.0){
    //     discard;
    // }


    // if( (mod(vPosition.x + 6.0,24.0) <= 2.0 
    // || mod(vPosition.y - 6.0,24.0) <= 2.0)
    // && vPosition.z <= 0.0
    // || vPosition.z == 0.0
    //     ){
    //     discard;
    // }

if( vPosition.z >= 0.2){
    diffuseColor.rgb = vec3(0.2,0.0,5.0);
}    
else if( vPosition.z >= 1.0 ){
    diffuseColor.rgb = vec3(0.2,0.5,0.0);
}
else{
    diffuseColor.rgb = vec3(0.2,0.0,0.0);
}
`

const CustomPhongShader = () => {
    const ref = useRef()
    useFrame(() => {
        console.log(ref.current);
    })
    return (
        <shaderMaterial
            ref={ref}
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
                `
uniform sampler2D heightmap;  
varying vec2 vUv;   
varying vec3 vPosition;
uniform sampler2D clippingmap;
${THREE.ShaderChunk['meshphong_frag']}`
                    .replace(fragmentHook, `${fragmentHook}${pathColor}`)}
            uniforms={THREE.UniformsUtils.merge([
                THREE.ShaderLib['phong'].uniforms,
                {
                    'heightmap': { value: null },
                    'clippingmap': { value: null }
                }
            ])}
            lights
            shadows
            castShadow
            receiveShadow
            flatShading
        />
    )
}

export default CustomPhongShader