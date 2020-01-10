const path = require("path");
const dotenv = require("dotenv-webpack");

module.exports = {
    mode: "development", // "production"
    entry: "./src/main.js",
    plugins: [
        new dotenv()
    ],
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "weather.bundle.js"
    }
}