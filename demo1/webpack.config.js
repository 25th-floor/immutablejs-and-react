module.exports = {
    context: __dirname + "/src",
    entry: {
        javascript: "./main.js"
    },

    output: {
        filename: "app.js",
        path: __dirname + "/public",
    },

    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loaders: ["babel-loader"]
            }
        ]
    }
};
