import { readInput, sum } from '../utils.mjs';

const WIN = 6
const DRAW = 3
const LOOSE = 0
const SHAPE_SCORE = { ROCK: 1, PAPER: 2, SCISSOR: 3 }
const THEM = { ROCK: 'A', PAPER: 'B', SCISSOR: 'C' }
const ME = { ROCK: 'X', PAPER: 'Y', SCISSOR: 'Z' }
const ME_PART2 = { LOOSE: 'X', DRAW: 'Y', WIN: 'Z' }

const gameScoreTable = [
    { them: THEM.ROCK, me: ME.ROCK, myScore: DRAW + SHAPE_SCORE.ROCK },
    { them: THEM.ROCK, me: ME.PAPER, myScore: WIN + SHAPE_SCORE.PAPER },
    { them: THEM.ROCK, me: ME.SCISSOR, myScore: LOOSE + SHAPE_SCORE.SCISSOR },
    { them: THEM.PAPER, me: ME.ROCK, myScore: LOOSE + SHAPE_SCORE.ROCK },
    { them: THEM.PAPER, me: ME.PAPER, myScore: DRAW + SHAPE_SCORE.PAPER },
    { them: THEM.PAPER, me: ME.SCISSOR, myScore: WIN + SHAPE_SCORE.SCISSOR },
    { them: THEM.SCISSOR, me: ME.ROCK, myScore: WIN + SHAPE_SCORE.ROCK },
    { them: THEM.SCISSOR, me: ME.PAPER, myScore: LOOSE + SHAPE_SCORE.PAPER },
    { them: THEM.SCISSOR, me: ME.SCISSOR, myScore: DRAW + SHAPE_SCORE.SCISSOR },
]

const gameScoreTablePart2 = [
    { them: THEM.ROCK, me: ME_PART2.LOOSE, myScore: LOOSE + SHAPE_SCORE.SCISSOR },
    { them: THEM.ROCK, me: ME_PART2.DRAW, myScore: DRAW + SHAPE_SCORE.ROCK },
    { them: THEM.ROCK, me: ME_PART2.WIN, myScore: WIN + SHAPE_SCORE.PAPER },
    { them: THEM.PAPER, me: ME_PART2.LOOSE, myScore: LOOSE + SHAPE_SCORE.ROCK },
    { them: THEM.PAPER, me: ME_PART2.DRAW, myScore: DRAW + SHAPE_SCORE.PAPER },
    { them: THEM.PAPER, me: ME_PART2.WIN, myScore: WIN + SHAPE_SCORE.SCISSOR },
    { them: THEM.SCISSOR, me: ME_PART2.LOOSE, myScore: LOOSE + SHAPE_SCORE.PAPER },
    { them: THEM.SCISSOR, me: ME_PART2.DRAW, myScore: DRAW + SHAPE_SCORE.SCISSOR },
    { them: THEM.SCISSOR, me: ME_PART2.WIN, myScore: WIN + SHAPE_SCORE.ROCK },
]

async function part1() {
    const rounds = (await readInput(import.meta.url))
        .map(round => gameScoreTable.find(({
                                               them,
                                               me
                                           }) => them === round[0] && me === round[2]))
    return rounds.map(({ myScore }) => myScore).reduce(sum, 0)
}

async function part2() {
    const rounds = (await readInput(import.meta.url))
        .map(round => gameScoreTablePart2.find(({
                                                    them,
                                                    me
                                                }) => them === round[0] && me === round[2]))
    return rounds.map(({ myScore }) => myScore).reduce(sum, 0)
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
