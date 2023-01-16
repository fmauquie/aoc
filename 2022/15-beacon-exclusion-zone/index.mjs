import { identity, readInput } from '../../utils.mjs';

function manhattanDistance({ sx, sy, bx, by }) {
    return Math.abs(sx - bx) + Math.abs(sy - by)
}

async function parseInput() {
    return (await readInput(import.meta.url))
        .map(line => line.match(/Sensor at x=(-?\d+), y=(-?\d+): closest beacon is at x=(-?\d+), y=(-?\d+)/))
        .map(([_, sx, sy, bx, by]) => ({ sx: Number(sx), sy: Number(sy), bx: Number(bx), by: Number(by) }))
        .map(sensor => ({ ...sensor, distance: manhattanDistance(sensor) }));
}

async function part1() {
    const sensorsAndBeacons = await parseInput()
    const allXs = sensorsAndBeacons
        .flatMap(({ sx, bx, distance }) => [sx - distance, sx + distance, bx - distance, bx + distance])
    const minX = Math.min(...allXs)
    const maxX = Math.max(...allXs)

    return Array.from(new Array(maxX - minX))
        .filter((_, index) => sensorsAndBeacons
            .some(({ sx, sy, bx, by, distance }) => {
                const x = minX + index
                const y = 2_000_000
                if (bx === x && by === y) {
                    return false
                }
                return distance >= manhattanDistance({ sx, sy, bx: x, by: y });
            })
        )
        .length
}

async function part2() {
    const MIN_SEARCH_RANGE = 0
    const MAX_SEARCH_RANGE = 4_000_000

    const sensorsAndBeacons = (await parseInput())
        .map(({ sx, sy, distance, ...sensor }) => ({
            sx, sy, distance,
            ...sensor,
            // ax + b
            tl: { a: -1, b: -distance + sx + sy },
            tr: { a: 1, b: -distance - sx + sy },
            bl: { a: 1, b: distance - sx + sy },
            br: { a: -1, b: distance + sx + sy },
        }))

    function inRange({ x, y }) {
        return x >= MIN_SEARCH_RANGE && y >= MIN_SEARCH_RANGE && x <= MAX_SEARCH_RANGE && y <= MAX_SEARCH_RANGE
    }

    function intersection({ a: a1, b: b1 }, { a: a2, b: b2 }) {
        const x = (b2 - b1) / (a1 - a2)
        return { x, y: a1 * x + b1 }
    }

    function interestPointsNear(next, direction) {
        return [
            { x: Math.floor(next.x) + direction.x, y: Math.floor(next.y) + direction.y },
            { x: Math.floor(next.x) + direction.x, y: Math.ceil(next.y) + direction.y },
            { x: Math.ceil(next.x) + direction.x, y: Math.floor(next.y) + direction.y },
            { x: Math.ceil(next.x) + direction.x, y: Math.ceil(next.y) + direction.y },
        ].reduce((deduped, point) => {
            if (deduped.length === 0 || deduped.every(({ x, y }) => x !== point.x || y !== point.y)) {
                deduped.push(point)
            }
            return deduped
        }, [])
    }

    function cornerInterestPointsNear(sensor1, sensor2) {
        return [
            { x: sensor1.sx + sensor1.distance, y: sensor1.sy, from: { x: -1, y: 0 } },
            { x: sensor1.sx - sensor1.distance, y: sensor1.sy, from: { x: 1, y: 0 } },
            { x: sensor1.sx, y: sensor1.sy + sensor1.distance, from: { x: 0, y: -1 } },
            { x: sensor1.sx, y: sensor1.sy - sensor1.distance, from: { x: 0, y: 1 } },
        ]
            .filter(({ x: bx, y: by }) => manhattanDistance({
                ...sensor2,
                bx,
                by
            }) === sensor2.distance + 1)
            .flatMap(corner => [
                    { x: -1, y: 0 },
                    { x: 1, y: 0 },
                    { x: 0, y: -1 },
                    { x: 0, y: 1 }
                ]
                    .filter(({ x, y }) => x !== corner.from.x && y !== corner.from.y)
                    .map(({ x, y }) => ({
                        x: sensor1.sx + x,
                        y: sensor1.sy + y,
                    }))
            )
            .filter(({ x: bx, y: by }) => manhattanDistance({
                ...sensor2,
                bx,
                by
            }) === sensor2.distance + 1)
    }

    const distressBeacon = sensorsAndBeacons
        .map((sensor, index) => ({
            ...sensor,
            intersects: sensorsAndBeacons
                .slice(index + 1)
                .map(intersect => {
                    const distance = manhattanDistance({ ...sensor, bx: intersect.sx, by: intersect.sy })
                    if (distance > sensor.distance + intersect.distance) {
                        return false
                    }
                    if (distance < sensor.distance || distance < intersect.distance) {
                        return false
                    }

                    if (distance === sensor.distance + intersect.distance) {
                        return {
                            ...intersect,
                            interestPoints: [
                                ...cornerInterestPointsNear(sensor, intersect),
                                ...cornerInterestPointsNear(intersect, sensor)
                            ]
                        }
                    }

                    const interestPoints = [
                        {
                            which: 'stl-itr',
                            intersect: intersection(sensor.tl, intersect.tr),
                            direction: { x: 0, y: -1 }
                        },
                        {
                            which: 'str-itl',
                            intersect: intersection(sensor.tr, intersect.tr),
                            direction: { x: 0, y: -1 }
                        },
                        {
                            which: 'stl-ibl',
                            intersect: intersection(sensor.tl, intersect.bl),
                            direction: { x: -1, y: 0 }
                        },
                        {
                            which: 'sbl-itl',
                            intersect: intersection(sensor.bl, intersect.tl),
                            direction: { x: -1, y: 0 }
                        },
                        {
                            which: 'str-ibr',
                            intersect: intersection(sensor.tr, intersect.br),
                            direction: { x: 1, y: 0 }
                        },
                        {
                            which: 'sbr-itr',
                            intersect: intersection(sensor.br, intersect.tr),
                            direction: { x: 1, y: 0 }
                        },
                        {
                            which: 'sbl-ibr',
                            intersect: intersection(sensor.bl, intersect.br),
                            direction: { x: 0, y: 1 }
                        },
                        {
                            which: 'sbr-ibl',
                            intersect: intersection(sensor.br, intersect.bl),
                            direction: { x: 0, y: 1 }
                        },
                    ]
                        .filter(({ intersect }) => inRange(intersect))
                        .flatMap(({ intersect, direction }) => interestPointsNear(intersect, direction))

                    return {
                        ...intersect,
                        interestPoints
                    }
                })
                .filter(identity)
        }))
        .flatMap(({ intersects }) => intersects.flatMap(({ interestPoints }) => interestPoints))
        .find(({ x, y }) => sensorsAndBeacons
            .every(({ sx, sy, distance }) => distance < manhattanDistance({ sx, sy, bx: x, by: y }))
        )

    return distressBeacon.x * 4_000_000 + distressBeacon.y
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
