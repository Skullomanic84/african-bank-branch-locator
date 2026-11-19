import { renderToStaticMarkup } from "react-dom/server";
import type mapboxgl from "mapbox-gl";
import { FaMapMarkerAlt } from "react-icons/fa";

export const STORE_PIN_IMAGE_ID = "store-map-pin";

// Rendered at 2x and registered with pixelRatio 2, so it displays at 24x32.
const PIN_WIDTH = 48;
const PIN_HEIGHT = 64;

function getStorePinSvg() {
  return renderToStaticMarkup(
    <FaMapMarkerAlt
      color="#5dc300"
      stroke="#112768"
      strokeWidth={24}
      // Pad the icon's 384x512 viewBox so the outline isn't clipped.
      viewBox="-16 -16 416 544"
      width={PIN_WIDTH}
      height={PIN_HEIGHT}
    />,
  );
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
