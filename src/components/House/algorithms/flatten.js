export default function flatten(grid, sizes) {
    grid.forEach(nodes => {
        nodes.forEach(node => {
            if (node.isPath) {
                grid[node.row + 1][node.col + 1].value = sizes.flat
                grid[node.row + 1][node.col].value = sizes.flat
                grid[node.row + 1][node.col - 1].value = sizes.flat
                grid[node.row][node.col - 1].value = sizes.flat
                grid[node.row][node.col + 1].value = sizes.flat
                grid[node.row - 1][node.col + 1].value = sizes.flat
                grid[node.row - 1][node.col].value = sizes.flat
                grid[node.row - 1][node.col - 1].value = sizes.flat

                grid[node.row + 1][node.col + 1].isFlat = true
                grid[node.row + 1][node.col].isFlat = true
                grid[node.row + 1][node.col - 1].isFlat = true
                grid[node.row][node.col - 1].isFlat = true
                grid[node.row][node.col + 1].isFlat = true
                grid[node.row - 1][node.col + 1].isFlat = true
                grid[node.row - 1][node.col].isFlat = true
                grid[node.row - 1][node.col - 1].isFlat = true
            }
        })
    })
    grid.forEach(nodes => {
        nodes.forEach(node => {
            if (node.row > 1 && (node.row < (sizes.width - 1))) {
                const north = grid[node.row + 1][node.col]
                const south = grid[node.row - 1][node.col]
                if ((north.isFlat || north.isPath) && (south.isFlat || south.isPath)) {
                    grid[node.row][node.col].value = sizes.flat
                    grid[node.row][node.col].isFlat = true
                }
            }
            if (node.col > 1 && (node.col < (sizes.height - 1))) {
                const east = grid[node.row][node.col + 1]
                const west = grid[node.row][node.col - 1]
                if ((east.value === sizes.flat) && (west.value === sizes.flat)) {
                    grid[node.row][node.col].value = sizes.flat
                    grid[node.row][node.col].isFlat = true
                }
            }
        })
    })
}