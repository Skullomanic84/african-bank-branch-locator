"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";

import type { Store } from "@/types/store";
import {
  getMapboxAccessToken,
  SOUTH_AFRICA_CENTER,
  SOUTH_AFRICA_ZOOM,
} from "@/lib/utils/mapbox";

type StoreMapProps = {
  stores: Store[];
  isLoading?: boolean;
};

const STORES_SOURCE_ID = "stores-source";
const CLUSTERS_LAYER_ID = "clusters";
const CLUSTER_COUNT_LAYER_ID = "cluster-count";
const UNCLUSTERED_LAYER_ID = "unclustered-point";
const MAP_PIN_IMAGE_ID = "store-map-pin";

const SOUTH_AFRICA_LNG_MIN = 16;
const SOUTH_AFRICA_LNG_MAX = 33;
const SOUTH_AFRICA_LAT_MIN = -35;
const SOUTH_AFRICA_LAT_MAX = -22;

function isWithinSouthAfricaBounds(longitude: number, latitude: number) {
  return (
    longitude >= SOUTH_AFRICA_LNG_MIN &&
    longitude <= SOUTH_AFRICA_LNG_MAX &&
    latitude >= SOUTH_AFRICA_LAT_MIN &&
    latitude <= SOUTH_AFRICA_LAT_MAX
  );
}

function toFeatureCollection(stores: Store[]): GeoJSON.FeatureCollection<GeoJSON.Point> {
  const features: GeoJSON.Feature<GeoJSON.Point>[] = stores.flatMap((store) => {
    const [longitude, latitude] = store.location.coordinates;

    if (
      typeof longitude !== "number" ||
      typeof latitude !== "number" ||
      Number.isNaN(longitude) ||
      Number.isNaN(latitude) ||
      !isWithinSouthAfricaBounds(longitude, latitude)
    ) {
      return [];
    }

    return [
      {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        properties: {
          name: store.name,
          slug: store.slug,
          addressLine1: store.addressLine1,
          suburb: store.suburb,
          city: store.city,
          province: store.province,
        },
      },
    ];
  });

  return {
    type: "FeatureCollection",
    features,
  };
}

export default function StoreMap({ stores, isLoading = false }: StoreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [isMapReady, setIsMapReady] = useState(false);

  const token = getMapboxAccessToken();

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || !token) {
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: SOUTH_AFRICA_CENTER,
      zoom: SOUTH_AFRICA_ZOOM,
      attributionControl: false,
    });

    const navigationControl = new mapboxgl.NavigationControl({
      showCompass: true,
      showZoom: true,
      visualizePitch: false,
    });

    const geolocateControl = new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: false,
      showUserHeading: true,
      showAccuracyCircle: false,
    });

    map.addControl(navigationControl, "top-right");
    map.addControl(geolocateControl, "top-right");

    map.on("load", () => {
      map.addSource(STORES_SOURCE_ID, {
        type: "geojson",
        data: toFeatureCollection([]),
        cluster: true,
        clusterMaxZoom: 10,
        clusterRadius: 50,
      });

      map.addLayer({
        id: CLUSTERS_LAYER_ID,
        type: "circle",
        source: STORES_SOURCE_ID,
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#7db0ff",
            10,
            "#4c92ff",
            50,
            "#2b76ff",
          ],
          "circle-radius": ["step", ["get", "point_count"], 18, 10, 24, 50, 32],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#cde1ff",
          "circle-opacity": 0.85,
        },
      });

      map.addLayer({
        id: CLUSTER_COUNT_LAYER_ID,
        type: "symbol",
        source: STORES_SOURCE_ID,
        filter: ["has", "point_count"],
        layout: {
          "text-field": ["get", "point_count_abbreviated"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 13,
        },
        paint: {
          "text-color": "#0f3a85",
        },
      });

      const bindUnclusteredLayerInteractions = () => {
        map.on("click", UNCLUSTERED_LAYER_ID, (event) => {
          const feature = event.features?.[0];
          if (!feature || feature.geometry.type !== "Point") {
            return;
          }

          const properties = feature.properties as Record<string, string | undefined>;
          const [longitude, latitude] = feature.geometry.coordinates as [number, number];

          const popupHtml = `
            <div style="font-family: Montserrat, sans-serif; color: #112768; min-width: 220px;">
              <h3 style="margin: 0 0 8px; font-size: 16px; font-weight: 700;">${properties.name ?? ""}</h3>
              <p style="margin: 0 0 6px; font-size: 14px; font-weight: 300;">${properties.addressLine1 ?? ""}</p>
              <p style="margin: 0 0 10px; font-size: 14px; font-weight: 300;">
                ${properties.suburb ?? ""}, ${properties.city ?? ""}, ${properties.province ?? ""}
              </p>
              <a
                href="/stores/${properties.slug ?? ""}"
                style="
                  display: inline-block;
                  background: #5dc300;
                  color: white;
                  text-decoration: none;
                  padding: 8px 12px;
                  border-radius: 4px;
                  font-size: 14px;
                  font-weight: 600;
                "
              >
                View store
              </a>
            </div>
          `;

          new mapboxgl.Popup({
            offset: 8,
            closeButton: true,
            closeOnClick: false,
            className: "store-popup",
          })
            .setLngLat([longitude, latitude])
            .setHTML(popupHtml)
            .addTo(map);
        });

        map.on("mouseenter", UNCLUSTERED_LAYER_ID, () => {
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", UNCLUSTERED_LAYER_ID, () => {
          map.getCanvas().style.cursor = "";
        });
      };

      const addUnclusteredFallbackLayer = () => {
        if (!map.getLayer(UNCLUSTERED_LAYER_ID)) {
          map.addLayer({
            id: UNCLUSTERED_LAYER_ID,
            type: "circle",
            source: STORES_SOURCE_ID,
            filter: ["!", ["has", "point_count"]],
            paint: {
              "circle-color": "#5dc300",
              "circle-radius": 8,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#112768",
            },
          });
        }

        bindUnclusteredLayerInteractions();
      };

      map.loadImage("/location.png", (error, image) => {
        if (error || !image) {
          console.error("Failed to load map pin icon:", error);
          addUnclusteredFallbackLayer();
          return;
        }

        if (!map.hasImage(MAP_PIN_IMAGE_ID)) {
          map.addImage(MAP_PIN_IMAGE_ID, image, { pixelRatio: 2 });
        }

        if (!map.getLayer(UNCLUSTERED_LAYER_ID)) {
          map.addLayer({
            id: UNCLUSTERED_LAYER_ID,
            type: "symbol",
            source: STORES_SOURCE_ID,
            filter: ["!", ["has", "point_count"]],
            layout: {
              "icon-image": MAP_PIN_IMAGE_ID,
              "icon-size": 0.8,
              "icon-anchor": "bottom",
              "icon-offset": [0, -10],
              "icon-allow-overlap": true,
              "icon-ignore-placement": true,
            },
          });
        }

        bindUnclusteredLayerInteractions();
      });

      map.on("click", CLUSTERS_LAYER_ID, (event) => {
        const features = map.queryRenderedFeatures(event.point, {
          layers: [CLUSTERS_LAYER_ID],
        });

        const clusterFeature = features[0];
        const clusterId = clusterFeature?.properties?.cluster_id;
        if (typeof clusterId !== "number") {
          return;
        }

        const source = map.getSource(STORES_SOURCE_ID) as mapboxgl.GeoJSONSource;
        source.getClusterExpansionZoom(clusterId, (error, zoom) => {
          if (error || !clusterFeature.geometry || clusterFeature.geometry.type !== "Point") {
            return;
          }

          const [longitude, latitude] = clusterFeature.geometry.coordinates;
          map.easeTo({
            center: [longitude, latitude],
            zoom: typeof zoom === "number" ? zoom : map.getZoom(),
            duration: 600,
          });
        });
      });

      map.on("mouseenter", CLUSTERS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", CLUSTERS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });

      setIsMapReady(true);

      requestAnimationFrame(() => {
        map.resize();
      });

      setTimeout(() => {
        map.resize();
      }, 150);
    });

    resizeObserverRef.current = new ResizeObserver(() => {
      map.resize();
    });

    resizeObserverRef.current.observe(mapContainerRef.current);

    const handleWindowResize = () => {
      map.resize();
    };

    window.addEventListener("resize", handleWindowResize);

    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", handleWindowResize);

      resizeObserverRef.current?.disconnect();
      resizeObserverRef.current = null;

      map.remove();
      mapRef.current = null;
      setIsMapReady(false);
    };
  }, [token]);

  useEffect(() => {
    if (!mapRef.current || !isMapReady) {
      return;
    }

    const map = mapRef.current;
    const source = map.getSource(STORES_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    const validStores = stores.filter((store) => {
      const [longitude, latitude] = store.location.coordinates;
      return (
        typeof longitude === "number" &&
        typeof latitude === "number" &&
        !Number.isNaN(longitude) &&
        !Number.isNaN(latitude) &&
        isWithinSouthAfricaBounds(longitude, latitude)
      );
    });

    source?.setData(toFeatureCollection(validStores));

    if (!validStores.length) {
      map.flyTo({
        center: SOUTH_AFRICA_CENTER,
        zoom: SOUTH_AFRICA_ZOOM,
        duration: 800,
      });
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    validStores.forEach((store) => {
      const [longitude, latitude] = store.location.coordinates;

      bounds.extend([longitude, latitude]);
    });

    requestAnimationFrame(() => {
      map.resize();

      if (validStores.length === 1) {
        const [longitude, latitude] = validStores[0].location.coordinates;

        map.flyTo({
          center: [longitude, latitude],
          zoom: 13,
          duration: 1000,
        });

        return;
      }

      map.fitBounds(bounds, {
        padding: {
          top: 60,
          right: 60,
          bottom: 60,
          left: 60,
        },
        maxZoom: 13,
        duration: 1000,
      });
    });
  }, [stores, isMapReady]);

  if (!token) {
    return (
      <div className="flex h-full items-center justify-center rounded-lg bg-[#efefef] p-6 text-center text-[14px] font-light text-[#112768]">
        Add your Mapbox public token to
        <span className="mx-1 font-semibold">
          NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
        </span>
        to display the map.
      </div>
    );
  }

  return (
    <div className="relative h-full overflow-hidden rounded-lg bg-[#efefef]">
      <div ref={mapContainerRef} className="h-full w-full" />

      {isLoading ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/55 text-[14px] font-light text-[#112768]">
          Loading map...
        </div>
      ) : null}
    </div>
  );
}
