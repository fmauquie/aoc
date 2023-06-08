import fs from "node:fs/promises"
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

function logMinute(minute, position, openedValves, releasing) {
  console.log(`---Minute ${minute + 1}; Position: ${position}---`)
  if (openedValves.length === 0) {
    console.log("No valves are open.")
  } else if (openedValves.length === 1) {
    console.log(`Valve ${openedValves.join(", ")} is open, releasing ${releasing} pressure.`)
  } else {
    console.log(`Valves ${openedValves.join(", ")} are open, releasing ${releasing} pressure.`)
  }
}

function computePathScore(path = [], log = false) {
  let position = "AA"
  let released = 0
  let minutes = 0

  path.forEach((valve, index) => {
    if (minutes === 30) {
      return
    }

    const releasing = path.slice(0, index)
      .map(name => valvesByName[name].rate)
      .reduce(sum, 0)
    const toPosition = shortestPath(position, valve)

    const nbHops = Math.min(toPosition.length, 30 - minutes)
    if (log) {
      for (let i = 0; i < nbHops; i++) {
        logMinute(minutes + i, toPosition[i - 1] ?? position, path.slice(0, index), releasing)
        console.log((`Moving to ${toPosition[i]}, target ${valve}.`))
      }
    }

    position = valve
    minutes += nbHops
    released += releasing * nbHops

    if (minutes < 30) {
      minutes++
      released += releasing
      if (log) {
        logMinute(minutes - 1, position, path.slice(0, index), releasing)
        console.log(`Opening valve ${position}.`)
      }
    }
  })

  const releasing = path.map(name => valvesByName[name].rate)
    .reduce(sum, 0)

  if (log) {
    for (let i = 0; i < 30 - minutes; i++) {
      logMinute(minutes + i, position, path, releasing)
    }
  }

  return released += releasing * (30 - minutes)
}

const interestingValves = valves.filter(({ rate }) => rate > 0)
  .map(({ name }) => name)

function bestChoice(c1, c2, order) {
  if (order === 0) {
    return "==="
  } else if (order < 0) {
    return c2
  } else {
    return c1
  }
}

function pathDuration(path) {
  return path.reduce((acc, valve, i) => acc + shortestPath(path[i - 1] ?? "AA", valve).length, 0) + path.length
}

function nextValves(position, openedValves) {
  const nbMinutesRemaining = 30 - pathDuration(openedValves)

  function compareExpectedRelease(v1, v2) {
    if (v1.distance === v2.distance) {
      console.log(v1, v2, "eq", "Best", bestChoice(v1.name, v2.name, v1.rate - v2.rate))
      return v1.rate - v2.rate
    } else if (v1.distance < v2.distance) {
      const order = v1.rate * (v2.distance - v1.distance + nbMinutesRemaining) - v2.rate
      console.log(v1, v2, "<", order, "Best", bestChoice(v1.name, v2.name, order))
      return order
    } else {
      const order = v1.rate - v2.rate * (v1.distance - v2.distance + 1)
      console.log(v1, v2, ">", order, "Best", bestChoice(v1.name, v2.name, order))
      return order
    }
  }

  return interestingValves
    .filter((valve) => !openedValves.includes(valve))
    .map(valve => ({
      name: valve,
      rate: valvesByName[valve].rate,
      distance: shortestPath(position, valve).length,
    }))
    .filter(({ distance }) => distance + 1 < nbMinutesRemaining)
    .sort(compareExpectedRelease)
    .map(({ name }) => name)
}

function bruteForceBestPath({ path = [], score = 0 } = {}) {
  return interestingValves.filter(valve => !path.includes(valve))
    .map(valve => [...path, valve])
    .filter(nextPath => pathDuration(nextPath) < 30)
    .map(nextPath => bruteForceBestPath({
      path: nextPath, score: computePathScore(nextPath),
    }))
    .reduce((acc, next) => next.score > acc.score ? next : acc, { path, score })
}

async function part1() {
  return bruteForceBestPath().score
}

async function toGraphviz() {
  await fs.writeFile(new URL("graphviz", import.meta.url), `digraph {
  ${interestingValves
    .map(valve => `${valve} [label="${valve} (${valvesByName[valve].rate})"];`)
    .join("\n  ")}
  ${valves
    .flatMap(({ name, next }) => next
      .map(nextValve => `${name} -> ${nextValve};`))
    .join("\n  ")}
}`)
}

async function part2() {
  // return (await readInput(import.meta.url))
}

console.log(await part1().catch(console.error))
/*
console.log(await part2().catch(console.error))
*/
