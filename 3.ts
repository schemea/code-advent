// import input from "./3.json";

const input = [
    [ "R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72" ],
    [ "U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83" ],
];

// const input = [
//     [ "R8", "U5", "L5", "D3" ],
//     [ "U7", "R6", "D4", "L4" ],
// ];

enum Direction {
    UP    = "U",
    RIGHT = "R",
    DOWN  = "D",
    LEFT  = "L",
}

enum Axis {
    X = "x",
    Y = "y"
}

interface Grid {
    [k: number]: {
        [k: number]: Segment[]
    }
}

interface Segment {
    axis: Axis;
    wire: number;
    extremity: number;
}

let grid: Grid = {};

function getDirection(direction: Direction) {
    switch (direction) {
        case Direction.UP:
            return { axis: Axis.Y, direction: -1 };
        case Direction.RIGHT:
            return { axis: Axis.X, direction: 1 };
        case Direction.DOWN:
            return { axis: Axis.Y, direction: 1 };
        case Direction.LEFT:
            return { axis: Axis.X, direction: -1 };
    }
}

function get(x: number, y: number) {
    const gridX = grid[x] || (grid[x] = {});
    return gridX[y] || (gridX[y] = []);
}

const intersections: { x: number, y: number }[] = [];

function drawPath(path: string[], id: number) {
    const pos = {
        x: 0,
        y: 0,
    };

    path.forEach(movement => {
        const delta = getDirection(movement[0] as Direction);
        const value = parseInt(movement.substring(1)) * delta.direction;

        const start = pos[delta.axis];
        const end   = start + value;

        for (let i = start; i !== end; i += delta.direction) {
            let extremity = 0;

            if (i === start) {
                extremity = delta.direction;
            } else if (i === end - delta.direction) {
                extremity = -delta.direction;
            }

            pos[delta.axis] = i;

            const node = get(pos.x, pos.y);

            if (!node.find(segment => segment.wire === id) && node.length > 0) {
                intersections.push({ x: pos.x, y: pos.y });
            }

            node.push({ axis: delta.axis, wire: id, extremity });
        }
    })
}

function getClosestIntersection() {
    const ans = intersections.map(value => Math.abs(value.x) + Math.abs(value.y)).filter(x => x > 0).sort((a, b) => a - b).find(x => x > 0);
    return ans;
}
drawPath(input[0], 0);
drawPath(input[1], 1);

console.log(getClosestIntersection());


/** DRAWING */

if (document) {
    function addElement(tagname: string, parent: HTMLElement = document.body) {
        return parent.appendChild(document.createElement(tagname));
    }

    const form = addElement("form") as HTMLFormElement;
    const inputElement = addElement("textarea", form) as HTMLInputElement;
    const submit = addElement("input", form) as HTMLInputElement;

    submit.type = "submit";

    form.addEventListener("submit", (ev) => {
        ev.preventDefault();

        grid = {};
       inputElement.value.split('\n').map(x => x.split(",").filter(x => x)).forEach(drawPath);

        console.log(getClosestIntersection());
    });

    const canvas  = addElement("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d");

    canvas.width  = innerWidth;
    canvas.height = innerHeight;

    document.body.style.overflow = "hidden";

    const size   = 10;
    const pad    = 2;
    const stroke = 2;
    const scale  = 1;

    context.translate(0, 300);
    context.scale(scale, scale);

    document.addEventListener("mousemove", ev => {
        const bounds = canvas.getBoundingClientRect();

        const x = ev.clientX - bounds.x;
        const y = ev.clientY - bounds.y;

        const i = x / (size + pad);
        const j = y / (size + pad);
    });

    function asArray(obj: {}): number[] {
        return Object.keys(obj).map(x => parseInt(x)).filter(x => !isNaN(x)).sort((a, b) => a - b);
    }

    function drawGrid() {
        context.save();
        context.resetTransform();
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.restore();

        asArray(grid).forEach(x => {
            asArray(grid[x]).forEach(y => {
                const node = grid[x][y];

                const pos = {
                    x: x * (size + pad) + size,
                    y: y * (size + pad) + size,
                };

                const cOffset = (size - stroke) / 2;

                if (!node) {
                    return;
                }

                node.forEach(segment => {
                    let args = [ segment.extremity ? size / 2 : size, stroke ];

                    const newPos = { ...pos };
                    newPos[segment.axis === Axis.X ? Axis.Y : Axis.X] += cOffset;
                    if (segment.extremity > 0) {
                        newPos[segment.axis] += size * segment.extremity / 2;
                    }

                    if (segment.wire === 0) {
                        context.fillStyle = "red";
                    } else {
                        context.fillStyle = "blue";
                    }

                    // @ts-ignore
                    context.fillRect(newPos.x, newPos.y, ...(segment.axis === Axis.X ? args : args.reverse()));
                });
            });
        });

        requestAnimationFrame(time => drawGrid());
    }

    drawGrid();
}
