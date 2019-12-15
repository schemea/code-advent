import readline from "readline";
import intcode from "./5.json";
// const intcode = [
//     1, 9, 10, 3,
//     2, 3, 11, 0,
//     99,
//     30, 40, 50,
// ];
// const intcode = [ 1002, 4, 3, 4, 33 ];

// const intcode = [
//     3, 21, 1008, 21, 8, 20, 1005, 20, 22, 107, 8, 21, 20, 1006, 20, 31,
//     1106, 0, 36, 98, 0, 0, 1002, 21, 125, 20, 4, 20, 1105, 1, 46, 104,
//     999, 1105, 1, 46, 1101, 1000, 1, 20, 4, 20, 1105, 1, 46, 98, 99,
// ];

enum OP {
    ADD       = 1,
    MULTIPLY  = 2,
    INPUT     = 3,
    OUTPUT    = 4,
    JMP_TRUE  = 5,
    JMP_FALSE = 6,
    LESS_THAN = 7,
    EQUALS    = 8,
    FINISHED  = 99
}

enum Mode {
    POSITION  = 0,
    IMMEDIATE = 1
}

class Program {
    private readonly rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    memory: number[] = [];
    offset: number   = 0;
    exited: boolean  = false;

    oninput = () => {
        return new Promise<number>((resolve, reject) => {
            this.rl.question("System ID?  ", value => resolve(parseInt(value)));
        });
    };

    onoutput = console.log;

    get(position: number) {
        return this.memory[position];
    }

    set(position: number, value: number) {
        return this.memory[position] = value;
    }

    constructor(public readonly intcode: (number | string)[]) {
        this.memory = intcode.map(value => typeof value === "string" ? parseInt(value) : value);
    }

    jump(position: number) {
        this.offset = position;
    }

    read(len?: 1): number;
    read(len: number): number[];
    read(len: number = 1) {
        const buffer = this.memory.slice(this.offset, this.offset + len);
        this.offset += buffer.length;
        return len === 1 ? buffer[0] : buffer;
    }
}

class Operation {
    address: number;
    code: OP;
    modes: Mode[];
    parameters: number[];
    offset = 0;

    // @ts-ignore
    read(len?: 1): number;
    read(len: number): number[];
    read(len: number = 1) {
        let parameters = program.read(len);

        parameters = (typeof parameters === "number" ? [ parameters ] : parameters).map(parameter => {
            const mode = this.modes[this.offset] || Mode.POSITION;

            if (typeof parameter !== "number") {
                throw "invalid parameter: " + parameter;
            }

            switch (mode) {
                case Mode.POSITION:
                    parameter = program.get(parameter);
                    break;
                default:
                    break;
            }

            this.offset++;

            return parameter;
        });

        return len === 1 ? parameters[0] : parameters;
    }

    readPointer() {
        this.offset++;
        return program.read();
    }

    write(value: number) {
        if (isNaN(value)) {
            debugger;
        }
        const position = program.read();
        this.offset++;
        program.set(position, value);

        if (this.address === position) {
            program.jump(this.address);
        }
    }

    constructor(public readonly program: Program) {
        this.address = program.offset;
        const opcode = program.read().toString();
        this.code    = parseInt(opcode.substring(opcode.length - 2)) as OP;
        this.modes   = [ ...opcode.substring(0, opcode.length - 2) ].map(value => parseInt(value)).reverse();
    }
}

async function runOperation(program: Program) {
    const operation = new Operation(program);

    switch (operation.code) {
        case OP.ADD: {
            const [ a, b ] = operation.read(2);

            operation.write(a + b);
            break;
        }
        case OP.MULTIPLY: {
            const [ a, b ] = operation.read(2);

            operation.write(a * b);
            break;
        }
        case OP.FINISHED: {
            program.exited = true;
            break;
        }

        case OP.INPUT:
            operation.write(await program.oninput());
            break;
        case OP.OUTPUT:
            program.onoutput(operation.read());
            break;

        case OP.JMP_TRUE: {
            const [ condition, jmp ] = operation.read(2);
            if (condition) program.jump(jmp);
            break;
        }

        case OP.JMP_FALSE: {
            const [ condition, jmp ] = operation.read(2);
            if (!condition) program.jump(jmp);
            break;
        }

        case OP.LESS_THAN:
            operation.write(operation.read() < operation.read() ? 1 : 0);
            break;

        case OP.EQUALS:
            operation.write(operation.read() === operation.read() ? 1 : 0);
            break;

        default:
            console.error(`Unknown operation: ${ operation.code }`);
    }
}

const program = new Program(intcode);

(async function () {
    while (!program.exited) {
        await runOperation(program);
    }

    console.log(program.memory[0]);
})().then(value => process.exit());
