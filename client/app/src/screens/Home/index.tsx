import React from 'react';
import {Text} from '@react-navigation/elements';
import {View} from 'react-native';
import VideosList from '../../components/VideosContainer/VideosList';

export default function HomeScreen() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text>Home Screen</Text>
      <VideosList />
    </View>
  );
}
