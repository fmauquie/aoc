import { identity, readInput } from '../../utils.mjs';

function isVisible(x, y, trees) {
    const height = trees[y][x]

    if (x === 0 || y === 0 || x === trees[y].length - 1 || y === trees.length - 1) {
        return true
    }

    const visibleLeft = trees[y].slice(0, x).every(tree => tree < height)
    const visibleRight = visibleLeft || trees[y].slice(x + 1).every(tree => tree < height)
    const visibleTop = visibleRight || trees.slice(0, y).map(treesY => treesY[x]).every((tree) => tree < height)
    const visibleBottom = visibleTop || trees.slice(y + 1).map(treesY => treesY[x]).every((tree) => tree < height)

    return visibleBottom
}

function scenicScore(x, y, trees) {
    if (x === 0 || y === 0 || x === trees[y].length - 1 || y === trees.length - 1) {
        return 0
    }

    const height = trees[y][x]

    function convert(array) {
        const nbTrees = array.findIndex(tree => tree >= height) + 1

        return nbTrees === 0 ? array.length : nbTrees
    }

    const sizeLeft = convert(trees[y].slice(0, x).reverse())
    const sizeRight = convert(trees[y].slice(x + 1))
    const sizeTop = convert(trees.slice(0, y).map(treesY => treesY[x]).reverse())
    const sizeBottom = convert(trees.slice(y + 1).map(treesY => treesY[x]))

    return sizeLeft * sizeRight * sizeTop * sizeBottom
}

async function part1() {
    return (await readInput(import.meta.url))
        .map(line => Array.from(line).map(tree => parseInt(tree, 10)))
        .flatMap((treesY, y, trees) => treesY
            .map((_, x) => isVisible(x, y, trees)))
        .filter(identity)
        .length
}

async function part2() {
    return Math.max(...(await readInput(import.meta.url))
        .map(line => Array.from(line).map(tree => parseInt(tree, 10)))
        .flatMap((treesY, y, trees) => treesY
            .map((_, x) => scenicScore(x, y, trees)))
    )
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
