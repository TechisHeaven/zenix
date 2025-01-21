import {Dispatch} from 'react';
import {Action, UserState} from '../types/state.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Login action function
export const loginAction = async (
  dispatch: Dispatch<Action>,
  user: UserState,
  token: string,
) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
  await AsyncStorage.setItem('token', JSON.stringify(token));
  dispatch({
    type: 'LOGIN',
    payload: {user, token},
  });
};

// Logout action function
export const logoutAction = async (dispatch: Dispatch<Action>) => {
  await AsyncStorage.removeItem('user');
  await AsyncStorage.removeItem('token');
  dispatch({
    type: 'LOGOUT',
  });
};

export const refreshUserAction = async (dispatch: Dispatch<Action>) => {
  const user = await AsyncStorage.getItem('user');
  const token = await AsyncStorage.getItem('token');

  if (user && token) {
    dispatch({
      type: 'LOGIN',
      payload: {
        token: JSON.parse(token!),
        user: JSON.parse(user!),
      },
    });
  } else {
    dispatch({
      type: 'LOGOUT',
    });
  }
};
