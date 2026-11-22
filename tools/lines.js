// Prints every caption of one language as JSON: [{key, text}]
global.window = {};
require("../docs/app/stories.js");
const L = { en: 1, hi: 2, te: 3 }[process.argv[2]];
console.log(JSON.stringify(window.STORIES.flatMap(s => s.p.map((p, i) => ({ key: `${s.id}-${i}`, text: p[L] })))));
