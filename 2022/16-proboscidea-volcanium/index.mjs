import { readInput, sum } from "../../utils.mjs"

const valves = (await readInput(import.meta.url, "input"))
  .map(line => line.match(/Valve (\w\w) has flow rate=(\d+); tunnels? leads? to valves? (.+)/))
  .map(([_, name, rate, next]) => ({
    name, rate: Number(rate), next: next.split(", "),
  }))
const valvesByName = Object.fromEntries(valves.map((valve) => [
  valve.name, valve,
]))

let paths = {}

function shortestPath(from, to) {
  const pathKey = `${from}:${to}`
  if (!paths[pathKey]) {
    let needsProcess = [{ valve: from, path: [] }]
    let found = false
    let stop = 1_000
    while (!found) {
      stop--
      if (stop === 0) {
        throw new Error("Woops")
      }

      const { valve, path } = needsProcess.shift()

      const currentKey = `${from}:${valve}`
      if (paths[currentKey] && paths[currentKey].length < path.length) {
        continue
      } else {
        paths[currentKey] = path
      }

      const remainingKey = `${valve}:${to}`
      if (pathKey[remainingKey]) {
        found = true
        paths[pathKey] = [...path, ...pathKey[remainingKey]]
      } else if (valvesByName[valve].next.includes(to)) {
        found = true
        paths[pathKey] = [...path, to]
      } else {
        needsProcess.push(...valvesByName[valve].next.reduce((acc, next) => {
          if (!needsProcess.some(({ valve }) => next === valve) && !path.includes(next) && next !== from) {
            acc.push({ valve: next, path: [...path, next] })
          }
          return acc
        }, []))
      }
    }
  }
  return paths[pathKey]
}

let pathScores = {}

function computePathScore(path, maxMinutes) {
  const key = path.join(",") + maxMinutes
  if (!pathScores[key]) {
    let position = "AA"
    let released = 0
    let minutes = 0

    path.forEach((valve, index) => {
      if (minutes === maxMinutes) {
        return
      }

      const releasing = path.slice(0, index)
        .map(name => valvesByName[name].rate)
        .reduce(sum, 0)
      const toPosition = shortestPath(position, valve)

      const nbHops = Math.min(toPosition.length, maxMinutes - minutes)

      position = valve
      minutes += nbHops
      released += releasing * nbHops

      if (minutes < maxMinutes) {
        minutes++
        released += releasing
      }
    })

    const releasing = path.map(name => valvesByName[name].rate)
      .reduce(sum, 0)

    pathScores[key] = released += releasing * (maxMinutes - minutes)
  }
  return pathScores[key]
}

const interestingValves = valves.filter(({ rate }) => rate > 0)
  .map(({ name }) => name)

let pathDurations = {}

function pathDuration(path) {
  const key = path.join(",")
  if (!pathDurations[key]) {
    pathDurations[key] = path.reduce((acc, valve, i) => acc + shortestPath(path[i - 1] ?? "AA", valve).length, 0) + path.length
  }
  return pathDurations[key]
}

function bruteForceBestPath({ path = [], score = 0 } = {}) {
  return interestingValves.filter(valve => !path.includes(valve))
    .map(valve => [...path, valve])
    .filter(nextPath => pathDuration(nextPath) < 30)
    .map(nextPath => bruteForceBestPath({
      path: nextPath, score: computePathScore(nextPath, 30),
    }))
    .reduce((acc, next) => next.score > acc.score ? next : acc, { path, score })
}

function computeAllPaths(maxMinutes, { path = [], score = 0 } = {}) {
  return [
    { path, score }, ...interestingValves.filter(valve => !path.includes(valve))
      .map(valve => [...path, valve])
      .filter(nextPath => pathDuration(nextPath) <= maxMinutes)
      .flatMap(nextPath => computeAllPaths(maxMinutes, {
        path: nextPath, score: computePathScore(nextPath, maxMinutes),
      })),
  ]
}

async function part1() {
  return bruteForceBestPath().score
}

async function part2() {
  const allPaths = computeAllPaths(26)
    .sort(({ score: s1 }, { score: s2 }) => s2 - s1)

  const bestPaths = allPaths.reduce((best, next, i) => {
    const bestElephant = allPaths.slice(i)
      .filter(({
        path, score,
      }) => (next.score + score > best.score) && !path.some((valve) => next.path.includes(valve)))
      .at(0)

    return bestElephant ? {
      myPath: next,
      elephantPath: bestElephant,
      score: next.score + bestElephant.score,
    } : best
  }, { myPath: [], elephantPath: [], score: 0 })

  return bestPaths.score
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
