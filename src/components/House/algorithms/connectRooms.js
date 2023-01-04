// cette fonction permet de définir des 'portes' aux 'rooms' pour pouvoir par la suite transformer les rooms en escaliers.
// On va définir une porte aléatoirement sur chaque room qui correspondra au début de l'escalier
export default function connectRooms(grid, sizes, rooms) {
    // On va traverser la grid dans un ordre aléatoire
    const randomOrderGrid = grid.slice()
    randomOrderGrid.sort(() => 0.5 - Math.random())

    // Pour chaque node de la grid
    randomOrderGrid.forEach(nodes => {
        nodes.forEach(node => {
            if (!node.isPath && !node.isStairsStart) {
                if (node.row && node.col && node.row < sizes.width - 1 && node.col < sizes.height - 1) {
                    // On regarde les voisins
                    const north = grid[node.row + 1][node.col]
                    const south = grid[node.row - 1][node.col]
                    const east = grid[node.row][node.col + 1]
                    const west = grid[node.row][node.col - 1]

                    // On va chercher les points d'intersection entre le maze fait précèdement et le centre d'une des faces d'une room
                    // On s'assure à chque fois qu'il n'y ait qu'une seule porte par room
                    // si la case d'au dessus est l'entrée d'une room et si celle d'en dessous est sur le chemin
                    if (north.isStairsStart && south.isPath && (rooms[north.roomNumber] && rooms[north.roomNumber].value > 0)) {
                        grid[south.row][south.col].isInFrontOfDoor = true
                        rooms[north.roomNumber].value--

                        // Pour chaque intersection trouvée on va stocker l'information de la direction dans la grid
                        grid[node.row + 5][node.col].direction = `east0`
                        grid[node.row + 2][node.col].direction = `east1`

                        // on peux également modifier leur valeur
                        grid[node.row + 7][node.col + 1].value = sizes.doorsValue
                        grid[node.row + 7][node.col].value = sizes.doorsValue
                        grid[node.row + 7][node.col - 1].value = sizes.doorsValue
                    }
                    // si la case d'au dessus est sur le chemin et si celle d'en dessous est l'entrée d'une room 
                    if (north.isPath && south.isStairsStart && (rooms[south.roomNumber] && rooms[south.roomNumber].value > 0)) {
                        grid[north.row][north.col].isInFrontOfDoor = true
                        rooms[south.roomNumber].value--

                        grid[node.row - 5][node.col].direction = `west0`
                        grid[node.row - 2][node.col].direction = `west1`

                        grid[node.row - 7][node.col + 1].value = sizes.doorsValue
                        grid[node.row - 7][node.col].value = sizes.doorsValue
                        grid[node.row - 7][node.col - 1].value = sizes.doorsValue

                    }
                    // si la case de gauche est l'entrée d'une room et si celle de droite est sur le chemin
                    if (east.isStairsStart && west.isPath && (rooms[east.roomNumber] && rooms[east.roomNumber].value > 0)) {
                        grid[west.row][west.col].isInFrontOfDoor = true
                        rooms[east.roomNumber].value--

                        grid[node.row][node.col + 2].direction = `south0`
                        grid[node.row][node.col + 5].direction = `south1`

                        grid[node.row + 1][node.col + 7].value = sizes.doorsValue
                        grid[node.row][node.col + 7].value = sizes.doorsValue
                        grid[node.row - 1][node.col + 7].value = sizes.doorsValue
                    }
                    // si la case de gauche est sur le chemin et si celle de droite est l'entrée d'une room 
                    if (east.isPath && west.isStairsStart && (rooms[west.roomNumber] && rooms[west.roomNumber].value > 0)) {
                        grid[east.row][east.col].isInFrontOfDoor = true
                        rooms[west.roomNumber].value--

                        grid[node.row][node.col - 2].direction = `north0`
                        grid[node.row][node.col - 5].direction = `north1`

                        grid[node.row + 1][node.col - 7].value = sizes.doorsValue
                        grid[node.row][node.col - 7].value = sizes.doorsValue
                        grid[node.row - 1][node.col - 7].value = sizes.doorsValue
                    }
                }
            }
        })
    })
}