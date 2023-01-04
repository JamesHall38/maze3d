
export default function createStairs(grid, sizes, stairsFirstStep) {
    const stairsHeight = sizes.stairsHeight

    function applyStairs(node, value, horizontal, positive, direction) {
        const value0 = value - (horizontal ? (positive ? stairsHeight * 2 : 0) : stairsHeight)
        const value1 = value - (horizontal ? (positive ? stairsHeight * 2 : 0) : (positive ? stairsHeight * 2 : 0))
        const value2 = value - (horizontal ? (positive ? stairsHeight * 2 : 0) : (positive ? 0 : stairsHeight * 2))
        const value3 = value - stairsHeight
        const value4 = value - (horizontal ? stairsHeight : (positive ? stairsHeight * 2 : 0))
        const value5 = value - (horizontal ? stairsHeight : (positive ? 0 : stairsHeight * 2))
        const value6 = value - (horizontal ? (positive ? 0 : stairsHeight * 2) : stairsHeight)
        const value7 = value - (horizontal ? (positive ? 0 : stairsHeight * 2) : (positive ? stairsHeight * 2 : 0))
        const value8 = value - (horizontal ? (positive ? 0 : stairsHeight * 2) : (positive ? 0 : stairsHeight * 2))

        grid[node.row + 1][node.col].value = value0
        grid[node.row + 1][node.col + 1].value = value1
        grid[node.row + 1][node.col - 1].value = value2

        grid[node.row][node.col].value = value3
        grid[node.row][node.col + 1].value = value4
        grid[node.row][node.col - 1].value = value5

        grid[node.row - 1][node.col].value = value6
        grid[node.row - 1][node.col + 1].value = value7
        grid[node.row - 1][node.col - 1].value = value8

        if (!direction && horizontal) {
            const selected = grid[node.row + (horizontal ? (positive ? 1 : -1) : 0)][node.col]
            stairsFirstStep.push(selected)

            // Hide first step
            const selectedNorth = grid[node.row + (horizontal ? (positive ? 1 : -1) : 0)][node.col + 1]
            const selectedSouth = grid[node.row + (horizontal ? (positive ? 1 : -1) : 0)][node.col - 1]
            const neigbor = grid[node.row + (horizontal ? (positive ? 2 : -2) : 0)][node.col]
            const neigborNorth = grid[node.row + (horizontal ? (positive ? 2 : -2) : 0)][node.col + 1]
            const neigborSouth = grid[node.row + (horizontal ? (positive ? 2 : -2) : 0)][node.col - 1]

            selected.value = 0
            selectedNorth.value = 0
            selectedSouth.value = 0
            neigbor.value = 0
            neigborNorth.value = 0
            neigborSouth.value = 0
        }
        else if (direction && !horizontal) {
            const selected = grid[node.row][node.col + (horizontal ? 0 : (positive ? 1 : -1))]
            stairsFirstStep.push(selected)

            // Hide first step
            const selectedNorth = grid[node.row + 1][node.col + (horizontal ? 0 : (positive ? 1 : -1))]
            const selectedSouth = grid[node.row - 1][node.col + (horizontal ? 0 : (positive ? 1 : -1))]
            const neigbor = grid[node.row][node.col + (horizontal ? 0 : (positive ? 2 : -2))]
            const neigborNorth = grid[node.row + 1][node.col + (horizontal ? 0 : (positive ? 2 : -2))]
            const neigborSouth = grid[node.row - 1][node.col + (horizontal ? 0 : (positive ? 2 : -2))]

            selected.value = 0
            selectedNorth.value = 0
            selectedSouth.value = 0
            neigbor.value = 0
            neigborNorth.value = 0
            neigborSouth.value = 0
        }
    }

    grid.forEach(nodes => {
        nodes.forEach(node => {
            if (node.direction === 'east0')
                applyStairs(node, sizes.floorHeight - stairsHeight * 3, true, true, false)
            else if (node.direction === 'east1')
                applyStairs(node, sizes.floorHeight, true, true, true)
            else if (node.direction === 'west0')
                applyStairs(node, sizes.floorHeight - stairsHeight * 3, true, false, false)
            else if (node.direction === 'west1')
                applyStairs(node, sizes.floorHeight, true, false, true)

            else if (node.direction === 'north0')
                applyStairs(node, sizes.floorHeight, false, false, false)
            else if (node.direction === 'north1')
                applyStairs(node, sizes.floorHeight - stairsHeight * 3, false, false, true)
            else if (node.direction === 'south0')
                applyStairs(node, sizes.floorHeight, false, true, false)
            else if (node.direction === 'south1')
                applyStairs(node, sizes.floorHeight - stairsHeight * 3, false, true, true)
            else {
                return
            }
            grid[node.row][node.col].isStairs = true
        })
    })
}