import { deviceWidth, deviceHeight } from './device';
import { PixelRatio } from 'react-native';

const GUIDELINE_WIDTH = 390;
const GUIDELINE_HEIGHT = 844;

/**
 * return pixel density independent width
 * @param width percentage
 */
export function w(width: number) {
  return PixelRatio.roundToNearestPixel((deviceWidth * width) / 100);
}

/**
 * return pixel density independent height
 * @param height percentage
 */
export function h(height: number) {
  return PixelRatio.roundToNearestPixel((deviceHeight * height) / 100);
}

const Height = 'h';
const Width = 'w';
type Dimension = typeof Height | typeof Width;

function scaleOnMiniDevices(scaledPixelSize, pixelSizeFromMockup) {
  let func = Math.min;
  if (pixelSizeFromMockup < 0) func = Math.max;

  return func(scaledPixelSize, pixelSizeFromMockup);
}

/**
 * Normalize size
 * returns pixel density independent height / width
 * based on given size of element according to mockups (for small devices only!)
 * @param pixelSizeFromMockup element size from mockup
 * @param dimension height or width of device we relate to
 */
export function ns(
  pixelSizeFromMockup: number | string,
  dimension: Dimension = Width,
): number {
  if (typeof pixelSizeFromMockup === 'number') {
    return scaleOnMiniDevices(
      dimension === Height
        ? h((pixelSizeFromMockup / GUIDELINE_HEIGHT) * 100)
        : w((pixelSizeFromMockup / GUIDELINE_WIDTH) * 100),
      pixelSizeFromMockup,
    );
  }

  return pixelSizeFromMockup as any;
}

// Normalize Font Size
export function nfs(pixelSizeFromMockup: number) {
  return scaleOnMiniDevices(ns(pixelSizeFromMockup), pixelSizeFromMockup);
}
