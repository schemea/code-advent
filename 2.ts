import program from "./2.json";

enum OP {
    ADD      = 1,
    MULTIPLY = 2,
    FINISHED = 99
}

enum Enum {
    B = 0b01,
    C = 0b10
}

function execOP(memory: number[], offset: number): number {
    const op = memory[offset] as OP;
    offset++;

    switch (op) {
        case OP.ADD: {
            const [ a, b, out ] = memory.slice(offset, offset + 3);

            memory[out] = memory[a] + memory[b];
            offset += 3;
            break;
        }
        case OP.MULTIPLY: {
            const [ a, b, out ] = memory.slice(offset, offset + 3);

            memory[out] = memory[a] * memory[b];
            offset += 3;
            break;
        }
        case OP.FINISHED: {
            offset = memory.length;
            break;
        }
        default:
            console.error(`Unknown operation: ${ op }`);
    }

    return offset;
}

function run(noun: number, verb: number) {
    let offset  = 0;
    const memory = [ ...program ];

    memory[1] = noun;
    memory[2] = verb;

    while ((offset = execOP(memory, offset)) < memory.length);

    return memory[0];
}

{
    const output = 19690720;

    for (let noun = 0; noun < 100; noun++) {
        for (let verb = 0; verb < 100; verb++) {
            if (run(noun, verb) === output) {
                console.log("noun", noun);
                console.log("verb", verb);
                console.log("ans ", 100 * noun + verb);
            }
        }
    }
}
