import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import { Slider } from '@miblanchard/react-native-slider';
import { useNavigation, useRoute, useIsFocused, useFocusEffect } from '@react-navigation/native';
import { ColorType, ScreenNavigationProp } from '@types';
import { Color } from 'assets/styles/Color';
import { ROUTES, STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { CommaFormat } from 'utils/functions';
import { get_cashback_pay_info, get_order_list } from 'api/models';
import SpaceView from 'component/SpaceView';
import { commonStyle, layoutStyle, styles } from 'assets/styles/Styles';
import LinearGradient from 'react-native-linear-gradient';


export default function RespectCard({ payInfo }) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const route = useRoute();
  const me = useUserInfo();

  if (!me) return null;
  return (
    <>
      {me?.respect_grade == 'VIP' || me?.respect_grade == 'VVIP' ?
        <SpaceView viewStyle={_styles.floatWrapper(route.name)}>
          <LinearGradient
            colors={['#7AAEDB', '#608B55']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{borderRadius: 10, paddingVertical: 10}}>

            <LinearGradient
              colors={['#C9F0FF', me?.respect_grade == 'DIAMOND' ? '#FCF9E4' : '#C9F0FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={_styles.respectLine}>
                <Image source={ICON.sparkler} style={styles.iconSquareSize(15)} />
                <Text style={_styles.repectGrade}>{me?.respect_grade}</Text>
            </LinearGradient>

            <SpaceView mt={20} pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween]}>
              <SpaceView mt={25} ml={15}>
                <Image source={ICON.icChip} style={styles.iconSquareSize(40)} />
              </SpaceView>

              <SpaceView ml={20}>
                <Text style={_styles.respectTitle}>닉네임</Text>
                <Text style={_styles.respectNickname}>{me?.nickname}</Text>
              </SpaceView>

              <SpaceView>
                <Text style={_styles.respectTitle}>보유RP</Text>
                <Text style={_styles.rpAmtText}>
                  {CommaFormat(me?.mileage_point)}
                  <Text style={_styles.rpText}>RP</Text>
                </Text>
                <Text style={_styles.rpAvailable}>이달 사용 가능한 RP</Text>

                {/* ################################################################################ 이달 사용 RP 영역 */}
                <SpaceView mt={5}>
                  <SpaceView>
                    <SpaceView viewStyle={{overflow: 'hidden', borderRadius: 50}}>
                      <LinearGradient
                        colors={['#32F9E4', '#32F9E4']}
                        start={{ x: 1, y: 0 }}
                        end={{ x: 0, y: 0 }}
                        style={_styles.gradient(me?.mileage_point / me?.respect_grade == 'VIP' ? 10000 : 20000)}>
                      </LinearGradient>
                      <Slider
                        animateTransitions={true}
                        renderThumbComponent={() => null}
                        containerStyle={_styles.sliderContainerStyle}
                        trackStyle={_styles.sliderThumbStyle}
                        trackClickable={false}
                        disabled
                      />
                    </SpaceView>
                    <Text style={_styles.gradeTitle}>5,500RP 남음</Text>
                  </SpaceView>
                </SpaceView>

              </SpaceView>
            </SpaceView>

            <SpaceView pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.alignEnd, layoutStyle.justifyBetween]}>
              <Image source={IMAGE.logoLeapTit} style={{width: 60, height: 25}} />
              <Text style={_styles.rpDescText}>RP는 획득 건 별로 60일 동안 보관됩니다.</Text>
            </SpaceView>
          </LinearGradient>
        </SpaceView>
      :
        <SpaceView mt={-40} viewStyle={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyCenter]}>
          <Text>문구 들어갈 자리</Text>
        </SpaceView>
      }
    </>
  )
}

{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  floatWrapper: (type:string) => {
    return {
      width: `100%`,
      marginTop: type == 'Cashshop' ? -105 : -70,
    };
  },
  rpStoreBtn: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  respectLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 35,
    marginTop: 15,
  },
  repectGrade: {
    fontFamily: 'MinSans-Bold',
    color: '#000000',
    marginRight: 10,
    marginLeft: 2,
  },
  respectTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    color: '#333B41',
  },
  respectNickname: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  rpAvailable: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    color: '#333B41',
    marginTop: 15,
  },
  rpText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
    color: '#32F9E4',
  },
  rpAmtText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 32,
    color: '#32F9E4',
  },
  gradeTitle: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#32F9E4',
    textAlign: 'right',
  },
  gradient: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 12,
      zIndex: 1,
      borderRadius: 20,
    };
  },
  sliderContainerStyle: {
    height: 12,
    borderRadius: 50,
    backgroundColor: '#FFF',
  },
  sliderThumbStyle: {
    height: 12,
    borderRadius: 50,
    backgroundColor: '#FFF',
  },
  rpDescText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#D5CD9E',
  },
});
