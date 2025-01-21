import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export default function SearchButton() {
  return (
    <TouchableOpacity style={styles.button}>
      <Icon name="search" size={18} color="#f2f2f2" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
});
