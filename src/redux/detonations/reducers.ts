import {
  DetonationState,
  DetonationActions,
  ADD_DETONATION,
  REMOVE_DETONATION,
} from './types';

const initialState: DetonationState = {
  detonations: [],
};

export function detonationReducer(
  state: DetonationState = initialState,
  action: DetonationActions
): DetonationState {
  switch (action.type) {
    case ADD_DETONATION:
      return {
        detonations: [...state.detonations, action.detonation],
      };
    case REMOVE_DETONATION:
      const detonation = state.detonations[action.index];
      if (!detonation) return state;
      detonation.remove();
      state.detonations.splice(action.index, 1);
      return { detonations: state.detonations };
    default:
      return state;
  }
}
