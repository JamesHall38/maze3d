import { useMemo, useState } from 'react'
import { generateRooms, growMaze, connectRooms, removeDeadEnds, flatten, dropColumns, createStairs, pushGeometries, optimizeGeometries } from './algorithms'
import * as THREE from 'three'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { button, useControls } from 'leva'

const floorNum = 3
const gridSize = 21

const ProceduralHouse = (props) => {
    const [regenerate, setRegenerate] = useState(0)

    const { color, wireframe } = useControls({
        color: 'white',
        wireframe: false,
        // floorNum: 3,
        regenerate: button(() => { setRegenerate(regenerate => regenerate + 1) })
    })

    const createGrid = () => {
        const grid = []
        for (let i = 0; i < gridSize; i++) {
            const row = []
            for (let j = 0; j < gridSize; j++)
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
                    isStairsEnd: false,
                    isFlat: false,
                    direction: '',
                    isBorder: false,
                    isColumn: false,
                    value: 0,
                })
            grid.push(row)
        }
        return grid
    }

    const boxGeometries = useMemo(() => {
        console.log('Regenerate', regenerate)

        const stairsFirstStep = []
        const grid = []
        for (let i = 0; i < floorNum; i++) { grid.push(createGrid()) }

        for (let i = (floorNum - 1); i >= 0; i--) {
            const sizes = {
                width: gridSize,
                height: gridSize,
                size: gridSize * gridSize,
                stairsHeight: 1,
                smallValue: 6 + 6 * i,
                bigValue: 7 + 6 * i,
                flat: 6 + 6 * i,
                floorHeight: 5 + 6 * i,
                doorsValue: 0 + 6 * i,
            }
            let starts = []
            let deadEnds = []

            // algorithms
            const rooms = generateRooms(grid[i], sizes, stairsFirstStep)
            growMaze(grid[i], sizes, starts, deadEnds)
            connectRooms(grid[i], sizes, rooms)
            removeDeadEnds(grid[i], starts, deadEnds)
            flatten(grid[i], sizes)
            createStairs(grid[i], sizes, stairsFirstStep)
            dropColumns(grid[i], sizes)
        }

        const geometries = []
        const windowsGeometries = []
        const columnGeometries = []
        const darkGeometries = []
        pushGeometries(grid, floorNum, geometries, columnGeometries, darkGeometries, windowsGeometries)

        let mergedfloors
        let mergedBorders
        let mergedWindows

        const floorGeometry = new THREE.BoxGeometry(gridSize, 1, gridSize).translate(-0.5, 0, -0.5)
        if (geometries)
            mergedfloors = BufferGeometryUtils.mergeBufferGeometries([...optimizeGeometries(geometries), floorGeometry])
        if (columnGeometries || darkGeometries)
            mergedBorders = BufferGeometryUtils.mergeBufferGeometries([...optimizeGeometries(darkGeometries), ...optimizeGeometries(columnGeometries)])
        if (windowsGeometries)
            mergedWindows = BufferGeometryUtils.mergeBufferGeometries(optimizeGeometries(windowsGeometries))

        return {
            floors: mergedfloors,
            borders: mergedBorders,
            windows: mergedWindows
        }
    }, [regenerate])

    return (
        <group {...props} >
            <mesh geometry={boxGeometries.borders} castShadow receiveShadow >
                <meshStandardMaterial color="grey" wireframe={wireframe} />
            </mesh>
            <mesh geometry={boxGeometries.floors} castShadow receiveShadow >
                <meshStandardMaterial color={color} wireframe={wireframe} side={THREE.DoubleSide} />
            </mesh>
            <mesh geometry={boxGeometries.windows} castShadow receiveShadow >
                <meshStandardMaterial color="black" wireframe={wireframe} side={THREE.DoubleSide}
                    transparent
                    roughness={0.25}
                    opacity={0.5}
                />
            </mesh>
        </group >
    )
}

export default ProceduralHouse