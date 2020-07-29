import OMT from "@surma/rollup-plugin-off-main-thread";

export default {
    input: 'src/index.js',
    output: {
      dir: 'dist',
      format: 'esm'
    },
    plugins: [OMT()]
  };