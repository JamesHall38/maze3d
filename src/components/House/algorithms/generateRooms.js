const doorsNumber = 1
const numRoomTries = 2
const unusedRoomValue = 0

// Randomly creates 7*3 rooms on a grid. Rooms that are created on top of others are removed 
export default function generateRooms(grid, sizes, stairsFirstStep) {
    const rooms = []

    // On ajoute le bas des escalier supérieurs pour creer un cycle d'escaliers cohérents
    if (stairsFirstStep.length) {
        stairsFirstStep.forEach(node => {
            // Pour chaque chaque node autour de la case en bas de lescalier
            for (let j = -2; j < 3; j++) {
                for (let k = -2; k < 3; k++) {
                    const x = node.row + j
                    const y = node.col + k

                    grid[x][y].isStairsEnd = true
                    grid[x][y].roomNumber = rooms.length
                    grid[x][y].isInFrontOfDoor = true
                }
            }
        })
    }

    // On réitère plusieurs tentatives de pos d'escaliers
    for (let i = 0; i < numRoomTries; i++) {
        const direction = Math.random() > 0.5
        const width = direction ? 3 : 7
        const height = direction ? 7 : 3
        const xPos = Math.floor(Math.random() * (sizes.width - width) / 2) * 2 + 1
        const yPos = Math.floor(Math.random() * (sizes.height - height) / 2) * 2 + 1

        // si il y a overlapse on passe
        let overlaps = false
        for (let j = 0; j < width; j++) {
            for (let k = 0; k < height; k++) {
                const x = xPos + j
                const y = yPos + k
                if (grid[x][y].isRoom === true || grid[x][y].isStairsEnd)
                    overlaps = true
            }
        }

        if (!overlaps) {
            // Pour chaque chaque node de la room 
            for (let j = 0; j < width; j++) {
                for (let k = 0; k < height; k++) {
                    const x = xPos + j
                    const y = yPos + k
                    // Si la case se situe au millieu d'un des des murs les plus petit on le marque pour plus tard (connectRooms)
                    if ((width === 7 && (j === 0 || j === 6) && k === 1)
                        || (height === 7 && (k === 0 || k === 6) && j === 1))
                        grid[x][y].isStairsStart = true

                    grid[x][y].isRoom = true
                    grid[x][y].roomNumber = rooms.length
                    grid[x][y].value = unusedRoomValue
                    grid[x][y].isDark = true
                }
            }
            rooms.push({ value: doorsNumber })
        }
    }

    // Si jamais il n'y a pas d'escaliers entre deux etages
    if (!rooms[0]) {
        generateRooms(grid, sizes, stairsFirstStep)
    }
    return rooms
}