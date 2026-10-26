import { transformSync } from 'esbuild';

let input = '';
for await (const chunk of process.stdin) input += chunk;
const request = JSON.parse(input);
const response = {
  styles: (request.styles || []).map((source) =>
    transformSync(source, { loader: 'css', minify: true, legalComments: 'inline' }).code),
  scripts: (request.scripts || []).map((source) =>
    transformSync(source, { loader: 'js', minify: true, legalComments: 'inline' }).code),
};
process.stdout.write(JSON.stringify(response));
