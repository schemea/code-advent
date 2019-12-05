import input from "./1.json"

// const input = temp1.innerText.split("\n").map(x => x.trim()).filter(x => x);
console.log("items:", input.length);

let getFuel = mass => Math.floor(mass / 3) - 2;

function computeFuel(mass) {
    let fuel = getFuel(mass);
    let diff = fuel;

    for (; ;) {
        diff = getFuel(diff);
        if (diff > 0) {
            fuel += diff;
        } else {
            break;
        }
    }

    return fuel;
}

const out = input.map(computeFuel).reduce((a, b) => a + b);

console.log(out);
