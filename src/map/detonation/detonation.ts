import * as d3 from 'd3';
import * as L from 'leaflet';
import { circle, difference, Feature, Polygon } from '@turf/turf';

import { Blast } from '../blast/blast';
import { Position } from '../position/position';
import { DetonationMarker } from './detonation-marker';

const geoblaze = require('geoblaze');

// Detonation
export class Detonation {
  blast: Blast;
  text: string = '';
  label: L.Marker;
  center: Position;
  private map: L.Map;
  private geometry: L.GeoJSON[] = [];
  private highlight!: L.GeoJSON;
  private zoneGroup!: L.FeatureGroup;

  constructor(marker: DetonationMarker, blast: Blast, map: L.Map) {
    this.map = map;
    this.blast = blast;
    this.center = marker.center;
    const { text, label } = marker.remove();
    this.text = text;
    this.label = label;
    this.label.remove();

    this.createDetonation();
  }

  createDetonation() {
    // create blast
    const extents = [0, this.blast.zones.length - 1];
    const color = d3.scaleSequential<string, number>(
      extents,
      d3.interpolatePlasma
    );
    const opacity = d3.scaleLinear().domain(extents).range([0.4, 0.9]);
    const center = [this.center.lng, this.center.lat] as number[];

    let previousCircle: Feature<Polygon> | null = null;

    const zoneGeometry: L.GeoJSON[] = [];

    for (let i = this.blast.zones.length - 1; i >= 0; i--) {
      const zone = this.blast.zones[i];
      let c = circle(center, zone.radius, {
        steps: 30,
        units: 'kilometers',
        properties: {
          psi: zone.psi,
          death: zone.deathRate,
        },
      });
      const options = {
        style: {
          weight: 0,
          fillColor: `${color(i)}`,
          fillOpacity: opacity(i),
        },
      } as L.GeoJSONOptions;

      let g: L.GeoJSON;
      if (i === this.blast.zones.length - 1) {
        g = L.geoJSON(c, options);
      } else {
        const diff = difference(c, previousCircle as Feature<Polygon>) || c;
        g = L.geoJSON(diff, options);
      }
      previousCircle = c;
      zoneGeometry.push(g);
    }

    this.zoneGroup = L.featureGroup();

    zoneGeometry.reverse().forEach((zone) => {
      // zone.addTo(this.map);
      zone.addTo(this.zoneGroup);
      this.geometry.push(zone);
    });

    this.zoneGroup.addTo(this.map);
    this.label.addTo(this.map);
  }

  sum(raster: any): number {
    let total = 0;
    this.geometry.forEach((geo, i) => {
      const zone = this.blast.zones[i];
      const deaths = geoblaze.sum(raster, geo.toGeoJSON());
      total += deaths * zone.deathRate;
    });
    return Math.floor(total);
  }

  focus() {
    const zone = this.blast.zones[0];
    const { lat, lng } = this.center;
    const center = [lng, lat] as number[];
    const style = {
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0.2,
      fillColor: '#ffffff',
    };

    const c = circle(center, zone.radius, { steps: 30, units: 'kilometers' });
    this.highlight = L.geoJSON(c, { style }).addTo(this.map);
  }

  blur() {
    this.highlight.remove();
  }

  remove() {
    this.label.remove();
    this.geometry.forEach((geo) => geo.remove());
    if (this.highlight) this.highlight.remove();
    if (this.zoneGroup) this.zoneGroup.remove();
  }
}
