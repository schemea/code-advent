{
    const input = {
        min: [ 2, 3, 1, 8, 3, 2 ],
        max: [ 7, 6, 7, 3, 4, 6 ],
    };

    const length = 6;
    const DOUBLE_ONLY = true;

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

    function first<T>(arr: T[]): T | undefined {
        return arr[0];
    }

    function canBeSuperiorToMax(password: number[]) {
        return password.reduce((boolean, digit, index) => boolean && digit === input.max[index], true);
    }

    function canBeInferiorToMin(password: number[]) {
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

        if (DOUBLE_ONLY) {
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
        } else {
            if (password.length === length - 1 && !hasDoubleOrMore(password)) {
                out = [ last(password) ];
            }
        }

        if (canBeInferiorToMin(password)) {
            out = out.filter(value => value >= min(password))
        }

        if (canBeSuperiorToMax(password)) {
            out = out.filter(value => value <= max(password))
        }

        return out;
    }

    function computePossiblePasswords(password: number[] = []): number[][] {
        if (password.length === 5) {
            return getPossibleDigits(password).map(digit => [ ...password, digit ]);
        } else {
            return [].concat(...getPossibleDigits(password).map(digit => computePossiblePasswords([ ...password, digit ])));
        }
    }

    const possibilities = computePossiblePasswords();

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
            if (!hasDouble(password)) error();
            /** never decrease */
            if (password.some((digit, index) => password[index - 1] && digit < password[index - 1])) error();
        });
    }

    /** OUTPUT */

    console.log(possibilities.length);

    debugger;
}

