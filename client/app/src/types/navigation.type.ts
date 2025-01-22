export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Home: undefined;
  Details: undefined;
  Settings: undefined;
  Password: {email: string};
  Register: {email: string};
  Video: {video: {name: string; title: string; thumbnail: string}};
};
