import { detonationReducer } from './detonations/reducers';
import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';

const rootReducer = combineReducers({
  detonation: detonationReducer,
});

export type AppState = ReturnType<typeof rootReducer>;

export default function configureStore() {
  const middleware = [thunkMiddleware];
  return createStore(rootReducer, applyMiddleware(...middleware));
}
