// const testModules = require('./test-module');
// require('../css/app.css');

//ベクトルのクラスを定義
class Vec {
  constructor(x = 0, y = 0) { //constructorはクラスを初期化した時に実行される関数
    this.x = x;
    this.y = y;
  }

  get len() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  set len(value) {
    const fact = value / this.len;
    this.x *= fact;
    this.y *= fact;
  }
}

//長方形を定義する
class Rect {
  constructor(w, h) {
    this.pos = new Vec;
    this.size = new Vec(w, h);
  }

  //ボールの左端、右端、上端、下端ではなく、中央を起点に跳ね返ってしまっており、めり込んでしまうのを解決
  get left() {
    return this.pos.x - this.size.x / 2;
  }

  get right() {
    return this.pos.x + this.size.x / 2;
  }

  get top() {
    return this.pos.y - this.size.y / 2;
  }

  get bottom() {
    return this.pos.y + this.size.y / 2;
  }
}

//Rectを継承する
class Ball extends Rect {
  constructor() {
    super(10 ,10);
    this.vel = new Vec;
  }
}

//プレイヤーを定義
class Player extends Rect {
  constructor() {
    super(20, 100); //ラケットの大きさ
    this.score = 0;
  }
}

//このゲームの環境全体設定
class Pong {
  constructor(canvas) {
    this._canvas = canvas;
    this._context = canvas.getContext("2d");

    //Ballクラスを使い、インスタンス(ball)を作成
    this.ball = new Ball;
    this.ball.pos.x = 100;
    this.ball.pos.y = 50;
    

    this.ball.vel.x = 100;
    this.ball.vel.y = 100;

    this.players = [
      new Player,
      new Player
    ];

    //playerの初期位置
    this.players[0].pos.x = 40;
    this.players[1].pos.x = this._canvas.width - 40;
    this.players.forEach(player => {
      player.pos.y = this._canvas.height / 2;
    })

    let lastTime;

    const callback = (millis) => {
      if(lastTime) {
        this.update((millis - lastTime) / 1000);
      }
      lastTime = millis;
      requestAnimationFrame(callback); //requestAnimationFrame()メソッドは、ブラウザにアニメーションを行いたいことをしらせ、指定した関数を呼び出して次の再描画２枚にアニメーションを更新することを要求します。
}

    callback();
    this.CHAR_PIXEL = 10;
    this.CHARS = [
      '111101101101111',
      '010010010010010',
      '111001111100111',
      '111001111001111',
      '101101111001001',
      '111100111001111',
      '111100111101111',
      '111001001001001',
      '111101111101111',
      '111101111001111'
    ].map(str => {
      const canvas = document.createElement("canvas");
      canvas.height = this.CHAR_PIXEL * 5;
      canvas.width = this.CHAR_PIXEL * 3;

      const context = canvas.getContext("2d");
      context.fillStyle = "#fff";
      str.split("").forEach((fill, i) => {
        if(fill === "1") {
          context.fillRect((i % 3) * this.CHAR_PIXEL,
          (i / 3 | 0) * this.CHAR_PIXEL,
          this.CHAR_PIXEL,
          this.CHAR_PIXEL);
        }
      });
      return canvas;
    });

    this.reset();
  }

  //ラケットの衝突判定
  collide(player, ball) {
    //プレイヤーの左端がボールの右端より小さくなる＆プレイヤーの右端がボールの左端より大きくなる。プレイヤーの上端がボールの下端より小さくなる。
    if(player.left < ball.right && player.right > ball.left && player.top < ball.bottom && player.bottom > ball.top) {
      const len = ball.vel.len;
      this.ball.vel.x = -this.ball.vel.x; //逆に移動するように
      ball.vel.y += 300 * (Math.random() - .5);
      ball.vel.len = len * 1.05; 
    }
  }

  draw() {
    //画面
    this._context.fillStyle = "#000";
    this._context.fillRect(0, 0, this._canvas.width, this._canvas.height);
    
    this.drawRect(this.ball);

    this.players.forEach(player => this.drawRect(player)); //playerが描画される

    this.drawScore();
  }

  //描画処理を関数に
  drawRect(rect) {
    //ピンポン球
    this._context.fillStyle = "#fff";
    this._context.fillRect(rect.left, rect.top, rect.size.x, rect.size.y);
  }

  //スコアを記述
  drawScore() {
    const align = this._canvas.width / 3;
    const CHAR_W = this.CHAR_PIXEL * 4;
    this.players.forEach((player, index) => {
      const chars = player.score.toString().split("");
      const offset = align * (index + 1) - (CHAR_W * chars.length / 2) + this.CHAR_PIXEL / 2;

      chars.forEach((char, pos) => {
        this._context.drawImage(this.CHARS[char | 0],
        offset + pos * CHAR_W, 20);
      });
    }) 
  }

  //リセット
  reset() {
    this.ball.pos.x = this._canvas.width / 2;
    this.ball.pos.y = this._canvas.height / 2;
    

    this.ball.vel.x = 0;
    this.ball.vel.y = 0;
  }

  //sタート
  start() {
    if(this.ball.vel.x === 0 && this.ball.vel.y === 0) {
      this.ball.vel.x = 300 * (Math.random() > .5 ? 1 : -1);  //速さ
      this.ball.vel.y = 300 * (Math.random() * 2 -1);

      this.ball.vel.len = 200 * 3;
    }
  }

  update(dt) { //update関数はanimationさせる時に繰り返し実行される関数
    this.ball.pos.x += this.ball.vel.x * dt;
    this.ball.pos.y += this.ball.vel.y * dt;
  
    //壁の定義
    if(this.ball.left < 0 || this.ball.right > this._canvas.width) {
      //スコアを出す
      const playerId = this.ball.vel.x < 0 | 0;

      this.players[playerId].score ++;
      this.reset();
    }
  
    if(this.ball.top < 0 || this.ball.bottom > this._canvas.height) {
      this.ball.vel.y = -this.ball.vel.y;
    }

    //player[1]のラケットの位置をボールの位置に
    this.players[1].pos.y = this.ball.pos.y;

    this.players.forEach(player => this.collide(player, this.ball));

    this.draw();
  }
}

const canvas = document.getElementById("pong");
const pong = new Pong(canvas);

//マウスでラケットを動かす
canvas.addEventListener("mousemove", event => {

  //画面街にラケットが出ないように設定
  const scale = event.offsetY / event.target.getBoundingClientRect().height;
  pong.players[0].pos.y = canvas.height * scale;
});

canvas.addEventListener("click", event => {
  pong.start();
});





