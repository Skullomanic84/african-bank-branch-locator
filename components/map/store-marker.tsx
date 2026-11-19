import { renderToStaticMarkup } from "react-dom/server";
import type mapboxgl from "mapbox-gl";
import { MdPersonPin } from "react-icons/md";

export const STORE_PIN_IMAGE_ID = "store-map-pin";

// Rendered at 2x and registered with pixelRatio 2, so it displays at 30x33.
const PIN_WIDTH = 66;
const PIN_HEIGHT = 66;

// Material icons start with an invisible 24x24 bounding-box path. It would
// pick up the outline stroke and draw a square around the pin, so drop it.
const BOUNDING_BOX_PATH = '<path fill="none" d="M0 0h24v24H0z"></path>';

function getStorePinSvg() {
  return renderToStaticMarkup(
    <MdPersonPin
      color="#5dc300"
      stroke="#112768"
      strokeWidth={0.5}
      // Crop to the pin shape (x 3-21, y 2-22) plus room for the outline,
      // so the tip sits on the bottom edge where the icon is anchored.
      viewBox="2 1 20 22"
      width={PIN_WIDTH}
      height={PIN_HEIGHT}
    />,
  ).replace(BOUNDING_BOX_PATH, "");
}

export function loadStorePinImage(map: mapboxgl.Map): Promise<void> {
  if (map.hasImage(STORE_PIN_IMAGE_ID)) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const image = new Image(PIN_WIDTH, PIN_HEIGHT);

    image.onload = () => {
      if (!map.hasImage(STORE_PIN_IMAGE_ID)) {
        map.addImage(STORE_PIN_IMAGE_ID, image, { pixelRatio: 2 });
      }
      resolve();
    };
    image.onerror = () => reject(new Error("Failed to load store pin icon."));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(getStorePinSvg())}`;
  });
}
