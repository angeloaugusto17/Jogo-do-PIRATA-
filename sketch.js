//CONSTANTES
const Engine = Matter.Engine;
const World = Matter.World;
const Bodies = Matter.Bodies;

//VARIAVEIS
var engine, world;

//objetos gerais
var ground, tower, cannon, angle, boat;

//matrix
var balls = [];
var boats = [];

//pontos
var score = 0;

//sons
var risoSound, bgSound, shootSound;

//imagem
var backgroundImg;

//animaçoes
var boatAnimation = [];
//var data armazena o dados JSON - var sheet armazena as imagens
var boatSpritedata, boatSpritesheet;

var brokenBoatAnimation = [];
var brokenBoatSpritedata, brokenBoatSpritesheet;

var waterSplashAnimation = [];
var waterSplashSpritedata, waterSplashSpritesheet;

//estado
var isGameOver = false;
var isLaughing = false;

//funçao para carregar imagens/animaçoes/sons
function preload() {
  //imagens
  backgroundImg = loadImage("./assets/background.gif");
  towerImage = loadImage("./assets/tower.png");

  //animaçoes 
    //carrega a imagem - bote navegando
  boatSpritesheet = loadImage("assets/boat/boat.png");
    //carrega o arquivo JSON - bote navegando
  boatSpritedata = loadJSON("assets/boat/boat.json");

  //bote quebrando
  brokenBoatSpritesheet = loadImage("assets/boat/broken_boat.png");
  brokenBoatSpritedata = loadJSON("assets/boat/broken_boat.json");
  
  //bola na agua
  waterSplashSpritesheet = loadImage("assets/water_splash/water_splash.png");
  waterSplashSpritedata = loadJSON("assets/water_splash/water_splash.json");

  //sons
  bgSound = loadSound("./assets/background_music.mp3");
  risoSound = loadSound("./assets/pirate_laugh.mp3");
  shootSound = loadSound("./assets/cannon_explosion.mp3");
}

//INICIALIZAR VARIAVEIS - EXECUTA UMA VEZ
function setup() {
  //cria a tela
  createCanvas(1200,600);

  //inicializa o mundo e mecanismo
  engine = Engine.create();
  world = engine.world;

  //cria o chão e adiciona ao mundo
  ground = Bodies.rectangle(0, height - 1, width * 2, 1, { isStatic: true });
  World.add(world, ground);

  //cria a torre e adiciona ao mundo
  tower = Bodies.rectangle(160, 350, 160, 310, { isStatic: true });
  World.add(world, tower);

  //cria o angulo e o canhão com a classe Cannon
  angleMode(DEGREES)
  angle = 15
  cannon = new Cannon(180, 110, 100, 70, angle);

  //funcionalidade das animaçoes JSON
  var boatFrames = boatSpritedata.frames;
  for (var i = 0; i < boatFrames.length; i++) {
    var pos = boatFrames[i].position;
    var img = boatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    boatAnimation.push(img);
  }

  var brokenBoatFrames = brokenBoatSpritedata.frames;
  for (var i = 0; i < brokenBoatFrames.length; i++) {
    var pos = brokenBoatFrames[i].position;
    var img = brokenBoatSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    brokenBoatAnimation.push(img);
  }

  var waterSplashFrames = waterSplashSpritedata.frames;
  for (var i = 0; i < waterSplashFrames.length; i++) {
    var pos = waterSplashFrames[i].position;
    var img = waterSplashSpritesheet.get(pos.x, pos.y, pos.w, pos.h);
    waterSplashAnimation.push(img);
  }
}

//DESENHA NA TELA - DEFINE FUNÇOES - EXECUTA VARIAS VEZES
function draw() {
  //define o fundo
  image(backgroundImg, 0, 0, width, height);

  //condicional - se a musica nao estiver tocando, toque a musica - muda o volume
  if(!bgSound.isPlaying()){
    bgSound.play();
    bgSound.setVolume(0.2);
  }

  //atualiza constantemente o mecanismo
  Engine.update(engine);
 
  //exibe o chão
  push();
  translate(ground.position.x, ground.position.y);
  fill("brown");
  rectMode(CENTER);
  rect(0, 0, width * 2, 1);
  pop();

  //exibe a torre
  push();
  translate(tower.position.x, tower.position.y);
  rotate(tower.angle);
  imageMode(CENTER);
  image(towerImage, 0, 0, 160, 310);
  pop();

  //chama a função mostrar boates
  showBoats();

  for (var i = 0; i < balls.length; i++) {
    showCannonBalls(balls[i], i);
    collisionWithBoat(i);
  }

  //exibe o canhão criado com a classe Cannon
  cannon.display();
  
  //exibe a pontuação, alinha, troca de cor, troca tamanho da letra
  fill("black"); 
  textSize(40); 
  text(`PONTUAÇÃO: ${score}`, width - 230, 50); 
  textAlign(CENTER, CENTER);


}

//função de quando a tecla é pressionada
function keyPressed() {
  //se a tecla down for pressionada
  if (keyCode === DOWN_ARROW) {
    //cria um objeto bola com a classe CannonBall
    var cannonBall = new CannonBall(cannon.x, cannon.y);
    //adiciona uma trajetoria
    cannonBall.trajectory = [];
    //define o angulo
    Matter.Body.setAngle(cannonBall.body, cannon.angle);
    //insere um novo objeto CannonBall, dentro da matrix balls
    balls.push(cannonBall);
  }
}

//função de quando a tecla é solta
function keyReleased() {
  if (keyCode === DOWN_ARROW && !isGameOver) {
    //toca o som
    shootSound.play();
    //chama a função shoot da classe
    balls[balls.length - 1].shoot();
  }
}

//funçao para mostrar a bola do canhao
function showCannonBalls(ball, index) {
  if (ball) {
    //mostra a bola com a função display
    ball.display();
    //chama a animação
    ball.animate();
    //se a bola sai da tela
    if (ball.body.position.x >= width || ball.body.position.y >= height - 50) {
      //remove da matrix
      ball.remove(index);
    }
  }
}

//função para mostrar os botes
function showBoats() {
  if(boats.lenght > 0){
    if(boats.lenght < 4 && boats[boats.lenght - 1].body.position.x < width - 300){
      var pos = [-40,-60,-70,-20];
      var position = random(pos);
      var boat = new Boat(width, height - 100, 170, 170, position, boatAnimation);
      boats.push(boat);
    }  

    for(var i = 0; i < boats.lenght; i++){
      Matter.body.setVelocity(boats[i].body, {x:-1, y:0});
      boats[i].display();
      boats[i].animate();

      var collision = Matter.SAT.collides(this.tower, boats[i].body);

      if(collision.collided && !boats[i].isBroken){
        if(!isLaughing && !risoSound.isPlaying()){
          risoSound.play();
          isLaughing = true;
        }
        isGameover = true;
        gameOver();
      }
    }
  }
  else{
    var boat = new Boat(width, height - 60, 170, 170, -60, boatAnimation);
    boats.push(boat);
  }
}

//colisão dos botes
function collisionWithBoat(index) {
  for(var i = 0; i < boats.length; i++){
    if(balls[index] !== undefined && boats[i] !== undefined){
      var collision = Matter.SAT.collides(balls[index].body, boats[i].body);
      if(collision.collided){
        score += 10;
        boats[i].remove(i);
        Matter.World.remove(world,balls[index].body);
        delete balls[index]; 
      }
    }
  }

}

//cria a tela final de game over
function gameOver() {
  swal({
    title: "FIM DE JOGO!",
    text: "OBRIGADO POR JOGAR!",
    imageUrl: "https://raw.githubusercontent.com/whitehatjr/PiratesInvasion/main/assets/boat.png",
    imageSize: "150x150",
    confirmButtonText: "JOGAR NOVAMENTE"
  }, function(isConfirm){
    if(isConfirm){
      location.reload();
    }
  });
}
