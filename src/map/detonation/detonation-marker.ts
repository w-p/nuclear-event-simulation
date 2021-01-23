import * as L from 'leaflet';
import { Position } from '../position/position';

// Detonation Marker
export class DetonationMarker {
  center: Position;
  text: string = '';
  label: L.Marker;
  geometry: L.CircleMarker | null = null;

  constructor(center: Position, map: L.Map) {
    this.center = center;
    const { lat, lng } = this.center;
    if (!lat || !lng) {
      throw new Error("Invalid 'Position' provided.");
    }

    const coords = { lat, lng };
    const options = {
      weight: 1,
      color: '#ffffff',
      fillOpacity: 0,
    } as L.CircleMarkerOptions;
    this.geometry = L.circleMarker(coords, options);
    this.geometry.addTo(map);

    const icon = L.divIcon({
      className: 'detonation-marker-label',
      html: this.text,
    });
    this.label = L.marker(coords, { icon });
    this.label.addTo(map);
  }

  setRadius(kilometers: number) {
    if (!this.geometry) return;
    const kilotons = Math.pow(kilometers / 1.42, 3.033);

    let energy = kilotons;
    let unit = 'Kilotons';
    if (kilotons >= 1000) {
      energy = kilotons / 1000;
      unit = 'Megatons';
    } else if (kilotons >= 1000000) {
      energy = kilotons / 1000000;
      unit = 'Gigatons';
    }

    this.text = `${energy.toFixed(2)} ${unit}`;
    const icon = this.label.getIcon() as L.DivIcon;
    icon.options.html = `<div class="text">${this.text}</div>`;
    this.geometry.setRadius(kilometers);
  }

  remove(): { text: string; label: L.Marker } {
    if (this.geometry) this.geometry.remove();
    return { text: this.text, label: this.label };
  }
}
