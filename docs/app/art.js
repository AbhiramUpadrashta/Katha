// Katha — comic panel renderer. Turns a scene string into an SVG: vintage paper tones,
// ink silhouettes with a neon rim, halftone dots. All shapes are original.
(function () {
  const BG = {
    day: ["#ffe7b0", "#f0a868", "#6b4a2b"], dusk: ["#ffb26b", "#6b2d6e", "#2a1430"], night: ["#0f1d40", "#2c1c55", "#0b0a1a"],
    forest: ["#d7e7a0", "#3f7a4a", "#15301d"], sea: ["#a6e1ea", "#1f5d8a", "#0d2a44"], desert: ["#ffe1a0", "#e08a3c", "#7a4318"],
    palace: ["#ffd79a", "#b54a6f", "#3b1530"], lake: ["#c4ecd9", "#2f7f82", "#0f3236"], sky: ["#c8ecff", "#ffd9a8", "#6aa7d8"],
    fire: ["#fff0a0", "#f0582e", "#3a0c10"], underworld: ["#3a1d5c", "#140b26", "#06040d"], eye: ["#fff4d0", "#f0b06a", "#3a2010"],
  };
  const RIM = { day: "#ff7a3d", dusk: "#ff6bd5", night: "#7cf0ff", forest: "#d9ff6b", sea: "#7cf0ff", desert: "#ff9d3d", palace: "#ffd36b",
    lake: "#8affd9", sky: "#ff8fb1", fire: "#ffe14d", underworld: "#c38bff", eye: "#ff7a3d" };
  const INK = "#1b0f22";
  let rim = "#fff", uid = 0;

  const P = (d, o = "") => `<path d="${d}" ${o}/>`;
  const C = (x, y, r, o = "") => `<circle cx="${x}" cy="${y}" r="${r}" ${o}/>`;
  const E = (x, y, rx, ry, o = "") => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" ${o}/>`;
  const ink = `fill="${INK}"`, line = (w) => `fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

  // ---------- people ----------
  function person(x, y, s, o) {
    const h = s, hr = h * 0.1, hy = y - h * 0.86, sh = y - h * 0.72, hip = y - h * 0.38, w = h * 0.13;
    let g = "";
    if (o.wings) g += P(`M${x - w * .6},${sh + 2} q${-h * .5},${-h * .35} ${-h * .62},${h * .1} q${h * .25},${-h * .02} ${h * .5},${h * .2}Z M${x + w * .6},${sh + 2} q${h * .5},${-h * .35} ${h * .62},${h * .1} q${-h * .25},${-h * .02} ${-h * .5},${h * .2}Z`, `fill="${INK}" opacity=".9"`);
    if (o.woman) {
      g += P(`M${x - w * .7},${sh} L${x - h * .26},${y} L${x + h * .26},${y} L${x + w * .7},${sh}Z`, ink); // flowing dress
      g += P(`M${x - hr},${hy} q${-hr * .8},${h * .3} ${-hr * .2},${h * .42}`, line(h * .05));                 // long hair
    } else {
      g += P(`M${x - w},${sh} L${x - w * .7},${hip} L${x + w * .7},${hip} L${x + w},${sh}Z`, ink);
      const st = o.run ? h * .16 : h * .08;
      g += P(`M${x - w * .4},${hip} L${x - st},${y} M${x + w * .4},${hip} L${x + st},${y}`, line(h * .085));
    }
    // arms
    const arm = o.bow || o.sword || o.disc ? `M${x - w},${sh + 1} L${x - h * .32},${sh + h * .12} M${x + w},${sh + 1} L${x + h * .34},${sh - h * .08}`
      : `M${x - w},${sh + 1} L${x - h * .22},${hip + h * .02} M${x + w},${sh + 1} L${x + h * .22},${hip + h * .02}`;
    g += P(arm, line(h * .07));
    g += C(x, hy, hr, ink);
    if (o.crown) g += P(`M${x - hr},${hy - hr * .6} l0,${-hr * 1.1} l${hr * .5},${hr * .6} l${hr * .5},${-hr * .8} l${hr * .5},${hr * .8} l${hr * .5},${-hr * .6} l0,${hr * 1.1}Z`, ink);
    if (o.beard) g += P(`M${x - hr * .7},${hy + hr * .3} q${hr * .7},${hr * 2.2} ${hr * 1.4},0Z`, ink) + C(x, hy - hr * 1.1, hr * .45, ink);
    if (o.horns) g += P(`M${x - hr * .6},${hy - hr * .6} q${-hr},${-hr * 1.2} ${-hr * .2},${-hr * 1.8} M${x + hr * .6},${hy - hr * .6} q${hr},${-hr * 1.2} ${hr * .2},${-hr * 1.8}`, line(h * .04));
    if (o.snakes) for (let i = -2; i <= 2; i++) g += P(`M${x + i * hr * .4},${hy - hr * .6} q${i * hr * .7},${-hr * 1.4} ${i * hr * 1.2 + hr * .3},${-hr * 1.2}`, line(h * .025));
    if (o.bird) g += P(`M${x + hr * .8},${hy} l${hr * .9},${hr * .3} l${-hr * .9},${hr * .35}Z`, ink);
    if (o.bow) g += P(`M${x - h * .34},${sh - h * .14} q${-h * .16},${h * .26} 0,${h * .52}`, line(h * .035)) + P(`M${x - h * .34},${sh - h * .14} L${x - h * .34},${sh + h * .38}`, `stroke="${INK}" stroke-width="${h * .012}"`);
    if (o.sword) g += P(`M${x + h * .34},${sh - h * .08} L${x + h * .5},${sh - h * .5}`, line(h * .03));
    if (o.shield) g += C(x - h * .3, sh + h * .14, h * .12, `fill="${INK}" stroke="${rim}" stroke-width=".6"`);
    if (o.disc) g += C(x + h * .38, sh - h * .2, h * .08, `fill="none" stroke="${rim}" stroke-width="${h * .03}"`);
    if (o.statue) g = g.replaceAll(INK, "#8a7f78");
    let tf = "";
    if (o.fly) tf = `rotate(-65 ${x} ${y - h / 2})`;
    if (o.fall) tf = `rotate(150 ${x} ${y - h / 2})`;
    if (o.run) tf = `rotate(12 ${x} ${y})`;
    return tf ? `<g transform="${tf}">${g}</g>` : g;
  }
  function monkey(x, y, s, o) {
    const g = person(x, y, s * .9, o).replace(/<circle /, `<circle `) + P(`M${x + s * .1},${y - s * .4} q${s * .5},${s * .1} ${s * .3},${-s * .5}`, line(s * .05)) + C(x - s * .1, y - s * .82, s * .05, ink) + C(x + s * .1, y - s * .82, s * .05, ink);
    return o.fly ? `<g transform="rotate(-65 ${x} ${y - s / 2})">${g}</g>` : g;
  }
  function ghost(x, y, s) {
    return P(`M${x - s * .4},${y + s * .5} q0,${-s * 1.4} ${s * .4},${-s * 1.4} q${s * .4},0 ${s * .4},${s * 1.4} l${-s * .15},${-s * .2} l${-s * .1},${s * .2} l${-s * .15},${-s * .2} l${-s * .15},${s * .2}Z`, `fill="#f6f0ff" opacity=".9"`) + C(x - s * .12, y - s * .4, s * .06, ink) + C(x + s * .12, y - s * .4, s * .06, ink);
  }

  // ---------- animals ----------
  const quad = (x, y, s, bodyW, bodyH, legH) => E(x, y - legH - bodyH / 2, bodyW / 2, bodyH / 2, ink) +
    P(`M${x - bodyW * .35},${y - legH} L${x - bodyW * .38},${y} M${x - bodyW * .15},${y - legH} L${x - bodyW * .12},${y} M${x + bodyW * .2},${y - legH} L${x + bodyW * .18},${y} M${x + bodyW * .38},${y - legH} L${x + bodyW * .4},${y}`, line(s * .06));
  const A = {
    elephant(x, y, s) { const b = quad(x, y, s, s * 1.1, s * .55, s * .3); return b + E(x + s * .55, y - s * .68, s * .22, s * .2, ink) + E(x + s * .42, y - s * .66, s * .16, s * .22, ink) + P(`M${x + s * .72},${y - s * .66} q${s * .12},${s * .3} ${s * .02},${s * .5}`, line(s * .09)); },
    lion(x, y, s) { return quad(x, y, s, s, s * .4, s * .3) + C(x + s * .52, y - s * .62, s * .24, ink) + C(x + s * .6, y - s * .6, s * .13, `fill="${INK}" stroke="${rim}" stroke-width=".5"`) + P(`M${x - s * .5},${y - s * .5} q${-s * .3},${-s * .1} ${-s * .25},${-s * .4}`, line(s * .05)); },
    deer(x, y, s) { return quad(x, y, s, s * .8, s * .32, s * .4) + P(`M${x + s * .32},${y - s * .62} L${x + s * .42},${y - s * .9}`, line(s * .09)) + E(x + s * .48, y - s * .92, s * .11, s * .07, ink) + P(`M${x + s * .42},${y - s * .98} l${-s * .05},${-s * .2} m${s * .05},${s * .1} l${s * .1},${-s * .12}`, line(s * .03)); },
    cow(x, y, s) { return quad(x, y, s, s, s * .42, s * .34) + E(x + s * .56, y - s * .62, s * .14, s * .12, ink) + P(`M${x + s * .5},${y - s * .72} q${-s * .05},${-s * .12} ${-s * .14},${-s * .1} M${x + s * .62},${y - s * .72} q${s * .05},${-s * .12} ${s * .14},${-s * .1}`, line(s * .03)); },
    horse(x, y, s) { return quad(x, y, s, s, s * .36, s * .42) + P(`M${x + s * .38},${y - s * .66} L${x + s * .55},${y - s * .98} L${x + s * .72},${y - s * .9}`, line(s * .13)) + P(`M${x - s * .5},${y - s * .66} q${-s * .2},${s * .1} ${-s * .2},${s * .35}`, line(s * .06)); },
    dog(x, y, s) { return quad(x, y, s, s * .8, s * .32, s * .3) + E(x + s * .48, y - s * .62, s * .16, s * .12, ink) + P(`M${x + s * .45},${y - s * .72} l${-s * .05},${-s * .12}`, line(s * .06)) + P(`M${x - s * .4},${y - s * .5} l${-s * .15},${-s * .2}`, line(s * .05)); },
    cat(x, y, s) { return E(x, y - s * .3, s * .38, s * .26, ink) + C(x + s * .34, y - s * .58, s * .18, ink) + P(`M${x + s * .22},${y - s * .7} l${s * .03},${-s * .18} l${s * .1},${s * .1} M${x + s * .4},${y - s * .72} l${s * .06},${-s * .16} l${s * .06},${s * .14}`, ink) + P(`M${x - s * .36},${y - s * .3} q${-s * .3},${-s * .1} ${-s * .2},${-s * .5}`, line(s * .07)); },
    rabbit(x, y, s) { return E(x, y - s * .35, s * .4, s * .32, ink) + C(x + s * .36, y - s * .7, s * .2, ink) + E(x + s * .32, y - s * 1.05, s * .06, s * .22, ink) + E(x + s * .44, y - s * 1.02, s * .06, s * .2, ink) + C(x - s * .4, y - s * .4, s * .1, `fill="#fff"`); },
    croc(x, y, s) { return P(`M${x - s},${y - s * .05} q${s * .2},${-s * .22} ${s},${-s * .2} l${s * .55},${s * .02} l${s * .4},${s * .08} l${-s * .42},${s * .04} l${-s * .5},${s * .05} q${-s * .9},${s * .12} ${-s * 1.03},${s * .01}Z`, ink) + P(`M${x - s * .5},${y - s * .2} l${s * .1},${-s * .08} l${s * .1},${s * .06} l${s * .1},${-s * .08} l${s * .1},${s * .06} l${s * .1},${-s * .08}`, `fill="none" stroke="${rim}" stroke-width=".5"`) + C(x + s * .52, y - s * .24, s * .035, `fill="${rim}"`); },
    bird(x, y, s, o) { return o.big ? P(`M${x},${y} q${-s * .6},${-s * .55} ${-s * 1.1},${-s * .1} q${s * .5},${-s * .05} ${s * 1.1},${s * .4} q${s * .6},${-s * .45} ${s * 1.1},${-s * .4} q${-s * .5},${-s * .45} ${-s * 1.1},${s * .1}Z`, ink)
      : P(`M${x - s},${y} q${s * .5},${-s * .6} ${s},0 q${s * .5},${-s * .6} ${s},0`, line(s * .22)) + C(x, y + s * .05, s * .18, ink); },
    serpent(x, y, s, o) { let d = `M${x - s},${y}`; for (let i = 0; i < 4; i++) d += ` q${s * .25},${(i % 2 ? 1 : -1) * s * .35} ${s * .5},0`; return P(d, line(s * .16)) + E(x + s * 1.05, y - s * .05, s * .14, s * .09, ink) + C(x + s * 1.08, y - s * .08, s * .03, `fill="${rim}"`); },
  };

  // ---------- objects ----------
  const O = {
    sun: (x, y, s) => `<g class="spin" style="transform-origin:${x}px ${y}px">${[...Array(12)].map((_, i) => P(`M${x},${y - s * 1.25} L${x},${y - s * 1.6}`, `stroke="#fff3c4" stroke-width="${s * .12}" stroke-linecap="round" transform="rotate(${i * 30} ${x} ${y})"`)).join("")}</g>` + C(x, y, s, `fill="#fff3c4"`) + C(x, y, s * .8, `fill="#ffd36b"`),
    moon: (x, y, s) => C(x, y, s, `fill="#fff6d8"`) + C(x + s * .4, y - s * .2, s * .85, `fill="url(#bg${uid})"`),
    stars: () => [...Array(18)].map((_, i) => C((i * 37 + 11) % 100, (i * 23 + 7) % 50, .35 + (i % 3) * .2, `fill="#fff" class="tw" style="animation-delay:${i * .2}s"`)).join(""),
    cloud: (x, y, s) => `<g fill="#fff" opacity=".85">${C(x - s * .4, y, s * .32)}${C(x, y - s * .15, s * .42)}${C(x + s * .4, y, s * .3)}${E(x, y + s * .12, s * .7, s * .18)}</g>`,
    mount: (x, y, s) => P(`M${x - s},${y + s * .35} L${x - s * .15},${y - s * .5} L${x + s * .05},${y - s * .3} L${x + s * .25},${y - s * .6} L${x + s},${y + s * .35}Z`, `fill="${INK}" opacity=".55"`),
    tree: (x, y, s) => P(`M${x - s * .05},${y + s * .9} L${x - s * .04},${y} L${x + s * .04},${y} L${x + s * .05},${y + s * .9}Z`, ink) + `<g fill="${INK}">${C(x, y - s * .15, s * .32)}${C(x - s * .28, y + s * .05, s * .24)}${C(x + s * .28, y + s * .05, s * .24)}${C(x, y + s * .12, s * .26)}</g>`,
    palm: (x, y, s) => P(`M${x},${y + s} q${s * .1},${-s * .5} 0,${-s}`, line(s * .07)) + [...Array(5)].map((_, i) => P(`M${x},${y} q${(i - 2) * s * .2},${-s * .25} ${(i - 2) * s * .32},${s * .1}`, line(s * .06))).join(""),
    river: (x, y, s) => E(x, y, s, s * .1, `fill="#7cd6ff" opacity=".55"`),
    waves: () => [...Array(4)].map((_, i) => P(`M0,${84 + i * 4} q6,-3 12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0 t12,0`, `fill="none" stroke="#e8fbff" stroke-width=".7" opacity="${.8 - i * .15}" class="wave" style="animation-delay:${i * .4}s"`)).join(""),
    palace: (x, y, s) => `<g fill="${INK}" opacity=".85">${P(`M${x - s * .6},${y + s * .5} L${x - s * .6},${y - s * .05} L${x + s * .6},${y - s * .05} L${x + s * .6},${y + s * .5}Z`)}${C(x, y - s * .12, s * .22)}${P(`M${x},${y - s * .5} L${x},${y - s * .32}`, `stroke="${INK}" stroke-width=".6"`)}${C(x - s * .45, y - s * .08, s * .1)}${C(x + s * .45, y - s * .08, s * .1)}</g>` + [...Array(5)].map((_, i) => P(`M${x - s * .4 + i * s * .2},${y + s * .5} L${x - s * .4 + i * s * .2},${y + s * .2} a${s * .05},${s * .05} 0 0 1 ${s * .1},0 L${x - s * .3 + i * s * .2},${y + s * .5}Z`, `fill="${rim}" opacity=".5"`)).join(""),
    temple: (x, y, s) => P(`M${x - s * .5},${y + s * .5} L${x - s * .5},${y + s * .1} L${x - s * .35},${y + s * .1} L${x - s * .2},${y - s * .5} L${x + s * .2},${y - s * .5} L${x + s * .35},${y + s * .1} L${x + s * .5},${y + s * .1} L${x + s * .5},${y + s * .5}Z`, `fill="${INK}" opacity=".85"`) + [...Array(5)].map((_, i) => P(`M${x - s * .3 + i * s * .03},${y - s * .3 + i * s * .1} L${x + s * .3 - i * s * .03},${y - s * .3 + i * s * .1}`, `stroke="${rim}" stroke-width=".3" opacity=".6"`)).join(""),
    pyramid: (x, y, s) => P(`M${x - s * .6},${y + s * .4} L${x},${y - s * .4} L${x + s * .6},${y + s * .4}Z`, `fill="${INK}" opacity=".75"`) + P(`M${x},${y - s * .4} L${x + s * .6},${y + s * .4} L${x + s * .1},${y + s * .4}Z`, `fill="#000" opacity=".25"`),
    column: (x, y, s) => P(`M${x - s * .12},${y + s * .9} L${x - s * .1},${y - s * .4} L${x + s * .1},${y - s * .4} L${x + s * .12},${y + s * .9}Z M${x - s * .18},${y - s * .4} L${x + s * .18},${y - s * .4} L${x + s * .18},${y - s * .48} L${x - s * .18},${y - s * .48}Z`, `fill="${INK}" opacity=".8"`),
    well: (x, y, s) => P(`M${x - s * .4},${y} L${x - s * .4},${y - s * .4} L${x + s * .4},${y - s * .4} L${x + s * .4},${y}Z`, ink) + E(x, y - s * .4, s * .4, s * .08, `fill="#3a6f8a"`) + P(`M${x - s * .35},${y - s * .4} L${x - s * .35},${y - s * .9} L${x + s * .35},${y - s * .9} L${x + s * .35},${y - s * .4}`, line(s * .05)),
    boat: (x, y, s) => P(`M${x - s * .6},${y - s * .1} q${s * .6},${s * .35} ${s * 1.2},0 l${-s * .15},${s * .02} q${-s * .45},${s * .18} ${-s * .9},0Z`, `fill="#ffc14d" stroke="${INK}" stroke-width=".5"`),
    bridge: (x, y, s) => [...Array(9)].map((_, i) => E(x - s * .5 + i * s * .125, y + Math.sin(i / 8 * Math.PI) * -s * .08, s * .07, s * .04, `fill="#8a7f78" stroke="${INK}" stroke-width=".3"`)).join(""),
    fire: (x, y, s) => `<g class="flick" style="transform-origin:${x}px ${y}px">${P(`M${x - s * .5},${y} q${-s * .2},${-s * .8} ${s * .5},${-s * 1.4} q${s * .7},${s * .6} ${s * .5},${s * 1.4}Z`, `fill="#ff8a3d"`)}${P(`M${x - s * .2},${y} q0,${-s * .5} ${s * .2},${-s * .8} q${s * .3},${s * .4} ${s * .2},${s * .8}Z`, `fill="#ffe36b"`)}</g>`,
    lamp: (x, y, s) => P(`M${x - s * .6},${y} q${s * .6},${s * .5} ${s * 1.2},0Z`, `fill="#c96a2b"`) + `<g class="flick" style="transform-origin:${x}px ${y}px">${P(`M${x - s * .15},${y} q${s * .15},${-s * .9} ${s * .3},0Z`, `fill="#ffe36b"`)}</g>` + C(x, y - s * .3, s * .8, `fill="#ffd36b" opacity=".18"`),
    lotus: (x, y, s) => [-2, -1, 0, 1, 2].map(i => E(x + i * s * .25, y - s * .3, s * .16, s * .4, `fill="#ff8fb1" stroke="${INK}" stroke-width=".3" transform="rotate(${i * 22} ${x + i * s * .25} ${y})"`)).join(""),
    house: (x, y, s) => P(`M${x - s * .5},${y + s * .5} L${x - s * .5},${y - s * .05} L${x},${y - s * .45} L${x + s * .5},${y - s * .05} L${x + s * .5},${y + s * .5}Z`, `fill="${INK}" opacity=".85"`) + P(`M${x - s * .1},${y + s * .5} L${x - s * .1},${y + s * .15} L${x + s * .1},${y + s * .15} L${x + s * .1},${y + s * .5}Z M${x + s * .22},${y + s * .05} h${s * .14} v${s * .14} h${-s * .14}Z`, `fill="${rim}" opacity=".6"`),
    bowl: (x, y, s) => P(`M${x - s},${y - s * .4} q${s},${s * 1.2} ${s * 2},0Z`, `fill="#fff" stroke="${INK}" stroke-width=".5"`) + P(`M${x - s * .3},${y - s * .8} q${s * .2},${-s * .4} 0,${-s * .8} M${x + s * .3},${y - s * .8} q${s * .2},${-s * .4} 0,${-s * .8}`, `fill="none" stroke="#fff" stroke-width=".4" opacity=".8"`),
    pot: (x, y, s) => E(x, y, s * .5, s * .4, `fill="#c96a2b" stroke="${INK}" stroke-width=".4"`) + P(`M${x},${y - s * .4} L${x},${y - s * 1.6}`, `stroke="${INK}" stroke-width=".4"`),
    chest: (x, y, s) => P(`M${x - s * .5},${y} L${x - s * .5},${y - s * .4} q${s * .5},${-s * .3} ${s},0 L${x + s * .5},${y}Z`, `fill="#ffc14d" stroke="${INK}" stroke-width=".6"`),
    arrow: (x, y, s) => P(`M${x - s},${y + s * .2} L${x + s},${y - s * .2} M${x + s},${y - s * .2} l${-s * .3},${-s * .05} m${s * .3},${s * .05} l${-s * .2},${s * .2}`, `fill="none" stroke="${rim}" stroke-width=".7" stroke-linecap="round"`),
    feather: (x, y, s) => E(x, y, s * .25, s, `fill="#fff" stroke="${INK}" stroke-width=".3" transform="rotate(35 ${x} ${y})"`),
    line: (x, y, s) => P(`M${x - s / 2},${y} L${x + s / 2},${y}`, `stroke="#fff" stroke-width="1.2" stroke-linecap="round"`),
  };

  function item(name, x, y, s, o) {
    if (name === "eye") return "";
    if (O[name]) return O[name](x, y, s, o);
    if (A[name]) return A[name](x, y, s, o);
    if (name === "monkey") return monkey(x, y, s, o);
    if (name === "ghost") return ghost(x, y, s, o);
    const kinds = { man: {}, hero: {}, king: { crown: 1 }, sage: { beard: 1 }, woman: { woman: 1 }, demon: { horns: 1, crown: 1 }, statue: { statue: 1, beard: 1 } };
    if (kinds[name]) return person(x, y, s * (name === "demon" ? 1.25 : 1) * 2.6, Object.assign({}, kinds[name], o));
    return "";
  }

  window.renderScene = function (scene, opt = {}) {
    uid++;
    const parts = scene.split("|"), bg = parts.shift();
    const c = BG[bg] || BG.day; rim = RIM[bg] || "#fff";
    let body = "";
    for (const p of parts) {
      const [name, rest] = p.split("@");
      if (!rest) { body += item(name, 0, 0, 0, {}); continue; }
      const a = rest.split(","); const x = +a[0], y = +a[1], s = +a[2];
      const o = {}; a.slice(3).forEach(k => o[k] = 1);
      let g = item(name, x, y, s, o);
      if (o.f) g = `<g transform="translate(${2 * x} 0) scale(-1 1)">${g}</g>`;
      body += `<g class="pop">${g}</g>`;
    }
    const eye = bg === "eye" ? E(50, 50, 30, 18, `fill="#fff"`) + C(50, 50, 13, `fill="#5a3a1a"`) + C(50, 50, 6, `fill="${INK}"`) + C(46, 46, 2.2, `fill="#fff"`) + C(50, 50, 22, `fill="none" stroke="${rim}" stroke-width=".6" stroke-dasharray="2 2"`) : "";
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" class="scene" role="img" aria-hidden="true">
<defs><linearGradient id="bg${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c[0]}"/><stop offset=".75" stop-color="${c[1]}"/><stop offset="1" stop-color="${c[2]}"/></linearGradient>
<pattern id="ht${uid}" width="2.2" height="2.2" patternUnits="userSpaceOnUse"><circle cx="1.1" cy="1.1" r=".42" fill="#000" opacity=".12"/></pattern>
<filter id="gl${uid}" x="-20%" y="-20%" width="140%" height="140%"><feMorphology operator="dilate" radius=".45" in="SourceAlpha" result="d"/><feFlood flood-color="${rim}"/><feComposite in2="d" operator="in" result="r"/><feGaussianBlur in="r" stdDeviation=".9" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="r"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
<rect width="100" height="100" fill="url(#bg${uid})"/>${eye}
<rect y="86" width="100" height="14" fill="${c[2]}" opacity=".55"/>
<g filter="url(#gl${uid})">${body}</g>
<rect width="100" height="100" fill="url(#ht${uid})"/></svg>`;
  };
})();
