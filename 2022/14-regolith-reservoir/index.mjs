import { readInput } from '../../utils.mjs';

const EMPTY_SPACE = '.'
const ROCK = '#'
const SETTLED_GRAIN = 'o'

async function executeSimulation(done) {
    const paths = (await readInput(import.meta.url))
        .map(line => line
            .split(' -> ')
            .map(coordinates => coordinates.split(','))
            .map(([x, y]) => ({ x: Number(x), y: Number(y) }))
        )
    const maxPathY = Math.max(...paths.flatMap(path => path.map(({ y }) => y)))

    let map = []
    let intervalX = { min: Number.MAX_SAFE_INTEGER, max: Number.MIN_SAFE_INTEGER }
    const setPoint = ({ x, y }, type) => {
        map[y] = map[y] ?? []
        map[y][x] = type
        intervalX = { min: Math.min(intervalX.min, x), max: Math.max(intervalX.max, x) }
    }
    const getPoint = ({ x, y }) => map[y]?.[x] ?? EMPTY_SPACE

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
                        .map((_, index) => ({ x: from.x, y: minY + index }))
                }
                if (from.y === to.y) {
                    const minX = Math.min(from.x, to.x)
                    const maxX = Math.max(from.x, to.x)
                    return Array
                        .from(new Array(maxX - minX + 1))
                        .map((_, index) => ({ x: minX + index, y: from.y }))
                }
                throw new Error("wut ?")
            })
        )
        .forEach((pathPoint) => setPoint(pathPoint, ROCK))

    let nbGrains = 0
    let currentGrain = { x: 500, y: 0 }
    do {
        nbGrains++
        currentGrain = { x: 500, y: 0 }
        let settled = false
        while (!settled) {
            const { x, y } = currentGrain
            if (y === maxPathY + 2) {
                setPoint({ x, y: y - 1 }, SETTLED_GRAIN)
                setPoint(currentGrain, ROCK)
                settled = true
            } else if (getPoint({ x, y: y + 1 }) === EMPTY_SPACE) {
                currentGrain = { x, y: y + 1 }
            } else if (getPoint({ x: x - 1, y: y + 1 }) === EMPTY_SPACE) {
                currentGrain = { x: x - 1, y: y + 1 }
            } else if (getPoint({ x: x + 1, y: y + 1 }) === EMPTY_SPACE) {
                currentGrain = { x: x + 1, y: y + 1 }
            } else {
                setPoint(currentGrain, SETTLED_GRAIN)
                settled = true
            }
        }
    } while (!done(currentGrain.y, maxPathY))

    const displayMap = Array.from(new Array(maxPathY + 3))
        .map((_y, y) => Array.from(new Array(intervalX.max - intervalX.min + 3))
            .map((_x, x) => getPoint({ x: intervalX.min + x - 1, y }))
            .join('')
        )
        .join('\n')
    return { displayMap, nbGrains }
}

async function part1() {
    const { displayMap, nbGrains } = await executeSimulation((y, maxY) => y > maxY)

    // console.log(displayMap)

    // Latest grain does not actually settle
    return nbGrains - 1
}

async function part2() {
    const { displayMap, nbGrains } = await executeSimulation((y) => y === 0)

    // console.log(displayMap)

    // All grains settle
    return nbGrains
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
