const assert = require('assert');
const {bundle, run, assertBundleTree, deferred} = require('./utils');

describe('wasm', function() {
  if (typeof WebAssembly === 'undefined') {
    return;
  }

  for (const target of ['browser', 'node']) {
    describe(`--target=${target}`, function() {
      it('should preload a wasm file for a sync require', async function() {
        let b = await bundle(__dirname + '/integration/wasm-sync/index.js', {
          target
        });

        assertBundleTree(b, {
          name: 'index.js',
          assets: [
            'index.js',
            'bundle-loader.js',
            'bundle-url.js',
            'wasm-loader.js'
          ],
          childBundles: [
            {
              type: 'wasm',
              assets: ['add.wasm'],
              childBundles: []
            },
            {
              type: 'map'
            }
          ]
        });

        let promise = deferred();
        run(b, {output: promise.resolve}, {require: false});
        assert.equal(await promise, 5);
      });

      it('should load a wasm file asynchronously with dynamic import', async function() {
        let b = await bundle(__dirname + '/integration/wasm-async/index.js', {
          target
        });

        assertBundleTree(b, {
          name: 'index.js',
          assets: [
            'index.js',
            'bundle-loader.js',
            'bundle-url.js',
            'wasm-loader.js'
          ],
          childBundles: [
            {
              type: 'wasm',
              assets: ['add.wasm'],
              childBundles: []
            },
            {
              type: 'map'
            }
          ]
        });

        var res = run(b);
        assert.equal(await res, 5);
      });

      it('should load a wasm file in parallel with a dynamic JS import', async function() {
        let b = await bundle(__dirname + '/integration/wasm-dynamic/index.js', {
          target
        });

        assertBundleTree(b, {
          name: 'index.js',
          assets: [
            'index.js',
            'bundle-loader.js',
            'bundle-url.js',
            'js-loader.js',
            'wasm-loader.js'
          ],
          childBundles: [
            {
              type: 'js',
              assets: ['dynamic.js'],
              childBundles: [
                {
                  type: 'wasm',
                  assets: ['add.wasm'],
                  childBundles: []
                },
                {
                  type: 'map'
                }
              ]
            },
            {
              type: 'map'
            }
          ]
        });

        var res = run(b);
        assert.equal(await res, 5);
      });
    });
  }
});
