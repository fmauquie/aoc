import { readInput } from '../utils.mjs';

async function part1() {
    return Array.from((await readInput(import.meta.url))[0]).findIndex((_, index, chars) => {
        if (index <= 3) {
            return false
        }
        const buffer = chars.slice(index - 4, index)
        return buffer.every((char, bufferIndex) => !buffer.slice(bufferIndex + 1).includes(char))
    })
}

async function part2() {
    return Array.from((await readInput(import.meta.url))[0]).findIndex((_, index, chars) => {
        if (index <= 13) {
            return false
        }
        const buffer = chars.slice(index - 14, index)
        return buffer.every((char, bufferIndex) => !buffer.slice(bufferIndex + 1).includes(char))
    })
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
