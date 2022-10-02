const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

const scoreEl = document.querySelector('#scoreEl') // top left score
const modalEl = document.querySelector('#modalEl') // game over  
const modalScoreEl = document.querySelector('#modalScoreEl') // final points
const buttonEl = document.querySelector('#buttonEl') //restart game
const startButtonEl = document.querySelector('#startButtonEl')  
const startModalEl = document.querySelector('#startModalEl') // game start

canvas.width = innerWidth
canvas.height = innerHeight

const x = canvas.width / 2
const y = canvas.height / 2

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = {
      x: 0,
      y: 0
    }
    this.powerUp
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()

    const friction = 0.99

    this.velocity.x *= friction
    this.velocity.y *= friction

    // collision detection for x axis
    if (
      this.x + this.radius + this.velocity.x <= canvas.width &&
      this.x - this.radius + this.velocity.x >= 0
    ) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    }

    // collision detection for y axis
    if (
      this.y + this.radius + this.velocity.y <= canvas.height &&
      this.y - this.radius + this.velocity.y >= 0
    ) {
      this.y += this.velocity.y
    } else {
      this.velocity.y = 0
    }
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.type = 'Linear'
    this.radians = 0
    this.center = {
      x,
      y
    }

    if (Math.random() < 0.5) {
      this.type = 'Homing'

      if (Math.random() < 0.5) {
        this.type = 'Spinning'

        if (Math.random() < 0.5) {
          this.type = 'Homing Spinning'
        }
      }
    }
  }

  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()

    if (this.type === 'Spinning') {
      this.radians += 0.1

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 30
      this.y = this.center.y + Math.sin(this.radians) * 30
    } else if (this.type === 'Homing') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    } else if (this.type === 'Homing Spinning') {
      this.radians += 0.1

      const angle = Math.atan2(
        player.y - this.center.y,
        player.x - this.center.x
      )
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)

      this.center.x += this.velocity.x
      this.center.y += this.velocity.y

      this.x = this.center.x + Math.cos(this.radians) * 30
      this.y = this.center.y + Math.sin(this.radians) * 30
    } else {
      // linear movement
      this.x = this.x + this.velocity.x
      this.y = this.y + this.velocity.y
    }
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

class BackgroundParticle {
  constructor({ position, radius = 3, color = 'blue' }) {
    this.position = position
    this.radius = radius
    this.color = color
    this.alpha = 0.1
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
    c.fillStyle = this.color
    c.fill()
    c.restore()
  }
}

// const powerUp = new PowerUp({y: 100, x: 100,  velocity: { x: 0, y: 0 }})

class PowerUp {
  constructor({ position = { x: 0, y: 0 }, velocity }) {
    this.position = position
    this.velocity = velocity

    this.image = new Image()
    this.image.src = './lightningBolt.png'

    this.alpha = 1
    gsap.to(this, {
      alpha: 0,
      duration: 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'linear'
    })

    this.radians = 0
  }

  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.translate(
      this.position.x + this.image.width / 2,
      this.position.y + this.image.height / 2
    )
    c.rotate(this.radians)
    c.translate(
      -this.position.x - this.image.width / 2,
      -this.position.y - this.image.height / 2
    )
    c.drawImage(this.image, this.position.x, this.position.y)
    c.restore()
  }

  update() {
    this.draw()
    this.radians += 0.01
    this.position.x += this.velocity.x
  }
}



// classes ends , logic 

let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let animationId
let intervalId
let score = 0
let powerUps = []
let frames = 0
let backgroundParticles = []

function init() {
  player = new Player(x, y, 10, 'white')
  projectiles = []
  enemies = []
  particles = []
  powerUps = []
  animationId
  score = 0
  scoreEl.innerHTML = 0
  frames = 0
  backgroundParticles = []

  const spacing = 30

  for (let x = 0; x < canvas.width + spacing; x += spacing) {
    for (let y = 0; y < canvas.height + spacing; y += spacing) {
      backgroundParticles.push(
        new BackgroundParticle({
          position: {
            x,
            y
          },
          radius: 3
        })
      )
    }
  }
}

function spawnEnemies() {
  intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4

    let x
    let y

    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
    }

    const color = `hsl(${Math.random() * 360}, 50%, 50%)`

    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)

    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }

    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000)
}

function spawnPowerUps() {
  spawnPowerUpsId = setInterval(() => {
    powerUps.push(
      new PowerUp({
        position: {
          x: -30,
          y: Math.random() * canvas.height
        },
        velocity: {
          x: Math.random() + 2,
          y: 0
        }
      })
    )
  }, 10000)
}

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  frames++

  // 1-background -particles
  backgroundParticles.forEach((backgroundParticle) => {
    backgroundParticle.draw()

    const dist = Math.hypot(
      player.x - backgroundParticle.position.x,
      player.y - backgroundParticle.position.y
    )

    if (dist < 100) {
      backgroundParticle.alpha = 0

      if (dist > 70) {
        backgroundParticle.alpha = 0.5
      }
    } else if (dist > 100 && backgroundParticle.alpha < 0.1) {
      backgroundParticle.alpha += 0.01
    } else if (dist > 100 && backgroundParticle.alpha > 0.1) {
      backgroundParticle.alpha -= 0.01
    }
  })

   // 2- player
  player.update()

  //3- power-up
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const powerUp = powerUps[i]

    if (powerUp.position.x > canvas.width) {
      powerUps.splice(i, 1)
    } else powerUp.update()

    const dist = Math.hypot(
      player.x - powerUp.position.x,
      player.y - powerUp.position.y
    )

    // gain power up
    if (dist < powerUp.image.height / 2 + player.radius) {
      powerUps.splice(i, 1)
      player.powerUp = 'MachineGun'
      player.color = 'yellow'

      // power up runs out
      setTimeout(() => {
        player.powerUp = null
        player.color = 'white'
      }, 5000)
    }
  }

  // machine gun animation / implementation
  if (player.powerUp === 'MachineGun') {
    const angle = Math.atan2(
      mouse.position.y - player.y,
      mouse.position.x - player.x
    )
    const velocity = {
      x: Math.cos(angle) * 5,
      y: Math.sin(angle) * 5
    }

    if (frames % 2 === 0)
      projectiles.push(
        new Projectile(player.x, player.y, 5, 'yellow', velocity)
      )
  }


  //4- particles
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]

    if (particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
  }


//5- projectiles
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]

    projectile.update()

    // remove from edges of screen
    if (
      projectile.x - projectile.radius < 0 ||
      projectile.x - projectile.radius > canvas.width ||
      projectile.y + projectile.radius < 0 ||
      projectile.y - projectile.radius > canvas.height
    ) {
      projectiles.splice(index, 1)
    }
  }

  // 6- enemies
  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]

    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //7 -end game
    if (dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId)
      clearInterval(intervalId)

      modalEl.style.display = 'block'
      gsap.fromTo(
        '#modalEl',
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          ease: 'expo'
        }
      )
      modalScoreEl.innerHTML = score
    }
//8 - projectile  collide with enemy
    for (
      let projectilesIndex = projectiles.length - 1;
      projectilesIndex >= 0;
      projectilesIndex--
    ) {
      const projectile = projectiles[projectilesIndex]

      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      // when projectiles touch enemy
      if (dist - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(
              projectile.x,
              projectile.y,
              Math.random() * 2,
              enemy.color,
              {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6)
              }
            )
          )
        }
        // this is where we shrink our enemy
        if (enemy.radius > 15) {
          score += 100
          scoreEl.innerHTML = score
          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
          projectiles.splice(projectilesIndex, 1)
        } else {
          // remove enemy if they are too small
          score += 150
          scoreEl.innerHTML = score

          // change background particle colors
          backgroundParticles.forEach((backgroundParticle) => {
            gsap.set(backgroundParticle, {
              color: 'white',
              alpha: 1
            })
            gsap.to(backgroundParticle, {
              color: enemy.color,
              alpha: 0.1
            })
            // backgroundParticle.color = enemy.color
          })

          enemies.splice(index, 1)
          projectiles.splice(projectilesIndex, 1)
        }
      }
    }
  }
}

addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  }
  projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity))
})

const mouse = {
  position: {
    x: 0,
    y: 0
  }
}
addEventListener('mousemove', (event) => {
  mouse.position.x = event.clientX
  mouse.position.y = event.clientY
})

// restart game
buttonEl.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  gsap.to('#modalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = 'none'
    }
  })
})


// start game
startButtonEl.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  spawnPowerUps()
  // startModalEl.style.display = 'none'
  gsap.to('#startModalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: 'expo.in',
    onComplete: () => {
      startModalEl.style.display = 'none'
    }
  })
})

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowRight':
      player.velocity.x += 1
      break
    case 'ArrowUp':
      player.velocity.y -= 1
      break
    case 'ArrowLeft':
      player.velocity.x -= 1
      break
    case 'ArrowDown':
      player.velocity.y += 1
      break
  }
})