import * as ImageManipulator from "expo-image-manipulator";
import jpeg from "jpeg-js";
import type { Rgb } from "./scan";

/** Downscale a captured photo to 32×32 and decode to RGB pixels on-device. */
export async function decodeSmall(uri: string): Promise<{ px: Rgb[]; width: number; height: number }> {
  const small = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 32, height: 32 } }], { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG, base64: true });
  const buf = Uint8Array.from(atob(small.base64 ?? ""), (c) => c.charCodeAt(0));
  const { data, width, height } = jpeg.decode(buf, { useTArray: true });
  const px: Rgb[] = [];
  for (let i = 0; i < data.length; i += 4) px.push({ r: data[i]!, g: data[i + 1]!, b: data[i + 2]! });
  return { px, width, height };
}
