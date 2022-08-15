// Run the A* algorithm which returns all nodes in the order in which they were visited
export function astar(grid, startNode, finishNode) {
    const visitedNodesInOrder = []

    // Contains all nodes for which we know the cost but have not yet verified the neighbors
    const openList = []
    openList.push(startNode)
    // Contains all the nodes for which we do not want to recalculate the neighbor costs
    const closedList = []

    // To make this algorithm work, we assign a cost to each node that corresponds to its distance from the final node
    // The algorithm will check the nodes closest to the end node, i.e. the node with the lowest cost
    while (openList.length) {
        // Get the node with the lowest cost
        openList.sort(function (a, b) { return a.cost - b.cost })
        const currentNode = openList.shift()
        closedList.push(currentNode)

        // Find the last node
        if (currentNode === finishNode) return visitedNodesInOrder
        visitedNodesInOrder.push(currentNode)

        // Calculate the cost of all the neighbors
        const neighbors = getNeighbors(currentNode, grid)
        neighbors.forEach(neighbor => {
            if (!closedList.includes(neighbor) && !openList.includes(neighbor)) {

                // G is the distance between the current node and the start node
                neighbor.g = currentNode.g + Math.abs(currentNode.row - neighbor.row) + Math.abs(currentNode.col - neighbor.col)
                // H is the distance between the current node and the end node
                neighbor.h = Math.abs(neighbor.row - finishNode.row) + Math.abs(neighbor.col - finishNode.col)
                neighbor.cost = neighbor.g + neighbor.h

                openList.push(neighbor)
                neighbor.previousNode = currentNode;
                neighbor.isVisited = true;
            }
        })
    }
    return visitedNodesInOrder

    // If they exist and they are not a wall, return the neighbors of the target cell
    function getNeighbors(currentNode, grid) {
        let neighbors = []
        if (currentNode.row && !grid[currentNode.row - 1][currentNode.col].isWall)
            neighbors.push(grid[currentNode.row - 1][currentNode.col])
        if (currentNode.row < grid.length - 1 && !grid[currentNode.row + 1][currentNode.col].isWall)
            neighbors.push(grid[currentNode.row + 1][currentNode.col])
        if (currentNode.col < grid[0].length - 1 && !grid[currentNode.row][currentNode.col + 1].isWall)
            neighbors.push(grid[currentNode.row][currentNode.col + 1])
        if (currentNode.col && !grid[currentNode.row][currentNode.col - 1].isWall)
            neighbors.push(grid[currentNode.row][currentNode.col - 1])
        return neighbors
    }
}

// Backtracks from the finishNode to find the shortest path
// Only works when called after the astar method above
export function getNodesInShortestPathOrder(finishNode) {
    const nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
        nodesInShortestPathOrder.unshift(currentNode);
        currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
}