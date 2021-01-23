import { Detonation } from '../../map/detonation';

export interface DetonationState {
  detonations: Detonation[];
}

export const ADD_DETONATION = 'ADD_DETONATION';

export const REMOVE_DETONATION = 'REMOVE_DETONATION';

export type AddDetonationAction = {
  type: typeof ADD_DETONATION;
  detonation: Detonation;
};

export type RemoveDetonationAction = {
  type: typeof REMOVE_DETONATION;
  index: number;
};

export type DetonationActions = AddDetonationAction | RemoveDetonationAction;
