import { readInput, sum } from '../../utils.mjs';

const byPriority = ({ priority: p1 }, { priority: p2 }) => p2 - p1
const toPriority = item => parseInt(item, 36) - 9 +
    ((item >= 'a' && item <= 'z') ? 0 : 26)

async function part1() {
    return (await readInput(import.meta.url))
        .map(line => ({
            half1: line.slice(0, line.length / 2),
            half2: line.slice(line.length / 2),
        }))
        .map(({
                  half1,
                  half2
              }) => Array.from(half1).find(item => half2.includes(item)))
        .map(toPriority)
        .reduce(sum, 0)
}

async function part2() {
    return (await readInput(import.meta.url))
        .reduce((acc, nextBag) => {
            const lastGroup = acc[acc.length - 1]
            if (lastGroup.length < 3) {
                lastGroup.push(nextBag)
            } else {
                acc.push([nextBag])
            }
            return acc
        }, [[]])
        .map(([sack1,sack2,sack3]) => Array.from(sack1).find(item => sack2.includes(item) && sack3.includes(item)))
        .map(toPriority)
        .reduce(sum, 0)
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
