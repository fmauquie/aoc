import { readInput } from '../../utils.mjs';

async function part1() {
    const paths = (await readInput(import.meta.url))
        .map(line => line
            .split(' -> ')
            .map(coordinates => coordinates.split(','))
            .map(([x, y]) => ({ x: Number(x), y: Number(y) }))
        )
    const pathX = paths.flatMap(path => path.map(({ x }) => x))
    const pathY = paths.flatMap(path => path.map(({ y }) => y))
    const minPathX = Math.min(...pathX)
    const maxPathX = Math.max(...pathX)
    const maxPathY = Math.max(...pathY)

    const lengthX = maxPathX - minPathX + 1
    const lengthY = maxPathY + 1

    let map = Array.from(new Array(lengthY)).map(_ => Array.from(new Array(lengthX)).map(_ => '.'))

    paths
        .flatMap(path => path
            .flatMap((from, index, others) => {
                const to = others[index + 1]
                if (!to) {
                    return []
                }
                if (from.x === to.x) {
                    const minY = Math.min(from.y, to.y)
                    const maxY = Math.max(from.y, to.y)
                    return Array
                        .from(new Array(maxY - minY + 1))
                        .map((_, index) => ({ x: from.x - minPathX, y: minY + index }))
                }
                if (from.y === to.y) {
                    const minX = Math.min(from.x, to.x)
                    const maxX = Math.max(from.x, to.x)
                    return Array
                        .from(new Array(maxX - minX + 1))
                        .map((_, index) => ({ x: minX + index - minPathX, y: from.y }))
                }
                throw new Error("wut ?")
            })
        )
        .forEach(({ x, y }) => map[y][x] = '#')

    let nbGrains = 0
    let out = false
    while (!out) {
        let currentGrain = { x: 500 - minPathX, y: 0 }
        let settled = false
        while (!settled && !out) {
            if (currentGrain.y === maxPathY) {
                out = true
            } else if (map[currentGrain.y + 1][currentGrain.x] === '.') {
                currentGrain.y++
            } else if (currentGrain.x === 0) {
                out = true
            } else if (map[currentGrain.y + 1][currentGrain.x - 1] === '.') {
                currentGrain.x--
                currentGrain.y++
            } else if (currentGrain.x === maxPathX - minPathX) {
                out = true
            } else if (map[currentGrain.y + 1][currentGrain.x + 1] === '.') {
                currentGrain.x++
                currentGrain.y++
            } else {
                map[currentGrain.y][currentGrain.x] = 'o'
                settled = true
                nbGrains++
            }
        }
    }
    console.log(map.map(line => line.join('')).join('\n'))
    return nbGrains
}

async function part2() {
    // return (await readInput(import.meta.url))
}

console.log(await part1().catch(console.error))
/*
console.log(await part2().catch(console.error))
*/
