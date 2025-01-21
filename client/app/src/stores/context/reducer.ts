// reducer.ts

import {Action, State} from '../../types/state.types';

export const initialState: State = {
  user: null,
  token: null,
  userLoading: true,
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        userLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        userLoading: false,
      };
    case 'LOGIN_REQUEST':
      return {
        ...state,
        userLoading: true,
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
};
