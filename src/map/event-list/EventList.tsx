import { Component } from 'react';

// redux
import { connect } from 'react-redux';
import { AppState } from '../../redux/store';
import { DetonationState } from '../../redux/detonations/types';
import { removeDetonation } from '../../redux/detonations/actions';

import './EventList.css';

export type EventListProps = {
  raster: any;
  title: string;
  detonation: DetonationState;
  removeDetonation: typeof removeDetonation;
};

export class EventList extends Component<EventListProps, any> {
  render() {
    const { title, raster, detonation, removeDetonation } = this.props;

    return (
      <div className="blast-list">
        <div className="blast-list-title">{title}</div>
        <div className="blast-list-items">
          <div key={'blast'} className="blast-list-header">
            <div className="blast-item-location">Lat, Lng</div>
            <div className="blast-item-radius">Radius</div>
            <div className="blast-item-yield">Yeild</div>
            <div className="blast-item-deaths">Deaths</div>
          </div>
          {detonation.detonations.map((d, i) => {
            const { lng, lat } = d.center;
            const radius = d.blast.zones[0].radius;
            return (
              <div
                key={'blast-' + i}
                tabIndex={0}
                className="blast-list-item"
                onMouseEnter={() => d.focus()}
                onMouseLeave={() => d.blur()}
              >
                <div className="blast-item-location">
                  {`${lat?.toFixed(2)}°, ${lng?.toFixed(2)}°`}
                </div>
                <div className="blast-item-radius">
                  {`${radius.toFixed(2)} km`}
                </div>
                <div className="blast-item-yield">{d.text}</div>
                <div className="blast-item-deaths">{d.sum(raster)}</div>
                <div
                  tabIndex={0}
                  className="blast-item-delete"
                  onClick={() => removeDetonation(i)}
                >
                  🗑
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default connect(
  (state: AppState) => ({ detonation: state.detonation }),
  { removeDetonation }
)(EventList);
