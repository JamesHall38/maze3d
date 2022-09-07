import './App.css'
import './Buttons.css'
import Pathfinding from './components/Pathfinding'
import Environment from './components/Environment'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'


const App = () => {

  const loading = useRef()
  const visualize = useRef(false)
  const generate = useRef(false)
  const clear = useRef(false)
  const controls = useRef()

  const heightmapVariable = useRef()

  const cameraPosition = [0, 2 + (window.innerWidth < 750 ? 1 : 0), 1 + (window.innerWidth < 750 ? 1 : 0)]

  return (
    <div className="App">

      <div className="buttons">
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
      </div>

      <div className="loading" ref={loading} >
        <div className="loader">
          <div className="loader-wheel"></div>
          <div className="loader-text"></div>
        </div>
      </div>

      <Canvas
        shadows
        style={{ height: '100vh', width: '100vw' }}
        camera={{ position: cameraPosition }}

      >
        <directionalLight color='blue' intensity={1.5} position={[20, 30, 20]} />
        <directionalLight color='red' intensity={1.5} position={[-20, 30, -20]} />
        <directionalLight intensity={0.75} position={[20, 30, -20]} />
        <directionalLight intensity={0.75} position={[-20, 30, 20]} />
        <ambientLight intensity={2} />

        <OrbitControls ref={controls} />

        <Environment heightmapVariable={heightmapVariable} />
        <Pathfinding
          loading={loading}

          visualize={visualize}
          generate={generate}
          clear={clear}
          controls={controls}
        />

      </Canvas>
    </div >
  )
}

export default App