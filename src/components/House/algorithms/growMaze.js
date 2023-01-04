
const getEmptyNode = (grid, sizes) => {
    const bigValue = sizes.bigValue
    let node
    for (let x = 1; x < sizes.width; x += 2) {
        for (let y = 1; y < sizes.height; y += 2) {
            const condition = grid[x][y].isRoom ||
                grid[x][y].isPath ||
                grid[0][y].row ||
                grid[x][0].col
            if (!condition) {
                node = grid[x][y]
                grid[x][y].value = bigValue
            }
        }
    }
    return node
}

const generate = (x, y, grid, sizes, deadEnds) => {
    const smallValue = sizes.smallValue
    function takePath(xSign, ySign) {
        const node0 = grid[x + 1 * xSign][y + 1 * ySign]
        const node1 = grid[x + 2 * xSign][y + 2 * ySign]
        node0.isPath = true
        node1.isPath = true

        node0.previousNode = grid[x][y]
        node1.previousNode = grid[x + 1 * xSign][y + 1 * ySign]

        grid[x][y].nextNode = node0
        grid[x + 1 * xSign][y + 1 * ySign].nextNode = node1

        grid[x + 1 * xSign][y + 1 * ySign].value = smallValue
        grid[x + 2 * xSign][y + 2 * ySign].value = smallValue
        generate(x + 2 * xSign, y + 2 * ySign, grid, sizes, deadEnds)
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
        () => { if (x < sizes.width - 2 && findEmpty2nodes(1, 0)) takePath(1, 0) },
        () => { if (y > 2 && findEmpty2nodes(0, -1)) takePath(0, -1) },
        () => { if (y < sizes.height - 2 && findEmpty2nodes(0, 1)) takePath(0, 1) }
    ]
    shuffle.sort(() => 0.5 - Math.random())
    shuffle.forEach(f => f())

    const condition = grid[x - 1][y].isPath
        + grid[x + 1][y].isPath
        + grid[x][y - 1].isPath
        + grid[x][y + 1].isPath

    if (condition === 1) {
        const node = grid[x][y]
        node.isDeadEnd = true
        deadEnds.push(node)
    }
    if (condition === 3)
        grid[x][y].isIntersection = true
}

export default function growMaze(grid, sizes, starts, deadEnds) {
    const firstNode = getEmptyNode(grid, sizes)
    if (firstNode === undefined)
        return
    firstNode.isPath = true
    starts.push(firstNode)
    generate(firstNode.row, firstNode.col, grid, sizes, deadEnds)
    growMaze(grid, sizes, starts, deadEnds)
}