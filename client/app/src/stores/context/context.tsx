// context.tsx
import React, {createContext, useReducer, ReactNode, useContext} from 'react';
import {reducer, initialState} from './reducer';
import {Action, State} from '../../types/state.types';

interface StateContextProps {
  state: State;
  dispatch: React.Dispatch<Action>;
}

const StateContext = createContext<StateContextProps | undefined>(undefined);

export const StateProvider: React.FC<{children: ReactNode}> = ({children}) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <StateContext.Provider value={{state, dispatch}}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = (): StateContextProps => {
  const context = useContext(StateContext);
  if (!context) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};
