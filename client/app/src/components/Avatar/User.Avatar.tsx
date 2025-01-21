import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {RootStackParamList} from '../../types/navigation.type';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

type SettingsScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Settings'
>;
export default function UserAvatar() {
  const navigate = useNavigation<SettingsScreenNavigationProp>();
  const handlePress = () => {
    navigate.navigate('Settings');
  };
  return (
    <TouchableOpacity onPress={handlePress} style={style.container}>
      <Text>S</Text>
    </TouchableOpacity>
  );
}

const style = StyleSheet.create({
  container: {
    borderRadius: 48,
    elevation: 2,
    backgroundColor: 'red',
    height: 32,
    width: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
