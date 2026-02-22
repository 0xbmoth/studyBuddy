// src/context/StateContext.tsx
import { createContext, Dispatch } from 'react';
import { AppState } from '../reducer/store';
import { Action } from '../reducer/store';

interface StateContextType {
  state: AppState;
  dispatch: Dispatch<Action>;
}

export const StateContext = createContext<StateContextType>({} as StateContextType);