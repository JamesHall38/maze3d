export default function removeDeadEnds(grid, starts, deadEnds) {
    function removeDeadEnd(deadEndNode, start) {
        function remove(node) {
            if ((node.previousNode && !start) || (start && node.nextNode)) {
                const selected = start
                    ? grid[node.nextNode.row][node.nextNode.col]
                    : grid[node.previousNode.row][node.previousNode.col]
                if (!selected.isIntersection && !selected.isInFrontOfDoor) {
                    grid[selected.row][selected.col].isPath = false
                    grid[selected.row][selected.col].value = 0
                    remove(selected)
                }
                if (selected.isIntersection)
                    selected.isIntersection = false
            }
        }
        if (!deadEndNode.isInFrontOfDoor) {
            grid[deadEndNode.row][deadEndNode.col].isPath = false
            grid[deadEndNode.row][deadEndNode.col].value = 0
            remove(deadEndNode)
        }
    }
    deadEnds.forEach(node => removeDeadEnd(node, false))
    starts.forEach(node => removeDeadEnd(node, true))
}