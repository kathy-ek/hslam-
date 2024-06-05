import Versions from './components/Versions'
import electronLogo from './assets/electron.svg'
import { useState } from 'react'
import HSLAMForm from './components/HSLAMInitializationForm'

function App() {
  // let ipcRenderer = window.electron.ipcRenderer
  // const ipcHandle = () => window.electron.ipcRenderer.send('ping')
  const [lsResult, setLsResult] = useState(null)

  return (
    <>
      <HSLAMForm />
    </>
  )
}

export default App
