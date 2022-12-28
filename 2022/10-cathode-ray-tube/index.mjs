import { readInput, sum } from '../../utils.mjs';

async function parseCycles() {
    return (await readInput(import.meta.url))
        .map(input => input.split(' '))
        .flatMap(([operation, nb]) => operation === 'noop' ? [0] : [0, Number(nb)])
        .reduce((acc, x, index) => {
            const lastCycle = acc[acc.length - 1]
            const cycle = lastCycle.cycle + 1
            const sum = lastCycle.sum + lastCycle.x
            const isLit = [sum - 1, sum, sum + 1].includes(lastCycle.position)
            const position = lastCycle.position === 39 ? 0 : lastCycle.position + 1;
            return [
                ...acc,
                {
                    cycle,
                    x,
                    sum,
                    position,
                    crt: lastCycle.crt + (isLit ? '#' : '.') + (position === 0 ? '\n' : '')
                },
            ]
        }, [{ cycle: 0, x: 1, sum: 0, position: 0, crt: '' }]);
}

async function part1() {
    const cycles = await parseCycles()
    return [20, 60, 100, 140, 180, 220]
        .map(cycleNb => cycles.find(({ cycle }) => cycle === cycleNb))
        .map(({ sum, cycle }) => sum * cycle)
        .reduce(sum, 0)
}

async function part2() {
    const cycles = await parseCycles()
    return cycles[cycles.length - 1].crt
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
