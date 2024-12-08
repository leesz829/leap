import { Color } from 'assets/styles/Color';
import type { FC } from 'react';
import * as React from 'react';
import { Dimensions, Image, StyleSheet, View, Text } from 'react-native';
import Tooltip from 'rn-tooltip';
import { ICON } from 'utils/imageUtils';
import { CommonText } from './CommonText';
import SpaceView from './SpaceView';
import { styles } from 'assets/styles/Styles';
import LinearGradient from 'react-native-linear-gradient';


const { width, height } = Dimensions.get('window');

interface Props {
  title: string;
  desc: string;
  position?: 'topRight' | 'topLeft' | 'bottomLeft' | 'bottomRight';
  arrowPosition?: 'left' | 'right';
  text: string;
}

/**
 *
 * @param {string} title 툴팁 타이틀
 * @param {string} desc 툴팁 설명
 * @param {string} position 툴팁 위치
 * @returns
 */
export const SpeechBubble: FC<Props> = (props) => {
  return (
    <>
      <LinearGradient
        colors={['#8BC1FF', '#416DFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0 }}
        style={_styles.bubble}
      >
        <Text style={styles.fontStyle('SB', 10, '#fff')}>{props.text}</Text>
        {/* <LinearGradient
          colors={['#8BC1FF', '#416DFF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={_styles.triangle}
        /> */}
        <SpaceView viewStyle={_styles.triangle(props.arrowPosition)} />
      </LinearGradient>
    </>
  );
};

const _styles = StyleSheet.create({
  bubble: {
    paddingVertical: 7,
    paddingHorizontal: 15,
    borderRadius: 50, // 말풍선의 둥근 모서리
    position: 'relative',
  },
  triangle: (position:any) => {
    return {
      position: 'absolute',
      bottom: -8, // 삼각형을 아래로 위치 조정
      right: position == 'right' ? 10 : undefined,
      left: position == 'left' ? 10 : undefined,
      width: 0,
      height: 0,
      borderLeftWidth: 9,
      borderRightWidth: 9,
      borderTopWidth: 9,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderTopColor: position == 'right' ? '#416DFF' : '#83B8FF', // 말풍선 배경색과 동일하게 설정
    };
  },
});
