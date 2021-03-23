import { join } from 'path';
import type { OutputChunk } from 'rollup';
import { build, Plugin } from 'vite';
import macrosPlugin from '../index';

test('macros', async () => {
  const code = `
	import preval from 'preval.macro'
	const result = preval\`module.exports = 1 + 2\`
	`;
  const result = await macrosPlugin().transform(code, 'file.js');
  expect(result?.code).toMatchInlineSnapshot(`"const result = 3;"`);
});

test('typechecks as a vite plugin', () => {
  const plugin: Plugin = macrosPlugin();
  expect(plugin.name).toBe('babel-macros');
});

test(".jsx files shouldn't throw", async () => {
  const result = await macrosPlugin().transform(`<div/>`, 'file.jsx');
  expect(result).not.toBeNull();
});

test('vite integration', async () => {
  let result = await build({
    root: join(__dirname, '../../tests/fixture'),
    plugins: [macrosPlugin()],
    logLevel: 'silent',
    build: {
      minify: false,
      write: false
    }
  });
  result = [result].flat()[0];

  const code = result.output.find((item): item is OutputChunk => item.type === 'chunk')?.code;

  expect(code).toContain(`alert("it's a secret\\n")`);
}, 10000);
