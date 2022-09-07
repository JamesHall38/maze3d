const WIDTH = 128;
const BOUNDS = 512;

const Water = {
    heightMapFragmentShader:
        `
#include <common>
uniform vec2 mousePos;
uniform float mouseSize;
uniform float viscosityConstant;
void main()	{
    vec2 cellSize = 1.0 / resolution.xy;
    vec2 uv = gl_FragCoord.xy * cellSize;
    // heightmapValue.x == height from previous frame
    // heightmapValue.y == height from penultimate frame
    // heightmapValue.z, heightmapValue.w not used
    vec4 heightmapValue = texture2D( heightmap, uv );
    // Get neighbours
    vec4 north = texture2D( heightmap, uv + vec2( 0.0, cellSize.y ) );
    vec4 south = texture2D( heightmap, uv + vec2( 0.0, - cellSize.y ) );
    vec4 east = texture2D( heightmap, uv + vec2( cellSize.x, 0.0 ) );
    vec4 west = texture2D( heightmap, uv + vec2( - cellSize.x, 0.0 ) );
    
    float newHeight = ( ( north.x + south.x + east.x + west.x ) * 0.5 - heightmapValue.y ) * viscosityConstant;
    // Mouse influence
    float mousePhase = clamp( length( ( uv - vec2( 0.5 ) ) * ${BOUNDS}.0 - vec2( mousePos.x, - mousePos.y ) ) * PI / mouseSize, 0.0, PI );
    newHeight += ( cos( mousePhase ) + 1.0 ) * 0.28;
    heightmapValue.y = heightmapValue.x;
    heightmapValue.x = newHeight;
    gl_FragColor = heightmapValue;
    
    if((gl_FragCoord.x > 31.0 && gl_FragCoord.x < 97.0) &&( gl_FragCoord.y > 31.0 && gl_FragCoord.y < 97.0)) {
        gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }
}
`,
    waterVertexShader:
        `
varying vec3 vPosition;

uniform sampler2D heightmap;
#define PHONG
varying vec3 vViewPosition;
#ifndef FLAT_SHADED
varying vec3 vNormal;
#endif
#include <common>
#include <uv_pars_vertex>
#include <uv2_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {    
    
    vPosition = position;
    
	vec2 cellSize = vec2( 1.0 / ${WIDTH}.0, 1.0 / ${WIDTH}.0 );
	#include <uv_vertex>
	#include <uv2_vertex>
	#include <color_vertex>
    
	vec3 objectNormal = vec3(
        ( texture2D( heightmap, uv + vec2( - cellSize.x, 0 ) ).x - texture2D( heightmap, uv + vec2( cellSize.x, 0 ) ).x ) * ${WIDTH}.0 / ${BOUNDS}.0,
		( texture2D( heightmap, uv + vec2( 0, - cellSize.y ) ).x - texture2D( heightmap, uv + vec2( 0, cellSize.y ) ).x ) * ${WIDTH}.0 / ${BOUNDS}.0,
		1.0 );
        #include <morphnormal_vertex>
        #include <skinbase_vertex>
        #include <skinnormal_vertex>
        #include <defaultnormal_vertex>
        #ifndef FLAT_SHADED 
        vNormal = normalize( transformedNormal );
        #endif
        float heightValue = texture2D( heightmap, uv ).x;
        vec3 transformed = vec3( position.x, position.y, heightValue );
        #include <morphtarget_vertex>
        #include <skinning_vertex>
        #include <displacementmap_vertex>
        #include <project_vertex>
        #include <logdepthbuf_vertex>
        #include <clipping_planes_vertex>
        vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
}
`
}
export default Water

