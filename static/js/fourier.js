let canvas = null; 
let context = null;
let time = 0;
const Point = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    equals(point) {
        return this.x === point.x && this.y === point.y;
    }
    toString() {
        return '(' + this.x + ', ' + this.y + ')';
    }

};

const FourierCircle = class {
    constructor(speed, radius, initial_angle, draw_circles)
    {
        this.radius = radius/2;
        this.speed = speed/20;
        this.initial_angle = initial_angle
        this.draw_circles = draw_circles
    }
    draw(ctx, at) 
    {
        ctx.beginPath();
        if(this.draw_circles) {
            ctx.arc(at.x, at.y, this.radius, 0, Math.PI * 2, true);
        }
        var x = at.x + this.radius * Math.cos(this.initial_angle + 2 * Math.PI * time * this.speed);
        var y = at.y + this.radius * Math.sin(this.initial_angle + 2 * Math.PI * time * this.speed);
        ctx.moveTo(at.x, at.y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(202, 126, 86, 0.7)';
        ctx.lineWidth = 1; 
        ctx.stroke();
    }

    nextCenter(at) 
    {
        var x = at.x + this.radius * Math.cos(this.initial_angle + 2 * Math.PI * time * this.speed);
        var y = at.y + this.radius * Math.sin(this.initial_angle + 2 * Math.PI * time * this.speed);
        return new Point(x, y)
    }
};

let n;
let circles;
let animation_id = 0;
let center = new Point(150, 150);
let wave = [];

function init_fourier(canvas_elm, constants, count, draw_circles) {
    canvas = canvas_elm;
    context = canvas.getContext('2d');
    if(animation_id !== 0)
        window.cancelAnimationFrame(animation_id);
    n = count;
    circles = [];
    wave = [];
    for (let i = 0; i < count; i++) {
        let constant = constants[i];
        circles[i] = new FourierCircle(constant.s, constant.r, constant.a, draw_circles);
    }
    animation_id = window.requestAnimationFrame(draw);
}

function draw_wave(ctx) {
    // ctx.beginPath();
    for (let i = 1; i < wave.length; i++) {
        ctx.beginPath();
        ctx.moveTo(wave[i-1].x, wave[i-1].y);
        ctx.lineTo(wave[i].x, wave[i].y);
        ctx.closePath();

        // let c = Math.ceil(127.0 + 128.0*i/wave.length);
        let alpha = 1 - i*1.0/wave.length;
        
        ctx.strokeStyle = 'rgba(0, 0, 0, ' + alpha + ')';
        //ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
    // ctx.closePath();
    // ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    // ctx.stroke();
} 

function draw() {
    context.clearRect(0,0, canvas.width, canvas.height);
    // let new_center = center;
    let new_center = circles[0].nextCenter(center);
    for(let i = 1; i < n; i++) {
        circles[i].draw(context, new_center);
        new_center = circles[i].nextCenter(new_center);
    }
    
    wave.unshift(new_center);
    draw_wave(context);

    animation_id = window.requestAnimationFrame(draw);

    time += 0.04;
    if(wave.length > 400) {
        wave.pop();
    }
}