import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import Maze from './Maze'
import { astar, getNodesInShortestPathOrder } from '../algorithms/astar'
import { recursiveDivision } from '../algorithms/recursiveDivision'
import { useThree } from '@react-three/fiber'


const Pathfinding = ({ loading, visualize, setVisualize, generate, setGenerate, clear, setClear }) => {
    const { scene, camera } = useThree()
    const timeout = useMemo(() => [], [])
    const [mountedMaze, setMountedMaze] = useState(false)

    const nodesPosition = useMemo(() => {
        const pos = {
            rowLenght: Math.floor(window.innerHeight / 30) + ((Math.floor(window.innerHeight / 30)) % 2 ? 0 : 1),
            colLenght: Math.floor(window.innerWidth / 30) + ((Math.floor(window.innerWidth / 30)) % 2 ? 0 : 1),
            start: {
                row: 3,
                col: 3
            },
            finish: {
                row: Math.floor(window.innerHeight / 30) + ((Math.floor(window.innerHeight / 30)) % 2 ? 0 : 1) - 4,
                col: Math.floor(window.innerWidth / 30) + ((Math.floor(window.innerWidth / 30)) % 2 ? 0 : 1) - 4
            }
        }
        camera.position.set(pos.colLenght / 2, -pos.rowLenght / 2, 25)
        return pos
    }, [camera])

    const grid = useMemo(() => {
        const newGrid = []
        for (let row = 0; row < nodesPosition.rowLenght; row++) {
            const currentRow = []
            for (let col = 0; col < nodesPosition.colLenght; col++) {
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
                    const selectedNode = scene.getObjectByName(`node-${node.row}-${node.col}`)
                    selectedNode.material.color.set('#c41e3d')
                    selectedNode.position.z = 0.25
                }
            }, 50 * i))
        }
    }, [timeout, scene])

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
                if (!node.isStart && !node.isFinish) {
                    const selectedNode = scene.getObjectByName(`node-${node.row}-${node.col}`)
                    selectedNode.material.color.set('#dcccbb')
                    selectedNode.position.z = 0.5
                }
            }, 10 * i))
        }
    }, [animateShortestPath, timeout, scene])

    const animateMaze = useCallback((nodesInShortestPathOrder) => {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
            timeout.push(setTimeout(() => {
                const node = nodesInShortestPathOrder[i]

                if (!node.isStart && !node.isFinish) {
                    const selectedNode = scene.getObjectByName(`node-${node.row}-${node.col}`)
                    selectedNode.material.color.set('#004e75')
                    selectedNode.position.z = 1

                    node.isWall = true
                }
            }, 20 * i))

        }
    }, [timeout, scene])

    const resetPathfinder = useCallback((keepWalls) => {
        timeout.forEach(e => { clearTimeout(e) })

        for (let row = 0; row < grid.length; row++) {
            for (let col = 0; col < grid[0].length; col++) {

                const selectedNode = scene.getObjectByName(`node-${row}-${col}`)

                grid[row][col].distance = Infinity
                grid[row][col].isVisited = false

                if (!(keepWalls && grid[row][col].isWall)) {
                    grid[row][col].previousNode = null

                    grid[row][col].isWall = false

                    selectedNode.material.color.set('#181a1b')
                    selectedNode.position.z = 0
                }
                if (grid[row][col].isStart || grid[row][col].isFinish) {
                    selectedNode.material.color.set('red')
                    selectedNode.position.z = 1
                }
            }
        }
    }, [grid, timeout, scene])

    const visualizePathFinding = useCallback(() => {
        resetPathfinder(true)
        const startNode = grid[nodesPosition.start.row][nodesPosition.start.col]
        const finishNode = grid[nodesPosition.finish.row][nodesPosition.finish.col]

        const visitedNodesInOrder = astar(grid, startNode, finishNode)
        const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode)
        animatePathFinding(visitedNodesInOrder, nodesInShortestPathOrder)
    }, [grid, nodesPosition, resetPathfinder, animatePathFinding])

    const animateWall = useCallback((row, col, removeWalls) => {
        const selectedNode = scene.getObjectByName(`node-${row}-${col}`)

        if (removeWalls) {
            selectedNode.material.color.set('#181a1b')
            selectedNode.position.z = 0
            grid[row][col].isWall = false
        }
        else {
            selectedNode.material.color.set('#004e75')
            selectedNode.position.z = 1
            grid[row][col].isWall = true
        }

        if (grid[row][col].isStart || grid[row][col].isFinish) {
            selectedNode.material.color.set('red')
            selectedNode.position.z = 1
        }


    }, [grid, scene])

    const generateMaze = useCallback(() => {
        resetPathfinder()
        const startNode = grid[nodesPosition.start.row][nodesPosition.start.col]
        const finishNode = grid[nodesPosition.finish.row][nodesPosition.finish.col]
        const maze = recursiveDivision(grid, startNode, finishNode)
        animateMaze(maze)
        animateWall(0, grid[0].length - 1)
        return maze.length
    }, [nodesPosition, grid, resetPathfinder, animateWall, animateMaze])


    const isMounted = useRef(false)
    const onMount = useCallback(() => {
        const time = generateMaze()
        const delay = setTimeout(() => {
            visualizePathFinding()
        }, 20 * time)
        return () => { clearTimeout(delay) }
    }, [generateMaze, visualizePathFinding])

    useEffect(() => {
        if (!isMounted.current && mountedMaze) {
            onMount()
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
        />
    )
}

export default Pathfinding
