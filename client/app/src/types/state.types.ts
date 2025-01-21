// types.ts
export interface State {
  user: {
    name: string | null;
    email: string | null;
    password: string | null;
  } | null;
  token: string | null;
  userLoading: boolean;
}
export type UserState = {
  name: string;
  email: string;
  password: string;
};

export type Action =
  | {type: 'LOGIN'; payload: {user: State['user']; token: string}}
  | {type: 'LOGOUT'}
  | {type: 'LOGIN_REQUEST'};
