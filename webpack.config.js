const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const path = require("path");

module.exports = {
  mode: "production",
  target: "node",
  entry: {
    // Прописывай для каждого таска точку входа и имя.
    //  Пример: SimUDuckExtra: "./labs/lab1/SimUDuckExtra/main.ts",
    Conversion: "./labs/lab1/main.ts",
  },
  output: {
    filename: "[name].bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  plugins: [new CleanWebpackPlugin()],
};
