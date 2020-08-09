const path = require("path");

module.exports = {
  entry: "./src/index.ts",
  devtool: "source-map",
  mode: "production",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
    library: "[name]",
    libraryTarget: "commonjs2",
  },
  target: "node",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: false,
            },
          },
        ],
        exclude: /node_modules/,
      },
      { test: /package.json/ },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".json"],
  },
  externals: {
    bl: "bl",
    "cross-spawn": "cross-spawn",
  },
};
