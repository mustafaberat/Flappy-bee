import React from 'react';

import './styles/main.scss';

let HEIGHT = window.innerHeight * 0.8; //Screen height
let WIDTH = window.innerWidth * 0.8; //Screen width
const PIPE_WIDTH = WIDTH / 15; //Pipe Thickness
const FPS = 80;
const manufacturedPipeTime = 220; //For Increasing speed, decrease
let SCORE = 0
let SPACE = HEIGHT / 3.4; //Between pipes

class Bee {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = WIDTH / 15;
    this.y = HEIGHT / 2; // must - width of icon
    this.gravity = 0;
    this.velocity = 0.24;
  }

  drawBee() {
    var img = document.getElementById("Bee");
    this.ctx.drawImage(img, this.x, this.y, HEIGHT / 20, HEIGHT / 20);
    // this.ctx.fillStyle = '#ffce1c';
    // this.ctx.beginPath();
    // this.ctx.arc(this.x, this.y, HEIGHT / 50, 0, 2 * Math.PI, false);
    // this.ctx.fill();
  }

  updateBee() {
    this.gravity += this.velocity;
    this.gravity = Math.min(5, this.gravity)
    this.y += this.gravity;
  }

  jump() {
    this.gravity = -4;
  }
}

class Pipe {
  constructor(ctx, height) {
    this.ctx = ctx;
    this.x = WIDTH * 1.33; //Out of screen
    this.isDead = false;
    this.y = height ? HEIGHT - height : 0;
    this.width = PIPE_WIDTH;
    this.height = height || (Math.max(Math.floor(Math.random() * HEIGHT * 0.7), SPACE * 1.2))
  }

  drawPipes() {
    try {
      var img = document.getElementById("Pipe");
      this.ctx.drawImage(img, this.x, this.y, this.width, this.height);
    } catch (error) {
      this.ctx.fillStyle = "#0fff5a";
      this.ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }

  updatePipe() {
    this.x -= 1
    if ((this.x + PIPE_WIDTH) < 0) {
      this.isDead = true;
      (this.isDead === true) && (this.increaseScore())
    }
  }

  increaseScore() {
    SCORE += 1;
    SPACE = (SPACE > HEIGHT / 5.6) ? SPACE -= 1 : SPACE
  }

}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.canvasRef = React.createRef();
    this.frameCount = 0;
    this.pipes = [];
    this.bee = null;
    this.state = {
      gameOverInfo: false,
      score: 0,
      space: 0
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this.onKeyDown);
    document.addEventListener('click', this.onKeyDown);
    document.addEventListener('touchstart', this.onKeyDown);
    var ctx = this.getCtx();
    this.pipes = this.generatePipes();
    this.bee = new Bee(ctx)
    this.loop = setInterval(this.gameLoop, 1000 / FPS); //FPS  
  }

  onKeyDown = (event) => {
    if (event.code === 'Space' || event.type === "click" || event.type === "touchstart") {
      this.bee.jump();
    }
  }

  generatePipes = () => {
    var ctx = this.getCtx();
    const firstPipe = new Pipe(ctx, null)
    const secondPipeHeight = HEIGHT - firstPipe.height - SPACE
    const secondPipe = new Pipe(ctx, secondPipeHeight)
    return [firstPipe, secondPipe]
  }

  gameLoop = () => {
    this.updateGame();
    this.updateScoreAndSpace();
    this.draw();
  }

  updateScoreAndSpace = () => {
    this.setState({ score: SCORE / 2, space: SPACE }) //Because of two discrete pipes
  }

  updateGame = () => {
    this.frameCount += 1;
    if (this.frameCount % manufacturedPipeTime === 0) {
      const pipes = this.generatePipes();
      this.pipes.push(...pipes);
    }
    this.pipes.forEach(pipe => pipe.updatePipe());
    this.pipes = this.pipes.filter(pipe => !pipe.isDead)

    this.bee.updateBee();
    if (this.isGameOver()) {
      this.endGame();
    }
  }

  endGame = () => {
    clearInterval(this.loop)
  }

  isGameOver = () => {
    let gameover = false;
    this.pipes.forEach(pipe => {
      if (this.bee.y >= HEIGHT || this.bee.y <= 0 || (this.bee.x > pipe.x && this.bee.x < pipe.x + pipe.width &&
        this.bee.y > pipe.y && this.bee.y < pipe.y + pipe.height)) {
        gameover = true
        this.setState({ gameOverInfo: true })
      }
    })

    return gameover;
  }

  draw() {
    var ctx = this.getCtx()
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    this.drawBg();
    this.pipes.forEach(pipe => pipe.drawPipes());
    this.bee.drawBee();
  }

  drawBg = () => {
    var ctx = this.getCtx();
    var bg = document.getElementById("bg");
    ctx.drawImage(bg, 0, 0, WIDTH, HEIGHT);
  }

  getCtx = () => this.canvasRef.current.getContext("2d");


  restartGame = () => {
    this.setState({ gameOverInfo: false })
    SCORE = 0
    SPACE = HEIGHT / 3.5; //Between pipes
    this.pipes = []
    var ctx = this.getCtx();
    this.bee = new Bee(ctx)
    this.draw()
    this.loop = setInterval(this.gameLoop, (1000 / FPS));
  }

  render() {
    return (
      <div className="container">
        <img id="bg" width='1' height='1' src="bg.png" alt="bg"></img>
        <img id="Bee" width='1' height='1' src="bee.png" alt="Bee"></img>
        <img id="Pipe" width='1' height='1' src="pipe.png" alt="Pipe"></img>
        <canvas
          ref={this.canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{ marginTop: '10px', border: '1px solid #c3c3c3' }} >
        </canvas>
        <div className="btn-container no-selection"
          style={{ 'width': WIDTH }}
        >
          <span>Space: {Math.floor(this.state.space)}</span>
          <button className="btn" disabled={!this.state.gameOverInfo} onClick={() => {
            // window.location.reload(false);
            this.restartGame();
          }}>Restart</button>
          <span>Score: {this.state.score}</span>

        </div>
      </div>
    );
  }
}

export default Game;
