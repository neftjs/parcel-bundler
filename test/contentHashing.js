const assert = require('assert');
const fs = require('fs');
const {bundle} = require('./utils');
const rimraf = require('rimraf');
const promisify = require('../src/utils/promisify');
const ncp = promisify(require('ncp'));

describe('content hashing', function() {
  beforeEach(function() {
    rimraf.sync(__dirname + '/input');
  });

  it('should update content hash when content changes', async function() {
    await ncp(__dirname + '/integration/html-css', __dirname + '/input');

    await bundle(__dirname + '/input/index.html', {
      production: true
    });

    let html = fs.readFileSync(__dirname + '/dist/index.html', 'utf8');
    let filename = html.match(
      /<link rel="stylesheet" href="[/\\]{1}dist[/\\]{1}(input\.[a-f0-9]+\.css)">/
    )[1];
    assert(fs.existsSync(__dirname + '/dist/' + filename));

    fs.writeFileSync(
      __dirname + '/input/index.css',
      'body { background: green }'
    );

    await bundle(__dirname + '/input/index.html', {
      production: true
    });

    html = fs.readFileSync(__dirname + '/dist/index.html', 'utf8');
    let newFilename = html.match(
      /<link rel="stylesheet" href="[/\\]{1}dist[/\\]{1}(input\.[a-f0-9]+\.css)">/
    )[1];
    assert(fs.existsSync(__dirname + '/dist/' + newFilename));

    assert.notEqual(filename, newFilename);
  });

  it('should update content hash when raw asset changes', async function() {
    await ncp(__dirname + '/integration/import-raw', __dirname + '/input');

    await bundle(__dirname + '/input/index.js', {
      production: true
    });

    let js = fs.readFileSync(__dirname + '/dist/index.js', 'utf8');
    let filename = js.match(/\/dist\/(test\.[0-9a-f]+\.txt)/)[1];
    assert(fs.existsSync(__dirname + '/dist/' + filename));

    fs.writeFileSync(__dirname + '/input/test.txt', 'hello world');

    await bundle(__dirname + '/input/index.js', {
      production: true
    });

    js = fs.readFileSync(__dirname + '/dist/index.js', 'utf8');
    let newFilename = js.match(/\/dist\/(test\.[0-9a-f]+\.txt)/)[1];
    assert(fs.existsSync(__dirname + '/dist/' + newFilename));

    assert.notEqual(filename, newFilename);
  });
});
