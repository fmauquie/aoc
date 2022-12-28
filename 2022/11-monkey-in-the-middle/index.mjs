import { numbers, readInput } from '../../utils.mjs';

function parseOperation(operation) {
    const [_, operator, parsedOperand] = operation.match(/new = old (.) (old|\d+)/)
    const operand = parsedOperand === 'old' ? 'old' : Number(parsedOperand)
    switch (operator) {
        case '+':
            return (old) => old + (operand === 'old' ? old : operand)
        case '*':
            return (old) => old * (operand === 'old' ? old : operand)
        default:
            throw new Error("unknown operator" + operator)
    }
}

async function parseInput() {
    return (await readInput(import.meta.url))
        .reduce((acc, line) => {
            switch (acc.current.lastParsed) {
                case '':
                    acc.current.name = line.slice('Monkey '.length, -1)
                    acc.current.lastParsed = 'Monkey '
                    return acc
                case 'Monkey ':
                    acc.current.items = line.trim().slice('Starting items: '.length).split(', ').map(Number)
                    acc.current.lastParsed = 'Starting items: '
                    return acc
                case 'Starting items: ':
                    acc.current.operation = parseOperation(line.trim().slice('Operation: '.length))
                    acc.current.lastParsed = 'Operation: '
                    return acc
                case 'Operation: ':
                    const divisibleBy = Number(line.trim().slice('Test: divisible by '.length))
                    acc.current.test = (level) => (level % divisibleBy) === 0
                    acc.current.divisibleBy = divisibleBy
                    acc.current.lastParsed = 'Test: divisible by '
                    return acc
                case 'Test: divisible by ':
                    acc.current.true = line.trim().slice('If true: throw to monkey '.length)
                    acc.current.lastParsed = 'If true: throw to monkey '
                    return acc
                case 'If true: throw to monkey ':
                    acc.current.false = line.trim().slice('If false: throw to monkey '.length)
                    acc.current.lastParsed = 'If false: throw to monkey '
                    acc.modulo = acc.modulo * acc.current.divisibleBy
                    acc.monkeys[acc.current.name] = acc.current
                    acc.names.push(acc.current.name)
                    return acc
                case 'If false: throw to monkey ':
                    acc.current = {
                        lastParsed: '',
                        name: 0,
                        items: [],
                        operation: () => {
                        },
                        test: () => {
                        },
                        true: 0,
                        false: 0,
                    }
                    acc.current.lastParsed = ''
                    return acc
            }

        }, {
            names: [],
            modulo: 1,
            current: {
                lastParsed: '',
                name: '0',
                items: [],
                operation: () => {
                },
                test: () => {
                },
                true: '0',
                false: '0',
                divisibleBy: 1,
            },
            monkeys: {}
        })
}

function turn(initialMonkeys, monkeyName, manageWorry) {
    const initialMonkey = initialMonkeys[monkeyName]
    return initialMonkey.items.reduce((monkeys, item) => {
        const inspect = initialMonkey.operation(item)
        const bored = manageWorry(inspect)
        const testResult = initialMonkey.test(bored)
        const toMonkey = monkeys[initialMonkey[testResult]]
        return {
            ...monkeys,
            [toMonkey.name]: {
                ...toMonkey,
                items: [...toMonkey.items, bored]
            }
        }
    }, { ...initialMonkeys, [monkeyName]: { ...initialMonkey, items: [] } })
}

function round({ monkeys, names, inspected, divide }, manageWorry) {
    return names.reduce((acc, name) => {
        return ({
            monkeys: turn(acc.monkeys, name, manageWorry),
            names: acc.names,
            inspected: { ...acc.inspected, [name]: acc.inspected[name] + acc.monkeys[name].items.length }
        });
    }, {
        monkeys,
        names,
        inspected
    })
}

async function part1() {
    const input = await parseInput()
    const after20rounds = Array.from(new Array(20)).reduce((acc, _) => round(acc, (worry) => Math.floor(worry / 3)), {
        monkeys: input.monkeys,
        names: input.names,
        inspected: input.names.reduce((acc, name) => ({
            ...acc,
            [name]: 0
        }), {})
    })

    return Object.values(after20rounds.inspected).sort(numbers).reverse().slice(0, 2).reduce((acc, value) => acc * value, 1)
}

async function part2() {
    const input = await parseInput()
    const after10000rounds = Array.from(new Array(10_000)).reduce((acc, _) => round(acc, (worry) => worry % input.modulo), {
        monkeys: input.monkeys,
        names: input.names,
        inspected: input.names.reduce((acc, name) => ({
            ...acc,
            [name]: 0
        }), {})
    })

    return Object.values(after10000rounds.inspected).sort(numbers).reverse().slice(0, 2).reduce((acc, value) => acc * value, 1)
}

console.log(await part1().catch(console.error))
console.log(await part2().catch(console.error))
