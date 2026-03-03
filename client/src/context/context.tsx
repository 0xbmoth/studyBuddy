import { createContext, Dispatch, ReactNode, useContext, useReducer } from 'react';
import { AppState, initialState, reducer } from '../reducer/store';
import { Action } from '../reducer/store';

const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<Action>;
} | undefined> (undefined)

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};