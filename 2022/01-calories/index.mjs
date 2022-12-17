import { readInput, sum } from '../../utils.mjs';

async function calories() {
    const elves = (await readInput(import.meta.url)).reduce((acc, line) => {
        if (line === '') {
            acc.push([])
            return acc
        }
        acc[acc.length - 1].push(Number.parseInt(line))
        return acc
    }, [[]])
    return elves.map(elf => elf.reduce((a, b) => a + b, 0));
}

async function part1() {
    return Math.max(...(await calories()))
}

async function part2() {
    return (await calories()).sort().reverse().slice(0,3).reduce(sum, 0)
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
