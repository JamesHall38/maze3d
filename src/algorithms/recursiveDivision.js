
export function recursiveDivision(grid) {
    const walls = []

    // Create walls at grid boundaries
    for (let i = 0; i < grid.length; i++) {
        walls.push(grid[grid.length - 1 - i][0])
        walls.push(grid[i][grid[0].length - 1])
    }
    for (let i = 1; i < grid[0].length - 1; i++) {
        walls.push(grid[0][i])
        walls.push(grid[grid.length - 1][grid[0].length - 1 - i])
    }

    const vertical = []
    for (let i = 0; i < grid[0].length - 2; i++) vertical.push(i)
    const horizontal = []
    for (let i = 0; i < grid.length - 2; i++) horizontal.push(i)

    recursiveWalls(vertical, horizontal)

    return walls


    function recursiveWalls(vertical, horizontal) {
        // Exit from the loop at the end of the section division
        if (vertical.length < 2 || horizontal.length < 2) return

        const dir = vertical.length <= horizontal.length
        const random = (dir ? horizontal : vertical)[wallRandomNum((dir ? horizontal : vertical).length - 1, true)]

        // Create a wall at the random position
        const wall = []
        if (!((dir ? vertical : horizontal).length === 2))
            for (let node of (dir ? vertical : horizontal)) wall.push(grid[(dir ? random : node) + 1][(dir ? node : random) + 1])
        wall.splice(wallRandomNum(wall.length, false), 1)
        for (let node of wall) walls.push(node)

        // Loop to make the next wall
        recursiveWalls(
            dir ? vertical : vertical.slice(0, vertical.indexOf(random)),
            dir ? horizontal.slice(0, horizontal.indexOf(random)) : horizontal)
        // Make the wall at the opposite side
        recursiveWalls(
            dir ? vertical : vertical.slice(vertical.indexOf(random) + 1),
            dir ? horizontal.slice(horizontal.indexOf(random) + 1) : horizontal)
    }
}

function wallRandomNum(wallLength, odd) {
    let random = Math.floor(Math.random() * wallLength)
    if ((random % 2 === 0 && odd) || (random % 2 !== 0 && !odd)) {
        if (random === wallLength) random--
        else random++
    }
    return random
}

