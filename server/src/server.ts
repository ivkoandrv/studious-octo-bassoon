/**
 * Here is a simple wss implementation
 * I did it really fast
 */
import express from "express"
import {createServer} from "http"
import {WebSocket, WebSocketServer} from "ws";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const POLLING_INTERVAL = 2000
const INITIAL_BUTTONS_COUNT = 10

const app = express()
const server = createServer(app)
const wss = new WebSocketServer({server})

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'HEAD', 'DELETE'],
    credentials: true
}))

/**
 * Data generators
 */

const generateId = () : string => Math.random().toString(36).substring(2, 9)
const generateButtonText = () : string => `Button ${Math.floor(Math.random() * 1000)}`

const generateButtons = (count: number) => Array.from({length: count}, () => ({
    id: generateId(),
    text: generateButtonText(),
    isUpdated: true
}))

/**
 * Web Socket handlers
 */

wss.on("connection", (ws: WebSocket) => {
    console.log('New client connected')

    const initialItems = generateButtons(INITIAL_BUTTONS_COUNT)
    ws.send(JSON.stringify({buttons: initialItems}))


    /**
     * Update interval
     */

    const updateInterval = setInterval(() => {
        if(ws.readyState === WebSocket.OPEN) {
            // generate random length array with buttons
            const newItems = generateButtons(Math.floor(Math.random() * 5) + 1)
            ws.send(JSON.stringify({buttons: newItems}))
        }
    }, POLLING_INTERVAL)

    ws.on('close', () => {
        console.log('Client disconnected')
        clearInterval(updateInterval)
    })

    ws.on('error', (err: Error) => {
        console.log('WS ERROR!!', err)
        clearInterval(updateInterval)
    })
})

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})

// test route if everything is working fine
app.get('/health', (_req, res) => {
    res.status(200).json({status: 'ok'})
})

/**
 * Shutdown
 */
process.on('SIGTERM', () => {
    console.log('Shutting down...');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});