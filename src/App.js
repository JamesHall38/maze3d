import './App.css'
import './Buttons.css'
import Pathfinding from './Components/Pathfinding'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'


const App = () => {

  const loading = useRef()
  const visualize = useRef(false)
  const generate = useRef(false)
  const clear = useRef(false)

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

        <button onClick={() => clear.current()} >
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
      >
        <pointLight position={[20, -5, 10]} castShadow />
        <ambientLight intensity={0.25} />


        {console.log('renderAPP')}
        <Pathfinding
          loading={loading}

          visualize={visualize}
          generate={generate}
          clear={clear}
        />

      </Canvas>
    </div >
  )
}

export default App