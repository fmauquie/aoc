import { readInput } from '../../utils.mjs';

function positionKey({ x, y }) {
    return `x:${x};y:${y}`
}

function canMoveOld(heightMap, from, current, to) {
    if (from.x === to.x && from.y === to.y) {
        return false
    }
    const currentElevation = heightMap[current.y][current.x]
    const toElevation = heightMap[to.y]?.[to.x]
    if (typeof toElevation === 'undefined') {
        return false
    }
    if (currentElevation === "S") {
        return toElevation === "S" || toElevation === "a" || toElevation === "b"
    }
    if (toElevation === "E") {
        return currentElevation === "z" || currentElevation === "y"
    }
    return parseInt(toElevation, 36) <= parseInt(currentElevation, 36) + 1
}

function canMove(heightMap, from, to) {
    const fromElevation = heightMap[from.y]?.[from.x]
    const toElevation = heightMap[to.y]?.[to.x]
    if (typeof toElevation === 'undefined' || typeof fromElevation === 'undefined') {
        return false
    }
    if (fromElevation === "S") {
        return toElevation === "S" || toElevation === "a" || toElevation === "b"
    }
    if (toElevation === "E") {
        return fromElevation === "z" || fromElevation === "y"
    }
    return parseInt(toElevation, 36) <= parseInt(fromElevation, 36) + 1
}

function findPosition(heightMap, token) {
    const lines = heightMap.map(line => line.indexOf(token))
    const y = lines.findIndex(x => x >= 0)
    const x = lines[y]

    return { x, y }
}

function moveTowards(heightMap, target, from, position, best = { distance: Number.MAX_SAFE_INTEGER, visited: {}, }) {
    if (position.x === target.x && position.y === target.y) {
        return { distance: 0, reason: 'found', visited: best.visited, path: [position] }
    }
    if (best.distance === 0) {
        return { distance: Number.MAX_SAFE_INTEGER, reason: 'dead-end', visited: best.visited, path: [] }
    }


    const currentPositionKey = positionKey(position)
    const knownBest = best.visited[currentPositionKey]
    if (knownBest === 'processing') {
        return { distance: Number.MAX_SAFE_INTEGER, reason: 'backwards', visited: best.visited, path: [] }
    } else if (knownBest === 'dead-end') {
        return { distance: Number.MAX_SAFE_INTEGER, reason: 'dead-end', visited: best.visited, path: [] }
    } else if (knownBest) {
        return knownBest.distance < best.distance
            ? { ...knownBest, visited: best.visited, reason: 'known' }
            : { distance: Number.MAX_SAFE_INTEGER, reason: 'dead-end', visited: best.visited, path: [] }
    }

    const { x, y, } = position
    const move = (to, previousBest) => canMoveOld(heightMap, from, position, to)
        ? moveTowards(heightMap, target, position, to, previousBest)
        : { distance: Number.MAX_SAFE_INTEGER, reason: 'dead-end', visited: previousBest.visited, path: [] }

    const left = { x: x - 1, y }
    const right = { x: x + 1, y }
    const top = { x, y: y - 1 }
    const bottom = { x, y: y + 1 }
    const xAxis = x > target.x ? [left, right] : [right, left]
    const yAxis = y > target.y ? [top, bottom] : [bottom, top]
    const directions = Math.abs(x - target.x) > Math.abs(y - target.y)
        ? [xAxis[0], ...yAxis, xAxis[1]]
        : [yAxis[0], ...xAxis, yAxis[1]]

    const direction0 = move(directions[0], {
        distance: best.distance - 1,
        visited: { ...best.visited, [currentPositionKey]: 'processing' }
    })
    const direction1 = move(directions[1], {
        distance: Math.min(best.distance - 1, direction0.distance),
        visited: direction0.visited
    })
    const direction2 = move(directions[2], {
        distance: Math.min(best.distance - 1, direction0.distance, direction1.distance),
        visited: direction1.visited
    })
    const direction3 = move(directions[3], {
        distance: Math.min(best.distance - 1, direction0.distance, direction1.distance, direction2.distance),
        visited: direction2.visited
    })

    const bestDistance = Math.min(direction0.distance, direction1.distance, direction2.distance, direction3.distance)
    if (bestDistance === Number.MAX_SAFE_INTEGER) {
        if ([direction0, direction1, direction2, direction3].some(({ reason }) => reason === 'backwards')) {
            return {
                distance: Number.MAX_SAFE_INTEGER,
                reason: 'backwards',
                visited: { ...direction3.visited, [currentPositionKey]: 'dead-end' },
                path: []
            }
        } else {
            return {
                distance: Number.MAX_SAFE_INTEGER,
                reason: 'dead-end',
                visited: { ...direction3.visited, [currentPositionKey]: 'dead-end' },
                path: []
            }
        }
    }

    const bestPath = [
        direction0,
        direction1,
        direction2,
        direction3
    ].find(({ distance: nextDistance }) => bestDistance === nextDistance)
    const distance = bestDistance + 1
    const path = [
        { x, y },
        ...bestPath.path
    ]

    return {
        distance,
        path,
        reason: 'found',
        visited: {
            ...direction3.visited,
            [currentPositionKey]: { distance, path }
        },
    }
}

function checkWeights(heightMap, start) {
    let next = [start]
    let weights = heightMap.map(line => line.map(_ => 'pending'))
    weights[start.y][start.x] = 0

    while (next.length > 0) {
        const current = next.shift()
        const { x, y } = current
        const closePoints = [{ x, y: y - 1 }, { x, y: y + 1 }, { x: x - 1, y }, { x: x + 1, y }]
        const unexploredPossibleFrom = closePoints
            .filter(point => canMove(heightMap, point, current))
            .filter((point) => weights[point.y][point.x] === 'pending')
        const surroundingWeights = closePoints
            .filter(point => canMove(heightMap, current, point))
            .map(point => weights[point.y][point.x])
            .filter((weight) => typeof weight === 'number')

        if (surroundingWeights.length > 0) {
            weights[y][x] = Math.min(...surroundingWeights) + 1
        }
        unexploredPossibleFrom.forEach(point => weights[point.y][point.x] = 'queued')
        next.push(...unexploredPossibleFrom)
    }

    return weights
}

async function deprecatedPart1() {
    const heightMap = (await readInput(import.meta.url))
        .map(line => line.split(''))

    const startingPoint = findPosition(heightMap, "S")
    const targetPoint = findPosition(heightMap, "E")

    const bestPath = moveTowards(heightMap, targetPoint, startingPoint, startingPoint)
    console.log(heightMap
        .map((line, y) => line
            .map((elevation, x) =>
                //bestPath.visited[positionKey({x,y})]
                bestPath.path.find((path) => path.x === x && path.y === y)
                    ? elevation.toUpperCase()
                    : elevation).join('')
        )
        .join('\n'))
    return bestPath.distance
}

async function parseWeights() {
    const heightMap = (await readInput(import.meta.url))
        .map(line => line.split(''))

    const startingPoint = findPosition(heightMap, "S")
    const targetPoint = findPosition(heightMap, "E")

    const weights = checkWeights(heightMap, targetPoint)

    return { heightMap, weights, startingPoint, targetPoint }
}

async function part1() {
    const { weights, startingPoint } = await parseWeights()
    return weights[startingPoint.y][startingPoint.x]
}

async function part2() {
    const { weights, heightMap, startingPoint } = await parseWeights()

    return Math.min(
        weights[startingPoint.y][startingPoint.x],
        ...weights
            .flatMap((line, y) => line
                .filter((weight, x) => typeof weight === 'number' && heightMap[y][x] === 'a')
            )
    )
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
