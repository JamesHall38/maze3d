import { Flex, Box } from '@react-three/flex'
import { useEffect } from 'react'


const Maze = ({ nodesPosition, grid, animateWall, setMountedMaze }) => {
    let mouseDown
    let removeWalls

    function handleMouseDown(row, col) {
        removeWalls = grid[row][col].isWall
        animateWall(row, col, removeWalls)
        mouseDown = true
    }
    function handleMouseEnter(row, col) {
        if (!mouseDown) return
        animateWall(row, col, removeWalls)
    }
    function handleMouseUp() {
        mouseDown = false
    }

    useEffect(() => {
        setMountedMaze(true)
    }, [setMountedMaze])

    return (

        <Flex
            size={[nodesPosition.colLenght, nodesPosition.rowLenght, 0]}
            position={[0, -2, 0]}
            flexDirection="row"
            flexWrap="wrap"
            justifyContent="center"
            alignItems="center"
        >
            {grid.map((row) => {
                return (
                    row.map((node, nodeIdx) => {
                        const { row, col, isFinish, isStart } = node;
                        console.log('full')
                        return (
                            <Box centerAnchor key={nodeIdx} >
                                <mesh
                                    onPointerDown={() => handleMouseDown(row, col)}
                                    onPointerEnter={() => handleMouseEnter(row, col)}
                                    onPointerUp={() => handleMouseUp()}

                                    name={`node-${row}-${col}`}
                                    position={(isStart || isFinish) ? [0, 0, 1] : [0, 0, 0]}
                                    castShadow
                                    receiveShadow
                                >
                                    <boxGeometry />
                                    <meshStandardMaterial color={(isStart || isFinish) ? 'red' : '#181a1b'} />
                                </mesh >
                            </Box>
                        )
                    })
                )
            })
            }
        </Flex>
    )
}

export default Maze