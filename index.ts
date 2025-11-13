import { Global } from "./src/core/global";
import { Camera } from "./src/core/camera";
import { Entity } from "./src/core/entity";
import { Input } from "./src/core/input";

const camera = new Camera(
    0, 0,
    10,
    10
);



// Register key handlers
Input.onKey('w', () => {

});

Input.onKey('a', () => {

});

Input.onKey('s', () => {

});

Input.onKey('d', () => {

});

Input.onKey('q', () => {
    process.exit(0);
})

async function main() {

}

main();
