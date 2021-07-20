import json from '@rollup/plugin-json';

import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import zip from 'rollup-plugin-zip'
import { emptyDir } from 'rollup-plugin-empty-dir'
import copy from "rollup-plugin-copy"

import {uglify} from "rollup-plugin-uglify";
import obfuscatorPlugin from "rollup-plugin-javascript-obfuscator";

import { chromeExtension, simpleReloader } from 'rollup-plugin-chrome-extension'

const p = process.env.NODE_ENV === 'production'

export default {
  input: ['src/manifest.json'],
  output: {
    dir: 'dist',
    format: 'esm',
  },
  plugins: [

    // always put chromeExtension() before other plugins
    chromeExtension(),
    // includes an automatic reloader in watch mode
    simpleReloader(),
    // rollup json plugin - DOES NOT SEEM TO WORK AT ALL
    json(),

    // copy() does not work either
    /*copy({
      targets: [
        {src: 'src/main_scenario.json', dest: 'dist/'},
      ], hook: "writeBundle"
    }),
     */

    // resolves node modules
    resolve({browser: true, preferBuiltins: false}),
    // converts libraries that use commonjs
    commonjs(),
    // empties the dist for each build
    emptyDir(),

    // uglify
    //uglify(),

    // obfuscator plugin
    /*obfuscatorPlugin({
      compact: true
    }),*/
    // creates a zip to upload to the Chrome Web Store :)
    p && zip({ dir: 'releases' }),
  ]
}
