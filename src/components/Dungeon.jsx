import { useFrame } from '@react-three/fiber'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import CustomPhongShader from './CustomPhongShader'

const numRoomTries = 50
const roomExtraSize = 0
const doorsNumber = 2
const doorSize = 30

const WIDTH = 128 * 2
const HEIGHT = 128 * 2
const widthh = WIDTH * 2 - 21;
const heightt = HEIGHT * 2 - 21;
const size = widthh * heightt;
const maxValue = 12

const gridWidth = Math.floor(widthh / maxValue)
const gridHeight = Math.floor(heightt / maxValue)



const House = ({ loading }) => {
    const meshRef = useRef()
    const data = useRef(new Float32Array(8 * size))
    const heightmap = useRef(new THREE.DataTexture(data.current, widthh, heightt, THREE.RGBAFormat, THREE.FloatType))

    const deadEnds = useRef([])
    const starts = useRef([])

    const grid = useMemo(() => {
        const grid = []
        for (let i = 0; i < widthh; i++) {
            const row = []
            for (let j = 0; j < heightt; j++)
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
                    isInFrontOfDoor: false
                })
            grid.push(row)
        }
        return grid
    }, [])

    const applyOnData = (row, col, value) => {
        for (let ind = 0; ind < maxValue; ind++) {
            for (let din = 0; din < maxValue; din++) {
                const x = row * maxValue + din
                const y = col * maxValue + ind
                const i = widthh * (y - 1) + x
                const stride = i * 4
                const xValue = (y % maxValue < 6) ? - y % maxValue : - y % maxValue + 12
                const yValue = (x % maxValue < 6) ? - x % maxValue : - x % maxValue + 12

                data.current[stride] = value
                data.current[stride + 1] = xValue
                data.current[stride + 2] = yValue

                if (x < 2 || y < 2 || x > widthh - 2 || y > widthh - 2)
                    data.current[stride] = 0
            }
        }
        heightmap.current.data = data.current
        heightmap.current.needsUpdate = true
    }

    const addRooms = useCallback(() => {
        const rooms = []
        for (let i = 0; i < numRoomTries; i++) {
            const size = Math.round(Math.random() * (3 + roomExtraSize) + 1) * 2 + 1
            // const rectangularity = (Math.random() + size / 2) * 2
            let width = size;
            let height = size;

            // if (i % 2)
            //     width += rectangularity;
            // else
            //     height += rectangularity;

            const xPos = Math.floor(Math.random() * (widthh / maxValue - width) / 2) * 2 + 1
            const yPos = Math.floor(Math.random() * (heightt / maxValue - height) / 2) * 2 + 1

            let overlaps = false
            for (let j = 0; j < width; j++) {
                for (let k = 0; k < height; k++) {
                    const x = xPos + j
                    const y = yPos + k
                    const node = grid[x][y]
                    if (node.isRoom === true)
                        overlaps = true
                }
            }

            if (!overlaps) {
                for (let j = 0; j < width; j++) {
                    for (let k = 0; k < height; k++) {
                        const x = xPos + j
                        const y = yPos + k
                        grid[x][y].isRoom = true
                        grid[x][y].roomNumber = rooms.length
                        applyOnData(x, y, 70)
                    }
                }
                rooms.push({ value: doorsNumber })
            }
        }
        return rooms
    }, [grid])

    const getEmptyNode = useCallback(() => {
        let node
        for (let x = 1; x < gridWidth; x += 2) {
            for (let y = 1; y < gridHeight; y += 2) {
                const test = grid[x][y].isRoom ||
                    grid[x][y].isPath ||
                    grid[0][y].row ||
                    grid[x][0].col
                if (!test) {
                    node = grid[x][y]
                    applyOnData(x, y, 30)
                }
            }
        }
        return node
    }, [grid])

    const generate = useCallback((x, y) => {
        function takePath(xSign, ySign) {
            const node0 = grid[x + 1 * xSign][y + 1 * ySign]
            const node1 = grid[x + 2 * xSign][y + 2 * ySign]
            node0.isPath = true
            node1.isPath = true

            node0.previousNode = grid[x][y]
            node1.previousNode = grid[x + 1 * xSign][y + 1 * ySign]

            grid[x][y].nextNode = node0
            grid[x + 1 * xSign][y + 1 * ySign].nextNode = node1

            applyOnData(x + 1 * xSign, y + 1 * ySign, 30)
            applyOnData(x + 2 * xSign, y + 2 * ySign, 30)
            generate(x + 2 * xSign, y + 2 * ySign)
        }
        const findEmpty2nodes = (xSign, ySign) => {
            const room1 = grid[x + 1 * xSign][y + 1 * ySign].isRoom
            const room2 = grid[x + 2 * xSign][y + 2 * ySign].isRoom
            const path1 = grid[x + 1 * xSign][y + 1 * ySign].isPath
            const path2 = grid[x + 2 * xSign][y + 2 * ySign].isPath
            return !room1 && !room2 && !path1 && !path2
        }
        const shuffle = [
            () => { if (x > 2 && findEmpty2nodes(-1, 0)) takePath(-1, 0) },
            () => { if (x < gridWidth - 2 && findEmpty2nodes(1, 0)) takePath(1, 0) },
            () => { if (y > 2 && findEmpty2nodes(0, -1)) takePath(0, -1) },
            () => { if (y < gridHeight - 2 && findEmpty2nodes(0, 1)) takePath(0, 1) }
        ]
        shuffle.sort(() => 0.5 - Math.random())
        shuffle.forEach(f => f())

        const test = grid[x - 1][y].isPath
            + grid[x + 1][y].isPath
            + grid[x][y - 1].isPath
            + grid[x][y + 1].isPath

        if (test === 1) {
            const node = grid[x][y]
            node.isDeadEnd = true
            deadEnds.current.push(node)
        }
        if (test === 3)
            grid[x][y].isIntersection = true

    }, [grid])

    const growMaze = useCallback(() => {
        const firstNode = getEmptyNode()
        if (firstNode === undefined)
            return
        firstNode.isPath = true
        starts.current.push(firstNode)
        generate(firstNode.row, firstNode.col)
        growMaze()
    }, [generate, getEmptyNode])

    const connectRooms = useCallback((rooms) => {
        const randomOrderGrid = grid.slice()
        randomOrderGrid.sort(() => 0.5 - Math.random())

        randomOrderGrid.forEach(nodes => {
            nodes.forEach(node => {
                if (!node.isPath && !node.isRoom) {
                    if (node.row && node.col && node.row < gridWidth && node.col < gridHeight) {
                        const north = grid[node.row + 1][node.col]
                        const south = grid[node.row - 1][node.col]
                        const east = grid[node.row][node.col + 1]
                        const west = grid[node.row][node.col - 1]

                        if (north.isRoom && south.isRoom && rooms[north.roomNumber].value > 0 && rooms[south.roomNumber].value > 0) {
                            applyOnData(node.row, node.col, doorSize)
                            rooms[north.roomNumber].value--
                            rooms[south.roomNumber].value--
                        }
                        if (east.isRoom && west.isRoom && rooms[east.roomNumber].value > 0 && rooms[west.roomNumber].value > 0) {
                            applyOnData(node.row, node.col, doorSize)
                            rooms[east.roomNumber].value--
                            rooms[west.roomNumber].value--
                        }
                        if (north.isRoom && south.isPath && rooms[north.roomNumber].value > 0) {
                            grid[south.row][south.col].isInFrontOfDoor = true
                            applyOnData(node.row, node.col, doorSize)
                            rooms[north.roomNumber].value--
                        }
                        if (north.isPath && south.isRoom && rooms[south.roomNumber].value > 0) {
                            grid[north.row][north.col].isInFrontOfDoor = true
                            applyOnData(node.row, node.col, doorSize)
                            rooms[south.roomNumber].value--
                        }
                        if (east.isRoom && west.isPath && rooms[east.roomNumber].value > 0) {
                            grid[west.row][west.col].isInFrontOfDoor = true
                            applyOnData(node.row, node.col, doorSize)
                            rooms[east.roomNumber].value--
                        }
                        if (east.isPath && west.isRoom && rooms[west.roomNumber].value > 0) {
                            grid[east.row][east.col].isInFrontOfDoor = true
                            applyOnData(node.row, node.col, doorSize)
                            rooms[west.roomNumber].value--
                        }
                    }
                }
            })
        })
    }, [grid])

    const removeDeadEnds = useCallback(() => {
        function removeDeadEnd(deadEndNode, start) {
            function remove(node) {
                if ((node.previousNode && !start) || (start && node.nextNode)) {
                    const selected = start
                        ? grid[node.nextNode.row][node.nextNode.col]
                        : grid[node.previousNode.row][node.previousNode.col]
                    if (!selected.isIntersection && !selected.isInFrontOfDoor) {
                        grid[selected.row][selected.col].isPath = false
                        applyOnData(selected.row, selected.col, 0)
                        remove(selected)
                    }
                    if (selected.isIntersection)
                        selected.isIntersection = false
                }
            }
            if (!deadEndNode.isInFrontOfDoor) {
                grid[deadEndNode.row][deadEndNode.col].isPath = false
                applyOnData(deadEndNode.row, deadEndNode.col, 0)
                remove(deadEndNode)
            }
        }

        deadEnds.current.forEach(node => removeDeadEnd(node, false))
        starts.current.forEach(node => removeDeadEnd(node, true))
    }, [grid])


    useEffect(() => {
        const rooms = addRooms()
        growMaze()
        connectRooms(rooms)
        removeDeadEnds()
        loading.current.style.display = 'none'
    }, [grid, addRooms, connectRooms, growMaze, loading, removeDeadEnds])

    useFrame(() => {
        meshRef.current.material.uniforms['heightmap'].value = heightmap.current
    })

    return (
        <mesh ref={meshRef} scale={[0.01, 0.01, 0.01,]} position={[0, 0, 0]} rotation={[- Math.PI / 2, 0, 0]}>
            <planeBufferGeometry args={[WIDTH * 2, WIDTH * 2, WIDTH, WIDTH]} />
            <CustomPhongShader />
        </mesh>
    )
}

export default House