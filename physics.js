var canvas = document.getElementById('game_canvas');
var context = canvas.getContext('2d');
var stopExecution = false;


//-----------------------------//
//---------- VECTORS ----------//
//-----------------------------//
var Vec2d = function(x, y) {
  this.x = x;
  this.y = y;
};
Vec2d.prototype.eq = function(v) {
  if (v instanceof Vec2d) {
    return this.x === v.x && this.y === v.y;
  }
  console.error('Vec2d.eq called with non-Vec2d argument');
};
Vec2d.prototype.copy = function() {
  return new Vec2d(this.x, this.y);
};
Vec2d.prototype.add = function(v) {
  if (typeof v === 'number') {
    return new Vec2d(this.x + v, this.y + v);
  } else if (v instanceof Vec2d) {
    return new Vec2d(this.x + v.x, this.y + v.y);
  }
  console.error('Vec2d.add called with non-number, non-Vec2d argument');
};
Vec2d.prototype.sub = function(v) {
  if (typeof v === 'number') {
    return new Vec2d(this.x - v, this.y - v);
  } else if (v instanceof Vec2d) {
    return new Vec2d(this.x - v.x, this.y - v.y);
  }
  console.error('Vec2d.sub called with non-number, non-Vec2d argument');
};
Vec2d.prototype.mul = function(v) {
  if (typeof v === 'number') {
    return new Vec2d(this.x * v, this.y * v);
  } else if (v instanceof Vec2d) {
    return new Vec2d(this.x * v.x, this.y * v.y);
  }
  console.error('Vec2d.mul called with non-number, non-Vec2d argument');
};
Vec2d.prototype.div = function(v) {
  if (typeof v === 'number') {
    return new Vec2d(this.x / v, this.y / v);
  } else if (v instanceof Vec2d) {
    return new Vec2d(this.x / v.x, this.y / v.y);
  }
  console.error('Vec2d.div called with non-number, non-Vec2d argument');
};
Vec2d.prototype.neg = function() {
  return new Vec2d(-this.x, -this.y);
};
Vec2d.prototype.dot = function(v) {
  if (v instanceof Vec2d) {
    return this.x * v.x + this.y * v.y;
  }
  console.error('Vec2d.dot called with non-Vec2d argument');
};
Vec2d.prototype.mag = function() {
  return Math.sqrt(this.x * this.x + this.y * this.y);
};
Vec2d.prototype.norm = function() {
  return this.div(this.mag());
};
Vec2d.prototype.proj = function(v) {
  if (v instanceof Vec2d) {
    return v.norm().mul(this.dot(v.norm()));
  }
  console.error('Vec2d.proj called with non-Vec2d argument');
};


//-------------------------------------------//
//---------- GAME GLOBAL VARIABLES ----------//
//-------------------------------------------//
// Game dimensions
var width = 1000;
var height = 600;
// Set canvas dimensions to correct width and height
canvas.width = width;
canvas.height = height;
// Reset button specs
var resetX = 10;
var resetY = 10;
var resetW = 159;
var resetH = 38;
// Number of balls
var numBalls = 100;
// Balls array
var balls;

//---------------------------------------//
//---------- PRELOADING IMAGES ----------//
//---------------------------------------//
// Define images
var bgImg = new Image();
bgImg.src = "imgs/background.jpg";
var resetBtnImg = new Image();
resetBtnImg.src = "imgs/reset_btn.png";

// Ensure all images have loaded before starting the game
var numImages = 2;
var numLoaded = 0;
var imageLoaded = function() {
  numLoaded++;
  if (numLoaded === numImages) {
    initGame();
  }
};
bgImg.onload = function() {
  imageLoaded();
};
resetBtnImg.onload = function() {
  imageLoaded();
};



//-----------------------------------------//
//---------- HANDLING USER INPUT ----------//
//-----------------------------------------//
// Check if ball is clicked
var ballClicked = function(x, y, ball) {
  var xd = x - ball.pos.x;
  var yd = y - ball.pos.y;
  var dist = Math.sqrt(xd * xd + yd * yd);
  return dist <= ball.r;
};

// Code that handles mouse clicks
var onCanvasClick = function(e) {
  var x = e.layerX - canvas.offsetLeft;
  var y = e.layerY - canvas.offsetTop;
  // Check if we clicked the reset button
  if (x >= resetX && x <= resetX + resetW &&
      y >= resetY && y <= resetY + resetH) {
    stopExecution = true;
  }
  // Check if we clicked one of the balls
  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];
    if (ballClicked(x, y, ball)) {
      ball.vel = ball.vel.neg();
    }
  }
};
canvas.addEventListener('mousedown', onCanvasClick);



//-----------------------------------------//
//---------- GAME INITIALIZATION ----------//
//-----------------------------------------//
var overlap = function(b0, b1) {
  var dist = b0.pos.sub(b1.pos).mag();
  return dist <= b0.r + b1.r;
}
var randomHexColor = function() {
  var num = parseInt(Math.random() * 256 * 256 * 256);
  var hex = num.toString(16);
  while (hex.length < 6) {
    hex = '0' + hex;
  }
  return '#' + hex;
};
// Makes new balls
var resetBalls = function() {
  /*
  var b0 = {
    r: 100,
    pos: new Vec2d(500.02, 100),
    vel: new Vec2d(-20, 0),
    color: randomHexColor()
  };
  var b1 = {
    r: 100,
    pos: new Vec2d(200.01, 100),
    vel: new Vec2d(-10, 0),
    color: randomHexColor()
  };
  var b0 = {
    r: 100,
    pos: new Vec2d(400, 100),
    vel: new Vec2d(-10, 0),
    color: randomHexColor()
  };
  var b1 = {
    r: 100,
    pos: new Vec2d(200.01, 100),
    vel: new Vec2d(-10, 0),
    color: randomHexColor()
  };
  balls = [b0, b1];
  */
  balls = [];
  for (var i = 0; i < numBalls; i++) {
    var r = Math.floor(Math.random() * 10) + 10;
    var validBall = false;
    while (!validBall) {
      var x = r + Math.random() * (width - 2 * r);
      var y = r + Math.random() * (height - 2 * r);
      var vx = Math.floor(Math.random() * 10) - 5;
      var vy = Math.floor(Math.random() * 10) - 5;
      var newBall = {
        r: r,
        pos: new Vec2d(x, y),
        vel: new Vec2d(vx, vy),
        color: randomHexColor()
      };
      validBall = true;
      for (var i = 0; i < balls.length; i++) {
        if (overlap(newBall, balls[i])) {
          validBall = false;
          break;
        }
      }
    }
    balls.push(newBall);
  }
}
// Initialize game objects and start game loop
var initGame = function() {
  resetBalls();
  updateGame();
};



//------------------------------------//
//---------- MAIN GAME LOOP ----------//
//------------------------------------//
var detectCollision = function(b0, b1) {
  if (!overlap(b0, b1)) {
    return;
  }
  b0m = Math.PI * b0.r * b0.r;
  b1m = Math.PI * b1.r * b1.r;
  colDir = b0.pos.sub(b1.pos);
  b0ColVel = b0.vel.proj(colDir);
  b1ColVel = b1.vel.proj(colDir);
  if (!(b0.pos.x > b1.pos.x && b0ColVel.x > b1ColVel.x) &&
      !(b0.pos.x < b1.pos.x && b0ColVel.x < b1ColVel.x)) {
    b0.vel.x += ((b0m - b1m) * b0ColVel.x + 2 * b1m * b1ColVel.x) / (b0m + b1m) - b0ColVel.x;
    b1.vel.x += ((b1m - b0m) * b1ColVel.x + 2 * b0m * b0ColVel.x) / (b0m + b1m) - b1ColVel.x;
  }
  if (!(b0.pos.y > b1.pos.y && b0ColVel.y > b1ColVel.y) &&
      !(b0.pos.y < b1.pos.y && b0ColVel.y < b1ColVel.y)) {
    b0.vel.y += ((b0m - b1m) * b0ColVel.y + 2 * b1m * b1ColVel.y) / (b0m + b1m) - b0ColVel.y;
    b1.vel.y += ((b1m - b0m) * b1ColVel.y + 2 * b0m * b0ColVel.y) / (b0m + b1m) - b1ColVel.y;
  }
};
var updateGame = function() {
  // Move game objects
  var updates = true;
  var count = 0;
  while (updates) {
    count++;
    if (count > 10) {
      console.error('Error: max collision iteration depth exceeded');
      stopExecution = true;
      break;
    }
    for (var i = 0; i < balls.length; i++) {
      var ball = balls[i];
      ball.oldvel = ball.vel.copy();
    }
    for (var i = 0; i < balls.length; i++) {
      var ball = balls[i];
      for (var j = i + 1; j < balls.length; j++) {
        var otherBall = balls[j];
        detectCollision(ball, otherBall);
      }
      if ((ball.pos.x - ball.r <= 0 && ball.vel.x < 0) ||
          (ball.pos.x + ball.r >= width && ball.vel.x > 0)) {
        ball.vel.x = -ball.vel.x;
      }
      if ((ball.pos.y - ball.r <= 0 && ball.vel.y < 0) ||
          (ball.pos.y + ball.r >= height && ball.vel.y > 0)) {
        ball.vel.y = -ball.vel.y;
      }
    }
    updates = false;
    for (var i = 0; i < balls.length; i++) {
      if (!ball.oldvel.eq(ball.vel)) {
        updates = true;
      }
    }
  }
  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];
    ball.pos = ball.pos.add(ball.vel);
  }

  // Draw images corresponding to game objects
  context.drawImage(bgImg, 0, 0, width, height);
  for (var i = 0; i < balls.length; i++) {
    var ball = balls[i];
    context.beginPath();
    context.arc(ball.pos.x, ball.pos.y, ball.r, 0, 2 * Math.PI);
    context.fillStyle = ball.color;
    context.fill();
    context.lineWidth = 1;
    context.strokeStyle = 'black';
    context.stroke();
  }
  context.drawImage(resetBtnImg, resetX, resetY, resetW, resetH);

  // Wait 25 milliseconds before starting next game frame
  if (!stopExecution) {
    setTimeout(updateGame, 25);
  }
};
