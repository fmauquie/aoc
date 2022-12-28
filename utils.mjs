import fs from 'node:fs/promises';

export async function readInput(importMetaUrl, file = 'input') {
    const input = await fs.readFile(new URL(file, importMetaUrl), 'utf-8')
    return input.split('\n').slice(0, -1)
}

export const sum = (a, b) => a + b

export const identity = (a) => a

export const numbers = (a, b) => a - b

export function log(value) {
    console.log(value)
    return value
}

// Template

async function part1() {
    return (await readInput(import.meta.url))
}

async function part2() {
    // return (await readInput(import.meta.url))
}

/*
console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
*/
