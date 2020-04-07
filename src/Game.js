import React from 'react';

import './styles/main.scss';

const HEIGHT = 400; //Screen height
const WIDTH = 300; //Screen width
// const WIDTH = 800; //Screen width
const PIPE_WIDTH = WIDTH / 15; //Pipe Thickness
const FPS = 80;
const manufacturedPipeTime = 250; //For Increasing speed, decrease
let SCORE = 0
let SPACE = HEIGHT / 4.5; //Between pipes

class Bee {
  constructor(ctx) {
    this.ctx = ctx;
    this.x = WIDTH / 15;
    this.y = HEIGHT / 2; // must - width of icon
    this.gravity = 0;
    this.velocity = 0.24;
  }

  draw() {
    this.ctx.fillStyle = '#ffce1c';
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, HEIGHT / 50, 0, 2 * Math.PI, false);
    this.ctx.fill();
  }

  updateBird() {
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
    this.x = WIDTH * 1.5; //Out of screen
    this.isDead = false;
    this.y = height ? HEIGHT - height : 0;
    this.width = PIPE_WIDTH;
    this.height = height || (Math.max(Math.floor(Math.random() * HEIGHT * 0.7), SPACE * 1.2)) //MIN: 96 - MAX:350;
  }

  drawPipes() {
    this.ctx.fillStyle = "#0fff5a";
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
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
      score: 0
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
    const secondPipeHeight = HEIGHT - firstPipe.height - SPACE //MIN: 70 - MAX:324 
    const secondPipe = new Pipe(ctx, secondPipeHeight)
    return [firstPipe, secondPipe]
  }

  gameLoop = () => {
    this.updateGame();
    this.updateScore();
    this.draw();
  }

  updateScore = () => {
    this.setState({ score: SCORE / 2 })
  }

  updateGame = () => {
    this.frameCount += 1;
    if (this.frameCount % manufacturedPipeTime === 0) {
      const pipes = this.generatePipes();
      this.pipes.push(...pipes);
    }
    this.pipes.forEach(pipe => pipe.updatePipe());
    this.pipes = this.pipes.filter(pipe => !pipe.isDead)

    this.bee.updateBird();
    if (this.isGameOver()) {
      this.endGame();
    }
  }

  endGame = () => {
    console.log("Frame C: " + this.frameCount)
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
    this.pipes.forEach(pipe => pipe.drawPipes());
    this.bee.draw();
  }

  getCtx = () => this.canvasRef.current.getContext("2d");


  restartGame = () => {
    this.frameCount = 0
    clearInterval(this.loop);
    console.log("in")
    var ctx = this.getCtx();
    this.pipes = this.generatePipes();
    this.bee = new Bee(ctx)
    this.draw()
    this.loop = setInterval(this.gameLoop, 1000 / this.gameSpeed);
  }

  render() {
    return (
      <div className="container">
        <canvas
          ref={this.canvasRef}
          width={WIDTH}
          height={HEIGHT}
          style={{ marginTop: '10px', border: '1px solid #c3c3c3' }} >
        </canvas>
        <div className="btn-container no-selection">
          <span>Score: {(this.state.score)}</span>
          <button className="btn" disabled={!this.state.gameOverInfo} onClick={() => {
            window.location.reload(false);
          }}>Restart</button>
        </div>
      </div>
    );
  }
}

export default Game;
