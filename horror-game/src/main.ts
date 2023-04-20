import './style.css'
import { Application } from 'pixi.js'

const app = new Application({
  width: 500,
  height: 500
})

const appElement = document.querySelector<HTMLDivElement>('#app')!

appElement.appendChild(app.view as HTMLCanvasElement)