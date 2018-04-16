const path = require('path');

module.exports = {
  entry: './elements/app-container.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
  }
};
