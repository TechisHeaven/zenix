import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import React, {PropsWithChildren} from 'react';
import {SafeAreaView, Text} from 'react-native';
import {RootStackParamList} from '../../types/navigation.type';
import {useNavigation} from '@react-navigation/native';
import {useAuth} from '../../utils/auth.utils';
import {Button} from '@react-navigation/elements';
type SectionProps = PropsWithChildren<{
  title: string;
}>;
type HomeScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Home'
>;
export default function Settings() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {logout} = useAuth();
  const handleLogout = () => {
    logout();
  };
  return (
    <SafeAreaView>
      <Text>Settings Screen</Text>
      <Button onPress={() => navigation.navigate('Details')}>
        Go to Details Page
      </Button>
      <Button onPress={handleLogout}>Logout</Button>
    </SafeAreaView>
  );
}
