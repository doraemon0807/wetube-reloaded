const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const BASE_JS = "./src/client/js/";

module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    recorder: BASE_JS + "recorder.js",
    commentSection: BASE_JS + "commentSection.js",
  }, // <- file you want to convert
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/styles.css",
    }),
  ],
  mode: "development",
  watch: true, // <- keep assets running and refresh every time files are saved
  output: {
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"), // <- where to export converted file
    clean: true, // <- delete old files every time webpack is run
  },
  module: {
    rules: [
      {
        test: /\.js$/, // <- grab all js files
        use: {
          loader: "babel-loader", // <- loader is the dude that transforms the files
          options: {
            presets: [["@babel/preset-env"]],
          },
        },
      },
      {
        test: /\.scss$/,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"], // <- start from the last to first (webpack starts from the end)
      },
    ],
  },
};
