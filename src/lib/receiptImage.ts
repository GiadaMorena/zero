// Local adaptive contrast keeps faint text visible despite uneven lighting.
export function receiptContrast(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
) {
  const stride = width + 1,
    gray = new Uint8Array(width * height),
    sum = new Float64Array((width + 1) * (height + 1)),
    squared = new Float64Array(sum.length);
  let warm = 0,
    blue = 0;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i],
      g = pixels[i + 1],
      b = pixels[i + 2];
    if (r > b * 1.15 && g > b * 1.05 && r > 70) warm++;
    if (b > r * 1.08 && b > g * 1.02) blue++;
  }
  const blueBackdrop =
    warm > width * height * 0.08 && blue > width * height * 0.1;
  for (let y = 0; y < height; y++) {
    let row = 0,
      rowSquared = 0;
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4,
        r = pixels[i],
        g = pixels[i + 1],
        b = pixels[i + 2];
      const value =
        blueBackdrop && b > r * 1.08 && b > g * 1.02
          ? 255
          : Math.round(0.299 * r + 0.587 * g + 0.114 * b);
      gray[y * width + x] = value;
      row += value;
      rowSquared += value * value;
      const p = (y + 1) * stride + x + 1;
      sum[p] = sum[p - stride] + row;
      squared[p] = squared[p - stride] + rowSquared;
    }
  }
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const l = Math.max(0, x - 25),
        r = Math.min(width, x + 26),
        t = Math.max(0, y - 25),
        b = Math.min(height, y + 26),
        area = (r - l) * (b - t);
      const total =
          sum[b * stride + r] -
          sum[t * stride + r] -
          sum[b * stride + l] +
          sum[t * stride + l],
        square =
          squared[b * stride + r] -
          squared[t * stride + r] -
          squared[b * stride + l] +
          squared[t * stride + l],
        mean = total / area,
        deviation = Math.sqrt(Math.max(0, square / area - mean * mean));
      const value =
          gray[y * width + x] < mean * (1 + 0.1 * (deviation / 128 - 1))
            ? 0
            : 255,
        i = (y * width + x) * 4;
      pixels[i] = pixels[i + 1] = pixels[i + 2] = value;
      pixels[i + 3] = 255;
    }
  return pixels;
}
