// import input from "./3.json";

{
    const input = [
        [ "R75", "D30", "R83", "U83", "L12", "D49", "R71", "U7", "L72" ],
        [ "U62", "R66", "U55", "R34", "D71", "R55", "D58", "R83" ],
    ];

    // const input = [
    //     ["R98","U47","R26","D63","R33","U87","L62","D20","R33","U53","R51"],
    //     ["U98","R91","D20","R16","D67","R40","U7","R15","U6","R7"  ],
    // ];

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
        distance: number;
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
            default:
                throw "invalid direction: " + direction;
        }
    }

    function getCell(x: number, y: number) {
        const gridX = grid[x] || (grid[x] = {});
        return gridX[y] || (gridX[y] = []);
    }

    interface Intersection {
        x: number;
        y: number;
    }

    let intersections: Intersection[] = [];
        let wires                     = [];

    function drawPath(path: string[], id: number) {
        wires.push(id);

        const pos = {
            x: 0,
            y: 0,
        };

        let distance = -1;

        path.forEach(movement => {
            const action = movement[0];

            if (action === "M" || action === "m") {
                const m = /([-+]?\d+)(?::([-+]?\d+))?/.exec(movement);

                if (m) {
                    const dx = parseInt(m[1]) || 0;
                    const dy = parseInt(m[2]) || 0;

                    if (action === "m") {
                        pos.x += dx;
                        pos.y += dy;
                    } else {
                        pos.x = dx;
                        pos.y = dy;
                    }
                }

                return;
            }

            const delta = getDirection(action.toUpperCase() as Direction);
            let value   = parseInt(movement.substring(1)) * delta.direction;

            if (!value  ) {
                throw "invalid value: " + movement;
            }

            if (Math.sign(value) !== Math.sign(delta.direction)) {
                delta.direction *= -1;
            }

            const start = pos[delta.axis] + delta.direction;
            const end   = start + value;

            function add(x: number, y: number, extremity = 0) {
                const cell = getCell(pos.x, pos.y);

                if (!cell.find(segment => segment.wire === id && segment.distance === distance)) {
                    ++distance;

                    if (cell.length > 0 && distance > 0) {
                        intersections.push({
                            x: pos.x,
                            y: pos.y,
                        });
                    }
                }

                cell.push({ axis: delta.axis, wire: id, extremity, distance });
            }

            add(pos.x, pos.y, delta.direction);

            for (let i = start; i !== end - delta.direction; i += delta.direction) {
                pos[delta.axis] = i;
                add(pos.x, pos.y);
            }

            pos[delta.axis] += delta.direction;

            add(pos.x, pos.y, -delta.direction);
        })
    }

        function withoutSelfIntersection(intersections: Intersection[]) {
            return intersections
                .filter(intersection =>
                    wires
                        .map(wire => !!getCell(intersection.x, intersection.y).find(segment => segment.wire === wire))
                        .reduce((a, b) => a && b, true),
                );
        }

    function getClosestIntersection() {
        return withoutSelfIntersection(intersections).map(value => Math.abs(value.x) + Math.abs(value.y)).sort((a, b) => a - b).find(x => x > 0);
    }

    function getShortestIntersection() {
        function computeSteps(x: number, y: number) {
            const cell = getCell(x, y);

            const distances = [];
            cell.forEach(value => distances[value.wire] = distances[value.wire]
                                                          ? Math.min(distances[value.wire], value.distance)
                                                          : value.distance);

            return distances.reduce((a, b) => a + b);
        }

        return withoutSelfIntersection(intersections).map(value => computeSteps(value.x, value.y)).sort((a, b) => a - b).find(x => x > 0);
    }

    input.forEach(drawPath);

    console.log("closest:", getClosestIntersection());
    console.log("shortest:", getShortestIntersection());


    /** DRAWING */

    if (typeof document !== "undefined") {
        function addElement(tagname: string, parent: HTMLElement = document.body) {
            return parent.appendChild(document.createElement(tagname));
        }

        const inputElement = addElement("textarea") as HTMLInputElement;

        inputElement.addEventListener("input", (ev) => {
            grid          = {};
            intersections = [];
            wires         = [];

            inputElement.value.split('\n').map(x => x.split(",").map(x => x.replace(/\s/g, "")).filter(x => /[A-Z][+-]?\d+/i.test(x))).forEach(drawPath);

            console.log(getClosestIntersection());
        });

        const canvas  = addElement("canvas") as HTMLCanvasElement;
        const context = canvas.getContext("2d", { alpha: false });

        canvas.width  = innerWidth;
        canvas.height = innerHeight;

        document.body.style.overflow = "hidden";
        canvas.style.position        = "absolute";
        canvas.style.left            = "0";
        canvas.style.top             = "0";
        canvas.style.zIndex          = "-1";

        context.imageSmoothingEnabled = false;

        const size   = 4;
        const pad    = 1;
        const stroke = 1;

        document.addEventListener("mousemove", ev => {
            const bounds = canvas.getBoundingClientRect();

            const x = ev.clientX - bounds.x;
            const y = ev.clientY - bounds.y;

            const i = x / (size + pad);
            const j = y / (size + pad);
        });

        window.addEventListener("resize", ev => {
            canvas.width  = innerWidth;
            canvas.height = innerHeight;
        });

        function asArray(obj: {}): number[] {
            return Object.keys(obj).map(x => parseInt(x)).filter(x => !isNaN(x)).sort((a, b) => a - b);
        }

        function computeExtremity(axis: Axis, predicate: (a: number, b: number) => number) {
            let out = 0;

            switch (axis) {
                case Axis.X:
                    for (let x in grid) {
                        out = predicate(out, parseInt(x));
                    }
                    break;
                case Axis.Y:
                    for (let x in grid) {
                        for (let y in grid[x]) {
                            out = predicate(out, parseInt(y));
                        }
                    }
                    break;
                default:
                    throw "invalid axis: " + axis;
            }

            return out * (size + pad);
        }

        function applyTransform() {
            const min = {
                x: computeExtremity(Axis.X, Math.min),
                y: computeExtremity(Axis.Y, Math.min),
            };

            const max = {
                x: computeExtremity(Axis.X, Math.max),
                y: computeExtremity(Axis.Y, Math.max),
            };

            const size = {
                width: max.x - min.x,
                height: max.y - min.y,
            };

            const scale = Math.min(
                Math.min(1, canvas.width / size.width),
                Math.min(1, canvas.height / size.height),
            ) * 0.9;

            context.translate(
                -min.x * scale + (canvas.width - size.width * scale) / 2,
                -min.y * scale + (canvas.height - size.height * scale) / 2,
            );

            context.scale(scale, scale)
        }

        function drawGrid() {
            context.resetTransform();
            context.fillStyle = "white";
            context.fillRect(0, 0, canvas.width, canvas.height);
            applyTransform();

            asArray(grid).forEach(x => {
                asArray(grid[x]).forEach(y => {
                    const node = grid[x][y];

                    const pos = {
                        x: x * (size + pad) + size,
                        y: y * (size + pad) + size,
                    };

                    if (!node) {
                        return;
                    }

                    node.forEach(segment => {
                        const length = segment.extremity ? size / 2 : size;
                        const newPos = { ...pos };

                        {
                            /** center the segment in his cell */
                            const perpendicular = segment.axis === Axis.X ? Axis.Y : Axis.X;
                            newPos[perpendicular] += (size - stroke) / 2;
                        }

                        if (segment.extremity > 0) {
                            newPos[segment.axis] += size * segment.extremity / 2;
                        }

                        if (segment.wire === 0) {
                            context.fillStyle = "red";
                        } else {
                            context.fillStyle = "blue";
                        }

                        const args: [ number, number ] = segment.axis === Axis.X ? [ length, stroke ] : [ stroke, length ];
                        context.fillRect(newPos.x, newPos.y, ...args);
                    });
                });
            });

            requestAnimationFrame(time => drawGrid());
        }

        drawGrid();
    }
}
