import { readInput, sum } from '../utils.mjs';

function createDirectory(cwd, name, directory) {
    if (cwd.length === 0) {
        return {
            ...directory,
            directories: {
                ...directory.directories,
                [name]: { files: {}, directories: {}, size: 0 }
            }
        };
    } else {
        return {
            ...directory,
            directories: {
                ...directory.directories,
                [cwd[0]]: createDirectory(cwd.slice(1), name, directory.directories[cwd[0]])
            },
        };
    }
}

function createFile(cwd, name, size, directory) {
    return cwd.length === 0
        ? {
            ...directory,
            files: {
                ...directory.files,
                [name]: size
            },
            size: directory.size + size,
        }
        : {
            ...directory,
            directories: {
                ...directory.directories,
                [cwd[0]]: createFile(cwd.slice(1), name, size, directory.directories[cwd[0]])
            },
            size: directory.size + size
        };
}

async function readStructure() {
    return (await readInput(import.meta.url)).reduce((structure, instruction) => {
        // execute cd
        if (instruction.startsWith("$ cd ")) {
            const directory = instruction.slice("$ cd ".length)
            return directory === '/'
                ? {
                    root: structure.root,
                    cwd: []
                }
                : directory === '..'
                    ? {
                        root: structure.root,
                        cwd: structure.cwd.slice(0, -1)
                    }
                    : {
                        root: structure.root,
                        cwd: [...structure.cwd, directory]
                    };
        }
        // ignore ls
        if (instruction === '$ ls') {
            return structure
        }
        // execute ls dir
        if (instruction.startsWith('dir ')) {
            return {
                cwd: structure.cwd,
                root: createDirectory(structure.cwd, instruction.slice('dir '.length), structure.root),
            }
        }
        // execute ls file
        const [_, size, name] = instruction.match(/^(\d+)\s+(.+)$/)
        return {
            cwd: structure.cwd,
            root: createFile(structure.cwd, name, parseInt(size, 10), structure.root),
        }
    }, { cwd: [], root: { directories: {}, files: {}, size: 0 } })
}

function accumulateTotalSizeIfLessThan100000(directory) {
    const sizes = Object.values(directory.directories).map(accumulateTotalSizeIfLessThan100000)
    return sizes.reduce(sum, directory.size < 100_000 ? directory.size : 0)
}

async function part1() {
    const structure = await readStructure()
    return accumulateTotalSizeIfLessThan100000(structure.root)
}

function findDirectoriesBiggerThan(directory, size, cwd) {
    return [
        ...Object.entries(directory.directories)
            .flatMap(([name, subDirectory]) => findDirectoriesBiggerThan(subDirectory, size, [...cwd, name])),
        ...directory.size >= size ? [{ cwd, size: directory.size }] : []
    ]
}

async function part2() {
    const totalSpace = 70_000_000
    const neededSpace = 30_000_000
    const structure = await readStructure()
    const maxDataToKeep = totalSpace - neededSpace
    const spaceToFree = structure.root.size - maxDataToKeep
    return findDirectoriesBiggerThan(structure.root, spaceToFree, [])
        .sort(({ size: s1 }, { size: s2 }) => s1 - s2)[0].size
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
