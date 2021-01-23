import * as L from 'leaflet';
import React, { Component } from 'react';
import { MapContainer } from 'react-leaflet';

import { Blast } from './blast';
import { Position } from './position';
import { Detonation, DetonationMarker } from './detonation';
import { loadRaster, buildPopulationLayer } from './helpers';
import { TOKEN, TILE_URL, STYLE_ID, ATTRIBUTION } from './config';
// redux
import { connect } from 'react-redux';
import { AppState } from '../redux/store';
import { DetonationState } from '../redux/detonations/types';
import { addDetonation } from '../redux/detonations/actions';

import EventList from './event-list/EventList';
import './Leaf.css';

const geoblaze = require('geoblaze');

// Map Props
export type LeafProps = {
  dataFile: string;
  detonation: DetonationState;
  addDetonation: typeof addDetonation;
};

// Map State
type LeafState = {
  raster: any;
  hover: Position;
  hoverValue: number;
  populationLayer: L.Layer;
  marker: DetonationMarker | null;
};

// Map
export class Leaf extends Component<LeafProps, LeafState> {
  constructor(props: any) {
    super(props);
    this.setState({});
  }

  async componentDidMount() {
    try {
      const raster = await loadRaster(this.props.dataFile);
      const populationLayer = buildPopulationLayer(raster);
      this.setState({ populationLayer, raster });
    } catch (err) {
      console.error(err);
    }
  }

  mapRef(map: any) {
    const { raster, populationLayer } = this.state;

    populationLayer.addTo(map);
    const group = L.layerGroup().addTo(map);

    const tileLayerOptions = {
      id: STYLE_ID,
      accessToken: TOKEN,
      attribution: ATTRIBUTION,
    } as L.TileLayerOptions;

    L.tileLayer(TILE_URL, tileLayerOptions).addTo(group);

    map.on('mousemove', (event: any) => {
      const { marker } = this.state;
      const pos = Position.fromEvent(event);
      const coords = [pos.lng, pos.lat];

      let value = geoblaze.identify(raster, coords)[0];
      if (!value || value < 0) {
        value = 0;
      }

      if (marker && marker.geometry) {
        const radius = marker.center.distanceBetweenPx(pos);
        marker.setRadius(radius);
      }

      this.setState({ marker, hover: pos, hoverValue: value });
    });

    map.on('mousedown', (event: any) => {
      if (!event.originalEvent.ctrlKey) return;
      map.dragging.disable();

      const pos = Position.fromEvent(event);
      const marker = new DetonationMarker(pos, map);
      this.setState({ marker });
    });

    map.on('mouseup', (event: any) => {
      const { marker } = this.state;
      if (!marker) return;

      const pos = Position.fromEvent(event);
      const radius = marker.center.distanceBetweenKm(pos);
      const blast = new Blast(radius);

      // update store
      const detonation = new Detonation(marker, blast, map);
      this.props.addDetonation(detonation);

      this.setState({ marker: null });
      map.dragging.enable();
    });
  }

  render() {
    if (!this.state) return null;

    const { hover, hoverValue, raster } = this.state;
    let v: number | string = 0;
    let x: number | string = 0;
    let y: number | string = 0;
    let lng: number | string = 0;
    let lat: number | string = 0;

    if (hover) {
      v = hoverValue.toFixed(2);
      x = (hover.x || 0).toFixed(2);
      y = (hover.y || 0).toFixed(2);
      lng = (hover.lng || 0).toFixed(2);
      lat = (hover.lat || 0).toFixed(2);
    }

    const style = { top: `${y}px`, left: `${x}px` };
    const text = `(${lat}, ${lng}) - Population: ${v}`;

    return (
      <>
        <MapContainer
          zoom={6}
          className="map"
          scrollWheelZoom={true}
          center={[35.79, -78.65]}
          whenCreated={this.mapRef.bind(this)}
        ></MapContainer>
        <div className="tooltip" style={style}>
          {text}
        </div>
        <EventList title={'Nuclear Events'} raster={raster}></EventList>
      </>
    );
  }
}

export default connect(
  (state: AppState) => ({ detonation: state.detonation }),
  { addDetonation }
)(Leaf);
