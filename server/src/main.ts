import { App } from "./bootstrap"

const app = new App()

await app.build()
await app.start()
