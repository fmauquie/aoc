import { readInput } from '../../utils.mjs';

function moveKnot(knots, index) {
    const tail = knots[index]
    const head = knots[index - 1]
    if (Math.abs(tail.x - head.x) <= 1 && Math.abs(tail.y - head.y) <= 1) {
        return
    }

    if (tail.x === head.x) {
        tail.y += tail.y > head.y ? -1 : 1
    } else if (tail.y === head.y) {
        tail.x += tail.x > head.x ? -1 : 1
    } else {
        if (tail.x < head.x) {
            tail.x += 1
        } else if (tail.x > head.x) {
            tail.x -= 1
        }
        if (tail.y < head.y) {
            tail.y += 1
        } else if (tail.y > head.y) {
            tail.y -= 1
        }
    }
}

async function parseInput() {
    return (await readInput(import.meta.url))
        .map(move => move.split(' '))
        .map(([direction, nb], index) => ({ direction, nb: parseInt(nb, 10), index }))
        .flatMap(move => Array.from(new Array(move.nb)).map((_, index) => ({
            from: move,
            index,
            dx: 0, dy: 0,
            ...move.direction === 'R' && { dx: 1 },
            ...move.direction === 'L' && { dx: -1 },
            ...move.direction === 'D' && { dy: 1 },
            ...move.direction === 'U' && { dy: -1 },
        })));
}

async function part1() {
    return Object.keys((await parseInput())
        .reduce((state, move) => {
            state.knots[0].x += move.dx
            state.knots[0].y += move.dy

            moveKnot(state.knots, 1)
            state.tailPositions[`${state.knots[1].x},${state.knots[1].y}`] = true

            return state
        }, {
            knots: [{ x: 0, y: 0 }, { x: 0, y: 0 }],
            tailPositions: { '0,0': true }
        })
        .tailPositions).length
}

async function part2() {
    return Object.keys((await parseInput())
        .reduce((state, move) => {
            state.knots[0].x += move.dx
            state.knots[0].y += move.dy

            state.knots.slice(1).forEach((_, index) => moveKnot(state.knots, index + 1))
            state.tailPositions[`${state.knots[9].x},${state.knots[9].y}`] = true

            return state
        }, {
            knots: Array.from(new Array(10)).map(() => ({ x: 0, y: 0 })),
            tailPositions: { '0,0': true }
        })
        .tailPositions).length
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
