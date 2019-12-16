enum Mode {
    PART_ONE,
    PART_TWO,
}

function getPossiblePasswords(range: { min: number, max: number }, mode: Mode = Mode.PART_TWO) {
    function asArray(value: number) {
        return [ ...value.toString() ].map(digit => parseInt(digit));
    }

    const input = {
        min: asArray(range.min),
        max: asArray(range.max),
    };

    const length = 6;

    function hasDouble(password: number[]): boolean {
        return password.some((value, index) => value === password[index + 1] && value !== password[index + 2] && value !== password[index - 1]);
    }

    function hasDoubleOrMore(password: number[]) {
        return password.some((value, index) => value === password[index + 1])
    }

    function getDoublePosition(password: number[]) {
        let digit: number;
        let index = -1;

        for (let i = 0; i < password.length; i++) {
            const value = password[i];
            if (value !== digit) {
                if (index !== -1 && i - index > 1) {
                    return index;
                } else {
                    digit = value;
                    index = i;
                }
            } else if (i - index > 1) {
                index = -1;
            }
        }

        return index < password.length - 1 ? index : -1;
    }

    function last<T>(arr: T[]): T | undefined {
        return arr[arr.length - 1];
    }

    function beforeLast<T>(arr: T[]): T | undefined {
        return arr[arr.length - 2];
    }

    function canBeMoreThanMax(password: number[]) {
        return password.reduce((boolean, digit, index) => boolean && digit === input.max[index], true);
    }

    function canBeLessThanMin(password: number[]) {
        return password.reduce((boolean, digit, index) => boolean && digit === input.min[index], true);
    }

    function min(password: number[]) {
        return input.min[password.length];
    }

    function max(password: number[]) {
        return input.max[password.length];
    }

    function asNumber(password: number[]): number {
        return password.reduce((value, digit, index) => value + digit * 10 ** (length - 1 - index), 0)
    }

    function getPossibleDigits(password: number[]) {
        let out: number[] = [];

        for (let i = last(password) || min(password); i < 10; i++) {
            out.push(i);
        }

        switch (mode) {
            case Mode.PART_ONE:
                if (password.length === length - 1 && !hasDoubleOrMore(password))
                    out = [ last(password) ];
                break;
            case Mode.PART_TWO: {
                const doublePosition = getDoublePosition(password);
                if (doublePosition === length - 3) {
                    out = out.filter(value => value !== last(password));
                } else if (password.length === length - 1 && doublePosition === -1) {
                    if (beforeLast(password) === last(password)) {
                        out = []
                    } else {
                        out = [ last(password) ];
                    }
                }
                break;
            }
        }

        if (canBeLessThanMin(password)) {
            out = out.filter(value => value >= min(password))
        }

        if (canBeMoreThanMax(password)) {
            out = out.filter(value => value <= max(password))
        }

        return out;
    }

    function getPossiblePasswords(password: number[] = []): number[][] {
        if (password.length === 5) {
            return getPossibleDigits(password).map(digit => [ ...password, digit ]);
        } else {
            return [].concat(...getPossibleDigits(password).map(digit => getPossiblePasswords([ ...password, digit ])));
        }
    }

    const possibilities = getPossiblePasswords();

    /** CHECKING */
    {
        const min = asNumber(input.min);
        const max = asNumber(input.max);

        possibilities.forEach(password => {
            const value = asNumber(password);

            function error() {
                debugger;
                console.error("invalid password:", value);
            }

            if (password.some(isNaN)) error();
            if (isNaN(value)) error();
            if (password.length !== length) error();
            if (value < min) error();
            if (value > max) error();

            switch (mode) {
                case Mode.PART_ONE:
                    if (!hasDoubleOrMore(password)) error();
                    break;
                case Mode.PART_TWO:
                    if (!hasDouble(password)) error();
                    break;
            }

            /** never decrease */
            if (password.some((digit, index) => password[index - 1] && digit < password[index - 1])) error();
        });
    }

    return possibilities;
}

const result = getPossiblePasswords({
    min: 231832,
    max: 767346,
}, Mode.PART_TWO);

console.log(result.length);
