import {
  loginAction,
  logoutAction,
  refreshUserAction,
} from '../actions/auth.actions';
import {useStateContext} from '../stores/context/context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {State, UserState} from '../types/state.types';

export const useAuth = () => {
  const {state, dispatch} = useStateContext();

  const login = (user: UserState, token: string) => {
    loginAction(dispatch, user, token);
  };
  const register = (user: UserState, token: string) => {
    loginAction(dispatch, user, token);
  };

  const logout = () => {
    logoutAction(dispatch);
  };
  const refreshUser = () => {
    refreshUserAction(dispatch);
  };

  const isAuthenticated = state.token !== null;

  return {
    user: state.user,
    isAuthenticated,
    login,
    register,
    logout,
    loading: state.userLoading,
    refreshUser,
  };
};

export const fetchUserFromAsyncStorage = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
};
