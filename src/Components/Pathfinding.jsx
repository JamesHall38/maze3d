import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Maze from './Maze'
import { astar, getNodesInShortestPathOrder } from '../algorithms/astar'
import { recursiveDivision } from '../algorithms/recursiveDivision'
import * as THREE from 'three'

const WIDTH = 128 * 2
const width = WIDTH * 2 - 21;
const height = WIDTH * 2 - 21;
const size = width * height;
const maxValue = 12


const Pathfinding = ({ loading, visualize, setVisualize, generate, setGenerate, clear, setClear, controls }) => {
    const data0 = useRef(new Float32Array(8 * size))
    const data1 = useRef(new Float32Array(8 * size))
    const data2 = useRef(new Float32Array(8 * size))
    const heightmap0 = useRef(new THREE.DataTexture(data0.current, width, height, THREE.RGBAFormat, THREE.FloatType))
    const heightmap1 = useRef(new THREE.DataTexture(data1.current, width, height, THREE.RGBAFormat, THREE.FloatType))
    const heightmap2 = useRef(new THREE.DataTexture(data2.current, width, height, THREE.RGBAFormat, THREE.FloatType))

    const applyOnData = (dataRef, heightmapRef, row, col, value) => {
        for (let ind = 0; ind < maxValue; ind++) {
            for (let din = 0; din < maxValue; din++) {
                const x = row * maxValue + din
                const y = col * maxValue + ind
                const i = width * (y - 1) + x
                const stride = i * 4
                const xValue = (y % maxValue < 6) ? - y % maxValue : - y % maxValue + 12
                const yValue = (x % maxValue < 6) ? - x % maxValue : - x % maxValue + 12

                dataRef.current[stride] = value
                dataRef.current[stride + 1] = xValue
                dataRef.current[stride + 2] = yValue

                if (x < 2 || y < 2 || x > width - 2 || y > width - 2)
                    dataRef.current[stride] = 0
            }
        }
        heightmapRef.current.data = dataRef.current
        heightmapRef.current.needsUpdate = true
    }

    const timeout = useMemo(() => [], [])
    const [mountedMaze, setMountedMaze] = useState(false)

    const nodesPosition = useMemo(() => {
        const pos = {
            rowLenght: Math.floor(window.innerHeight / 30) + ((Math.floor(window.innerHeight / 30)) % 2 ? 0 : 1),
            colLenght: Math.floor(window.innerWidth / 30) + ((Math.floor(window.innerWidth / 30)) % 2 ? 0 : 1),
            start: {
                row: 20,
                col: 0
            },
            finish: {
                row: 20,
                col: 40
            }
        }
        return pos
    }, [])

    const grid = useMemo(() => {
        const newGrid = []
        for (let row = 0; row < 41; row++) {
            const currentRow = []
            for (let col = 0; col < 41; col++) {
                currentRow.push(
                    {
                        col,
                        row,
                        isStart: row === nodesPosition.start.row && col === nodesPosition.start.col,
                        isFinish: row === nodesPosition.finish.row && col === nodesPosition.finish.col,
                        distance: Infinity,
                        isWall: false,
                        previousNode: null,
                        cost: 0,
                        g: 0,
                        h: 0,
                    }
                )
            }
            newGrid.push(currentRow)
        }
        return (newGrid)
    }, [nodesPosition])

    const animateShortestPath = useCallback((nodesInShortestPathOrder) => {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            timeout.push(setTimeout(() => {
                const node = nodesInShortestPathOrder[i]
                if (!node.isStart && !node.isFinish) {
                    applyOnData(data1, heightmap1, node.row, node.col, 0)
                    applyOnData(data2, heightmap2, node.row, node.col, 65)
                }
            }, 50 * i))
        }
    }, [timeout])



    const animatePathFinding = useCallback((visitedNodesInOrder, nodesInShortestPathOrder) => {
        for (let i = 0; i <= visitedNodesInOrder.length; i++) {
            if (i === visitedNodesInOrder.length) {
                timeout.push(setTimeout(() => {
                    animateShortestPath(nodesInShortestPathOrder)
                }, 10 * i))
                return
            }
            timeout.push(setTimeout(() => {
                const node = visitedNodesInOrder[i]
                if (!node.isStart && !node.isFinish
                    && !(node.row === 20 && (node.col === 39 || node.col === 1))) {
                    node.visited = true
                    applyOnData(data1, heightmap1, node.row, node.col, 30)
                }
            }, 10 * i))
        }
    }, [animateShortestPath, timeout])

    const animateMaze = useCallback((nodesInShortestPathOrder) => {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            timeout.push(setTimeout(() => {
                const node = nodesInShortestPathOrder[i]

                if (!node.isStart && !node.isFinish
                    && !(node.row === 20 && (node.col === 39 || node.col === 1))) {
                    node.isWall = true
                    applyOnData(data0, heightmap0, node.row, node.col, 50)
                }
            }, 5 * i))

        }
    }, [timeout])

    const resetPathfinder = useCallback((keepWalls, clearPath) => {
        if (!clearPath && !keepWalls)
            timeout.forEach(e => { clearTimeout(e) })

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {
                grid[row][col].distance = Infinity
                grid[row][col].isVisited = false
                applyOnData(data1, heightmap1, row, col, 0)
                applyOnData(data2, heightmap2, row, col, 0)

                if (!clearPath) {
                    if (!(keepWalls && grid[row][col].isWall)) {
                        grid[row][col].previousNode = null
                        grid[row][col].isWall = false
                        applyOnData(data0, heightmap0, row, col, 0)
                    }
                }
                if (grid[row][col].isStart || grid[row][col].isFinish) {
                    grid[row][col].starto = true
                }
            }
        }
    }, [grid, timeout])

    const visualizePathFinding = useCallback(() => {
        resetPathfinder(true)
        const startNode = grid[nodesPosition.start.row][nodesPosition.start.col]
        const finishNode = grid[nodesPosition.finish.row][nodesPosition.finish.col]

        const visitedNodesInOrder = astar(grid, startNode, finishNode)
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode)
        animatePathFinding(visitedNodesInOrder, nodesInShortestPathOrder)
    }, [grid, nodesPosition, resetPathfinder, animatePathFinding])

    const animateWall = useCallback((row, col, removeWalls) => {
        resetPathfinder(true, true)
        if (removeWalls) {
            grid[row][col].isWall = false
            applyOnData(data0, heightmap0, row, col, 0)
        }
        else {
            grid[row][col].isWall = true
            applyOnData(data0, heightmap0, row, col, 50)
        }
        if (grid[row][col].isStart || grid[row][col].isFinish) {
            grid[row][col].starto = true
        }
    }, [grid, resetPathfinder])

    const generateMaze = useCallback(() => {
        resetPathfinder()
        const startNode = grid[nodesPosition.start.row][nodesPosition.start.col]
        const finishNode = grid[nodesPosition.finish.row][nodesPosition.finish.col]
        const maze = recursiveDivision(grid, startNode, finishNode)
        animateMaze(maze)
        return maze.length
    }, [nodesPosition, grid, resetPathfinder, animateMaze])


    const isMounted = useRef(false)
    const onMount = useCallback(() => {
        const time = generateMaze()
        const delay = setTimeout(() => {
            visualizePathFinding()
        }, 5 * time)
        return () => { clearTimeout(delay) }
    }, [generateMaze, visualizePathFinding])

    useEffect(() => {
        if (!isMounted.current && mountedMaze) {
            // onMount()
            isMounted.current = true
            loading.current.style.display = 'none'
            visualize.current = visualizePathFinding
            clear.current = resetPathfinder
            generate.current = generateMaze
        }

    }, [onMount, mountedMaze, loading,
        visualize, clear,
        setVisualize, generate, setGenerate,
        generateMaze, resetPathfinder, setClear, visualizePathFinding])

    return (
        < Maze nodesPosition={nodesPosition} grid={grid}
            animateWall={animateWall}
            setMountedMaze={setMountedMaze}
            heightmap0={heightmap0}
            heightmap1={heightmap1}
            heightmap2={heightmap2}
            controls={controls}
        />
    )
}

export default Pathfinding
