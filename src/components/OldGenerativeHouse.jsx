import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { generateRooms, growMaze, connectRooms, removeDeadEnds, flatten, dropColumns, createStairs } from './House/algorithms'
import * as THREE from 'three'
// import CustomPhongShader from '../CustomPhongShader'


const sizeWidth = 128
const sizeHeight = 128
const sizeMaxValue = 6

const sizes = {
    width: sizeWidth,
    height: sizeHeight,
    maxValues: sizeMaxValue,
    gridWidth: Math.floor(sizeWidth / sizeMaxValue),
    gridHeight: Math.floor(sizeHeight / sizeMaxValue),
    size: sizeWidth * sizeHeight
}

const GenerativeHouse = ({ loading, position }) => {
    const meshRef = useRef()
    const data = useRef(new Float32Array(8 * sizes.size))
    const heightmap = useRef(new THREE.DataTexture(data.current, sizes.width, sizes.height, THREE.RGBAFormat, THREE.FloatType))

    const clippingData = useRef(new Float32Array(8 * sizes.size / sizeMaxValue))
    const clippingMap = useRef(new THREE.DataTexture(clippingData.current, sizes.gridWidth, sizes.gridHeight, THREE.RGBAFormat, THREE.FloatType))

    const deadEnds = useRef([])
    const starts = useRef([])

    const grid = useMemo(() => {
        const grid = []
        for (let i = 0; i < sizes.width; i++) {
            const row = []
            for (let j = 0; j < sizes.height; j++)
                row.push({
                    isRoom: false,
                    isPath: false,
                    row: i,
                    col: j,
                    roomNumber: 0,
                    previousNode: null,
                    nextNode: null,
                    isIntersection: false,
                    isDeadEnd: false,
                    isInFrontOfDoor: false,
                    isStairsStart: false,
                    isFlat: false,
                    direction: '',
                })
            grid.push(row)
        }
        return grid
    }, [])

    const applyOnData = useCallback((row, col, value) => {
        for (let ind = 0; ind < sizes.maxValues; ind++) {
            for (let din = 0; din < sizes.maxValues; din++) {
                const x = row * sizes.maxValues + din
                const y = col * sizes.maxValues + ind
                const i = sizes.width * (y - 1) + x
                const stride = i * 4

                // const xValue = 0
                // (y % sizes.maxValues < 12) ? - y % (sizes.maxValues / 24) : y % (sizes.maxValues / 24)
                // const yValue = 0
                // (x % sizes.maxValues < 12) ? - x % (sizes.maxValues / 24) : x % (sizes.maxValues / 24)

                data.current[stride] = value
                // data.current[stride + 1] = xValue
                // data.current[stride + 2] = yValue

                if (x < 2 || y < 2 || x > sizes.width - 2 || y > sizes.width - 2)
                    data.current[stride] = 0
            }
            heightmap.current.data = data.current
            heightmap.current.needsUpdate = true
        }
    }, [])


    useEffect(() => {
        const parameters = { grid, applyOnData, sizes }

        // algorithms
        const rooms = generateRooms(parameters)
        growMaze(parameters, starts, deadEnds)
        connectRooms(parameters, rooms, clippingData, clippingMap)
        removeDeadEnds(parameters, starts, deadEnds)
        flatten(parameters)
        createStairs(parameters)
        dropColumns(parameters)


        meshRef.current.material.clippingPlanes = true
        meshRef.current.material.side = THREE.DoubleSide
        loading.current.style.display = 'none'

    }, [grid, loading, applyOnData])

    useFrame(() => {
        meshRef.current.material.uniforms['heightmap'].value = heightmap.current
        meshRef.current.material.uniforms['clippingmap'].value = clippingMap.current
    })

    return (
        <mesh ref={meshRef} scale={[0.01, 0.01, 0.01,]} position={position} rotation={[- Math.PI / 2, 0, 0]}>
            <planeBufferGeometry args={[sizes.width, sizes.height, sizes.width / 2, sizes.height / 2]} />
            <CustomPhongShader />
        </mesh>
    )
}

export default GenerativeHouse