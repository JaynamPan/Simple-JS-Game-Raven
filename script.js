const canvas = document.getElementById("canvas1");
const ctx = canvas.getContext("2d");
let CANVAS_WIDTH = canvas.width = window.innerWidth;
let CANVAS_HEIGHT = canvas.height = window.innerHeight;

//canvas 2
const canvas2 = document.getElementById("canvas2");
const ctx2 = canvas2.getContext("2d", {
    antialias: true,
    willReadFrequently: true,
});
let CANVAS_WIDTH2 = canvas2.width = window.innerWidth;
let CANVAS_HEIGHT2 = canvas2.height = window.innerHeight;

let timeToNext = 0;
let ravenInterval = 500;
let lastTime = 0;

let ravens = []
let score = 0;
ctx.font = "50px Impact";
class Raven {
    constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.3 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markDelete = false;
        this.image = new Image();
        this.image.src = "./raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColor = [Math.floor(Math.random() * 255),
        Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.color = "rgb(" + this.randomColor[0] + "," + this.randomColor[1] + "," +
            this.randomColor[2] + ")";


    }
    update(dTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = -this.directionY;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.spriteWidth) {
            this.markDelete = true;
        }
        this.timeSinceFlap += dTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            } else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
        }



    }

    draw() {
        ctx2.fillStyle = this.color;
        ctx2.fillRect(this.x, this.y, this.width, this.height);

        ctx.drawImage(this.image, this.spriteWidth * this.frame, 0, this.spriteWidth,
            this.spriteHeight, this.x, this.y, this.width,
            this.height);
    }
}

let explosions = [];
class Explosion {
    constructor(x, y, size) {
        this.image = new Image();
        this.image.src = "./boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = "./boom.wav";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markDelete = false;
    }
    update(dTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += dTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            if (this.frame > 5) this.markDelete = true;
        }
    }
    draw() {
        ctx.drawImage(this.image, this.frame * this.spriteWidth, 0,
            this.spriteWidth, this.spriteHeight, this.x, this.y,
            this.size, this.size);
    }
}


function drawScore() {
    ctx.font = "50px Impact";
    ctx.fillStyle = "black";
    ctx.fillText("Score: " + score, 50, 75);
    ctx.fillStyle = "white";
    ctx.fillText("Score: " + score, 55, 80);
}

window.addEventListener("click", function (e) {
    const detectPixelColor = ctx2.getImageData(e.x, e.y, 1, 1);
    //console.log(detectPixelColor);
    const pColor = detectPixelColor.data;
    ravens.forEach(obj => {
        if (obj.randomColor[0] === pColor[0]
            && obj.randomColor[1] == pColor[1]
            && obj.randomColor[2] === pColor[2]) {
            obj.markDelete = true;
            score++;
            explosions.push(new Explosion(obj.x, obj.y, obj.width))

        }
    });
});
window.addEventListener("resize", resizeCanvas);

function resizeCanvas() {

    let CANVAS_WIDTH = canvas.width = window.innerWidth;
    let CANVAS_HEIGHT = canvas.height = window.innerHeight;
    let CANVAS_WIDTH2 = canvas2.width = window.innerWidth;
    let CANVAS_HEIGHT2 = canvas2.height = window.innerHeight;

}

function animate(timestamp) {
    ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    timeToNext += deltaTime;
    if (timeToNext > ravenInterval) {
        ravens.push(new Raven());
        timeToNext = 0;
        ravens.sort(function (a, b) {
            return a.width - b.width;
        })
    }

    drawScore();
    [...ravens, ...explosions].forEach(obj => {
        obj.update(deltaTime);
        obj.draw();
    })
    ravens = ravens.filter(obj => !obj.markDelete);
    explosions = explosions.filter(obj => !obj.markDelete);
    requestAnimationFrame(animate);
}
animate(0);