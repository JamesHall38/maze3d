import './App.css'
import './Buttons.css'
import Pathfinding from './components/Pathfinding'
// import Environment from './components/Environment'
import ProceduralHouse from './components/House/ProceduralHouse'
import { Suspense, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import { useControls } from 'leva'


const App = () => {

  const visualize = useRef(false)
  const generate = useRef(false)
  const clear = useRef(false)
  const controls = useRef()
  const heightmapVariable = useRef()

  const { Performances: perfVisible, maze } = useControls({
    Performances: false,
    maze: false
  })

  return (
    <div className="App">

      {maze && <div className="buttons">
        <button onClick={() => generate.current()} >
          <span>Generate</span>
          <div className="liquid"></div>
        </button>

        <button onClick={() => visualize.current()} >
          <span>Resolve</span>
          <div className="liquid resolve"></div>
        </button>

        <button onClick={() => {
          clear.current()
          heightmapVariable.current.material.uniforms['uClear'] = { value: 0.0 };
          setTimeout(() => {
            heightmapVariable.current.material.uniforms['uClear'] = { value: 1.0 };
          }, 50)
        }} >
          <span>Clear</span>
          <div className="liquid clear"></div>
        </button>
      </div>}

      <Suspense fallback={
        <div className="loading" >
          <div className="loader">
            <div className="loader-wheel"></div>
            <div className="loader-text"></div>
          </div>
        </div>
      } >
        <Canvas
          shadows
          style={{ height: '100vh', width: '100vw' }}
          camera={{ position: [3, 3, 3] }}
        >
          {perfVisible &&
            <Perf position='top-left' />
          }
          <OrbitControls ref={controls} />

          <Environment preset='night' />
          {/* <BakeShadows /> */}

          {!maze &&
            <>
              <pointLight color="red" intensity={0.25} position={[0.4, 0.2, 0.4]} shadow-normalBias={0.04} castShadow />
              <pointLight color="red" intensity={0.25} position={[0.4, 0.8, 0]} shadow-normalBias={0.04} castShadow />
              <pointLight color="red" intensity={0.25} position={[0, 1.4, 0.4]} shadow-normalBias={0.04} castShadow />

              <ProceduralHouse position={[0, -1, 0]} scale={0.15} position-y={-1} />
            </>
          }
          {maze &&
            <>
              <directionalLight intensity={1} />
              <Pathfinding
                // loading={loading}
                visualize={visualize}
                generate={generate}
                clear={clear}
                controls={controls}
              />
            </>
          }

        </Canvas>
      </Suspense>
    </div >
  )
}

export default App