const path = require("path");

module.exports = {
  entry: ["./src/lib/ax.25.ts"],
  target: "node",
  node: {
    __dirname: true,
  },
  resolve: {
    extensions: [".js", ".json", ".ts", ".tsx"],
    extensionAlias: {
      ".js": [".js", ".ts"],
      ".cjs": [".cjs", ".cts"],
      ".mjs": [".mjs", ".mts"],
    },
  },
  optimization: {
    minimize: true,
  },
  output: {
    libraryTarget: "commonjs",
    path: path.join(__dirname, "dist"),
    filename: "index.js",
  },
  module: {
    rules: [
      {
        test: /\.([cm]?ts|tsx)$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "ts-loader",
            options: {
              transpileOnly: false,
            },
          },
        ],
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
    ],
  },
};
