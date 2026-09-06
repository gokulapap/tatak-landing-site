// Four buses projected through one pinhole camera into SVG.
//
// World frame: x right, y up, z into the scene. The station point is the
// origin at eye height EYE, looking level along +z, so the horizon is the
// row y = EYE on the picture plane. A world point (x, y, z) lands at
// (F x / z, -F (y - EYE) / z).
//
// Bus frame: u along the length from the front face (0) to the rear (L),
// v across the width from the door side (0) to the off side (W), w up from
// the road. Every bus is parked in the same bay: front-door corner at
// (X0, 0, Z0), yawed THETA so the front face and the door flank both face
// the camera. Same bay, same camera, so the four drawings share the two
// vanishing points and the near ground contact exactly.

import { writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);

const EYE = 1.6;
const THETA = (32 * Math.PI) / 180;
const X0 = 1.35;
const Z0 = 5.2;
const F = 900;

const SIN = Math.sin(THETA);
const COS = Math.cos(THETA);

function world(u, v, w) {
  return [X0 + u * SIN - v * COS, w, Z0 + u * COS + v * SIN];
}
function proj([x, y, z]) {
  return [(F * x) / z, (-F * (y - EYE)) / z];
}
const P = (u, v, w) => proj(world(u, v, w));

// Vanishing points, for the report and a sanity check.
const VP_U = [F * (SIN / COS), 0];
const VP_V = [-F * (COS / SIN), 0];

const r1 = (n) => Math.round(n * 10) / 10;

function shade(hex, k) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (s) => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * k)));
  return "#" + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, "0")).join("");
}

class Sheet {
  constructor() {
    this.parts = [];
    this.minx = Infinity; this.miny = Infinity; this.maxx = -Infinity; this.maxy = -Infinity;
  }
  track(pts) {
    for (const [x, y] of pts) {
      if (x < this.minx) this.minx = x;
      if (x > this.maxx) this.maxx = x;
      if (y < this.miny) this.miny = y;
      if (y > this.maxy) this.maxy = y;
    }
  }
  poly(pts, fill, extra = "") {
    this.track(pts);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)},${r1(y)}`).join("") + "Z";
    this.parts.push(`<path d="${d}" fill="${fill}"${extra ? " " + extra : ""}/>`);
  }
  raw(markup) {
    this.parts.push(markup);
  }
  line(pts, stroke, width, extra = "") {
    this.track(pts);
    const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)},${r1(y)}`).join("");
    this.parts.push(`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"${extra ? " " + extra : ""}/>`);
  }
}

// 2D samplers in whichever bus plane the caller maps them into.
function rrect(x0, y0, x1, y1, r, n = 5) {
  const pts = [];
  const corner = (cx, cy, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  corner(x1 - r, y1 - r, 0);
  corner(x0 + r, y1 - r, Math.PI / 2);
  corner(x0 + r, y0 + r, Math.PI);
  corner(x1 - r, y0 + r, 1.5 * Math.PI);
  return pts;
}
function circle(cx, cy, r, n = 40, a0 = 0, a1 = 2 * Math.PI) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
function arc(cx, cy, r, a0, a1, n = 12) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n;
    pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return pts;
}
function bezier(p0, p1, p2, p3, n = 24) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, s = 1 - t;
    pts.push([
      s * s * s * p0[0] + 3 * s * s * t * p1[0] + 3 * s * t * t * p2[0] + t * t * t * p3[0],
      s * s * s * p0[1] + 3 * s * s * t * p1[1] + 3 * s * t * t * p2[1] + t * t * t * p3[1],
    ]);
  }
  return pts;
}
// A band of vertical thickness h around a polyline in (u, w).
function band(pts, h) {
  const top = pts.map(([u, w]) => [u, w + h / 2]);
  const bot = pts.map(([u, w]) => [u, w - h / 2]).reverse();
  return top.concat(bot);
}
function hull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (const p of pts.slice().reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  return lower.slice(0, -1).concat(upper.slice(0, -1));
}

// Plane mappers.
const side = (v = 0) => ([u, w]) => P(u, v, w);
const front = (u = 0) => ([v, w]) => P(u, v, w);

// The front profile in (u, w): vertical up the face, then a quarter arc of
// radius R back into the roof.
function profile(g, H, R, n = 8) {
  const pts = [[0, g], [0, H - R]];
  for (let i = 1; i <= n; i++) {
    const a = Math.PI - (i / n) * (Math.PI / 2);
    pts.push([R + R * Math.cos(a), H - R + R * Math.sin(a)]);
  }
  return pts;
}

const INK = "#151614";
const GLASS = "#222b33";
const GLASS_FRONT = "#26323d";
const RUBBER = "#24251f";
const RUBBER_WALL = "#35362f";
const RIM = "#c9c6bd";
const RIM_IN = "#a09d95";
const HUB = "#6b6963";
const LED = "#ff8a1f";
const PLATE = "#f2c230";
const WHITE = "#f7f5f0";

function body(sh, s) {
  const { L, W, H, g, R, R2, c, base, sideK = 0.84, chamferK = 1.04, farK = 0.9, roofK = 0.8 } = s;
  const prof = profile(g, H, R);
  const profRear = (() => {
    const pts = [];
    const n = 6;
    for (let i = 0; i <= n; i++) {
      const a = (Math.PI / 2) - (i / n) * (Math.PI / 2);
      pts.push([L - R2 + R2 * Math.cos(a), H - R2 + R2 * Math.sin(a)]);
    }
    pts.push([L, g]);
    return pts;
  })();

  // The dark void under the floor. From standing height the road under the
  // skirt is visible as a band below the body, and it is in shadow; the
  // wheels are drawn over it. Nothing is drawn around the vehicle.
  const shadow = [[0.05, 0.03], [L, 0.03], [L, W - 0.05], [0.05, W - 0.05]].map(([u, v]) => P(u, v, 0));
  sh.poly(shadow, "#1c1c1a", 'fill-opacity="0.78"');

  // Far corner chamfer (thin sliver on the off side).
  const farA = prof.map(([pu, w]) => P(pu, W - c, w));
  const farB = prof.map(([pu, w]) => P(c + pu, W, w));
  sh.poly(farA.concat(farB.slice().reverse()), shade(base, farK));

  // Front face.
  const frontNear = prof.map(([pu, w]) => P(pu, c, w));
  const frontFar = prof.map(([pu, w]) => P(pu, W - c, w));
  sh.poly(frontNear.concat(frontFar.slice().reverse()), base);

  // Roof curve strip across the front, darker since it turns away.
  const arcIdx = prof.findIndex(([, w]) => w >= H - R) ;
  const arcNear = prof.slice(arcIdx).map(([pu, w]) => P(pu, c, w));
  const arcFar = prof.slice(arcIdx).map(([pu, w]) => P(pu, W - c, w));
  sh.poly(arcNear.concat(arcFar.slice().reverse()), shade(base, roofK));

  // Near corner chamfer.
  const nearA = prof.map(([pu, w]) => P(pu, c, w));
  const nearB = prof.map(([pu, w]) => P(c + pu, 0, w));
  sh.poly(nearA.concat(nearB.slice().reverse()), shade(base, chamferK));
  const nearArcA = prof.slice(arcIdx).map(([pu, w]) => P(pu, c, w));
  const nearArcB = prof.slice(arcIdx).map(([pu, w]) => P(c + pu, 0, w));
  sh.poly(nearArcA.concat(nearArcB.slice().reverse()), shade(base, roofK * chamferK));

  // Door flank.
  const flank = prof.map(([pu, w]) => [c + pu, w]).concat(profRear);
  sh.poly(flank.map(side()), shade(base, sideK));
  // Roof curve along the flank: the top of the profile arc, seen from below.
  const flankArc = prof.slice(arcIdx).map(([pu, w]) => [c + pu, w]);
  const flankArcTop = flankArc.concat([[L - R2, H], [L - R2, H - 0.06], [c + R, H - 0.06]]);
  sh.poly(flankArcTop.map(side()), shade(base, sideK * 0.93));
  // Skirt band along the bottom of the flank and the front.
  sh.poly([[c, g], [L, g], [L, g + 0.08], [c, g + 0.08]].map(side()), shade(base, sideK * 0.72));
  sh.poly([[c, g], [W - c, g], [W - c, g + 0.08], [c, g + 0.08]].map(front()), shade(base, 0.8));
  return { prof, sideTone: shade(base, sideK) };
}

function wheel(sh, s, uc, r, tread = 0.3) {
  const { g } = s;
  const ra = r + 0.12;
  // Arch on the flank.
  const a0 = Math.asin((g - r) / ra);
  const archPts = arc(uc, r, ra, a0, Math.PI - a0, 18);
  sh.poly(archPts.map(side()), "#0f100e");
  // Tyre as a cylinder: hull of the outer and inner sidewall ellipses.
  const outer = circle(uc, r, r, 44).map(side(0.03));
  const inner = circle(uc, r, r, 44).map(side(0.03 + tread));
  sh.poly(hull(outer.concat(inner)), RUBBER);
  sh.poly(outer, RUBBER_WALL);
  sh.poly(circle(uc, r, r * 0.64, 36).map(side(0.03)), RIM);
  sh.poly(circle(uc, r, r * 0.48, 36).map(side(0.03)), RIM_IN);
  sh.poly(circle(uc, r, r * 0.2, 24).map(side(0.03)), HUB);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * 2 * Math.PI;
    sh.poly(circle(uc + r * 0.35 * Math.cos(a), r + r * 0.35 * Math.sin(a), r * 0.05, 10).map(side(0.03)), "#3f3e39");
  }
}

function mirrorLow(sh, s, tone) {
  // Bus-style mirrors on arms at the A pillar, both sides.
  const { W } = s;
  const arm = (v0, v1, w) => sh.line([P(0.3, v0, w), P(0.3, v1, w)], INK, 3);
  arm(0, -0.28, 2.35);
  sh.poly(rrect(-0.44, 1.9, -0.26, 2.42, 0.04).map(front(0.32)), tone);
  sh.poly(rrect(-0.41, 1.94, -0.29, 2.38, 0.03).map(front(0.31)), GLASS);
  arm(W, W + 0.28, 2.35);
  sh.poly(rrect(W + 0.26, 1.9, W + 0.44, 2.42, 0.04).map(front(0.32)), shade(tone, 0.9));
}

function mirrorHigh(sh, s, tone) {
  // Coach-style mirrors on stalks from the top of the windscreen.
  const { W } = s;
  const stalk = (v0, v1, k) => sh.poly([[v0, 2.78], [v1, 2.86], [v1, 2.74], [v0, 2.66]].map(front(0.2)), shade(tone, k));
  stalk(0.02, -0.3, 1);
  sh.poly(rrect(-0.46, 2.2, -0.22, 2.82, 0.07).map(front(0.24)), tone);
  sh.poly(rrect(-0.43, 2.24, -0.25, 2.78, 0.05).map(front(0.23)), GLASS);
  stalk(W - 0.02, W + 0.3, 0.9);
  sh.poly(rrect(W + 0.22, 2.2, W + 0.46, 2.82, 0.07).map(front(0.24)), shade(tone, 0.9));
}

function windscreen(sh, s, v0, v1, w0, w1, r = 0.08) {
  sh.poly(rrect(v0, w0, v1, w1, r).map(front()), GLASS_FRONT);
  // A sky reflection across the upper part of the glass.
  sh.poly([[v0 + 0.05, w1 - 0.05], [v1 - 0.05, w1 - 0.05], [v1 - 0.05, w0 + (w1 - w0) * 0.62], [v0 + 0.05, w0 + (w1 - w0) * 0.4]].map(front()), "#ffffff", 'fill-opacity="0.08"');
}

function wipers(sh, s, v0, v1, wBase) {
  const pivot1 = [v0 + (v1 - v0) * 0.3, wBase];
  const pivot2 = [v0 + (v1 - v0) * 0.72, wBase];
  sh.line([front()(pivot1), front()([pivot1[0] - 0.25, wBase + 0.55])], INK, 3);
  sh.line([front()(pivot2), front()([pivot2[0] - 0.25, wBase + 0.55])], INK, 3);
}

function ledBoard(sh, s, v0, v1, w0, w1, dots = 9, u = 0.02) {
  sh.poly(rrect(v0, w0, v1, w1, 0.03).map(front(u)), "#101210");
  const dw = (v1 - v0 - 0.2) / dots;
  for (let i = 0; i < dots; i++) {
    const lit = i % 4 === 3 ? 0.35 : 1;
    const x = v0 + 0.1 + i * dw;
    sh.poly(rrect(x + dw * 0.15, w0 + (w1 - w0) * 0.3, x + dw * 0.7, w1 - (w1 - w0) * 0.3, 0.01, 2).map(front(u)), LED, `fill-opacity="${lit}"`);
  }
}

function plate(sh, s, v0, v1, w0, w1) {
  sh.poly(rrect(v0, w0, v1, w1, 0.02, 2).map(front(-0.01)), PLATE);
  sh.poly(rrect(v0 + 0.05, w0 + 0.03, v1 - 0.05, w1 - 0.03, 0.01, 2).map(front(-0.01)), INK, 'fill-opacity="0.55"');
}

// Destination board lettering. The only text in these drawings, because a
// board exists to be read. Each glyph is placed on its own: its origin is
// the projected point on the front face, and its transform is the local
// derivative of the projection there (image-right is decreasing v, image-
// down is decreasing w), so every letter sits in the plane of the face,
// shrinks toward the width vanishing point, and shares the vehicle's
// perspective rather than being pasted flat. Sizes are in centimetres on
// the face; a monospace stack so the advance is predictable without a
// webfont, since these load through <img>.
//
// `u` is either the depth of the face plane or a (v, w) -> image mapper for
// a face that is not at constant u, such as a raked windscreen; the local
// derivative is taken through the mapper either way.
function boardText(sh, str, vCenter, wBase, sizeCm, advance, fill, u = -0.01) {
  const M = typeof u === "function" ? u : ([v, w]) => P(u, v, w);
  const n = str.length;
  const h = 0.002;
  const glyphs = [];
  for (let i = 0; i < n; i++) {
    const ch = str[i];
    if (ch === " ") continue;
    const v = vCenter + ((n - 1) / 2 - i) * advance;
    const p0 = M([v, wBase]);
    const px = M([v - h, wBase]);
    const py = M([v, wBase - h]);
    const a = (px[0] - p0[0]) / h / 100, b = (px[1] - p0[1]) / h / 100;
    const c = (py[0] - p0[0]) / h / 100, d = (py[1] - p0[1]) / h / 100;
    const m = [a, b, c, d, p0[0], p0[1]].map((x) => Math.round(x * 1000) / 1000).join(" ");
    glyphs.push(`<text transform="matrix(${m})" font-size="${sizeCm}" text-anchor="middle">${ch}</text>`);
  }
  sh.raw(`<g font-family="ui-monospace, Menlo, Consolas, 'Liberation Mono', monospace" font-weight="700" fill="${fill}">\n${glyphs.join("\n")}\n</g>`);
}

function roundLamp(sh, v, w, r, ring = "#d9d7cf") {
  sh.poly(circle(v, w, r, 28).map(front(-0.01)), ring);
  sh.poly(circle(v, w, r * 0.72, 24).map(front(-0.01)), "#ffffff");
  sh.poly(circle(v - r * 0.2, w + r * 0.2, r * 0.3, 16).map(front(-0.01)), "#dfe7ee");
}

// Side windows with an optional seat back. (u0, u1) along the flank,
// (w0, w1) sill to head, all in the v = 0 plane.
function sideWindow(sh, u0, u1, w0, w1, opts = {}) {
  const { seat = "#2d5ec0", seatTop = "#234a99", curtain = null, sillGlow = true } = opts;
  sh.poly(rrect(u0, w0, u1, w1, 0.04).map(side()), GLASS);
  if (curtain) {
    const n = Math.max(3, Math.round((u1 - u0) / 0.14));
    const dw = (u1 - u0 - 0.06) / n;
    for (let i = 0; i < n; i++) {
      sh.poly([[u0 + 0.03 + i * dw, w0 + 0.03], [u0 + 0.03 + (i + 1) * dw, w0 + 0.03], [u0 + 0.03 + (i + 1) * dw, w1 - 0.03], [u0 + 0.03 + i * dw, w1 - 0.03]].map(side()), i % 2 ? curtain[1] : curtain[0]);
    }
  } else if (seat) {
    const sw = Math.min(0.42, (u1 - u0) * 0.45);
    const su = u0 + (u1 - u0) * 0.15;
    sh.poly(rrect(su, w0 + 0.06, su + sw, w0 + 0.42, 0.06).map(side()), seat);
    sh.poly(rrect(su + sw * 0.15, w0 + 0.4, su + sw * 0.85, w0 + 0.52, 0.04).map(side()), seatTop);
  }
  if (sillGlow) {
    sh.poly([[u0 + 0.02, w1 - 0.02], [u1 - 0.02, w1 - 0.02], [u1 - 0.02, w0 + (w1 - w0) * 0.58], [u0 + 0.02, w0 + (w1 - w0) * 0.58]].map(side()), "#ffffff", 'fill-opacity="0.07"');
  }
}

function door(sh, u0, u1, w0, wMid, w1, lowerTone, pole = null) {
  sh.poly(rrect(u0, w0, u1, w1, 0.04).map(side()), INK);
  const leaf = (a, b) => {
    sh.poly(rrect(a, wMid, b, w1 - 0.06, 0.03).map(side()), GLASS);
    sh.poly([[a + 0.02, w1 - 0.08], [b - 0.02, w1 - 0.08], [b - 0.02, wMid + (w1 - wMid) * 0.55], [a + 0.02, wMid + (w1 - wMid) * 0.55]].map(side()), "#ffffff", 'fill-opacity="0.07"');
    sh.poly(rrect(a, w0 + 0.05, b, wMid - 0.05, 0.03).map(side()), lowerTone);
  };
  const mid = (u0 + u1) / 2;
  leaf(u0 + 0.05, mid - 0.02);
  leaf(mid + 0.02, u1 - 0.05);
  if (pole) sh.poly([[mid - 0.025, wMid], [mid + 0.025, wMid], [mid + 0.025, w1 - 0.06], [mid - 0.025, w1 - 0.06]].map(side()), pole);
}

function sideLamps(sh, L, w) {
  sh.poly(rrect(L - 0.1, w, L - 0.02, w + 0.24, 0.03).map(side()), "#d92c2c");
  sh.poly(rrect(L - 0.1, w + 0.28, L - 0.02, w + 0.4, 0.03).map(side()), "#f39a1e");
}

// ---------------------------------------------------------------------
// The four vehicles.

function bengaluruSarige(sh) {
  const s = { L: 10.6, W: 2.5, H: 3.1, g: 0.3, R: 0.34, R2: 0.3, c: 0.14, base: "#3b9adb" };
  const { L, W, H, g, c } = s;
  const { sideTone } = body(sh, s);
  const wSill = 1.42, wHead = 2.72;

  // Flank: white rear panel with the diagonal front edge and the yellow rule.
  sh.poly([[6.15, g + 0.08], [6.6, 1.3], [L, 1.3], [L, g + 0.08]].map(side()), shade("#f6f4ee", 0.93));
  sh.poly([[6.55, 1.22], [6.63, 1.34], [L, 1.34], [L, 1.22]].map(side()), shade(PLATE, 0.95));
  // BMTC roundel and wordmark on the white panel.
  sh.poly(circle(8.9, 0.9, 0.16, 24).map(side()), "#2d7db6");
  sh.poly(circle(8.9, 0.9, 0.1, 20).map(side()), shade("#f6f4ee", 0.93));
  sh.poly(circle(8.9, 0.9, 0.04, 12).map(side()), "#2d7db6");
  sh.poly(rrect(9.15, 0.93, 9.85, 1.0, 0.03, 2).map(side()), "#2d7db6");
  sh.poly(rrect(9.15, 0.8, 9.65, 0.86, 0.03, 2).map(side()), "#2d7db6");
  // Window band.
  sh.poly(rrect(c + 0.5, wSill - 0.04, L - 0.12, wHead + 0.04, 0.05).map(side()), INK);
  door(sh, 0.9, 2.1, g + 0.1, wSill, wHead, sideTone, PLATE);
  const win = [[2.2, 3.2], [3.3, 4.3], [4.4, 5.4], [5.5, 6.5], [6.6, 7.6]];
  for (const [a, b] of win) {
    sideWindow(sh, a, b, wSill, wHead, {});
    sh.poly([[a + (b - a) * 0.52, wSill], [a + (b - a) * 0.52 + 0.05, wSill], [a + (b - a) * 0.52 + 0.05, wHead], [a + (b - a) * 0.52, wHead]].map(side()), "#d9d7cf");
  }
  door(sh, 7.7, 8.9, g + 0.1, wSill, wHead, shade("#f6f4ee", 0.93), PLATE);
  sideWindow(sh, 9.0, 10.4, wSill, wHead, {});
  sideLamps(sh, L, 0.8);

  wheel(sh, s, 2.55, 0.5);
  wheel(sh, s, 7.6, 0.5);

  // Front: one big screen, LED board in the glass, Kannada line, grille, lamps.
  windscreen(sh, s, c + 0.12, W - c - 0.12, 1.48, 2.74, 0.1);
  sh.poly(rrect(c + 0.2, 2.36, W - c - 0.2, 2.64, 0.03).map(front(0.02)), "#101210");
  boardText(sh, "500-CA BANASHANKARI", W / 2, 2.435, 15, 0.094, LED, 0.015);
  wipers(sh, s, c + 0.12, W - c - 0.12, 1.5);
  // Kannada wordmark suggested as a white bar under the screen.
  sh.poly(rrect(0.85, 1.29, 1.65, 1.39, 0.03, 2).map(front(-0.005)), "#f7f5f0");
  // Grille with slats.
  sh.poly(rrect(0.62, 0.66, W - 0.62, 1.16, 0.05).map(front(-0.005)), INK);
  for (let i = 0; i < 4; i++) {
    const w = 0.72 + i * 0.105;
    sh.poly(rrect(0.7, w, W - 0.7, w + 0.04, 0.01, 2).map(front(-0.008)), "#2d7db6");
  }
  sh.poly(circle(W / 2, 0.92, 0.09, 20).map(front(-0.01)), "#d9d7cf");
  roundLamp(sh, 0.38, 0.9, 0.14);
  roundLamp(sh, W - 0.38, 0.9, 0.14);
  // Bumper stripe and plate.
  sh.poly([[c, 0.5], [W - c, 0.5], [W - c, 0.56], [c, 0.56]].map(front(-0.005)), "#e8e6df");
  plate(sh, s, 1.0, 1.5, 0.26, 0.44);
  sh.poly(rrect(0.3, 0.3, 0.55, 0.42, 0.02, 2).map(front(-0.005)), PLATE);
  sh.poly(rrect(W - 0.55, 0.3, W - 0.3, 0.42, 0.02, 2).map(front(-0.005)), PLATE);
  mirrorLow(sh, s, "#2d7db6");
  return s;
}

function karnatakaSarige(sh) {
  const s = { L: 11, W: 2.5, H: 3.16, g: 0.3, R: 0.36, R2: 0.3, c: 0.14, base: "#cd2a30" };
  const { L, W, H, g, c } = s;
  const { sideTone } = body(sh, s);
  const wSill = 1.5, wHead = 2.62;
  const silver = "#cfcfc9";

  // Silver midband with the yellow rule, along the flank and across the front.
  sh.poly([[c, 1.06], [L, 1.06], [L, 1.5], [c, 1.5]].map(side()), shade(silver, 0.86));
  sh.poly([[c, 1.06], [L, 1.06], [L, 1.12], [c, 1.12]].map(side()), shade("#b8b8b1", 0.86));
  sh.poly([[c, 0.99], [L, 0.99], [L, 1.06], [c, 1.06]].map(side()), shade(PLATE, 0.9));
  // KSRTC roundel and wordmark on the band.
  sh.poly(circle(6.4, 1.28, 0.14, 24).map(side()), "#a9202a");
  sh.poly(circle(6.4, 1.28, 0.08, 20).map(side()), shade(silver, 0.86));
  sh.poly(circle(6.4, 1.28, 0.035, 12).map(side()), "#a9202a");
  for (let i = 0; i < 5; i++) sh.poly(rrect(6.65 + i * 0.19, 1.2, 6.78 + i * 0.19, 1.37, 0.02, 2).map(side()), "#234a99");
  sh.poly(rrect(5.4, 1.22, 6.15, 1.35, 0.03, 2).map(side()), "#a9202a");
  sh.poly(rrect(4.0, 1.25, 5.2, 1.32, 0.03, 2).map(side()), "#234a99");
  // Window band.
  sh.poly(rrect(c + 0.45, wSill - 0.04, L - 0.1, wHead + 0.04, 0.05).map(side()), INK);
  door(sh, 0.75, 1.85, g + 0.1, wSill, wHead, sideTone, "#d9d7cf");
  for (let i = 0; i < 7; i++) {
    const a = 2.0 + i * 1.1, b = a + 1.02;
    sideWindow(sh, a, b, wSill, wHead, {});
  }
  door(sh, 9.75, 10.85, g + 0.1, wSill, wHead, sideTone, "#d9d7cf");
  sideLamps(sh, L, 0.62);

  wheel(sh, s, 2.6, 0.5);
  wheel(sh, s, 8.2, 0.5);

  // Front: big screen, black lower band with the Kannada line, silver panel with the grille.
  windscreen(sh, s, c + 0.1, W - c - 0.1, 1.5, 2.8, 0.1);
  // Destination board across the top of the glass.
  sh.poly(rrect(0.42, 2.5, W - 0.42, 2.76, 0.03).map(front(-0.005)), "#f7f5f0");
  boardText(sh, "MANGALURU", W / 2, 2.56, 18, 0.15, INK, -0.01);
  wipers(sh, s, c + 0.1, W - c - 0.1, 1.52);
  sh.poly([[c, 1.2], [W - c, 1.2], [W - c, 1.5], [c, 1.5]].map(front(-0.004)), INK);
  sh.poly(rrect(0.85, 1.31, 1.65, 1.39, 0.03, 2).map(front(-0.008)), "#f7f5f0");
  sh.poly([[c, 0.62], [W - c, 0.62], [W - c, 1.2], [c, 1.2]].map(front(-0.004)), silver);
  sh.poly(rrect(0.66, 0.68, W - 0.66, 1.02, 0.05).map(front(-0.008)), INK);
  for (let i = 0; i < 3; i++) sh.poly(rrect(0.74, 0.74 + i * 0.09, W - 0.74, 0.78 + i * 0.09, 0.01, 2).map(front(-0.01)), "#8f8f89");
  sh.poly(rrect(0.8, 1.06, W - 0.8, 1.14, 0.03, 2).map(front(-0.008)), "#5a5a55");
  // Twin rectangular lamps each side.
  for (const v of [0.3, W - 0.6]) {
    sh.poly(rrect(v, 0.74, v + 0.3, 0.92, 0.03).map(front(-0.008)), INK);
    sh.poly(circle(v + 0.09, 0.83, 0.06, 16).map(front(-0.012)), "#ffffff");
    sh.poly(circle(v + 0.21, 0.83, 0.06, 16).map(front(-0.012)), "#ffffff");
  }
  // Red bumper, plate, fog lamps.
  plate(sh, s, 1.0, 1.5, 0.4, 0.58);
  sh.poly(rrect(0.4, 0.44, 0.58, 0.54, 0.02, 2).map(front(-0.005)), "#f5c400");
  sh.poly(rrect(W - 0.58, 0.44, W - 0.4, 0.54, 0.02, 2).map(front(-0.005)), "#f5c400");
  mirrorLow(sh, s, "#a9202a");
  return s;
}

function vajra(sh) {
  const s = { L: 12, W: 2.55, H: 3.2, g: 0.3, R: 0.44, R2: 0.3, c: 0.22, base: "#c72f2b" };
  const { L, W, H, g, c } = s;
  const { sideTone } = body(sh, s);
  const wSill = 1.28, wHead = 2.82;
  const white = shade(WHITE, 0.93);

  // White swooshes on the rear flank.
  const sw1 = bezier([L, 1.1], [9.6, 1.1], [7.0, 0.85], [3.6, 0.38]);
  sh.poly(band(sw1, 0.14).map(side()), white);
  const sw2 = bezier([L, 0.72], [10.2, 0.72], [8.3, 0.62], [6.0, 0.36]);
  sh.poly(band(sw2, 0.1).map(side()), white);
  // Yellow rule under the glass, and the BMTC roundel.
  sh.poly([[c + 0.2, 1.2], [L - 0.1, 1.2], [L - 0.1, 1.27], [c + 0.2, 1.27]].map(side()), shade(PLATE, 0.9));
  sh.poly(circle(9.0, 0.78, 0.2, 24).map(side()), white);
  sh.poly(circle(9.0, 0.78, 0.13, 20).map(side()), sideTone);
  sh.poly(circle(9.0, 0.78, 0.09, 20).map(side()), white);
  sh.poly(circle(9.0, 0.78, 0.04, 12).map(side()), sideTone);
  sh.poly(rrect(2.6, 0.9, 3.4, 1.0, 0.03, 2).map(side()), white);
  // Window band.
  sh.poly(rrect(c + 0.4, wSill - 0.04, L - 0.08, wHead + 0.04, 0.06).map(side()), INK);
  door(sh, 1.1, 2.3, g + 0.1, wSill, wHead, sideTone, PLATE);
  const wins = [[2.45, 3.55], [3.62, 4.72], [4.79, 5.89]];
  for (const [a, b] of wins) sideWindow(sh, a, b, wSill, wHead, {});
  door(sh, 6.0, 7.5, g + 0.1, wSill, wHead, sideTone, PLATE);
  for (let i = 0; i < 4; i++) sideWindow(sh, 7.62 + i * 1.08, 7.62 + i * 1.08 + 1.0, wSill, wHead, {});
  sideLamps(sh, L, 0.56);

  wheel(sh, s, 3.3, 0.55);
  wheel(sh, s, 9.4, 0.55);

  // Front: curved one-piece screen with the LED board, Volvo grille, twin lamps, wordmark.
  windscreen(sh, s, c + 0.08, W - c - 0.08, 1.22, 2.78, 0.16);
  sh.poly(rrect(c + 0.12, 2.42, W - c - 0.12, 2.74, 0.06).map(front(0.02)), "#101210");
  boardText(sh, "V-500CA ITPL", W / 2, 2.49, 19, 0.135, LED, 0.015);
  wipers(sh, s, c + 0.08, W - c - 0.08, 1.24);
  sh.poly(rrect(0.78, 0.9, W - 0.78, 1.14, 0.03).map(front(-0.005)), "#d9d7cf");
  sh.poly(rrect(0.82, 0.93, W - 0.82, 1.11, 0.02).map(front(-0.008)), INK);
  sh.poly(circle(W / 2, 1.02, 0.06, 16).map(front(-0.01)), "#d9d7cf");
  // B.M.T.C. as a white bar on the red panel.
  sh.poly(rrect(0.9, 0.62, W - 0.9, 0.76, 0.03, 2).map(front(-0.005)), "#f7f5f0");
  for (const v of [0.34, W - 0.66]) {
    sh.poly(rrect(v, 0.58, v + 0.32, 0.86, 0.06).map(front(-0.008)), INK);
    roundLamp(sh, v + 0.1, 0.72, 0.07, "#8a8a84");
    roundLamp(sh, v + 0.23, 0.72, 0.07, "#8a8a84");
  }
  sh.poly([[c, 0.44], [W - c, 0.44], [W - c, 0.49], [c, 0.49]].map(front(-0.005)), "#f7f5f0");
  plate(sh, s, 1.0, 1.55, 0.5, 0.58);
  mirrorHigh(sh, s, "#a12420");
  return s;
}

function airavat(sh) {
  const s = { L: 12, W: 2.55, H: 3.62, g: 0.35, R: 0.5, R2: 0.34, c: 0.26, base: "#f4c51c", sideK: 0.86 };
  const { L, W, H, g, c } = s;
  const { sideTone } = body(sh, s);
  const wSill = 1.56, wHead = 3.1;
  const blue = "#1f4fb4", lightBlue = "#4d8ad9";

  // Luggage bays under the floor.
  for (const [a, b] of [[4.2, 6.1], [6.2, 8.1]]) {
    sh.poly(rrect(a, 0.5, b, 1.34, 0.05).map(side()), shade(s.base, 0.78));
    sh.poly(rrect(a + 0.03, 0.53, b - 0.03, 1.31, 0.04).map(side()), sideTone);
    sh.poly(rrect(b - 0.32, 0.86, b - 0.12, 0.94, 0.03, 2).map(side()), shade(s.base, 0.7));
  }
  // The blue wave rising over the rear axles.
  const wave = (w0, wEnd) => bezier([c, w0], [4.0, w0 + 0.05], [7.6, w0 - 0.15], [10.3, wEnd]);
  sh.poly(band(wave(0.98, 1.42), 0.26).map(side()), blue);
  sh.poly(band(wave(0.74, 1.18), 0.1).map(side()), shade(WHITE, 0.93));
  sh.poly(band(wave(0.54, 0.98), 0.14).map(side()), lightBlue);
  // Bay door seams read through the wave.
  for (const [a, b] of [[4.2, 6.1], [6.2, 8.1]]) sh.line(rrect(a, 0.5, b, 1.34, 0.05).map(side()).concat([side()([b - 0.05, 0.5])]), "#3a2f05", 1.4, 'fill-opacity="0" stroke-opacity="0.35"');
  for (const [u, w, r] of [[10.6, 1.55, 0.09], [10.85, 1.68, 0.06], [11.0, 1.5, 0.05], [11.15, 1.62, 0.04], [10.7, 1.36, 0.05], [10.95, 1.32, 0.03]]) {
    sh.poly(circle(u, w, r, 16).map(side()), blue);
  }
  // Airavat wordmark, skewed, and the Gold Class line.
  sh.poly([[6.1, 1.5], [8.4, 1.5], [8.55, 1.66], [6.25, 1.66]].map(side()), blue);
  sh.poly([[6.95, 1.4], [7.9, 1.4], [7.95, 1.46], [7.0, 1.46]].map(side()), shade(s.base, 0.7));
  sh.poly(circle(3.8, 1.5, 0.12, 20).map(side()), shade(s.base, 0.7));
  sh.poly(circle(3.8, 1.5, 0.08, 20).map(side()), sideTone);
  // Window band with green curtains, driver window, door.
  sh.poly(rrect(c + 0.3, wSill - 0.04, L - 0.1, wHead + 0.04, 0.06).map(side()), INK);
  sideWindow(sh, c + 0.36, 1.3, 1.8, wHead - 0.1, { seat: null });
  sh.poly(rrect(c + 0.42, 2.85, c + 0.9, 2.98, 0.02, 2).map(side()), LED);
  door(sh, 1.4, 2.4, g + 0.1, wSill, wHead, sideTone, "#d9d7cf");
  const curtain = ["#5aa552", "#3f8a3c"];
  for (let i = 0; i < 6; i++) sideWindow(sh, 2.55 + i * 1.55, 2.55 + i * 1.55 + 1.45, wSill, wHead, { curtain, sillGlow: false });
  sideLamps(sh, L, 0.62);

  wheel(sh, s, 3.3, 0.55);
  wheel(sh, s, 9.4, 0.55);
  wheel(sh, s, 10.75, 0.55);

  // Front: N.W.K.R.T.C. board over a two-piece screen, tricolour flags, stripes.
  sh.poly(rrect(c + 0.06, 2.9, W - c - 0.06, 3.28, 0.06).map(front(-0.002)), INK);
  boardText(sh, "HUBBALLI", W / 2, 3.0, 22, 0.19, "#f7f5f0", -0.008);
  windscreen(sh, s, c + 0.08, W - c - 0.08, 1.32, 2.86, 0.12);
  sh.poly([[W / 2 - 0.015, 1.34], [W / 2 + 0.015, 1.34], [W / 2 + 0.015, 2.84], [W / 2 - 0.015, 2.84]].map(front(-0.004)), INK);
  wipers(sh, s, c + 0.08, W - c - 0.08, 1.34);
  // Grille slot and lamps.
  sh.poly(rrect(0.95, 1.08, W - 0.95, 1.22, 0.03, 2).map(front(-0.006)), INK);
  sh.poly(circle(W / 2, 1.15, 0.05, 16).map(front(-0.01)), "#d9d7cf");
  for (const v of [0.34, W - 0.66]) {
    sh.poly(rrect(v, 0.7, v + 0.32, 0.92, 0.05).map(front(-0.008)), INK);
    roundLamp(sh, v + 0.1, 0.81, 0.07, "#8a8a84");
    roundLamp(sh, v + 0.23, 0.81, 0.07, "#8a8a84");
  }
  // Tricolour flags each side of the number board.
  for (const v of [0.42, W - 0.62]) {
    sh.poly(rrect(v, 1.0, v + 0.2, 1.04, 0.005, 1).map(front(-0.006)), "#f39a1e");
    sh.poly(rrect(v, 0.96, v + 0.2, 1.0, 0.005, 1).map(front(-0.006)), "#f7f5f0");
    sh.poly(rrect(v, 0.92, v + 0.2, 0.96, 0.005, 1).map(front(-0.006)), "#3f8a3c");
  }
  sh.poly(rrect(0.82, 0.94, W - 0.82, 1.02, 0.02, 2).map(front(-0.006)), "#f7f5f0");
  // Blue and white stripes across the lower front.
  for (const [w, h, col] of [[0.66, 0.05, blue], [0.6, 0.02, "#f7f5f0"], [0.54, 0.04, lightBlue]]) {
    sh.poly([[c + 0.05, w], [W - c - 0.05, w], [W - c - 0.05, w + h], [c + 0.05, w + h]].map(front(-0.005)), col);
  }
  plate(sh, s, 1.0, 1.55, 0.72, 0.84);
  mirrorHigh(sh, s, "#d7a90f");
  return s;
}

// ---------------------------------------------------------------------
// Namma Metro. Same bay, same camera. The train frame is the bus frame:
// u along the car from the tip of the nose, v across from the platform
// side, w up from rail top, which sits on the road line the buses stand on.
//
// The car is a leading car cut to a length whose end lands inside the
// frame the buses fixed, not a whole rake: a full 21.6 m car would run past
// the right edge of the shared viewBox. Height, width, door pitch and the
// window band are at true scale; only the number of door bays is reduced.
//
// The body is not the bus body. The cross-section is a domed superellipse
// above the eave, so the roof has no ridge; the nose is a superellipse in
// plan, scaled down with the section so it closes smoothly over the roof,
// and set back by a convex tip profile that leans in at the skirt, stands
// up through the mask, rakes back through the windscreen and rolls over
// into the roof. There is no corner post anywhere: the cab is one surface
//
//   u(v, w) = rake(w) + D * (hw(w) / (W/2)) * nose((v - W/2) / hw(w))
//
// over the section's interior, and the flank and roof are that section
// swept back to the car end. Nothing on the cab is a straight edge, so
// nothing on it is drawn as one: every region is a marching-squares
// contour of a field sampled on a parameter grid, projected point by point
// through the same camera as the wheels, and the silhouette is the zero
// set of the visibility field, where the surface normal turns away from
// the station point, not an outline drawn by hand.

const STEEL = "#3a3b37";
const STEEL_LIGHT = "#55564f";
const RAIL = "#a3a49e";
const METRO_LED = "#ffa11f";

// Camera in world coordinates, for the visibility test.
const CAM = [0, EYE, 0];
const U_DIR = [SIN, 0, COS], V_DIR = [-COS, 0, SIN], W_DIR = [0, 1, 0];

// Insert points along each edge of a parameter-space polyline so that a
// straight edge in (v, w) becomes a curve once mapped through a surface.
function densify(pts, step = 0.03, closed = true) {
  const out = [];
  const n = pts.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const k = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    for (let j = 0; j < k; j++) out.push([a[0] + ((b[0] - a[0]) * j) / k, a[1] + ((b[1] - a[1]) * j) / k]);
  }
  if (!closed) out.push(pts[n - 1]);
  return out;
}
// A rounded box with different radii at the bottom and the top.
function rrect2(x0, y0, x1, y1, rb, rt, n = 8) {
  const pts = [];
  const corner = (cx, cy, r, a0) => {
    for (let i = 0; i <= n; i++) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
    }
  };
  rt = Math.min(rt, (x1 - x0) / 2, (y1 - y0) / 2);
  rb = Math.min(rb, (x1 - x0) / 2, (y1 - y0) / 2);
  corner(x1 - rt, y1 - rt, rt, 0);
  corner(x0 + rt, y1 - rt, rt, Math.PI / 2);
  corner(x0 + rb, y0 + rb, rb, Math.PI);
  corner(x1 - rb, y0 + rb, rb, 1.5 * Math.PI);
  return pts;
}
// Douglas-Peucker on a closed loop, in image units: the loop is opened at
// its first point and at the point farthest from it, and each arc is
// simplified on its own.
function simplify(loop, eps) {
  if (loop.length < 4) return loop;
  const pts = loop.concat([loop[0]]);
  const keep = new Array(pts.length).fill(false);
  const dp = (i0, i1) => {
    const [ax, ay] = pts[i0], [bx, by] = pts[i1];
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    let best = -1, bi = -1;
    for (let i = i0 + 1; i < i1; i++) {
      const d = len === 1 && dx === 0 && dy === 0
        ? Math.hypot(pts[i][0] - ax, pts[i][1] - ay)
        : Math.abs((pts[i][0] - ax) * dy - (pts[i][1] - ay) * dx) / len;
      if (d > best) { best = d; bi = i; }
    }
    if (best > eps) { keep[bi] = true; dp(i0, bi); dp(bi, i1); }
  };
  let far = 1, fd = -1;
  for (let i = 1; i < loop.length; i++) {
    const d = Math.hypot(loop[i][0] - loop[0][0], loop[i][1] - loop[0][1]);
    if (d > fd) { fd = d; far = i; }
  }
  keep[0] = keep[far] = true;
  dp(0, far);
  dp(far, pts.length - 1);
  return loop.filter((_, i) => keep[i]);
}
// Marching squares over an (nx + 1) x (ny + 1) vertex grid. `value(i, j)`
// is positive inside the region and `point(i, j)` is the image of the
// vertex. The grid is padded with an outside ring that reuses the boundary
// vertices' positions, so a region that runs to the edge of the parameter
// domain is closed exactly along that edge. Returns closed loops in image
// coordinates.
function contours(nx, ny, value, point) {
  const val = new Float64Array((nx + 3) * (ny + 3));
  const px = new Float64Array((nx + 3) * (ny + 3));
  const py = new Float64Array((nx + 3) * (ny + 3));
  const idx = (i, j) => (i + 1) * (ny + 3) + (j + 1);
  for (let i = -1; i <= nx + 1; i++) {
    for (let j = -1; j <= ny + 1; j++) {
      const inside = i >= 0 && j >= 0 && i <= nx && j <= ny;
      const ci = Math.max(0, Math.min(nx, i)), cj = Math.max(0, Math.min(ny, j));
      const k = idx(i, j);
      val[k] = inside ? value(i, j) : -1;
      const p = point(ci, cj);
      px[k] = p[0]; py[k] = p[1];
    }
  }
  const cross = new Map();
  const crossing = (key, a, b) => {
    let c = cross.get(key);
    if (c) return c;
    const fa = val[a], fb = val[b];
    const t = fa / (fa - fb);
    c = { p: [px[a] + (px[b] - px[a]) * t, py[a] + (py[b] - py[a]) * t], segs: [] };
    cross.set(key, c);
    return c;
  };
  const segs = [];
  for (let i = -1; i <= nx; i++) {
    for (let j = -1; j <= ny; j++) {
      const a = idx(i, j), b = idx(i + 1, j), c = idx(i + 1, j + 1), d = idx(i, j + 1);
      const code = (val[a] >= 0 ? 1 : 0) | (val[b] >= 0 ? 2 : 0) | (val[c] >= 0 ? 4 : 0) | (val[d] >= 0 ? 8 : 0);
      if (code === 0 || code === 15) continue;
      const B = () => crossing(`h${i},${j}`, a, b);
      const R = () => crossing(`v${i + 1},${j}`, b, c);
      const T = () => crossing(`h${i},${j + 1}`, d, c);
      const L = () => crossing(`v${i},${j}`, a, d);
      const add = (e0, e1) => {
        const s = [e0(), e1()];
        s[0].segs.push(segs.length); s[1].segs.push(segs.length);
        segs.push(s);
      };
      switch (code) {
        case 1: case 14: add(L, B); break;
        case 2: case 13: add(B, R); break;
        case 3: case 12: add(L, R); break;
        case 4: case 11: add(R, T); break;
        case 6: case 9: add(B, T); break;
        case 7: case 8: add(L, T); break;
        case 5: {
          const centre = (val[a] + val[b] + val[c] + val[d]) / 4;
          if (centre >= 0) { add(L, T); add(B, R); } else { add(L, B); add(R, T); }
          break;
        }
        case 10: {
          const centre = (val[a] + val[b] + val[c] + val[d]) / 4;
          if (centre >= 0) { add(L, B); add(R, T); } else { add(L, T); add(B, R); }
          break;
        }
        default: break;
      }
    }
  }
  const used = new Array(segs.length).fill(false);
  const loops = [];
  for (let s0 = 0; s0 < segs.length; s0++) {
    if (used[s0]) continue;
    const loop = [];
    let s = s0, node = segs[s0][0];
    for (;;) {
      used[s] = true;
      const [p, q] = segs[s];
      const next = p === node ? q : p;
      loop.push(next.p);
      const other = next.segs.find((k) => k !== s && !used[k]);
      if (other === undefined) break;
      s = other; node = next;
    }
    if (loop.length >= 3) loops.push(loop);
  }
  return loops;
}
function polyArea(pts) {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[(i + 1) % pts.length];
    a += x0 * y1 - x1 * y0;
  }
  return Math.abs(a) / 2;
}
// Draw the region where `value` is positive on a parameter grid, as one
// even-odd path of simplified contour loops. Loops below `minArea` are
// sampling noise and dropped.
function region(sh, nx, ny, value, point, fill, extra = "", minArea = 4) {
  const loops = contours(nx, ny, value, point)
    .filter((l) => polyArea(l) >= minArea)
    .map((l) => simplify(l, 0.12));
  if (!loops.length) return;
  for (const l of loops) sh.track(l);
  const d = loops.map((l) => l.map(([x, y], i) => `${i ? "L" : "M"}${r1(x)},${r1(y)}`).join("") + "Z").join("");
  sh.parts.push(`<path d="${d}" fill="${fill}" fill-rule="evenodd"${extra ? " " + extra : ""}/>`);
}

const vsub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const vdot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const vaxpy = (a, x, b, y, c, z) => [a[0] * x + b[0] * y + c[0] * z, a[1] * x + b[1] * y + c[1] * z, a[2] * x + b[2] * y + c[2] * z];

// Signed distance to a rounded box, negative inside, with the corner
// radius chosen by which half of the box the point is in.
function sdBox(v, w, v0, w0, v1, w1, rb, rt) {
  const cx = (v0 + v1) / 2, cy = (w0 + w1) / 2;
  const r = w > cy ? rt : rb;
  const qx = Math.abs(v - cx) - (v1 - v0) / 2 + r, qy = Math.abs(w - cy) - (w1 - w0) / 2 + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
}
const smax = (a, b, k) => {
  const h = Math.max(0, Math.min(1, 0.5 + (0.5 * (a - b)) / k));
  return b + (a - b) * h + k * h * (1 - h);
};

// The cab geometry, shared by the body regions and every detail mapped
// onto the surface.
function makeCab(t) {
  const { W, H, g, wEave, D, p, q } = t;
  // Tip profile in (u, w): skirt leaning in, the mask nearly upright and
  // proudest at the band, the windscreen raked back, the roll over the roof
  // ending level at the crest. Convex throughout, so the solid stays convex.
  const prof = [].concat(
    bezier([0.2, g], [0.1, 0.95], [0.0, 1.25], [0.0, 1.55], 12),
    bezier([0.0, 1.55], [0.0, 1.8], [0.04, 1.95], [0.08, 2.08], 8).slice(1),
    bezier([0.08, 2.08], [0.3, 2.5], [0.52, 2.95], [0.74, 3.36], 12).slice(1),
    bezier([0.74, 3.36], [1.0, 3.68], [1.25, H], [1.5, H], 16).slice(1),
  );
  const rake = (w) => {
    if (w <= prof[0][1]) return prof[0][0];
    for (let i = 1; i < prof.length; i++) {
      if (w <= prof[i][1]) {
        const [u0, w0] = prof[i - 1], [u1, w1] = prof[i];
        return u0 + ((u1 - u0) * (w - w0)) / (w1 - w0 || 1e-9);
      }
    }
    return prof[prof.length - 1][0];
  };
  // Half-width of the section at height w: the flank up to the eave, then
  // a superellipse dome to the crest.
  const hw = (w) => {
    if (w <= wEave) return W / 2;
    if (w >= H) return 0;
    const s = (w - wEave) / (H - wEave);
    return (W / 2) * Math.pow(1 - Math.pow(s, q), 1 / q);
  };
  const nose = (n) => {
    n = Math.min(1, Math.abs(n));
    return 1 - Math.pow(1 - Math.pow(n, p), 1 / p);
  };
  const depth = (v, w) => {
    const h = hw(w);
    if (h < 1e-6) return rake(w);
    return rake(w) + D * (h / (W / 2)) * nose((v - W / 2) / h);
  };
  // Where the flank begins at height w: the cab surface's near edge.
  const uFlank = (w) => rake(w) + D * (hw(w) / (W / 2));
  // The section as a polyline from the near skirt, up and over the dome,
  // down the far flank, at roughly even spacing. The bottom face is left
  // out: it is never visible from a standing eye.
  const section = [];
  const stepW = 0.03;
  for (let w = g; w < wEave; w += stepW) section.push([0, w]);
  const nDome = 130;
  for (let i = 0; i <= nDome; i++) {
    const a = Math.PI - (i / nDome) * Math.PI;
    const cx = Math.cos(a), sy = Math.sin(a);
    const x = (W / 2) * Math.sign(cx) * Math.pow(Math.abs(cx), 2 / q);
    const y = (H - wEave) * Math.pow(Math.abs(sy), 2 / q);
    section.push([W / 2 + x, wEave + y]);
  }
  for (let w = wEave - stepW; w >= g; w -= stepW) section.push([W, w]);
  section.push([W, g]);
  // Outward normal of the section at each vertex, in (v, w).
  const secN = section.map((pt, i) => {
    const a = section[Math.max(0, i - 1)], b = section[Math.min(section.length - 1, i + 1)];
    const tv = b[0] - a[0], tw = b[1] - a[1];
    const len = Math.hypot(tv, tw) || 1;
    return [-tw / len, tv / len];
  });
  // Visibility of a surface point with body-frame normal (nu, nv, nw).
  const visAt = (u, v, w, nu, nv, nw) => {
    const N = vaxpy(U_DIR, nu, V_DIR, nv, W_DIR, nw);
    return vdot(N, vsub(CAM, world(u, v, w)));
  };
  // The cab surface's outward normal is (-1, u_v, u_w) up to scale.
  const capVis = (v, w) => {
    const h = 0.002;
    const uv = (depth(v + h, w) - depth(v - h, w)) / (2 * h);
    const uw = (depth(v, w + h) - depth(v, w - h)) / (2 * h);
    return visAt(depth(v, w), v, w, -1, uv, uw);
  };
  const sweepVis = (i, u) => visAt(u, section[i][0], section[i][1], 0, secN[i][0], secN[i][1]);
  // A (v, w) -> image mapper for details on the cab surface, du proud.
  const face = (du = 0.006) => ([v, w]) => P(depth(v, w) - du, v, w);
  return { rake, hw, depth, uFlank, section, secN, capVis, sweepVis, face };
}

// The body, in two passes so the flank details can go between them: the
// swept flank and roof first, then the cab over the join. Each region is a
// contour of min(visibility, zone) on its parameter grid.
function trainSweep(sh, t, cab, tones) {
  const { L, W } = t;
  const { section, uFlank, sweepVis } = cab;
  const { upper, lower, valance, flankK, roofK, band, wBand, vBorder } = tones;
  const wEave = t.wEave;

  // Sweep grid: i along the section, j from just inside the cab edge
  // (so the join is covered by the cab drawn later) to the car end.
  const nI = section.length - 1, nJ = 90;
  const sweepU = (i, j) => {
    const [, w] = section[i];
    const u0 = uFlank(w) - 0.02;
    return u0 + ((L - u0) * j) / nJ;
  };
  const sweepPt = (i, j) => P(sweepU(i, j), section[i][0], section[i][1]);
  const sweepField = (zone) => (i, j) => Math.min(sweepVis(i, sweepU(i, j)), zone(section[i][0], section[i][1], sweepU(i, j)));
  region(sh, nI, nJ, sweepField(() => 1), sweepPt, shade(upper, flankK));
  // Lower body and valance on the flank, below the band and below the floor.
  region(sh, nI, nJ, sweepField((v, w) => wBand[0] - w), sweepPt, shade(lower, flankK));
  region(sh, nI, nJ, sweepField((v, w) => Math.min(wBand[0] - w, 1.02 - w)), sweepPt, shade(valance, flankK));
  // The shoulder, seen from below, turning away.
  region(sh, nI, nJ, sweepField((v, w) => w - wEave), sweepPt, shade(upper, flankK * roofK));
  // The line colour carried a little way onto the roof behind the cab.
  region(sh, nI, nJ, sweepField((v, w, u) => Math.min(0.22 - (u - uFlank(w) + 0.02), (W / 2 - vBorder) - Math.abs(v - W / 2))), sweepPt, shade(band, roofK));
}

// The cab: base tone over the whole visible surface, then the tonal zones
// on top. Returns the zone painter for the livery and the face.
function trainCap(sh, t, cab, tones) {
  const { W, H, g, wEave } = t;
  const { depth, capVis } = cab;
  const { upper, lower, valance, roofK, nearK, farK, wBand, vBorder } = tones;
  // Cab grid over (v, w), the region inside the section.
  const v0 = -0.03, v1 = W + 0.03, w0 = g - 0.03, w1 = H + 0.03;
  const nV = Math.ceil((v1 - v0) / 0.02), nW = Math.ceil((w1 - w0) / 0.02);
  const vAt = (i) => v0 + ((v1 - v0) * i) / nV, wAt = (j) => w0 + ((w1 - w0) * j) / nW;
  const capPt = (i, j) => P(depth(vAt(i), wAt(j)), vAt(i), wAt(j));
  const inside = (v, w) => Math.min(cab.hw(w) - Math.abs(v - W / 2), w - g, H - w);
  const capField = (zone) => (i, j) => {
    const v = vAt(i), w = wAt(j);
    const ins = inside(v, w);
    if (ins < -0.05) return ins;
    return Math.min(capVis(v, w), ins, zone(v, w));
  };
  const cap = (zone, fill) => region(sh, nV, nW, capField(zone), capPt, fill);
  cap(() => 1, upper);
  cap((v, w) => wBand[0] - w, lower);
  cap((v, w) => 1.02 - w, valance);
  cap((v, w) => vBorder - v, shade(upper, nearK));
  cap((v, w) => Math.min(vBorder - v, wBand[0] - w), shade(lower, nearK));
  cap((v, w) => Math.min(vBorder - v, 1.02 - w), shade(valance, nearK));
  cap((v, w) => v - (W - vBorder), shade(upper, farK));
  cap((v, w) => Math.min(v - (W - vBorder), wBand[0] - w), shade(lower, farK));
  cap((v, w) => w - (wEave + 0.12), shade(upper, roofK));
  return cap;
}

function runningGear(sh, t, bogies) {
  const { L, W } = t;
  const gauge = 1.435, vRail = W / 2 - gauge / 2, railW = 0.07, wheelR = 0.43, tread = 0.13;
  const void_ = [[0.05, 0.03], [L, 0.03], [L, W - 0.05], [0.05, W - 0.05]].map(([u, v]) => P(u, v, 0));
  sh.poly(void_, "#1c1c1a", 'fill-opacity="0.78"');
  for (const v of [vRail, W - vRail]) {
    sh.poly([[-0.6, v - railW / 2], [L + 0.1, v - railW / 2], [L + 0.1, v + railW / 2], [-0.6, v + railW / 2]].map(([u, vv]) => P(u, vv, 0)), RAIL);
  }
  // Far-side wheels and frame first, dark.
  const wheel = (uc, vOut, vIn, faceTone) => {
    const outer = circle(uc, wheelR, wheelR, 44).map(side(vOut));
    const inner = circle(uc, wheelR, wheelR, 44).map(side(vIn));
    sh.poly(hull(outer.concat(inner)), "#2b2c29");
    sh.poly(outer, faceTone);
    sh.poly(circle(uc, wheelR, wheelR * 0.3, 20).map(side(vOut)), HUB);
  };
  for (const uc of bogies) {
    sh.poly(rrect(uc - 1.5, 0.3, uc + 1.5, 0.82, 0.04).map(side(W - 0.3)), "#2e2f2b");
    wheel(uc - 1.1, W - vRail - tread / 2 - 0.02, W - vRail + tread / 2, "#3f403c");
    wheel(uc + 1.1, W - vRail - tread / 2 - 0.02, W - vRail + tread / 2, "#3f403c");
  }
  // Equipment boxes between the bogies, then the near bogies over them.
  const [b0, b1] = bogies;
  sh.poly(rrect(b0 + 1.9, 0.34, b1 - 1.9, 0.84, 0.03).map(side(0.34)), STEEL);
  sh.poly(rrect(0.34, 0.34, W - 0.34, 0.84, 0.03).map(front(b0 + 1.9)), shade(STEEL, 1.1));
  for (const u of [b0 + 3.4, b0 + 3.46, b1 - 3.4, b1 - 3.46]) {
    sh.poly([[u, 0.36], [u + 0.02, 0.36], [u + 0.02, 0.82], [u, 0.82]].map(side(0.335)), "#22231f");
  }
  for (const uc of bogies) {
    sh.poly(rrect(uc - 1.55, 0.3, uc + 1.55, 0.82, 0.05).map(side(0.28)), STEEL);
    sh.poly(rrect(0.28, 0.3, W - 0.28, 0.82, 0.05).map(front(uc - 1.55)), STEEL_LIGHT);
    sh.poly([[uc - 1.5, 0.52], [uc + 1.5, 0.52], [uc + 1.5, 0.56], [uc - 1.5, 0.56]].map(side(0.275)), STEEL_LIGHT);
    wheel(uc - 1.1, vRail - tread / 2 - 0.02, vRail + tread / 2, "#565752");
    wheel(uc + 1.1, vRail - tread / 2 - 0.02, vRail + tread / 2, "#565752");
    // Axle boxes at the wheel centres, outboard of the wheels.
    for (const uw of [uc - 1.1, uc + 1.1]) sh.poly(rrect(uw - 0.16, 0.3, uw + 0.16, 0.6, 0.05).map(side(0.27)), STEEL_LIGHT);
  }
}

// A pair of sliding leaves in a black frame, glazed at the top, with the
// line band carried across the lower panels.
function slidingDoor(sh, u0, u1, wFloor, wSill, wHead, wTop, tone, band, bandTone) {
  sh.poly(rrect(u0, wFloor, u1, wTop, 0.03).map(side()), INK);
  const mid = (u0 + u1) / 2;
  const leaf = (a, b) => {
    sh.poly(rrect(a, wFloor + 0.03, b, wTop - 0.03, 0.03).map(side()), tone);
    sh.poly([[a, band[0]], [b, band[0]], [b, band[1]], [a, band[1]]].map(side()), bandTone);
    sh.poly(rrect(a + 0.09, wSill, b - 0.09, wHead, 0.07).map(side()), GLASS);
    sh.poly([[a + 0.11, wHead - 0.02], [b - 0.11, wHead - 0.02], [b - 0.11, wSill + (wHead - wSill) * 0.58], [a + 0.11, wSill + (wHead - wSill) * 0.58]].map(side()), "#ffffff", 'fill-opacity="0.07"');
  };
  leaf(u0 + 0.03, mid - 0.015);
  leaf(mid + 0.015, u1 - 0.03);
}

// A saloon window with a grab pole seen through the glass.
function saloonWindow(sh, u0, u1, w0, w1) {
  sideWindow(sh, u0, u1, w0, w1, { seat: null, sillGlow: false });
  const up = u0 + (u1 - u0) * 0.42;
  sh.poly([[up, w0 + 0.03], [up + 0.03, w0 + 0.03], [up + 0.03, w1 - 0.03], [up, w1 - 0.03]].map(side()), "#b9b7ae");
  sh.poly([[u0 + 0.02, w1 - 0.02], [u1 - 0.02, w1 - 0.02], [u1 - 0.02, w0 + (w1 - w0) * 0.58], [u0 + 0.02, w0 + (w1 - w0) * 0.58]].map(side()), "#ffffff", 'fill-opacity="0.07"');
}

function nammaMetro(sh, line) {
  const t = { L: 15, W: 2.88, H: 3.9, g: 0.62, wEave: 3.3, D: 0.95, p: 2.2, q: 2.5 };
  const { L, W, H, g, wEave } = t;
  const band = line.band;
  const upper = "#d4d6d3", lower = "#c0c2bf", valance = "#9c9e9b";
  const MASK = "#3a3c3b";
  const wFloor = 1.1, wSill = 2.05, wHead = 3.08, wBand = [1.72, 2.02];
  const vBorder = 0.3;
  const bogies = [2.6, L - 2.6];
  const cab = makeCab(t);
  const { uFlank, face } = cab;

  runningGear(sh, t, bogies);
  const tones = { upper, lower, valance, flankK: 0.86, roofK: 0.78, nearK: 1.03, farK: 0.9, band, wBand, vBorder };
  const flankTone = shade(upper, 0.86);
  trainSweep(sh, t, cab, tones);

  // Flank details, on the v = 0 plane. Each runs from just inside the cab
  // edge at its own height, so the cab drawn afterwards covers the join.
  const fl = (w) => uFlank(w) - 0.03;
  // Cantrail gutter and the sheeting line under the floor.
  sh.poly([[fl(wEave - 0.04), wEave - 0.04], [L, wEave - 0.04], [L, wEave], [fl(wEave), wEave]].map(side()), shade(upper, 0.6));
  sh.poly([[fl(wFloor - 0.06), wFloor - 0.06], [L, wFloor - 0.06], [L, wFloor - 0.02], [fl(wFloor - 0.02), wFloor - 0.02]].map(side()), shade(lower, 0.62));
  // The line band, with a darker rule under it.
  sh.poly([[fl(wBand[0]), wBand[0]], [L, wBand[0]], [L, wBand[1]], [fl(wBand[1]), wBand[1]]].map(side()), shade(band, 0.86));
  sh.poly([[fl(wBand[0] - 0.04), wBand[0] - 0.04], [L, wBand[0] - 0.04], [L, wBand[0]], [fl(wBand[0]), wBand[0]]].map(side()), shade(band, 0.6));
  // Cab side window, following the raked cab edge, and the crew door.
  const cw0 = (w) => uFlank(w) + 0.1;
  const cabWin = [[cw0(wSill), wSill], [1.9, wSill], [1.9, wHead - 0.02], [cw0(wHead - 0.02), wHead - 0.02]];
  sh.poly(densify(cabWin, 0.05).map(side()), INK);
  sh.poly(densify([[cw0(wSill) + 0.04, wSill + 0.04], [1.86, wSill + 0.04], [1.86, wHead - 0.06], [cw0(wHead - 0.06) + 0.04, wHead - 0.06]], 0.05).map(side()), GLASS);
  sh.poly(rrect(2.0, wFloor, 2.62, wHead + 0.04, 0.04).map(side()), INK);
  sh.poly(rrect(2.03, wFloor + 0.03, 2.59, wHead + 0.01, 0.03).map(side()), flankTone);
  sh.poly([[2.03, wBand[0]], [2.59, wBand[0]], [2.59, wBand[1]], [2.03, wBand[1]]].map(side()), shade(band, 0.86));
  sh.poly([[2.03, wFloor + 0.03], [2.59, wFloor + 0.03], [2.59, wBand[0] - 0.04], [2.03, wBand[0] - 0.04]].map(side()), shade(lower, 0.86));
  sh.poly(rrect(2.1, wSill + 0.1, 2.52, wHead - 0.06, 0.06).map(side()), GLASS);
  // Three door bays at the real 4.6 m pitch, saloon windows between.
  const doors = [[2.9, 4.3], [7.5, 8.9], [12.1, 13.5]];
  const windows = [[4.45, 5.85], [6.0, 7.35], [9.05, 10.45], [10.6, 11.95], [13.65, 14.75]];
  for (const [a, b] of windows) saloonWindow(sh, a, b, wSill, wHead);
  for (const [a, b] of doors) {
    slidingDoor(sh, a, b, wFloor, wSill, wHead - 0.1, wHead + 0.02, flankTone, wBand, shade(band, 0.86));
    sh.poly([[a + 0.03, wFloor + 0.03], [b - 0.03, wFloor + 0.03], [b - 0.03, wBand[0] - 0.04], [a + 0.03, wBand[0] - 0.04]].map(side()), shade(lower, 0.86));
    sh.poly([[a + 0.03, wBand[0]], [b - 0.03, wBand[0]], [b - 0.03, wBand[1]], [a + 0.03, wBand[1]]].map(side()), shade(band, 0.86));
    sh.poly([[(a + b) / 2 - 0.012, wFloor + 0.03], [(a + b) / 2 + 0.012, wFloor + 0.03], [(a + b) / 2 + 0.012, wHead], [(a + b) / 2 - 0.012, wHead]].map(side()), INK);
  }
  // Car-end gangway rubber.
  sh.poly([[L - 0.06, g], [L, g], [L, wEave - 0.1], [L - 0.06, wEave - 0.1]].map(side()), INK);

  // The cab. The dark face is a rounded box of glass over mask; the line
  // colour is a thick border round it, carried up over the roof edge to
  // where the silver roof begins, and joined to the flank band at each
  // side with a fillet.
  const faceBox = [0.46, 1.36, W - 0.46, 3.22, 0.42, 0.5];
  const outerBox = [vBorder, 1.2, W - vBorder, 3.74, 0.58, 0.5];
  const greenField = (v, w) => {
    const ring = Math.min(-sdBox(v, w, ...outerBox), sdBox(v, w, ...faceBox));
    const bandIn = Math.min(w - wBand[0], wBand[1] - w, Math.min(v, W - v) < W / 2 ? 0.44 - Math.min(v, W - v) : -1);
    return smax(ring, bandIn, 0.1);
  };
  const cap = trainCap(sh, t, cab, tones);
  cap(greenField, band);
  cap((v, w) => Math.min(greenField(v, w), vBorder + 0.12 - v), shade(band, 1.04));
  cap((v, w) => Math.min(greenField(v, w), w - (wEave + 0.12)), shade(band, 0.78));
  cap((v, w) => Math.min(greenField(v, w), v - (W - vBorder - 0.12)), shade(band, 0.9));

  // Mask and glass.
  const FR = face();
  sh.poly(densify(rrect2(...faceBox), 0.03).map(FR), MASK);
  sh.poly(densify(rrect2(0.55, 2.12, W - 0.55, 3.14, 0.14, 0.38), 0.03).map(face(0.009)), GLASS_FRONT);
  sh.poly(densify([[0.62, 3.06], [W - 0.62, 3.06], [W - 0.62, 2.72], [0.62, 2.5]], 0.03).map(face(0.011)), "#ffffff", 'fill-opacity="0.08"');
  // Destination strip, set into the bodywork above the glass.
  sh.poly(densify(rrect(W / 2 - 0.7, 3.27, W / 2 + 0.7, 3.46, 0.03), 0.03).map(face(0.004)), "#2a2b28");
  sh.poly(densify(rrect(W / 2 - 0.67, 3.29, W / 2 + 0.67, 3.44, 0.02), 0.03).map(face(0.006)), "#0b0c0b");
  boardText(sh, line.destination, W / 2, 3.33, 10, 0.092, METRO_LED, face(0.008));
  // Wipers at rest, arms lying along the bottom of the glass.
  for (const v0 of [0.66, 1.52]) {
    sh.line(densify([[v0, 2.14], [v0 + 0.72, 2.2]], 0.04, false).map(face(0.012)), INK, 3);
    sh.line(densify([[v0 + 0.14, 2.24], [v0 + 0.72, 2.29]], 0.04, false).map(face(0.012)), INK, 2.2);
  }
  // Emblem: the BMRCL knot, in magenta on the mask.
  const em = [W / 2, 1.86];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    sh.poly(densify(circle(em[0] + 0.075 * Math.cos(a), em[1] + 0.075 * Math.sin(a), 0.045, 16), 0.02).map(face(0.01)), "#b8288f");
  }
  sh.poly(densify(circle(em[0], em[1], 0.05, 16), 0.02).map(face(0.011)), MASK);
  sh.poly(densify(circle(em[0], em[1], 0.024, 12), 0.02).map(face(0.012)), "#b8288f");
  // Lamps: round clusters low and outboard in pairs, a squarer lamp between.
  const lamp = (v, w, r) => {
    sh.poly(densify(circle(v, w, r, 24), 0.02).map(face(0.01)), "#8a8a84");
    sh.poly(densify(circle(v, w, r * 0.72, 20), 0.02).map(face(0.012)), "#ffffff");
    sh.poly(densify(circle(v - r * 0.2, w + r * 0.2, r * 0.3, 12), 0.02).map(face(0.014)), "#dfe7ee");
  };
  for (const v of [0.74, W - 0.74]) {
    lamp(v, 1.6, 0.095);
    lamp(v + (v < W / 2 ? 0.25 : -0.25), 1.6, 0.095);
  }
  sh.poly(densify(rrect(W / 2 - 0.1, 1.5, W / 2 + 0.1, 1.62, 0.02, 3), 0.02).map(face(0.01)), "#8a8a84");
  sh.poly(densify(rrect(W / 2 - 0.08, 1.52, W / 2 + 0.08, 1.6, 0.015, 3), 0.02).map(face(0.012)), "#f4f1e6");
  // Coupler under the nose.
  const uTip = cab.rake(g);
  sh.poly([[uTip - 0.34, W / 2 - 0.13, 0.44], [uTip + 0.3, W / 2 - 0.13, 0.44], [uTip + 0.3, W / 2 - 0.13, 0.62], [uTip - 0.34, W / 2 - 0.13, 0.62]].map((x) => P(...x)), "#2a2b28");
  sh.poly([[uTip - 0.34, W / 2 - 0.13, 0.44], [uTip - 0.34, W / 2 + 0.13, 0.44], [uTip - 0.34, W / 2 + 0.13, 0.62], [uTip - 0.34, W / 2 - 0.13, 0.62]].map((x) => P(...x)), INK);
  sh.poly(rrect(W / 2 - 0.16, 0.42, W / 2 + 0.16, 0.66, 0.05).map(front(uTip - 0.36)), "#1e1f1c");
  return t;
}

// ---------------------------------------------------------------------

const metroLines = [
  { id: "namma-metro-green", line: "Green Line", band: "#1fa04c", destination: "SILK INSTITUTE" },
  { id: "namma-metro-purple", line: "Purple Line", band: "#7c3399", destination: "CHALLAGHATTA" },
  { id: "namma-metro-yellow", line: "Yellow Line", band: "#f3c317", destination: "BOMMASANDRA" },
];

const trains = metroLines.map((m) => ({
  id: m.id,
  title: `Namma Metro ${m.line} train, leading car, three-quarter view from the front and platform side`,
  note: `Standard-gauge metro stock: a rounded, domed cab in light grey and silver, one raked windscreen over a dark mask with paired round lamps, the ${m.line.split(" ")[0].toLowerCase()} of the line as a thick border round the face that runs over the roof edge and joins the flank band, three pairs of sliding doors, bogies under the sheeting, on rail. A 15 m leading car: the length is cut so the car end lands inside the frame the 12 m coaches fixed; height, width and door pitch are at true scale.`,
  draw: (sh) => nammaMetro(sh, m),
}));

const buses = [
  { id: "bmtc-bengaluru-sarige", title: "BMTC Bengaluru Sarige city bus, three-quarter view from the front and door side", note: "Ashok Leyland front-engine body: mid-blue, white rear panel with a diagonal front edge, black-framed sliding windows, two folding doors, yellow grab poles.", draw: bengaluruSarige },
  { id: "ksrtc-karnataka-sarige", title: "KSRTC Karnataka Sarige intercity bus, three-quarter view from the front and door side", note: "Ashok Leyland Viking chassis with a KSRTC body: red roof and lower body, silver midband with a yellow rule, black-framed sliding windows, blue seats.", draw: karnatakaSarige },
  { id: "bmtc-vajra-volvo", title: "BMTC Vajra Volvo air conditioned city bus, three-quarter view from the front and door side", note: "Volvo B7RLE low-floor body: deep red with white swooshes along the rear flank, a yellow rule under a continuous black window band.", draw: vajra },
  { id: "nwkrtc-airavat-gold-class", title: "NWKRTC Airavat Gold Class coach, three-quarter view from the front and door side", note: "Volvo multi-axle high-floor coach: yellow with a blue and white wave rising along the flank, luggage bays under the floor, green curtains in the windows.", draw: airavat },
];

const draw = (list) => list.map((b) => {
  const sh = new Sheet();
  b.draw(sh);
  return sh;
});
const sheets = draw(buses);
const trainSheets = draw(trains);

// One viewBox for all seven: the union of the four bus extents, with a
// margin, and the near ground contact placed identically in each file. The
// buses fix the box; the trains are drawn to fit inside it and checked.
const pad = 18;
const minx = Math.min(...sheets.map((s) => s.minx)) - pad;
const maxx = Math.max(...sheets.map((s) => s.maxx)) + pad;
const miny = Math.min(...sheets.map((s) => s.miny)) - pad;
const maxy = Math.max(...sheets.map((s) => s.maxy)) + pad;
const vbW = Math.ceil(maxx - minx), vbH = Math.ceil(maxy - miny);
const ox = -minx, oy = -miny;

const outDir = process.argv[2] || path.resolve("public/fleet");
mkdirSync(outDir, { recursive: true });

const header = (b, shared) => {
  const horizon = r1(oy);
  const vpu = r1(VP_U[0] + ox), vpv = r1(VP_V[0] + ox);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" role="img">
<title>${b.title}</title>
<!-- ${b.note} -->
<!-- Projected through one pinhole camera shared by ${shared}: station point at road level x=0, eye height ${EYE} m, level view, focal length ${F} units; the vehicle parked with its front door corner ${X0} m right and ${Z0} m ahead, yawed ${Math.round((THETA * 180) / Math.PI)} degrees. Horizon at y=${horizon}; vanishing points at x=${vpu} (length) and x=${vpv} (width) in this viewBox. -->
<g transform="translate(${r1(ox)} ${r1(oy)})">
`;
};

const all = buses.map((b, i) => [b, sheets[i], "all four fleet drawings"])
  .concat(trains.map((b, i) => [b, trainSheets[i], "all seven fleet drawings, four buses and three metro cars"]));

for (const [b, sh, shared] of all) {
  const svg = header(b, shared) + sh.parts.join("\n") + "\n</g>\n</svg>\n";
  writeFileSync(path.join(outDir, `${b.id}.svg`), svg);
}

console.log(`viewBox 0 0 ${vbW} ${vbH}; horizon y=${r1(oy)}; VPs x=${r1(VP_U[0] + ox)}, ${r1(VP_V[0] + ox)}`);
let overflow = false;
for (const [b, s] of all) {
  const x0 = s.minx + ox, x1 = s.maxx + ox, y0 = s.miny + oy, y1 = s.maxy + oy;
  const out = x0 < 0 || y0 < 0 || x1 > vbW || y1 > vbH;
  overflow ||= out;
  console.log(b.id, `x ${r1(x0)}..${r1(x1)} y ${r1(y0)}..${r1(y1)}${out ? "  OUTSIDE THE BOX" : ""}`);
}
if (overflow) process.exitCode = 1;

// Optional review renders.
if (process.argv[3]) {
  const sharp = require(path.resolve(process.cwd(), "node_modules/sharp"));
  const dir = process.argv[3];
  mkdirSync(dir, { recursive: true });
  const bg = `<rect width="${vbW}" height="${vbH}" fill="#f6f2ea"/>`;
  await Promise.all(all.map(([b, sh, shared]) => {
    const svg = header(b, shared).replace("<title>", bg + "<title>") + sh.parts.join("\n") + "\n</g>\n</svg>\n";
    return sharp(Buffer.from(svg)).resize(1000).png().toFile(path.join(dir, `${b.id}.png`));
  }));
}
