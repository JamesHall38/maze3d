import * as THREE from 'three'

export default function pushGeometries(grid, floorNum, geometries, columnGeometries, darkGeometries, windowsGeometries) {

    // create the cubes
    for (let i = 0; i < floorNum; i++) {
        grid[i].forEach(nodes => {
            nodes.forEach(node => {

                let cond = false
                let testooo = false
                let stop = false
                let lowerFloorNode = 6
                let lowerStairs
                for (let j = i; j > 0; j--) {

                    // si en haut et en bas c'est pas tout les deux des bords pour toutes les directions alors testo
                    if (node.row < 20 & node.col < 20 && node.row > 0 && node.col > 0) {

                        const topNorth = grid[i][node.row + 1][node.col]
                        const topSouth = grid[i][node.row - 1][node.col]
                        const topEast = grid[i][node.row][node.col + 1]
                        const topWest = grid[i][node.row][node.col - 1]

                        const bottomNorth = grid[j - 1][node.row + 1][node.col]
                        const bottomSouth = grid[j - 1][node.row - 1][node.col]
                        const bottomEast = grid[j - 1][node.row][node.col + 1]
                        const bottomWest = grid[j - 1][node.row][node.col - 1]

                        cond = (((topNorth.isBorder && bottomNorth.isBorder) ? 1 : 0)
                            + ((topSouth.isBorder && bottomSouth.isBorder) ? 1 : 0)
                            + ((topEast.isBorder && bottomEast.isBorder) ? 1 : 0)
                            + ((topWest.isBorder && bottomWest.isBorder) ? 1 : 0) < 2)

                    }
                    if (!stop) {
                        if (grid[j - 1][node.row][node.col].isBorder || (node.row === 20 || node.col === 20 || node.row === 0 || node.col === 0))
                            testooo = true
                        if (grid[j - 1][node.row][node.col].isRoom)
                            lowerStairs = true
                        if (grid[j - 1][node.row][node.col].isFlat)
                            stop = true
                        else
                            lowerFloorNode += 6
                    }
                }

                // On sassure que les cubes qui sont en dessous de la map et les colones qui sont au dessus d'escaliers ne se rendent pas
                if (node.value > 0) {
                    if (node.isColumn && !lowerStairs) {
                        if (testooo || i === 0)
                            columnGeometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col), value: lowerFloorNode, isBox: true })
                        else
                            darkGeometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col), isBox: true })
                    }
                    else if (!node.isColumn && node.isBorder) {
                        if (!lowerStairs && (testooo || i === 0)) {
                            if (!cond)
                                windowsGeometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col), value: lowerFloorNode })
                            else
                                columnGeometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col), value: lowerFloorNode, isBox: true })
                        }
                        darkGeometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col), isBox: true })
                    }
                    else if (node.isDark)
                        darkGeometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col), isBox: true })
                    else
                        geometries.push({ height: node.value, position: new THREE.Vector2(node.row, node.col) })
                }
            })
        })
    }
}