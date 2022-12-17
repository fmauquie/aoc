import { readInput } from '../utils.mjs';

// A stack is an array, the element on top is the head (index 0)
// There is a virtual "0th" stack, that reads its crates from out of the file

async function parseInput() {
    const input = (await readInput(import.meta.url))
    const separatorIndex = input.findIndex(line => line === '')
    const stackDefinitions = input.slice(0, separatorIndex)
    const moveDefinitions = input.slice(separatorIndex + 1)
    const stackHeaders = stackDefinitions[stackDefinitions.length - 1]
    const stackContents = stackDefinitions.slice(0, stackDefinitions.length - 1)
    const stackCrateIndex = Array.from(stackHeaders).reduce((acc, char, currentIndex) => {
        if (char !== ' ') {
            if (acc.length !== parseInt(char, 10)) {
                throw new Error(`Expected stack index ${acc.length}, got ${char} at index ${currentIndex}`)
            }
            acc.push(currentIndex)
        }
        return acc
    }, [-1])
    const stacks = stackCrateIndex.map(index => stackContents
        .map(crates => crates[index])
        .filter(crate => Boolean(crate?.trim()))
    )
    const moves = moveDefinitions.map(definition => {
        const [, nb, from, to] = definition.match(/move (\d+) from (\d+) to (\d+)/)
        return {
            nb: parseInt(nb, 10),
            from: parseInt(from, 10),
            to: parseInt(to, 10),
        }
    })

    return { stacks, moves }
}

function rearrangeStacks(from, to, stacks, fromStack, toStack) {
    return from < to ? [
        ...stacks.slice(0, from),
        fromStack,
        ...stacks.slice(from + 1, to),
        toStack,
        ...stacks.slice(to + 1)
    ] : [
        ...stacks.slice(0, to),
        toStack,
        ...stacks.slice(to + 1, from),
        fromStack,
        ...stacks.slice(from + 1)
    ];
}

function moveOne(stacks, from, to) {
    const [moved, ...fromStack] = stacks[from]
    const toStack = [moved, ...stacks[to]]

    return rearrangeStacks(from, to, stacks, fromStack, toStack)
}

function moveMany(stacks, { nb, from, to }) {
    return Array.from(new Array(nb)).reduce((acc) => moveOne(acc, from, to), stacks)
}

function moveManyPart2(stacks, { nb, from, to }) {
    const moved = stacks[from].slice(0, nb)
    const fromStack = stacks[from].slice(nb)
    const toStack = [...moved, ...stacks[to]]

    return rearrangeStacks(from, to, stacks, fromStack, toStack)
}

async function part1() {
    const { stacks, moves } = await parseInput()

    const finalArrangement = moves.reduce((acc, move) => moveMany(acc, move), stacks)
    return finalArrangement.map(([top]) => top).join('')
}

async function part2() {
    const { stacks, moves } = await parseInput()

    const finalArrangement = moves.reduce((acc, move) => moveManyPart2(acc, move), stacks)
    return finalArrangement.map(([top]) => top).join('')
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
