import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native';
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { useUserInfo } from 'hooks/useUserInfo';
import SpaceView from 'component/SpaceView';
import { styles, layoutStyle } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import { CommaFormat } from 'utils/functions';
import { Slider } from '@miblanchard/react-native-slider';



/* ######################################################################
#########################################################################
#### 상점 마일리지 정보 Component
#########################################################################
###################################################################### */
export default function MileageInfo({ data }) {
  
  return (
    <>
      {data?.respect_grade == 'PLATINUM' || data?.respect_grade == 'DIAMOND' &&
        <SpaceView viewStyle={_styles.floatWrapper}>
          <LinearGradient
            colors={['#7AAEDB', '#608B55']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{borderRadius: 10, paddingVertical: 10}}>

            <LinearGradient
              colors={['#C9F0FF', data?.respect_grade == 'DIAMOND' ? '#FCF9E4' : '#C9F0FF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={_styles.respectLine}>
                <Image source={ICON.sparkler} style={{width: 15, height: 15}} />
                <Text style={_styles.repectGrade}>{data?.respect_grade}</Text>
            </LinearGradient>

            <SpaceView mt={20} pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween]}>
              <SpaceView mt={25} ml={15}>
                <Image source={ICON.icChip} style={{width: 40, height: 40}} />
              </SpaceView>

              <SpaceView ml={20}>
                <Text style={_styles.respectTitle}>닉네임</Text>
                <Text style={_styles.respectNickname}>{data?.nickname}</Text>
              </SpaceView>

              <SpaceView>
                <Text style={_styles.respectTitle}>보유RP</Text>
                <Text style={_styles.rpAmtText}>
                  {CommaFormat(data?.mileage_point)}
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
                        style={_styles.gradient(data?.mileage_point / 10000)}>
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
      }
    </>
  );

}



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  floatWrapper: {
      width: '100%',
      marginTop:10,
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