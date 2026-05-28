import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZES } from '../../constants';

export default function MechanicHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Mechanic Home</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  text: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
  },
});