import * as d3 from 'd3';
import * as L from 'leaflet';
const parse_georaster = require('georaster');
const GeoRasterLayer = require('georaster-layer-for-leaflet');

export async function loadRaster(file: string): Promise<any> {
  const res = await fetch(file);
  const buffer = await res.arrayBuffer();
  return await parse_georaster(buffer);
}

export function buildPopulationLayer(
  raster: any,
  resolution: number = 32
): L.Layer {
  const maxValue = raster.maxs[0];
  // redistribute colors for visibility
  const extents = [0, maxValue / 50, maxValue / 1.25, maxValue];
  const populationColor = d3.scaleSequential(extents, d3.interpolateCool);

  const colorFn = (values: any) => {
    // 'strip' non-population data; n <= 0
    if (values[0] === raster.noDataValue) {
      return '#00000000';
    }
    return populationColor(values[0]);
  };

  const geoRasterOptions = {
    className: 'map-data',
    georaster: raster,
    resolution: resolution,
    pixelValuesToColorFn: colorFn,
  };

  return new GeoRasterLayer(geoRasterOptions);
}
