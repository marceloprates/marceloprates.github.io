
let palette = [
    '#f56767',
    '#ffc878',
    '#8aa2eb',
]

// Time variable
var t = 0

// Noise scale
var ns = .1

function setup()
{

    let width = document.getElementById('sketch-holder').clientWidth
	let height = .25*width
    canvas = createCanvas(width, height);
    canvas.parent('sketch-holder');

    // Plot the "paper texture" on a different graphics object
    texture_graphics = createGraphics(width, height);
    drawNoiseBackground(0.1*(width*height), texture_graphics);
}

function draw() {
    randomSeed(42)

    background(255)

    t += TWO_PI / 200

    noFill()

    let m = 40
    let n = 100

    push()
    for (var k = 0; k < m; k++)
    {
        sw = 0.04 * width * sin(TWO_PI * k / m)
        strokeWeight(sw)

        stroke(palette[0])
        beginShape()
        for (var i = 0; i < n; i++) {
            var x = .05 * width + .9 * width * i / n + .01 * width * cos(-t + 5 * TWO_PI * i / n)
            var y = width + .05 * width + .9 * width * i / n - .01 * width * cos(-t + 5 * TWO_PI * i / n)

            y -= .1 * width * k + .15*(mouseX - .1*width)

            if (y < .05 * height)
                continue

            if (x > .9 * width || y > .9 * height)
                break

            curveVertex(x, y)
        }
        endShape()
    }
    pop()

    push()
    for (var k = 0; k < m; k++)
    {
        sw = 0.04 * width * sin(TWO_PI * k / m)
        strokeWeight(sw)

        stroke(palette[1])
        beginShape()
        for (var i = 0; i < n; i++) {
            var x = .03 * width + .05 * width + .9 * width * i / n + .01 * width * cos(-t + 5 * TWO_PI * i / n)
            var y = width + .05 * width + .9 * width * i / n - .01 * width * cos(-t + 5 * TWO_PI * i / n)

            y -= .1 * width * k + .10*(mouseX - .1*width)

            if (y < .05 * height)
                continue

            if (x > .9 * width || y > .9 * height)
                break

            curveVertex(x, y)
        }
        endShape()
    }
    pop()

    push()
    for (var k = 0; k < m; k++)
    {
        sw = 0.04 * width * sin(TWO_PI * k / m)
        strokeWeight(sw)

        stroke(palette[2])
        beginShape()
        for (var i = 0; i < n; i++) {
            var x = .06 * width + .05 * width + .9 * width * i / n + .01 * width * cos(-t + 5 * TWO_PI * i / n)
            var y = width + .05 * width + .9 * width * i / n - .01 * width * cos(-t + 5 * TWO_PI * i / n)

            y -= .1 * width * k + .05*(mouseX - .1*width)

            if (y < .05 * height)
                continue

            if (x > .9 * width || y > .9 * height)
                break

            curveVertex(x, y)
        }
        endShape()
    }
    pop()

    image(texture_graphics, 0, 0)
}

function drawNoiseBackground(_n, _graphics)
{
    let c = color(0, 0, 0, 5);
    for (let i = 0; i < _n; i++) {
        let x = random(1) * width;
        let y = random(1) * height;
        let w = random(1, 4);
        let h = random(1, 4);
        _graphics.noStroke();
        _graphics.fill(c);
        _graphics.ellipse(x, y, w, h);
    }
}