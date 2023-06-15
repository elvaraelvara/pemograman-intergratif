const express = require("express");
const app = express();

const port = 3030;

// Define Route
app.get("/", (req, res) => {
    console.log('client connected')

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Access-Controll-Allow-Origin", "*");

    const intervalId = setInterval(() => {
        const date = new Date().toLocaleString();
        res.write(`data: ${date}\n\n`)
    }, 10000)

    res.on('close', () => {
        console.log('client closed connection')
        clearInterval(intervalId);
        res.end
    })
})

app.listen(port, () => {
    console.log('server is running')
})