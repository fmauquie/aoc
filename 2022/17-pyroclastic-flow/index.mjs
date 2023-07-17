import { readInput } from "../../utils.mjs"

function isEmpty(tower, x, y) {
  if (y === -1 || x === -1 || x > 6) {
    return false
  }
  if (!tower[y]) {
    tower[y] = "......."
  }
  return tower[y][x] === "."
}

function put(tower, shape, x, y) {
  const biggestTower = tower.length >= shape.length + y
    ? tower
    : tower.concat(Array.from(Array(shape.length + y - tower.length), () => "......."))
  return biggestTower.map((line, towerY) => towerY < y || towerY >= y + shape.length
    ? line
    : Array.from(line, (space, towerX) => space === "#" || shape[towerY - y][towerX - x] === "#"
      ? "#"
      : ".").join(""))
}

const blocks = [
  {
    shape: ["####"],
    canMoveLeft: (tower, x, y) => isEmpty(tower, x - 1, y),
    canMoveRight: (tower, x, y) => isEmpty(tower, x + 4, y),
    canMoveDown: (tower, x, y) => isEmpty(tower, x, y - 1) && isEmpty(tower, x + 1, y - 1) && isEmpty(tower, x + 2, y - 1) && isEmpty(tower, x + 3, y - 1),
  }, {
    shape: [".#.", "###", ".#."],
    canMoveLeft: (tower, x, y) => isEmpty(tower, x, y) && isEmpty(tower, x - 1, y + 1) && isEmpty(tower, x, y + 2),
    canMoveRight: (tower, x, y) => isEmpty(tower, x + 2, y) && isEmpty(tower, x + 3, y + 1) && isEmpty(tower, x + 2, y + 2),
    canMoveDown: (tower, x, y) => isEmpty(tower, x, y) && isEmpty(tower, x + 1, y - 1) && isEmpty(tower, x + 2, y),
  }, {
    shape: ["###", "..#", "..#"],
    canMoveLeft: (tower, x, y) => isEmpty(tower, x - 1, y) && isEmpty(tower, x + 2, y + 1) && isEmpty(tower, x + 2, y + 2),
    canMoveRight: (tower, x, y) => isEmpty(tower, x + 3, y) && isEmpty(tower, x + 3, y + 1) && isEmpty(tower, x + 3, y + 2),
    canMoveDown: (tower, x, y) => isEmpty(tower, x, y - 1) && isEmpty(tower, x + 1, y - 1) && isEmpty(tower, x + 2, y - 1),
  }, {
    shape: ["#", "#", "#", "#"],
    canMoveLeft: (tower, x, y) => isEmpty(tower, x - 1, y) && isEmpty(tower, x - 1, y + 1) && isEmpty(tower, x - 1, y + 2) && isEmpty(tower, x - 1, y + 3),
    canMoveRight: (tower, x, y) => isEmpty(tower, x + 1, y) && isEmpty(tower, x + 1, y + 1) && isEmpty(tower, x + 1, y + 2) && isEmpty(tower, x + 1, y + 3),
    canMoveDown: (tower, x, y) => isEmpty(tower, x, y - 1),
  }, {
    shape: ["##", "##"],
    canMoveLeft: (tower, x, y) => isEmpty(tower, x - 1, y) && isEmpty(tower, x - 1, y + 1),
    canMoveRight: (tower, x, y) => isEmpty(tower, x + 2, y) && isEmpty(tower, x + 2, y + 1),
    canMoveDown: (tower, x, y) => isEmpty(tower, x, y - 1) && isEmpty(tower, x + 1, y - 1),
  },
]

const input = (await readInput(import.meta.url, "input"))[0]

function runFall(nbRocks) {
  let highestLine = 0
  let directionIndex = 0
  let tower = []

  for (let i = 0; i < nbRocks; i++) {
    const currentBlock = blocks[i % 5]
    let currentBlockPosition = [2, highestLine + 3]
    let settled = false

    while (!settled) {
      let [x, y] = currentBlockPosition
      if (input[directionIndex] === "<" && currentBlock.canMoveLeft(tower, x, y)) {
        x = x - 1
      } else if (input[directionIndex] === ">" && currentBlock.canMoveRight(tower, x, y)) {
        x = x + 1
      }

      if (currentBlock.canMoveDown(tower, x, y)) {
        y = y - 1
      } else {
        settled = true
      }
      directionIndex++
      if (directionIndex === input.length) {
        directionIndex = 0
      }
      currentBlockPosition = [x, y]
    }

    tower = put(tower, currentBlock.shape, ...currentBlockPosition)
    highestLine = Math.max(highestLine, currentBlockPosition[1] + currentBlock.shape.length)
  }

  return highestLine
}

async function part1() {
  return runFall(2022)
}

async function part2() {
  return runFall(1_000_000_000_000)
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
