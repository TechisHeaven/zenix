import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {StyleSheet, useColorScheme} from 'react-native';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './src/screens/Home';
import DetailsScreen from './src/screens/Details';
import Login from './src/screens/Login';
import {useAuth} from './src/utils/auth.utils';
import SplashScreen from './src/screens/SplashScreen';
import {StateProvider} from './src/stores/context/context';
import UserAvatar from './src/components/Avatar/User.Avatar';
import SearchButton from './src/components/Buttons/SearchButton';
import Settings from './src/screens/Settings';
import Video from './src/screens/Video';
import {RootStackParamList} from './src/types/navigation.type';
import Password from './src/screens/Login/password';
import RegisterScreen from './src/screens/Register';

const Stack = createStackNavigator<RootStackParamList>();

function Root(): React.JSX.Element {
  const scheme = useColorScheme();
  const {user, refreshUser, loading, isAuthenticated} = useAuth();

  useEffect(() => {
    if (!user) {
      refreshUser(); // Fetch user data if not already in context
    }
  }, [user]);

  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack.Navigator>
        {loading ? (
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown: false}}
          />
        ) : isAuthenticated ? (
          <Stack.Group>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'For You',
                headerTitleAlign: 'center',
                headerLeftContainerStyle: {paddingHorizontal: 12},
                headerRightContainerStyle: {paddingHorizontal: 12},
                headerLeft: () => {
                  return <UserAvatar />;
                },
                headerRight: () => {
                  return <SearchButton />;
                },
              }}
            />
            <Stack.Screen name="Details" component={DetailsScreen} />
            <Stack.Screen name="Settings" component={Settings} />
            <Stack.Screen
              name="Video"
              options={{headerShown: false}}
              component={Video}
            />
          </Stack.Group>
        ) : (
          <Stack.Group>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{
                title: 'Login',
                headerShown: false,
                headerStyle: {backgroundColor: 'green'},
              }}
            />
            <Stack.Screen
              name="Password"
              options={{headerShown: false}}
              component={Password}
            />
            <Stack.Screen
              name="Register"
              options={{headerShown: false}}
              component={RegisterScreen}
            />
          </Stack.Group>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function App(): React.JSX.Element {
  return (
    <StateProvider>
      <Root />
    </StateProvider>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
