import { Detonation } from '../../map/detonation';
import { ADD_DETONATION, REMOVE_DETONATION } from './types';

export function addDetonation(detonation: Detonation) {
  console.log('adding detonation', detonation);
  return {
    type: ADD_DETONATION,
    detonation,
  };
}

export function removeDetonation(index: number) {
  return {
    type: REMOVE_DETONATION,
    index,
  };
}
