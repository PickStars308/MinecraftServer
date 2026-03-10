const {spawn} = require("child_process")

function start(name, path) {

    const process = spawn("node", [path], {
        stdio: "inherit",
        shell: true
    })

    process.on("close", (code) => {
        console.log(`${name} exited with code ${code}`)
    })

}

start("ServerBackend", "./Server/ServerBackend/server.js")
start("MinecraftStatus", "./Server/MinecraftStatus/server.js")
