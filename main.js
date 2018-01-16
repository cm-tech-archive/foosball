import TWEEN from "@tweenjs/tween.js";
import * as PIXI from "pixi.js";

let w = window.innerWidth;
let h = window.innerHeight;

const r = [14, 8];
if (w / r[0] < h / r[1]) h = r[1] * w / r[0];
else w = r[0] * h / r[1];

const pallettes = [
    [0x85D600, 0xDE4A1F, 0xc4ff66, 0xe98263],
    [0x26B8F2, 0xF29A21, 0x90dbf9, 0xf7c47d]
];
const myPallette = pallettes[Math.floor(Math.random() * pallettes.length)];
const colors = '00101011'.split('').map(index => myPallette[index]);

const app = new PIXI.Application(w, h, {
    backgroundColor: 0xeeeeee,
    antialias: true
});
document.body.appendChild(app.view);

app.stage.interactive = true;

const graphics = new PIXI.Graphics();
app.stage.addChild(graphics);

const averageGuy = {
    width: h / 32,
    height: h / 16,
};
let guys = [1, 2, 3, 4, 4, 3, 2, 1].map((amount, column) => {
    return [...Array(amount).keys()].map(y => {
        return {
            offsetY: h * (y + 1) / (amount + 1) - h / 2,
            x: column / 7 * (w * 6 / 10) + w * 2 / 10,
            y: 0,
            width: averageGuy.width,
            height: averageGuy.height,
            color: colors[column]
        };
    });
});

const ball = {
    x: w / 2,
    y: h,
    speed: 9,
    decay: 0.99,
    maxSpeed: 10,
    minSpeed: 7,
    radius: h / 70,
    collide: true,
    alpha: 1
};
const ballVel = (vx, vy) => {
    const length = Math.sqrt(vx ** 2 + vy ** 2);

    ball.vx = vx / length;
    ball.vy = vy / length;
};
const vy = -Math.random();
const vx = (Math.random() * 0.25 + 0.005) * vy;
ballVel((Math.random() >= 0.5 ? 1 : -1) * vx, vy);

const redScore = new Array(5).fill().map(() => ({ scale: 0 }));
const blueScore = new Array(5).fill().map(() => ({ scale: 0 }));

let redDirection = 0;
let blueDirection = 0;
let redOffset = new Array(8).fill(h / 2);
let blueOffset = new Array(8).fill(h / 2);

window.addEventListener("keydown", a => {
    if (38 == a.keyCode) redDirection = -1;
    if (87 == a.keyCode) blueDirection = -1;

    if (40 == a.keyCode) redDirection = 1;
    if (83 == a.keyCode) blueDirection = 1;
});

window.addEventListener("keyup", a => {
    if (38 == a.keyCode && -1 == redDirection) redDirection = 0;
    if (87 == a.keyCode && -1 == blueDirection) blueDirection = 0;

    if (40 == a.keyCode && 1 == redDirection) redDirection = 0;
    if (83 == a.keyCode && 1 == blueDirection) blueDirection = 0;
});

const move = () => {
    ball.x += ball.vx * ball.speed * h / 1000;
    ball.y += ball.vy * ball.speed * h / 1000;
    ball.speed = Math.max(ball.speed * ball.decay, ball.minSpeed);
    if (ball.y - ball.radius > h / 3 && ball.y + ball.radius < h * 2 / 3) {
        if (ball.x + ball.radius > w * 0.9) {
            const redZero = redScore.find(element => element.scale == 0);
            new TWEEN.Tween(redZero).to({
                scale: 0.9
            }, 1000)
                .easing(TWEEN.Easing.Bounce.Out)
                .start();

            new TWEEN.Tween(ball).to({
                alpha: 0,
                x: w * 0.9 - ball.radius,
                y: h / 2
            }, 1000).chain(
                new TWEEN.Tween(ball).to({
                    alpha: 1,
                    x: w / 2,
                    y: h
                }, 1000).onComplete(() => {
                    const vy = -Math.random();
                    const vx = (Math.random() * 0.25 + 0.005) * vy;
                    ballVel((Math.random() >= 0.5 ? 1 : -1) * vx, vy);
                })).start();
        }
        if (ball.x - ball.radius < w * 0.1) {
            const blueZero = blueScore.find(element => element.scale == 0);

            new TWEEN.Tween(blueZero).to({
                scale: 0.9
            }, 1000)
                .easing(TWEEN.Easing.Bounce.Out)
                .start();

            new TWEEN.Tween(ball).to({
                alpha: 0,
                x: w * 0.1 + ball.radius,
                y: h / 2
            }, 1000).chain(
                new TWEEN.Tween(ball).to({
                    alpha: 1,
                    x: w / 2,
                    y: h
                }, 1000).onComplete(() => {
                    const vy = -Math.random();
                    const vx = (Math.random() * 0.25 + 0.005) * vy;
                    ballVel((Math.random() >= 0.5 ? 1 : -1) * vx, vy);
                })).start();
        }
    }

    const wallBounce = 8;
    if (ball.y - ball.radius < 0) {
        ball.vy = -ball.vy;
        ball.y = 0 + ball.radius;
        ball.speed = wallBounce;
    }
    if (ball.y + ball.radius > h) {
        ball.vy = -ball.vy;
        ball.y = h - ball.radius;
        ball.speed = wallBounce;
    }
    if (ball.x - ball.radius < w * 0.1) {
        ball.vx = -ball.vx;
        ball.x = w * 0.1 + ball.radius;
        ball.speed = wallBounce;
    }
    if (ball.x + ball.radius > w * 0.9) {
        ball.vx = -ball.vx;
        ball.x = w * 0.9 - ball.radius;
        ball.speed = wallBounce;
    }

    redOffset = redOffset.map((current, index) => {
        const amount = [3, 3, 4, 5, 5, 4, 3, 3][index];
        current += redDirection / amount * h / 40;
        current = Math.min(Math.max(current, h / 2 - h / amount + averageGuy.height), h / 2 + h / amount - averageGuy.height);
        return current;
    });

    blueOffset = blueOffset.map((current, index) => {
        const amount = [3, 3, 4, 5, 5, 4, 3, 3][index];
        current += blueDirection / amount * h / 40;
        current = Math.min(Math.max(current, h / 2 - h / amount + averageGuy.height), h / 2 + h / amount - averageGuy.height);
        return current;
    });
    guys = guys.map((a, column) => a.map(guy => {
        let movement;
        if (guy.color == myPallette[0]) {
            guy.y = guy.offsetY + redOffset[column];
            movement = 1;
        } else if (guy.color == myPallette[1]) {
            guy.y = guy.offsetY + blueOffset[column];
            movement = -1;
        }

        if (ball.x - ball.radius < guy.x + guy.width / 2 &&
            ball.x + ball.radius > guy.x - guy.width / 2 &&
            ball.y - ball.radius < guy.y + guy.height / 2 &&
            ball.y + ball.radius > guy.y - guy.height / 2) {
            new TWEEN.Tween(guy).to({
                width: averageGuy.width * 2
            }, 100).chain(
                new TWEEN.Tween(guy).to({
                    width: averageGuy.width
                }, 100)).start();

            if (guy.collide) {
                ballVel(
                    Math.abs(ball.x - guy.x + guy.width / 2) * movement,
                    ball.y - guy.y + guy.height / 2
                );
                ball.speed = ball.maxSpeed;
                guy.collide = false;
            }
        } else (guy.collide = true);
        return guy;
    }));
};

const draw = () => {
    graphics.clear();
    graphics.lineStyle(0);
    graphics.beginFill(0x888888, ball.alpha);
    graphics.drawCircle(ball.x, ball.y, ball.radius);
    graphics.endFill();

    graphics.beginFill(0x888888, 1);
    graphics.drawRoundedRect(w * 0.1 - w / 80, h / 3, w / 40, h / 3, w / 160);
    graphics.drawRoundedRect(w * 0.9 - w / 80, h / 3, w / 40, h / 3, w / 160);
    graphics.endFill();
    graphics.beginFill(0xeeeeee, 1);
    graphics.drawRect(0, h / 3 + w / 80, w * 0.1, h / 3 - w / 40);
    graphics.drawRect(w * 0.9, h / 3 + w / 80, w * 0.1, h / 3 - w / 40);
    graphics.endFill();

    [].concat(...guys).map(guy => {
        graphics.beginFill(guy.color, 1);
        graphics.drawRoundedRect(guy.x - guy.width / 2, guy.y - guy.height / 2, guy.width, guy.height, guy.width / 2);
        graphics.endFill();
    });

    const scale = 1;
    graphics.beginFill(0xFFFFFF, 1);
    for (const i in new Array(5).fill()) {
        graphics.drawRoundedRect(
            w * 0.96 - h * 0.02 - w * 0.04 * scale,
            i * (0.005 * w - 0.2 * h) + scale * (w * 0.005 - h * 0.1) + (0.92 * h) - (0.025 * w),
            w * 0.08 * scale, scale * (h * 0.2 - w * 0.01), 10);
        graphics.drawRoundedRect(
            w * 0.04 + h * 0.02 - w * 0.04 * scale,
            i * (0.005 * w - 0.2 * h) + scale * (w * 0.005 - h * 0.1) + (0.92 * h) - (0.025 * w),
            w * 0.08 * scale, scale * (h * 0.2 - w * 0.01), 10);
    }
    graphics.endFill();

    graphics.beginFill(myPallette[2], 1);
    redScore.map((element, index) => {
        const s = element.scale;

        graphics.drawRoundedRect(
            w * 0.04 + h * 0.02 - w * 0.04 * s,
            index * (0.005 * w - 0.2 * h) + ((0.92 * h) - (0.025 * w)) - s * (h * 0.1 - w * 0.005),
            w * 0.08 * s, s * (h * 0.2 - w * 0.01), 10 * s);

    });
    graphics.endFill();

    graphics.beginFill(myPallette[3], 1);
    blueScore.map((element, index) => {
        const s = element.scale;
        graphics.drawRoundedRect(
            w * 0.96 - h * 0.02 - w * 0.04 * s,
            index * (0.005 * w - 0.2 * h) + ((0.92 * h) - (0.025 * w)) - s * (h * 0.1 - w * 0.005),
            w * 0.08 * s, s * (h * 0.2 - w * 0.01), 10 * s);
    });
    graphics.endFill();
};

app.ticker.add(() => {
    TWEEN.update();
    move();
    draw();
});
