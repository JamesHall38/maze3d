export default function dropColumns(grid, sizes) {
    grid.forEach(nodes => {
        nodes.forEach(node => {
            const north = (node.col === sizes.height - 1) ? { isFlat: false } : grid[node.row][node.col + 1]
            const south = (node.col === 0) ? { isFlat: false } : grid[node.row][node.col - 1]
            const east = (node.row === sizes.width - 1) ? { isFlat: false } : grid[node.row + 1][node.col]
            const west = (node.row === 0) ? { isFlat: false } : grid[node.row - 1][node.col]

            const flatNeigbors = ((north.isFlat ? 1 : 0)
                + (south.isFlat ? 1 : 0)
                + (east.isFlat ? 1 : 0)
                + (west.isFlat ? 1 : 0))

            const isBorder = node.isFlat && (flatNeigbors === 1 || flatNeigbors === 2 || flatNeigbors === 3)
            grid[node.row][node.col].isBorder = isBorder
        })
    })

    grid.forEach(nodes => {
        nodes.forEach(node => {

            const north = (node.col === sizes.height - 1) ? 0 : grid[node.row][node.col + 1].isBorder
            const south = (node.col === 0) ? 0 : grid[node.row][node.col - 1].isBorder
            const east = (node.row === sizes.width - 1) ? 0 : grid[node.row + 1][node.col].isBorder
            const west = (node.row === 0) ? 0 : grid[node.row - 1][node.col].isBorder

            const isCorner = ((
                ((north && east) ? (grid[node.row + 1][node.col + 1].isBorder ? 0 : 1) : 0)
                + ((north && west) ? (grid[node.row - 1][node.col + 1].isBorder ? 0 : 1) : 0)
                + ((south && east) ? (grid[node.row + 1][node.col - 1].isBorder ? 0 : 1) : 0)
                + ((south && west) ? (grid[node.row - 1][node.col - 1].isBorder ? 0 : 1) : 0)
            ) === 1)

            if (isCorner) {
                grid[node.row][node.col].isColumn = true
                grid[node.row][node.col].isDark = true
            }
        })
    })
}

