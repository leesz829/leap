import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { GIF_IMG } from 'utils/imageUtils';

export const CommonLoading  = () => {
  
  return (
    <View style={_styles.loadingArea}>
      <View style={_styles.loadingDim} />
      {/* <Image source={GIF_IMG.loadingIcon} style={_styles.loadingIcon} /> */}
      <Image source={GIF_IMG.loadingNewIcon} style={_styles.loadingIcon} />
    </View>
  );
};




const _styles = StyleSheet.create({
  loadingArea : {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingDim : {
    backgroundColor: 'black',
    opacity: 0.1,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 1,
  },
  loadingIcon : {
    width: 50,
    height: 50,
    zIndex: 2,
  },
});