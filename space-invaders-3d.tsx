import React, { useState, useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Text, OrbitControls } from '@react-three/drei'
import { Vector3 } from 'three'

function Player({ position, onShoot }) {
  const ref = useRef()
  const [playerPos, setPlayerPos] = useState(new Vector3(...position))
  const [keys, setKeys] = useState({ left: false, right: false })

  useFrame((state, delta) => {
    if (ref.current) {
      const newPos = playerPos.clone()
      if (keys.left) newPos.x -= 5 * delta
      if (keys.right) newPos.x += 5 * delta
      newPos.x = Math.max(-4, Math.min(4, newPos.x))
      setPlayerPos(newPos)
      ref.current.position.copy(newPos)
    }
  })

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: true }))
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: true }))
      if (e.code === 'Space') onShoot(playerPos.clone())
    }
    const handleKeyUp = (e) => {
      if (e.key === 'ArrowLeft') setKeys(prev => ({ ...prev, left: false }))
      if (e.key === 'ArrowRight') setKeys(prev => ({ ...prev, right: false }))
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [onShoot, playerPos])

  return (
    <Box ref={ref} args={[1, 0.5, 0.5]} position={position}>
      <meshStandardMaterial color="blue" />
    </Box>
  )
}

function Bullet({ position, onHit }) {
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.position.z -= 10 * delta
      if (ref.current.position.z < -10) {
        onHit()
      }
    }
  })

  return (
    <Box ref={ref} args={[0.1, 0.1, 0.3]} position={position}>
      <meshStandardMaterial color="yellow" />
    </Box>
  )
}

function Invader({ position, onHit }) {
  const ref = useRef()

  useFrame((state, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta
    }
  })

  return (
    <Box ref={ref} args={[0.8, 0.8, 0.8]} position={position} onClick={onHit}>
      <meshStandardMaterial color="green" />
    </Box>
  )
}

function Game() {
  const [invaders, setInvaders] = useState([])
  const [bullets, setBullets] = useState([])
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)

  useEffect(() => {
    const newInvaders = []
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        newInvaders.push({ id: `${i}-${j}`, position: [i * 2 - 4, j * 2 + 3, -5] })
      }
    }
    setInvaders(newInvaders)
  }, [])

  useEffect(() => {
    if (invaders.length === 0 && !gameOver) {
      setGameOver(true)
    }
  }, [invaders, gameOver])

  useFrame((state, delta) => {
    setInvaders((prevInvaders) =>
      prevInvaders.map((invader) => ({
        ...invader,
        position: [
          invader.position[0],
          invader.position[1],
          invader.position[2] + Math.sin(state.clock.elapsedTime) * 0.01,
        ],
      }))
    )
  })

  const handleShoot = (playerPos) => {
    setBullets((prev) => [...prev, { id: Date.now(), position: [playerPos.x, playerPos.y + 0.5, playerPos.z] }])
  }

  const handleBulletHit = (bulletId) => {
    setBullets((prev) => prev.filter((bullet) => bullet.id !== bulletId))
  }

  const handleInvaderHit = (invaderId) => {
    setInvaders((prev) => prev.filter((invader) => invader.id !== invaderId))
    setScore((prev) => prev + 100)
  }

  const resetGame = () => {
    setGameOver(false)
    setScore(0)
    const newInvaders = []
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 3; j++) {
        newInvaders.push({ id: `${i}-${j}`, position: [i * 2 - 4, j * 2 + 3, -5] })
      }
    }
    setInvaders(newInvaders)
    setBullets([])
  }

  return (
    <>
      <Player position={[0, -3, 0]} onShoot={handleShoot} />
      {bullets.map((bullet) => (
        <Bullet key={bullet.id} position={bullet.position} onHit={() => handleBulletHit(bullet.id)} />
      ))}
      {invaders.map((invader) => (
        <Invader key={invader.id} position={invader.position} onHit={() => handleInvaderHit(invader.id)} />
      ))}
      <Text position={[0, 4, 0]} fontSize={0.5} color="white">
        Score: {score}
      </Text>
      {gameOver && (
        <>
          <Text position={[0, 0, 0]} fontSize={1} color="white">
            Game Over!
          </Text>
          <Box position={[0, -1, 0]} args={[2, 0.5, 0.5]} onClick={resetGame}>
            <meshStandardMaterial color="blue" />
            <Text position={[0, 0, 0.26]} fontSize={0.2} color="white">
              Play Again
            </Text>
          </Box>
        </>
      )}
    </>
  )
}

export default function Component() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 0, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Game />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
      <div className="absolute top-0 left-0 text-white p-4">
        <h1 className="text-2xl font-bold">3D Space Invaders</h1>
        <p>Use left/right arrows to move and space to shoot!</p>
      </div>
    </div>
  )
}
