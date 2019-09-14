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
    constructor(speed, radius, initial_angle)
    {
        this.radius = radius/2;
        this.speed = speed/20;
        this.initial_angle = initial_angle
    }
    draw(ctx, at) 
    {
        ctx.beginPath();
        ctx.arc(at.x, at.y, this.radius, 0, Math.PI * 2, true);
        var x = at.x + this.radius * Math.cos(this.initial_angle + 2 * Math.PI * time * this.speed);
        var y = at.y + this.radius * Math.sin(this.initial_angle + 2 * Math.PI * time * this.speed);
        ctx.moveTo(at.x, at.y);
        ctx.lineTo(x, y);
        ctx.closePath();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 
        ctx.stroke();
        return new Point(x, y)
    }
};

let n;
let circles;
let animation_id = 0;
let center = new Point(150, 150);
let wave = [];

function init_fourier(canvas_elm, constants, count) {
    canvas = canvas_elm;
    context = canvas.getContext('2d');
    if(animation_id !== 0)
        window.cancelAnimationFrame(animation_id);
    n = count;
    circles = [];
    wave = [];
    for (let i = 0; i < count; i++) {
        let constant = constants[i];
        circles[i] = new FourierCircle(constant.s, constant.r, constant.a);
    }
    animation_id = window.requestAnimationFrame(draw);
}

function draw_wave(ctx) {
    ctx.beginPath();
    for (let i = 1; i < wave.length; i++) {
        ctx.moveTo(wave[i-1].x, wave[i-1].y);
        ctx.lineTo(wave[i].x, wave[i].y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
    ctx.stroke();
} 

function draw() {
    context.clearRect(0,0, canvas.width, canvas.height);
    let new_center = center;
    for(let i = 0; i < n; i++) {
        new_center = circles[i].draw(context, new_center);
    }
    
    wave.unshift(new_center);
    draw_wave(context);

    animation_id = window.requestAnimationFrame(draw);

    time += 0.04;
    if(wave.length > 2000) {
        wave.pop();
    }
}