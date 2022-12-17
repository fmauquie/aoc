import { readInput } from '../utils.mjs';

async function readAssignments() {
    return (await readInput(import.meta.url))
        .map(line => line.split(',')
            .map(interval => interval.split('-')
                .map(section => parseInt(section, 10))
            )
        );
}

async function part1() {
    return (await readAssignments())
        .filter(([[l1, u1], [l2, u2]]) => (l1 <= l2 && u1 >= u2) || (l2 <= l1 && u2 >= u1))
        .length
}

async function part2() {
    return (await readAssignments()).filter(([[l1, u1], [l2, u2]]) => l1 <= u2 && l2 <= u1).length
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
