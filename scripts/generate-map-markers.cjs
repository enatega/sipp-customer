const fs = require('node:fs');
const path = require('node:path');
const { PNG } = require('pngjs');

const outputDirectory = path.resolve(__dirname, '../src/general/assets/map-markers');
const BLUE = [37, 155, 231, 255];
const WHITE = [255, 255, 255, 255];

function blendPixel(png, x, y, color) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) return;
  const index = (Math.floor(y) * png.width + Math.floor(x)) * 4;
  const alpha = color[3] / 255;
  const inverse = 1 - alpha;
  png.data[index] = Math.round(color[0] * alpha + png.data[index] * inverse);
  png.data[index + 1] = Math.round(color[1] * alpha + png.data[index + 1] * inverse);
  png.data[index + 2] = Math.round(color[2] * alpha + png.data[index + 2] * inverse);
  png.data[index + 3] = Math.round((alpha + (png.data[index + 3] / 255) * inverse) * 255);
}

function circle(png, cx, cy, radius, color) {
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (distance <= radius) blendPixel(png, x, y, color);
    }
  }
}

function ring(png, cx, cy, radius, width, color) {
  const minX = Math.floor(cx - radius);
  const maxX = Math.ceil(cx + radius);
  const minY = Math.floor(cy - radius);
  const maxY = Math.ceil(cy + radius);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const distance = Math.hypot(x + 0.5 - cx, y + 0.5 - cy);
      if (distance <= radius && distance >= radius - width) blendPixel(png, x, y, color);
    }
  }
}

function line(png, x1, y1, x2, y2, width, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)) * 2;
  for (let index = 0; index <= steps; index += 1) {
    const progress = steps === 0 ? 0 : index / steps;
    circle(
      png,
      x1 + (x2 - x1) * progress,
      y1 + (y2 - y1) * progress,
      width / 2,
      color,
    );
  }
}

function polygon(png, points, color) {
  const ys = points.map((point) => point[1]);
  for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y += 1) {
    const intersections = [];
    for (let index = 0; index < points.length; index += 1) {
      const a = points[index];
      const b = points[(index + 1) % points.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        intersections.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let index = 0; index < intersections.length; index += 2) {
      for (let x = Math.floor(intersections[index]); x <= Math.ceil(intersections[index + 1]); x += 1) {
        blendPixel(png, x, y, color);
      }
    }
  }
}

function storeGlyph(png, scale, color, offsetX = 0, offsetY = 0) {
  const s = scale;
  line(png, (15.5 + offsetX) * s, (20.5 + offsetY) * s, (32.5 + offsetX) * s, (20.5 + offsetY) * s, 2.2 * s, color);
  line(png, (17 + offsetX) * s, (20.5 + offsetY) * s, (17 + offsetX) * s, (31.5 + offsetY) * s, 2.2 * s, color);
  line(png, (31 + offsetX) * s, (20.5 + offsetY) * s, (31 + offsetX) * s, (31.5 + offsetY) * s, 2.2 * s, color);
  line(png, (17 + offsetX) * s, (31.5 + offsetY) * s, (31 + offsetX) * s, (31.5 + offsetY) * s, 2.2 * s, color);
  polygon(png, [[(16.5 + offsetX) * s, (14.5 + offsetY) * s], [(31.5 + offsetX) * s, (14.5 + offsetY) * s], [(33 + offsetX) * s, (20.5 + offsetY) * s], [(15 + offsetX) * s, (20.5 + offsetY) * s]], color);
  line(png, (21 + offsetX) * s, (31 + offsetY) * s, (21 + offsetX) * s, (25 + offsetY) * s, 2 * s, color);
  line(png, (27 + offsetX) * s, (31 + offsetY) * s, (27 + offsetX) * s, (25 + offsetY) * s, 2 * s, color);
  line(png, (21 + offsetX) * s, (25 + offsetY) * s, (27 + offsetX) * s, (25 + offsetY) * s, 2 * s, color);
}

function createStoreMarker(scale, selected) {
  const png = new PNG({ width: 48 * scale, height: 48 * scale });
  if (selected) circle(png, 24 * scale, 22 * scale, 21 * scale, [46, 170, 242, 42]);
  polygon(png, [[18.5 * scale, 34 * scale], [24 * scale, 44 * scale], [29.5 * scale, 34 * scale]], selected ? BLUE : WHITE);
  circle(png, 24 * scale, 22 * scale, 19.25 * scale, selected ? WHITE : BLUE);
  circle(png, 24 * scale, 22 * scale, 16.5 * scale, selected ? BLUE : WHITE);
  storeGlyph(png, scale, selected ? WHITE : BLUE);
  return png;
}

function createTrackingHome(scale) {
  const png = new PNG({ width: 48 * scale, height: 48 * scale });
  circle(png, 24 * scale, 24 * scale, 22 * scale, [46, 170, 242, 42]);
  circle(png, 24 * scale, 24 * scale, 19.25 * scale, WHITE);
  circle(png, 24 * scale, 24 * scale, 17 * scale, BLUE);
  line(png, 15.5 * scale, 23.5 * scale, 24 * scale, 16 * scale, 2.2 * scale, WHITE);
  line(png, 24 * scale, 16 * scale, 32.5 * scale, 23.5 * scale, 2.2 * scale, WHITE);
  line(png, 18 * scale, 22 * scale, 18 * scale, 32 * scale, 2.2 * scale, WHITE);
  line(png, 30 * scale, 22 * scale, 30 * scale, 32 * scale, 2.2 * scale, WHITE);
  line(png, 18 * scale, 32 * scale, 30 * scale, 32 * scale, 2.2 * scale, WHITE);
  return png;
}

function createTrackingStore(scale) {
  const png = new PNG({ width: 40 * scale, height: 40 * scale });
  circle(png, 20 * scale, 20 * scale, 18 * scale, BLUE);
  circle(png, 20 * scale, 20 * scale, 15.8 * scale, WHITE);
  // The shared glyph is authored on a 48px canvas (optical centre x=24).
  // Tracking markers use a 40px canvas, so shift it left and slightly up to
  // centre the storefront within the 20px circle rather than the bitmap.
  storeGlyph(png, scale, BLUE, -4, -3);
  return png;
}

function createTrackingRider(scale) {
  const png = new PNG({ width: 40 * scale, height: 40 * scale });
  circle(png, 20 * scale, 20 * scale, 18 * scale, BLUE);
  circle(png, 20 * scale, 20 * scale, 15.8 * scale, WHITE);
  ring(png, 13 * scale, 26 * scale, 4 * scale, 1.8 * scale, BLUE);
  ring(png, 28 * scale, 26 * scale, 4 * scale, 1.8 * scale, BLUE);
  line(png, 13 * scale, 26 * scale, 18 * scale, 18 * scale, 2 * scale, BLUE);
  line(png, 18 * scale, 18 * scale, 23 * scale, 26 * scale, 2 * scale, BLUE);
  line(png, 23 * scale, 26 * scale, 13 * scale, 26 * scale, 2 * scale, BLUE);
  line(png, 23 * scale, 26 * scale, 26 * scale, 18 * scale, 2 * scale, BLUE);
  line(png, 21 * scale, 18 * scale, 26 * scale, 18 * scale, 2 * scale, BLUE);
  line(png, 17 * scale, 15 * scale, 21 * scale, 15 * scale, 2 * scale, BLUE);
  return png;
}

const assets = [
  ['store', createStoreMarker],
  ['store-selected', (scale) => createStoreMarker(scale, true)],
  ['tracking-home', createTrackingHome],
  ['tracking-store', createTrackingStore],
  ['tracking-rider', createTrackingRider],
];

for (const [name, create] of assets) {
  for (const scale of [1, 2, 3]) {
    const suffix = scale === 1 ? '' : `@${scale}x`;
    const outputPath = path.join(outputDirectory, `${name}${suffix}.png`);
    create(scale).pack().pipe(fs.createWriteStream(outputPath));
  }
}
