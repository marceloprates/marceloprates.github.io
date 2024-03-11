let palette = ["#E76F51", "#F4A261", "#E9C46A", "#2A9D8F", "#264653"];
let ns = .01

function setup()
{
	let width = document.getElementById('sketch-holder').clientWidth
	let height = .33*width
    canvas = createCanvas(width, height);
    canvas.parent('sketch-holder');
	
    graphics = createGraphics(width, height);
    graphics.colorMode(HSB, 360, 100, 100, 100);
    drawNoiseBackground(10000, graphics);
}

function draw()
{
	randomSeed(42)
	
	background(255)
	
	for(let i = 0; i < 100; i++)
	{
		let shape = int(random(3))
		
		let w = map(noise(ns*mouseX, random()), 0, 1, 20, 60)
		let h = map(noise(ns*mouseX, random()), 0, 1, 20, 60)
		let a = random(180)
		
		let x = map(i, 0, 100, .1*width, .9*width)
		let y = .5*height + .3*height*(sin(map(mouseX, 0, width, 0, PI) + TWO_PI*i/100))
		
		let k = noise(.1 * ns*mouseX, .05*i)
		k = int(2 * palette.length*k) % palette.length
		fill(palette[k])
		
		push()
		translate(x, y)
		rotate(a)
		if(shape == 0)
		{
			rect(0, 0, w, h)
		}
		else if(shape == 1)
		{
			ellipse(0, 0, w, w)
		}
		else
		{
			beginShape()
				vertex(0, 0)
				vertex(w, 0)
				vertex(w, h)
				vertex(0, 0)
			endShape()
		}
		pop()
	}
	
	image(graphics, 0, 0);
}

function drawNoiseBackground(_n, _graphics)
{
  let c = color(0, 0, 100, 5);
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

function mouseClicked()
{
	redraw()
}