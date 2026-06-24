import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import HeaderComponent from './components/headerComponent.jsx'
import HeroComponent from './components/heroComponent.jsx'
import FooterComponent from './components/footerComponent.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
<HeaderComponent/>
<HeroComponent/>
<FooterComponent/>
    </>
  )
}

export default App
