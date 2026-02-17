const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;

let gameState = "menu";

let player = {
    x: MAP_WIDTH / 2,
    y: MAP_HEIGHT / 2,
    radius: 18,
    speed: 4
};

let keys = {};
let mouse = { x: 0, y: 0, down: false };

document.addEventListener("keydown", e => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", e => keys[e.key.toLowerCase()] = false);

canvas.addEventListener("mousemove", e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});

canvas.addEventListener("mousedown", () => mouse.down = true);
canvas.addEventListener("mouseup", () => mouse.down = false);

canvas.addEventListener("click", () => {
    if (gameState === "menu") gameState = "playing";
});

let bullets = [];
let zombies = [];

function spawnZombie() {
    zombies.push({
        x: Math.random() * MAP_WIDTH,
        y: Math.random() * MAP_HEIGHT,
        radius: 16,
        speed: 1.2
    });
}

for (let i = 0; i < 8; i++) spawnZombie();

function shoot() {
    let angle = Math.atan2(mouse.y - canvas.height/2, mouse.x - canvas.width/2);

    bullets.push({
        x: player.x,
        y: player.y,
        dx: Math.cos(angle) * 10,
        dy: Math.sin(angle) * 10,
        radius: 4
    });
}

function update() {

    if (gameState !== "playing") return;

    let vx = 0;
    let vy = 0;

    if (keys["w"]) vy -= 1;
    if (keys["s"]) vy += 1;
    if (keys["a"]) vx -= 1;
    if (keys["d"]) vx += 1;

    let length = Math.hypot(vx, vy);
    if (length > 0) {
        vx /= length;
        vy /= length;
    }

    player.x += vx * player.speed;
    player.y += vy * player.speed;

    player.x = Math.max(player.radius, Math.min(MAP_WIDTH - player.radius, player.x));
    player.y = Math.max(player.radius, Math.min(MAP_HEIGHT - player.radius, player.y));

    if (mouse.down) shoot();

    bullets.forEach((b, i) => {
        b.x += b.dx;
        b.y += b.dy;

        zombies.forEach((z, zi) => {
            let dist = Math.hypot(b.x - z.x, b.y - z.y);
            if (dist < z.radius) {
                zombies.splice(zi, 1);
                bullets.splice(i, 1);
            }
        });
    });

    zombies.forEach(z => {
        let angle = Math.atan2(player.y - z.y, player.x - z.x);
        z.x += Math.cos(angle) * z.speed;
        z.y += Math.sin(angle) * z.speed;
    });
}

function drawMenu() {

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    ctx.textAlign = "center";

    ctx.font = "60px Arial";
    ctx.fillText("Zombie Survival", canvas.width/2, canvas.height/2 - 50);

    ctx.font = "30px Arial";
    ctx.fillText("PLAY", canvas.width/2, canvas.height/2 + 10);

    ctx.font = "18px Arial";
    ctx.fillText("Made by BananaMan5902", canvas.width/2, canvas.height - 30);
}

function drawGame() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const offsetX = player.x - canvas.width/2;
    const offsetY = player.y - canvas.height/2;

    ctx.fillStyle = "#3e8f2b";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Player
    const px = canvas.width/2;
    const py = canvas.height/2;

    ctx.fillStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.arc(px+3, py+5, player.radius, 0, Math.PI*2);
    ctx.fill();

    let gradP = ctx.createRadialGradient(px-5, py-5, 5, px, py, player.radius);
    gradP.addColorStop(0, "#4a90ff");
    gradP.addColorStop(1, "#0d47a1");

    ctx.fillStyle = gradP;
    ctx.beginPath();
    ctx.arc(px, py, player.radius, 0, Math.PI*2);
    ctx.fill();

    let angle = Math.atan2(mouse.y - py, mouse.x - px);

    ctx.strokeStyle = "black";
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px + Math.cos(angle)*25, py + Math.sin(angle)*25);
    ctx.stroke();

    // Bullets
    ctx.fillStyle = "yellow";
    bullets.forEach(b => {
        ctx.beginPath();
        ctx.arc(b.x - offsetX, b.y - offsetY, b.radius, 0, Math.PI*2);
        ctx.fill();
    });

    // Zombies
    zombies.forEach(z => {

        let zx = z.x - offsetX;
        let zy = z.y - offsetY;

        ctx.fillStyle = "rgba(0,0,0,0.25)";
        ctx.beginPath();
        ctx.arc(zx+2, zy+3, z.radius, 0, Math.PI*2);
        ctx.fill();

        let gradZ = ctx.createRadialGradient(zx-4, zy-4, 4, zx, zy, z.radius);
        gradZ.addColorStop(0, "#66bb6a");
        gradZ.addColorStop(1, "#1b5e20");

        ctx.fillStyle = gradZ;
        ctx.beginPath();
        ctx.arc(zx, zy, z.radius, 0, Math.PI*2);
        ctx.fill();
    });
}

function gameLoop() {

    if (gameState === "menu") {
        drawMenu();
    } else {
        update();
        drawGame();
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
