import { distance } from '@turf/turf';

const geoblaze = require('geoblaze');

// Position
export class Position {
  x: number | null;
  y: number | null;
  lat: number | null;
  lng: number | null;

  constructor(x: number, y: number, lat: number, lng: number) {
    this.x = x;
    this.y = y;
    this.lat = lat;
    this.lng = lng;
  }

  static fromEvent(event: any): Position {
    const x = event.containerPoint.x;
    const y = event.containerPoint.y;
    const lat = event.latlng.lat;
    const lng = event.latlng.lng;
    return new Position(x, y, lat, lng);
  }

  getValue(raster: any): number {
    return geoblaze.identify(raster, [this.lng, this.lat])[0] || 0;
  }

  distanceBetweenPx(p: Position): number {
    if (!this.x || !this.y || !p.x || !p.y) return 0;
    return Math.sqrt(Math.pow(p.x - this.x, 2) + Math.pow(p.y - this.y, 2));
  }

  distanceBetweenKm(p: Position): number {
    const start = [this.lng, this.lat] as number[];
    const end = [p.lng, p.lat] as number[];
    return distance(start, end, { units: 'kilometers' });
  }
}
