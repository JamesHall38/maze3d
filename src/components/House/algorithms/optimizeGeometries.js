import * as THREE from 'three'

const gridSize = 21

const createGeometry = (height, position, x, y, value, isBox) => {
    let geometry
    if (isBox)
        geometry = new THREE.BoxGeometry(x, value ?? 1, y)
    else {
        if (value) {
            if (x === 1) {
                geometry = new THREE.PlaneGeometry(y, value)
                geometry.rotateY(Math.PI / 2)
            }
            if (y === 1) {
                geometry = new THREE.PlaneGeometry(value, x)
                geometry.rotateZ(Math.PI / 2)
            }
        }
        else {
            geometry = new THREE.PlaneGeometry(x, y)
            geometry.rotateX(-Math.PI / 2)
            geometry.translate(0, 0.4, 0)
        }
    }
    geometry.translate((position.x - gridSize / 2 + x / 2 - 0.5), height, (position.y - gridSize / 2 + y / 2 - 0.5))
    if (value)
        geometry.translate(0, - (value / 2) + 0.5, 0)
    return geometry
}

export default function optimizeGeometries(geometries) {
    const result = []
    for (let i = 0; i < 21; i++) {
        const floor = geometries.filter(geo => geo.height === i)
        const slicedLines = []
        let maxLayers = 1
        for (let i = 0; i < 21; i++) {
            const line = floor.filter(geo => geo.position.x === i)
            const firstOfYPart = line.filter((node, nodeIndex) => {
                node.yIndex = nodeIndex
                return (nodeIndex === 0) || (((line[nodeIndex - 1].position.y + 1) !== node.position.y) || (line[nodeIndex - 1].value !== node.value))
            })
            slicedLines.push(firstOfYPart.map((node, i) =>
                line.slice(node.yIndex,
                    (i === (firstOfYPart.length - 1)
                        ? line.length
                        : firstOfYPart[i + 1].yIndex))))
            if (firstOfYPart.length > maxLayers)
                maxLayers = firstOfYPart.length
        }
        const firstOfXPart = []
        for (let layerIndex = 0; layerIndex < maxLayers; layerIndex++) {
            firstOfXPart.push(slicedLines.filter((slicedLine, sliceIndex) => {
                slicedLine.forEach(slice => {
                    slice[0].xIndex = sliceIndex
                })
                if (slicedLines[sliceIndex - 1] && slicedLine[0]) {
                    let isSuccessive = false
                    let isSameLength = false
                    let isSameValue = false
                    if (slicedLines[sliceIndex - 1][layerIndex] && slicedLines[sliceIndex][layerIndex]) {
                        if (((slicedLines[sliceIndex - 1][layerIndex][0].position.x + 1) === slicedLines[sliceIndex][layerIndex][0].position.x)
                            && ((slicedLines[sliceIndex - 1][layerIndex][0].position.y) === slicedLines[sliceIndex][layerIndex][0].position.y))
                            isSuccessive = true
                        if (slicedLines[sliceIndex - 1][layerIndex].length === slicedLines[sliceIndex][layerIndex].length)
                            isSameLength = true
                        if (slicedLines[sliceIndex - 1][layerIndex][0].value === slicedLines[sliceIndex][layerIndex][0].value)
                            isSameValue = true
                    }
                    return !(isSuccessive && isSameLength && isSameValue)
                }
                return (sliceIndex === 0 && slicedLine[0])
            }))
        }
        firstOfXPart.forEach((layer, ind) => {
            layer.forEach((node, i) => {
                let lastNotEmpty
                let lastNotEmptyBeforeTheNext
                for (let j = (slicedLines.length - 1); j >= 0; j--)
                    if (slicedLines[j][0]) {
                        lastNotEmpty = j + 1
                        j = 0
                    }
                if (firstOfXPart[ind][i + 1])
                    for (let j = (firstOfXPart[ind][i + 1][0][0].xIndex - 1); j >= 0; j--)
                        if (slicedLines[j][0]) {
                            lastNotEmptyBeforeTheNext = j + 1
                            j = 0
                        }

                const start = node[0][0].xIndex
                let end = (i === (firstOfXPart[ind].length - 1))
                    ? lastNotEmpty
                    : lastNotEmptyBeforeTheNext
                const parts = slicedLines.slice(start, end)

                if (parts[0][ind])
                    result.push(createGeometry(
                        parts[0][ind][0].height,
                        parts[0][ind][0].position,
                        parts.length, parts[0][ind].length,
                        parts[0][ind][0].value,
                        parts[0][ind][0].isBox))
            })
        })
    }
    return result
}