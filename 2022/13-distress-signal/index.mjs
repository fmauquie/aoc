import { identity, multiply, readInput, sum } from '../../utils.mjs';

function compareOrder(left, right) {
    if (typeof left === 'undefined') {
        return -1
    }
    if (typeof right === 'undefined') {
        return 1
    }
    if (typeof left === 'number' && typeof right === 'number') {
        return left - right
    }
    const arrayLeft = typeof left === 'number' ? [left] : left
    const arrayRight = typeof right === 'number' ? [right] : right

    const elementsResult = arrayLeft.reduce((acc, subLeft, index) => {
        if (acc === 0) {
            return compareOrder(subLeft, arrayRight[index])
        }
        return acc
    }, 0)

    if (elementsResult === 0) {
        return left.length === right.length ? 0 : -1
    } else {
        return elementsResult
    }
}

async function part1() {
    const LINE_TYPE_LEFT = 0
    const LINE_TYPE_RIGHT = 1
    const LINE_TYPE_BLANK = 2
    const pairs = (await readInput(import.meta.url)).reduce((pairs, line, index) => {
        const lineType = index % 3
        switch (lineType) {
            case LINE_TYPE_LEFT:
                pairs.push({ left: JSON.parse(line), right: [] })
                break
            case LINE_TYPE_RIGHT:
                pairs[pairs.length - 1].right = JSON.parse(line)
                break
            case LINE_TYPE_BLANK:
                break
        }
        return pairs
    }, [])

    return pairs
        .map(({ left, right }) => compareOrder(left, right))
        .map((order, index) => order < 0 ? index + 1 : 0)
        .reduce(sum, 0)
}

async function part2() {
    const dividers = [[[2]], [[6]]]
    const packets = (await readInput(import.meta.url))
        .filter(identity)
        .map(line => JSON.parse(line))
        .concat(dividers)
        .sort(compareOrder)

    return dividers.map(divider => packets.indexOf(divider) + 1).reduce(multiply, 1)
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
