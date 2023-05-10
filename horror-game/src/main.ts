import { Graphics, Rectangle } from 'pixi.js'
import './style.css'
import { Application,Sprite } from 'pixi.js'
import { Texture } from 'pixi.js'

const WINDOW_WIDTH = 750
const WINDOW_HEIGHT = 750
const UNIT = 30
const UNIT_SIZE = WINDOW_WIDTH/UNIT
const HALF_UNIT_SIZE = UNIT_SIZE/2
const PLAYER_SPEED = 2
const MONSTER_SPEED = 2
let LAST_MOVE = {'U':false,'D':false,'R':false,'L':false}

const VIEW_SIZE = UNIT_SIZE*7
const FLASHLIGHT_SIZE = UNIT_SIZE*9

let IN_MANSION = false

const BACKGROUND_PATH = 'image/background.png'
const ROOF_PATH = 'image/roof.png'

const GAMEOVER_PATH = 'image/gameover.jpg'
const WIN_PATH = 'image/win.jpg'
const EXIT_PATH = 'image/exit.png'

const PLAYER_UP_PATH = 'image/hunter_up.png'
const PLAYER_DOWN_PATH = 'image/hunter_down.png'
const PLAYER_RIGHT_PATH = 'image/hunter_right.png'
const PLAYER_LEFT_PATH = 'image/hunter_left.png'

const MONSTER_UP_PATH = 'image/monster_up.png'
const MONSTER_DOWN_PATH = 'image/monster_down.png'
const MONSTER_RIGHT_PATH = 'image/monster_right.png'
const MONSTER_LEFT_PATH = 'image/monster_left.png'

const VIEW_PATH = 'image/flashlight.png'

const X_WALL_PATH = 'image/2x1_wall.png'
const Y_WALL_PATH = 'image/1x2_wall.png'
const CORNER_PATH = 'image/corner.png'

const app = new Application({
  width: WINDOW_WIDTH,
  height: WINDOW_HEIGHT,
  backgroundColor: 0x000000
})

const appElement = document.querySelector<HTMLDivElement>('#app')!

appElement.appendChild(app.view as HTMLCanvasElement)

app.ticker.add(gameLoop)

// Background Sprite
const bg:Sprite = Sprite.from(BACKGROUND_PATH)
bg.anchor.set(0.5)
bg.width = WINDOW_WIDTH
bg.height = WINDOW_HEIGHT
bg.x = WINDOW_WIDTH/2 - UNIT_SIZE*2
bg.y = WINDOW_HEIGHT/2

// Roof Sprite
const roof:Sprite = Sprite.from(ROOF_PATH)
roof.anchor.set(0.5)
roof.width = WINDOW_WIDTH
roof.height = pos(18) + HALF_UNIT_SIZE
roof.x = WINDOW_WIDTH - pos(9)
roof.y = WINDOW_HEIGHT/2
roof.angle = 90

// Gameover Sprite
const go:Sprite = Sprite.from(GAMEOVER_PATH)
go.anchor.set(0.5)
go.width = WINDOW_WIDTH
go.height = WINDOW_HEIGHT/3*2
go.x = WINDOW_WIDTH/2
go.y = WINDOW_HEIGHT/2

// Player Sprite
const player:Sprite = Sprite.from(PLAYER_DOWN_PATH)
player.anchor.set(0.5)
player.width = UNIT_SIZE*1.5
player.height = UNIT_SIZE*1.5
player.x = pos(1)
player.y = pos(15)

// View Sprite
const view:Sprite = Sprite.from(VIEW_PATH)
view.anchor.set(0.5)
view.width = VIEW_SIZE
view.height = VIEW_SIZE

const rect1:Graphics = new Graphics()
const rect2:Graphics = new Graphics()
const rect3:Graphics = new Graphics()
const rect4:Graphics = new Graphics()

rect1.beginFill(0x000000)
rect2.beginFill(0x000000)
rect3.beginFill(0x000000)
rect4.beginFill(0x000000)

rect1.drawRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT)
rect2.drawRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT)
rect3.drawRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT)
rect4.drawRect(0,0,WINDOW_WIDTH,WINDOW_HEIGHT)

// Monster 1 Sprite
const monster1:Sprite = Sprite.from(MONSTER_DOWN_PATH)
monster1.anchor.set(0.5)
monster1.width = UNIT_SIZE*2
monster1.height = UNIT_SIZE*2

// Monster 2 Sprite
const monster2:Sprite = Sprite.from(MONSTER_DOWN_PATH)
monster2.anchor.set(0.5)
monster2.width = UNIT_SIZE*2
monster2.height = UNIT_SIZE*2

// Monster 3 Sprite
const monster3:Sprite = Sprite.from(MONSTER_DOWN_PATH)
monster3.anchor.set(0.5)
monster3.width = UNIT_SIZE*2
monster3.height = UNIT_SIZE*2

// Monster 4 Sprite
const monster4:Sprite = Sprite.from(MONSTER_DOWN_PATH)
monster4.anchor.set(0.5)
monster4.width = UNIT_SIZE*2
monster4.height = UNIT_SIZE*2

// Exit Sprite
const exit:Sprite = Sprite.from(EXIT_PATH)
exit.anchor.set(0.5)
exit.x = pos(13)
exit.y = pos(27) + HALF_UNIT_SIZE
exit.width = UNIT_SIZE*2
exit.height = UNIT_SIZE*2

// Add Sprite
app.stage.addChild(bg)
app.stage.addChild(player)
app.stage.addChild(monster1)
app.stage.addChild(monster2)
app.stage.addChild(monster3)
app.stage.addChild(monster4)
app.stage.addChild(exit)

// Entity List
let MONSTER_LIST:Sprite[] = [monster1,monster2,monster3,monster4]
let WALL_LIST:Sprite[] = []

// Keyboard movement
let keys = {}

window.addEventListener('keydown',keysDown)
window.addEventListener('keyup',keysUp)

// Monster Positions
// Monster 1
let GOING_TO_POS_1 = true
const XPOS_1 = pos(12) + HALF_UNIT_SIZE
const YPOS_1 = pos(4) + HALF_UNIT_SIZE
monster1.x = XPOS_1
monster1.y = YPOS_1

// Monster 2
let GOING_TO_POS_2 = true
const XPOS_2 = pos(27) + HALF_UNIT_SIZE
const YPOS_2 = pos(21) + HALF_UNIT_SIZE
monster2.x = XPOS_2
monster2.y = YPOS_2

// Monster 3
let GOING_TO_POS_3 = true
const XPOS_3 = pos(27) + HALF_UNIT_SIZE
const YPOS_3 = pos(1) + HALF_UNIT_SIZE
monster3.x = XPOS_3
monster3.y = YPOS_3

// Monster 4
let GOING_TO_POS_4 = true
const XPOS_4 = pos(21) + HALF_UNIT_SIZE
const YPOS_4 = pos(27) + HALF_UNIT_SIZE
monster4.x = XPOS_4
monster4.y = YPOS_4

makeLabyrinth()

addRoof()

function gameLoop() {
  if ((player.x >= pos(9) + HALF_UNIT_SIZE && player.x <= pos(10))&&
    (player.y > pos(14) && player.y <= pos(15) + HALF_UNIT_SIZE)) {
    removeRoof()
    player.x = pos(13)
  }
  if (player.x >= pos(12) && player.x <= pos(14) && player.y >= pos(27)) {
    win()
  }
  if ((player.x <= pos(10)) || 
    (player.x < pos(18) && player.y < pos(18) && player.y > pos(10))) {
    IN_MANSION = false
  } else {
    IN_MANSION = true
  }
  if (MONSTER_LIST.some(monster => checkColision(player,monster))) {
    IN_MANSION = false
    removeView()
    gameover()
  }
  if (!WALL_LIST.some(entity => checkColision(player,entity))) {
    movement(player)
  } else {
    resetPlayerPos(player)
  }

  GOING_TO_POS_1 = moveRightMonster(monster1,XPOS_1,pos(28),GOING_TO_POS_1)
  GOING_TO_POS_2 = moveLeftMonster(monster2,XPOS_2,pos(12),GOING_TO_POS_2)
  GOING_TO_POS_3 = moveDownMonster(monster3,YPOS_3,pos(28),GOING_TO_POS_3)
  GOING_TO_POS_4 = moveUpMonster(monster4,YPOS_4,pos(2),GOING_TO_POS_4)

  if (IN_MANSION){
    placeView()
  } else {
    removeView()
  }
}

function removeView() {
  app.stage.removeChild(rect1)
  app.stage.removeChild(rect2)
  app.stage.removeChild(rect3)
  app.stage.removeChild(rect4)
  app.stage.removeChild(view)
}

function placeView() {
  app.stage.addChild(rect1)
  app.stage.addChild(rect2)
  app.stage.addChild(rect3)
  app.stage.addChild(rect4)
  app.stage.addChild(view)

  view.x = player.x
  view.y = player.y

  rect1.x = player.x + view.width/2
  rect2.x = player.x - rect2.width - view.width/2
  rect3.y = player.y + view.width/2
  rect4.y = player.y - rect4.width - view.width/2
}

function getFlashlight() {
  view.width = FLASHLIGHT_SIZE
  view.height = FLASHLIGHT_SIZE
}

function makeLabyrinth() {
  // Make Corner
  const X_START = pos(11)
  const X_END = pos(29)
  const Y_TOP_START = pos(0)
  const Y_TOP_END = pos(12)
  const Y_BOT_START = pos(17)
  const Y_BOT_END = pos(29)

  let cornersTop: Sprite[] = []
  let cornersBot: Sprite[] = []

  // cornersTop
  for (let i = 0; i < 34; i++) {
    const corner:Sprite = Sprite.from(CORNER_PATH)
    corner.anchor.set(0.5)
    corner.width = UNIT_SIZE
    corner.height = UNIT_SIZE
    cornersTop.push(corner)
  }

  // cornersBot
  for (let i = 0; i < 35; i++) {
    const corner:Sprite = Sprite.from(CORNER_PATH)
    corner.anchor.set(0.5)
    corner.width = UNIT_SIZE
    corner.height = UNIT_SIZE
    cornersBot.push(corner)
  }

  WALL_LIST = [...cornersTop,...cornersBot]
  
  // Place Corners
  for (let i = X_START; i <= X_END; i+=UNIT_SIZE*3) {
    for (let j = Y_TOP_START; j <= Y_TOP_END; j+=UNIT_SIZE*3) {
      if (i != X_START+UNIT_SIZE*3 || j != Y_TOP_END) {
        const corner = cornersTop.pop()
        corner.x = i
        corner.y = j
        app.stage.addChild(corner)
      }
    }
  }

  for (let i = X_START; i <= X_END; i+=UNIT_SIZE*3) {
    for (let j = Y_BOT_START; j <= Y_BOT_END; j+=UNIT_SIZE*3) {
      const corner = cornersBot.pop()
      corner.x = i
      corner.y = j
      app.stage.addChild(corner)
    }
  }

  // Make Walls
  const X_WALL_WIDTH = UNIT_SIZE*2
  const X_WALL_HEIGHT = UNIT_SIZE
  const Y_WALL_WIDTH = UNIT_SIZE
  const Y_WALL_HEIGHT = UNIT_SIZE*2

  const X_START_X_WALL = pos(12) + HALF_UNIT_SIZE
  const X_END_X_WALL = pos(27) + HALF_UNIT_SIZE
  const Y_START_TOP_Y_WALL = pos(1) + HALF_UNIT_SIZE
  const Y_END_TOP_Y_WALL = pos(10) + HALF_UNIT_SIZE
  const Y_START_BOT_Y_WALL = pos(18) + HALF_UNIT_SIZE
  const Y_END_BOT_Y_WALL = pos(27) + HALF_UNIT_SIZE

  let xTopWalls:Sprite[] = []
  let yTopWalls:Sprite[] = []
  let xBotWalls:Sprite[] = []
  let yBotWalls:Sprite[] = []
  let yMidWalls:Sprite[] = []

  // xTopWalls
  for (let i = 0; i < 20; i++) {
    const wall:Sprite = Sprite.from(X_WALL_PATH)
    wall.anchor.set(0.5)
    wall.width = X_WALL_WIDTH
    wall.height = X_WALL_HEIGHT
    xTopWalls.push(wall)
  }

  // yTopWalls
  for (let i = 0; i < 13; i++) {
    const wall:Sprite = Sprite.from(Y_WALL_PATH)
    wall.anchor.set(0.5)
    wall.width = Y_WALL_WIDTH
    wall.height = Y_WALL_HEIGHT
    yTopWalls.push(wall)
  }

  // xBotWalls
  for (let i = 0; i < 18; i++) {
    const wall:Sprite = Sprite.from(X_WALL_PATH)
    wall.anchor.set(0.5)
    wall.width = X_WALL_WIDTH
    wall.height = X_WALL_HEIGHT
    xBotWalls.push(wall)
  }

  // yBotWalls
  for (let i = 0; i < 15; i++) {
    const wall:Sprite = Sprite.from(Y_WALL_PATH)
    wall.anchor.set(0.5)
    wall.width = Y_WALL_WIDTH
    wall.height = Y_WALL_HEIGHT
    yBotWalls.push(wall)
  }

  // yMidWalls
  for (let i = 0; i < 8; i++) {
    const wall:Sprite = Sprite.from(Y_WALL_PATH)
    wall.anchor.set(0.5)
    wall.width = Y_WALL_WIDTH
    wall.height = Y_WALL_HEIGHT
    yMidWalls.push(wall)
  }

  WALL_LIST = [...WALL_LIST,...xTopWalls,...yTopWalls,...xBotWalls,...yBotWalls,...yMidWalls]

  // Place Walls
  // xTopWalls
  // 01,02,04,14,24,32,42,43,51,53
  for (let i = X_START_X_WALL; i <= X_END_X_WALL; i+=UNIT_SIZE*3) {
    for (let j = Y_TOP_START; j <= Y_TOP_END; j+=UNIT_SIZE*3) {
      if ((i != X_START_X_WALL || j != Y_TOP_START+UNIT_SIZE*3) &&
        (i != X_START_X_WALL || j != Y_TOP_START+UNIT_SIZE*3*2) &&
        (i != X_START_X_WALL || j != Y_TOP_START+UNIT_SIZE*3*4) &&
        (i != X_START_X_WALL+UNIT_SIZE*3 || j != Y_TOP_START+UNIT_SIZE*3*4) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*2 || j != Y_TOP_START+UNIT_SIZE*3*4) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*3 || j != Y_TOP_START+UNIT_SIZE*3*2) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*4 || j != Y_TOP_START+UNIT_SIZE*3*2) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*4 || j != Y_TOP_START+UNIT_SIZE*3*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*5 || j != Y_TOP_START+UNIT_SIZE*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*5 || j != Y_TOP_START+UNIT_SIZE*3*3)) {
        const wall = xTopWalls.pop()
        wall.x = i
        wall.y = j
        app.stage.addChild(wall)
      }
    }
  }

  // yTopWalls
  // 10,13,20,21,22,30,31,32,33,40,42,43,50,51,53
  for (let i = X_START; i <= X_END; i+=UNIT_SIZE*3) {
    for (let j = Y_START_TOP_Y_WALL; j <= Y_END_TOP_Y_WALL; j+=UNIT_SIZE*3) {
      if ((i != X_START+UNIT_SIZE*3 || j != Y_START_TOP_Y_WALL) &&
        (i != X_START+UNIT_SIZE*3 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3*3) &&
        (i != X_START+UNIT_SIZE*3*2 || j != Y_START_TOP_Y_WALL) &&
        (i != X_START+UNIT_SIZE*3*2 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3) &&
        (i != X_START+UNIT_SIZE*3*2 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3*2) &&
        (i != X_START+UNIT_SIZE*3*3) &&
        (i != X_START+UNIT_SIZE*3*4 || j != Y_START_TOP_Y_WALL) &&
        (i != X_START+UNIT_SIZE*3*4 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3*2) &&
        (i != X_START+UNIT_SIZE*3*4 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3*3) &&
        (i != X_START+UNIT_SIZE*3*5 || j != Y_START_TOP_Y_WALL) &&
        (i != X_START+UNIT_SIZE*3*5 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3) &&
        (i != X_START+UNIT_SIZE*3*5 || j != Y_START_TOP_Y_WALL+UNIT_SIZE*3*3)) {
        const wall = yTopWalls.pop()
        wall.x = i
        wall.y = j
        app.stage.addChild(wall)
      }
    }
  }

  // xBotWalls
  // 01,02,10,12,21,23,31,33,43,50,51,52
  for (let i = X_START_X_WALL; i <= X_END_X_WALL; i+=UNIT_SIZE*3) {
    for (let j = Y_BOT_START; j <= Y_BOT_END; j+=UNIT_SIZE*3) {
      if ((i != X_START_X_WALL || j != Y_BOT_START+UNIT_SIZE*3) &&
        (i != X_START_X_WALL || j != Y_BOT_START+UNIT_SIZE*3*2) &&
        (i != X_START_X_WALL+UNIT_SIZE*3 || j != Y_BOT_START) &&
        (i != X_START_X_WALL+UNIT_SIZE*3 || j != Y_BOT_START+UNIT_SIZE*3*2) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*2 || j != Y_BOT_START+UNIT_SIZE*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*2 || j != Y_BOT_START+UNIT_SIZE*3*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*3 || j != Y_BOT_START+UNIT_SIZE*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*3 || j != Y_BOT_START+UNIT_SIZE*3*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*4 || j != Y_BOT_START+UNIT_SIZE*3*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*5 || j != Y_BOT_START) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*5 || j != Y_BOT_START+UNIT_SIZE*3) &&
        (i != X_START_X_WALL+UNIT_SIZE*3*5 || j != Y_BOT_START+UNIT_SIZE*3*2)) {
        const wall = xBotWalls.pop()
        wall.x = i
        wall.y = j
        app.stage.addChild(wall)
      }
    }
  }

  // yBotWalls
  // 10,12,13,21,23,30,32,41,43,50,51,52,53
  for (let i = X_START; i <= X_END; i+=UNIT_SIZE*3) {
    for (let j = Y_START_BOT_Y_WALL; j <= Y_END_BOT_Y_WALL; j+=UNIT_SIZE*3) {
      if ((i != X_START+UNIT_SIZE*3 || j != Y_START_BOT_Y_WALL) &&
        (i != X_START+UNIT_SIZE*3 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3*2) &&
        (i != X_START+UNIT_SIZE*3 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3*3) &&
        (i != X_START+UNIT_SIZE*3*2 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3) &&
        (i != X_START+UNIT_SIZE*3*2 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3*3) &&
        (i != X_START+UNIT_SIZE*3*3 || j != Y_START_BOT_Y_WALL) &&
        (i != X_START+UNIT_SIZE*3*3 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3*2) &&
        (i != X_START+UNIT_SIZE*3*4 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3) &&
        (i != X_START+UNIT_SIZE*3*4 || j != Y_START_BOT_Y_WALL+UNIT_SIZE*3*3) && 
        (i != X_START+UNIT_SIZE*3*5)) {
        const wall = yBotWalls.pop()
        wall.x = i
        wall.y = j
        app.stage.addChild(wall)
      }
    }
  }

  // yMidWalls
  // 00,01,10,11,20,31,40,51
  const MID_START = Y_END_TOP_Y_WALL+UNIT_SIZE*3
  const MID_END = Y_START_BOT_Y_WALL-UNIT_SIZE*2
  for (let i = X_START; i <= X_END; i+=UNIT_SIZE*3) {
    for (let j = MID_START; j < MID_END; j+=UNIT_SIZE*2) {
      if ((i != X_START + UNIT_SIZE*3) &&
        (i != X_START + UNIT_SIZE*3*2 || j != MID_START) &&
        (i != X_START + UNIT_SIZE*3*3 || j != MID_START+UNIT_SIZE*2) &&
        (i != X_START + UNIT_SIZE*3*4 || j != MID_START) &&
        (i != X_START + UNIT_SIZE*3*5 || j != MID_START+UNIT_SIZE*2)) {
        const wall = yMidWalls.pop()
        wall.x = i
        wall.y = j
        app.stage.addChild(wall)
      }
    }
  }
}

function moveRightMonster(entity:Sprite,from:number,to:number,going:boolean):boolean {
  if (entity.x < to && going) {
    entity.texture = Texture.from(MONSTER_RIGHT_PATH)
    moveRight(entity,MONSTER_SPEED)
    return true
  } else {
    entity.texture = Texture.from(MONSTER_LEFT_PATH)
    moveLeft(entity,MONSTER_SPEED)
    if (entity.x < from){return true}
    return false
  }
}

function moveLeftMonster(entity:Sprite,from:number,to:number,going:boolean):boolean {
  if (entity.x > to && going) {
    entity.texture = Texture.from(MONSTER_LEFT_PATH)
    moveLeft(entity,MONSTER_SPEED)
    return true
  } else {
    entity.texture = Texture.from(MONSTER_RIGHT_PATH)
    moveRight(entity,MONSTER_SPEED)
    if (entity.x > from){return true}
    return false
  }
}

function moveUpMonster(entity:Sprite,from:number,to:number,going:boolean):boolean {
  if (entity.y > to && going) {
    entity.texture = Texture.from(MONSTER_UP_PATH)
    moveUp(entity,MONSTER_SPEED)
    return true
  } else {
    entity.texture = Texture.from(MONSTER_DOWN_PATH)
    moveDown(entity,MONSTER_SPEED)
    if (entity.y > from){return true}
    return false
  }
}

function moveDownMonster(entity:Sprite,from:number,to:number,going:boolean):boolean {
  if (entity.y < to && going) {
    entity.texture = Texture.from(MONSTER_DOWN_PATH)
    moveDown(entity,MONSTER_SPEED)
    return true
  } else {
    entity.texture = Texture.from(MONSTER_UP_PATH)
    moveUp(entity,MONSTER_SPEED)
    if (entity.y < from){return true}
    return false
  }
}

function keysDown(e:KeyboardEvent) {
  keys[e.keyCode] = true
}

function keysUp(e:KeyboardEvent) {
  keys[e.keyCode] = false
}

function checkColision(a:Sprite,b:Sprite): boolean {
  const aBox:Rectangle = a.getBounds()
  const bBox:Rectangle = b.getBounds()

  return aBox.x + aBox.width > bBox.x &&
         aBox.x < bBox.width + bBox.x &&
         aBox.y + aBox.height > bBox.y &&
         aBox.y < bBox.height + bBox.y
}

function resetPlayerPos(entity:Sprite) {
  if (LAST_MOVE['L'] == true) {
    entity.x += PLAYER_SPEED + 1
  }
  if (LAST_MOVE['U'] == true) {
    entity.y += PLAYER_SPEED + 1
  }
  if (LAST_MOVE['R'] == true) {
    entity.x -= PLAYER_SPEED + 1
  }
  if (LAST_MOVE['D'] == true) {
    entity.y -= PLAYER_SPEED + 1
  }
}

function movement(entity:Sprite) {
  resetLastMove()
  if (keys['37']) {
    moveLeft(entity,PLAYER_SPEED)
    entity.texture = Texture.from(PLAYER_LEFT_PATH)
    LAST_MOVE['L'] = true
  }
  if (keys['38']) {
    moveUp(entity,PLAYER_SPEED)
    entity.texture = Texture.from(PLAYER_UP_PATH)
    LAST_MOVE['U'] = true
  }
  if (keys['39']) {
    moveRight(entity,PLAYER_SPEED)
    entity.texture = Texture.from(PLAYER_RIGHT_PATH)
    LAST_MOVE['R'] = true
  }
  if (keys['40']) {
    moveDown(entity,PLAYER_SPEED)
    entity.texture = Texture.from(PLAYER_DOWN_PATH)
    LAST_MOVE['D'] = true
  }
}

function resetLastMove() {
  LAST_MOVE = {'U':false,'D':false,'R':false,'L':false}
}

function moveRight(entity:Sprite,amount:number) {
  entity.x += amount
}

function moveLeft(entity:Sprite,amount:number) {
  entity.x -= amount
}

function moveUp(entity:Sprite,amount:number) {
  entity.y -= amount
}

function moveDown(entity:Sprite,amount:number) {
  entity.y += amount
}

function pos(x:number) {
  return HALF_UNIT_SIZE + (UNIT_SIZE*x)
}

function gameover() {
  app.ticker.remove(gameLoop)

  app.stage.removeChildren()

  // Create GameOver image
  const imgElem = document.createElement('img')
  imgElem.id = 'gameoverImg'
  imgElem.src = GAMEOVER_PATH
  appElement.firstChild.remove()
  appElement.appendChild(imgElem)
}

function addRoof() {
  app.stage.addChild(roof)
}
function removeRoof() {
  app.stage.removeChild(roof)
}

function win() {
  app.ticker.remove(gameLoop)

  app.stage.removeChildren()

  // Create Win image
  const imgElem = document.createElement('img')
  imgElem.id = 'gameoverImg'
  imgElem.src = WIN_PATH
  appElement.firstChild.remove()
  appElement.appendChild(imgElem)
}