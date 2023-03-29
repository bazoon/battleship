import {useState} from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Board from './Board'
import Game from './Game'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="App">
      <Game />
    </div>
  )
}

export default App
