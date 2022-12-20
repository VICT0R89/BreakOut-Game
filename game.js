const cvs = document.getElementById('breakout');
const ctx = cvs.getContext('2d');

// canvas styles

cvs.style.border = "2px solid rgb(0, 121, 168)";

// context syles

ctx.lineWidth = 3;

//game variables

const PADDLE_WIDTH = 100;
const PADDLE_MARGIN_BOTTOM = 50;
const PADDLE_HEIGHT = 20;
const BALL_RADIUS = 8;
let LIFE = 3;
let SCORE = 0;
let SCORE_ACC = 0;
const SCORE_UNIT = 10;
let LEVEL = 1;
const MAX_LEVEL = 13;
let GAME_OVER = false;
let leftArrow = false;
let rightArrow = false;

//create the Paddle

const paddle = {
  x : cvs.width/2 - PADDLE_WIDTH/2,
  y : cvs.height - PADDLE_MARGIN_BOTTOM - PADDLE_HEIGHT,
  width : PADDLE_WIDTH,
  height : PADDLE_HEIGHT,
  dx : 5
}

// draw the paddle

function drawPaddle() {
  ctx.fillStyle = "#2e3548"
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);

  ctx.strokeStyle = "#ffcd05";
  ctx.strokeRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

// CONTROL PADDLE

document.addEventListener("keydown", function(e){  
  if(e.key == "a" || e.key == "A" || e.key == 'ArrowLeft'){
    leftArrow = true;
  } else if (e.key == "d" || e.key == "D" || e.key == 'ArrowRight'){
    rightArrow = true;
  }
})
document.addEventListener("keyup", function(e){
  if(e.key == "a" || e.key == "A" || e.key == 'ArrowLeft'){
    leftArrow = false;
  } else if (e.key == "d" || e.key == "D" || e.key == 'ArrowRight'){
    rightArrow = false;
  }
})

// MOVE paddle buttons


const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');

leftBtn.addEventListener("click", function(){
  
  if(paddle.x > 0){
    paddle.x -= 75;
  }
})

rightBtn.addEventListener("click", function(){
  if(paddle.x + paddle.width < cvs.width){
    paddle.x += 75;
  }
})


//MOVE paddle

function movePaddle(){
  if(rightArrow && paddle.x + paddle.width < cvs.width){
    paddle.x += paddle.dx;
  } else if (leftArrow && paddle.x > 0){
    paddle.x -= paddle.dx;
  }
}

// BALL OBJECT

const ball = {
  x : cvs.width/2,
  y : paddle.y - BALL_RADIUS,
  radius : BALL_RADIUS,
  speed : 4,
  dx : 3 * (Math.random() * 2 - 1),
  dy : -3
}

// DRAW BALL

function drawBall(){
  ctx.beginPath();

  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI*2);
  ctx.fillStyle = "#ffcd05"
  ctx.fill();

  ctx.strokeStyle = "#2e3548";
  ctx.stroke();

  ctx.closePath();
}

// MOVE BALL

function moveBall(){
  ball.x += ball.dx;
  ball.y += ball.dy;
}

// RESET BALL function

function resetBall(){  
  ball.x = paddle.x + paddle.width/2;
  ball.y = paddle.y - BALL_RADIUS;
  ball.dx = 3 * (Math.random() * 2 - 1);
  ball.dy = -3
}

// BALL COLLISION DETECTION ---WALL---

function ballWallCollision(){
  if(ball.x + ball.radius > cvs.width || ball.x - ball.radius < 0){
    ball.dx = - ball.dx;
    WALL_HIT.play();
  }
  if(ball.y - ball.radius < 0){
    ball.dy = -ball.dy;
    WALL_HIT.play();
  }
  if(ball.y + ball.radius > cvs.height){
    LIFE--;
    LIFE_LOST.play();
    resetBall();
  }
}

// BALL COLLISION DETECTION --- PADDLE

function ballPaddleCollision(){
  if(ball.x < paddle.x + paddle.width &&
    ball.x > paddle.x &&
    paddle.y < paddle.y + paddle.height &&
    ball.y > paddle.y){

      // PLAY SOUND BALL-HIT-PADDLE
      PADDLE_HIT.play();
      
      // CHECK WHERE THE BALL HIT THE PADDLE
      let collidePoint = ball.x - (paddle.x + paddle.width/2);
      
      // NORMALIZE THE VALUES
      collidePoint = collidePoint / (paddle.width/2);
      
      // CALCULATE THE ANGLE
      let angel = collidePoint * Math.PI/3;
      
      ball.dx = ball.speed * Math.sin(angel);
      ball.dy = - ball.speed * Math.cos(angel);
    }
}

// BLOCKS OBJECT

const block = {
  row : 1,
  column : 5,
  width : 55,
  height : 20,
  offSetLeft : 20,
  offSetTop : 20,
  marginTop : 40,
  fillColor : "#2e3548",
  strokeColor : "#fff"
}

// CREATE BLOCKS

let blocks = [];

function createBlocks (){
  for(let r = 0; r < block.row; r++){
    blocks[r] = [];
    for (let c = 0; c < block.column; c++) {
      blocks[r][c] = {
        x : c * ( block.offSetLeft + block.width ) + block.offSetLeft,
        y : r * ( block.offSetTop + block.height ) + block.offSetTop + block.marginTop,
        status : true
      }
    }
  }
}
createBlocks();

// DRAW BLOCKS

function drawBlocks(){
  for(let r = 0; r < block.row; r++){
    for (let c = 0; c < block.column; c++) {
      let b = blocks[r][c];
      // CHECK THE BLOCKS STATUS --BROKEN OR NOT BROKEN
      if(b.status){
        ctx.fillStyle = block.fillColor;
        ctx.fillRect(b.x, b.y, block.width, block.height);

        ctx.strokeStyle = block.strokeColor;
        ctx.strokeRect(b.x, b.y, block.width, block.height);
      }
    }
  }
}

// BALL COLLISION DETECTION --- BLOCKS

function ballBlockCollision(){
  for(let r = 0; r < block.row; r++){
    for (let c = 0; c < block.column; c++) {
      let b = blocks[r][c];
      // CHECK THE BLOCKS STATUS --BROKEN OR NOT BROKEN
      if(b.status){
        if(
          ball.x + ball.radius > b.x &&
          ball.x - ball.radius < b.x + block.width &&
          ball.y + ball.radius > b.y &&
          ball.y - ball.radius < b.y + block.height
          ) {
            BLOCK_HIT.play();
            ball.dy = - ball.dy;
            b.status = false;
            SCORE += SCORE_UNIT;
            //LIFE PLUS ------
            SCORE_ACC += SCORE_UNIT;
            if(SCORE_ACC === 250){
              LIFE+=1;
              SCORE_ACC = SCORE_ACC - SCORE_ACC;
            }
          }
      }
    }
  }
}

// SHOW GAME STATS 

function showGameStats(text, textX, textY, img, imgX, imgY){
  // DRAW TEXT
  ctx.fillStyle = "#fff";
  ctx.font = "25px Sans Serif";
  ctx.fillText(text, textX, textY);

  //DRAW IMG
  ctx.drawImage(img, imgX, imgY, width = 25, height = 25);
}


  

// DRAW function
function draw(){
  drawPaddle();
  drawBall();
  drawBlocks();  

  //SHOW SCORE
  showGameStats(SCORE, cvs.width/2, 25, SCORE_IMG, cvs.width/2 - 30, 5);
  // SHOW LIFE
  showGameStats(LIFE, cvs.width -25, 25, LIFE_IMG, cvs.width-55, 5);
  //SHOW LVL
  showGameStats(LEVEL, 35, 25, LEVEL_IMG, 5, 5); 

}

// GAME OVER

function gameOver(){
  if(LIFE <= 0){
    OVER.play();
    showYouLose();
    GAME_OVER = true;
  }
}

// LEVEL COMPLETE

function levelUp(){
  let isLvlDone = true;

  for(let r = 0; r < block.row; r++){
    for (let c = 0; c < block.column; c++) {
      let b = blocks[r][c]
      isLvlDone = isLvlDone && ! b.status;
    }
    if(isLvlDone){
      WIN.play();
      if(LEVEL < 6){
        block.row++;      
        createBlocks();
        resetBall();
        ball.speed += 0.8;
        LEVEL++;
      } else if(LEVEL == 6){
        block.row = block.row - block.row + 1;      
        createBlocks();
        resetBall();
        ball.speed += 0.5;
        paddle.dx = paddle.dx + 2
        LEVEL++;
      }else if(LEVEL > 6){
        block.row++;      
        createBlocks();
        resetBall();
        ball.speed += 0.5;
        LEVEL++;
      }
      if(LEVEL >= MAX_LEVEL){
        showYouWon();
        GAME_OVER = true;
        return;
      }      
    }
  }
}

// UPDATE game function

function update(){
  moveBall();
  movePaddle();
  ballWallCollision();
  ballPaddleCollision();
  ballBlockCollision();
  gameOver();
  levelUp();
}

// LOOP game function 

function loop(){

  ctx.drawImage(BG_IMG, 0, 0);

  draw();
  update();

  if(! GAME_OVER){
    requestAnimationFrame(loop);
  }
}

loop();

const sound = document.getElementById('sound');
sound.addEventListener("click", toogleSound);

function toogleSound(){
  let imgSrc = sound.getAttribute("src");
  let SOUND_IMG = imgSrc == "img/SOUND_ON.png" ? 
  "img/SOUND_OFF.png" : "img/SOUND_ON.png";

  sound.setAttribute("src", SOUND_IMG);

  OVER.muted = OVER.muted ? false : true;
  WIN.muted = WIN.muted ? false : true;
  PADDLE_HIT.muted = PADDLE_HIT.muted ? false : true;
  WALL_HIT.muted = WALL_HIT.muted ? false : true;
  BLOCK_HIT.muted = BLOCK_HIT.muted ? false : true;
  LIFE_LOST.muted = LIFE_LOST.muted ? false : true;
}

// END GAME CONFIG ----------

const game_over = document.getElementById('gameOver');
const youWin = document.getElementById('youWon');
const youLose = document.getElementById('youLose');
const restart = document.getElementById('restart');

// PLAY AGAIN ---------

restart.addEventListener("click",function(){
  location.reload(); // reload the page
});

// WIN CASE -----------
function showYouWon(){
  game_over.style.display = "block";
  youWin.style.display = "block";
}

// LOSE CASE ----------
function showYouLose(){
  game_over.style.display = "block";
  youLose.style.display = "block";
}