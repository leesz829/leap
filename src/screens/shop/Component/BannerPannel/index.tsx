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
import { get_cashback_pay_info } from 'api/models';
import SpaceView from 'component/SpaceView';
import { commonStyle, layoutStyle, styles } from 'assets/styles/Styles';
import LinearGradient from 'react-native-linear-gradient';


export default function BannerPannel({ payInfo }) {
  const me = useUserInfo();

  if (!me) return null;
  // return me?.gender !== 'M' ? <FemalePannel /> : <MalePannel payInfo={payInfo} />;
  return me?.gender !== 'M' && <FemalePannel />;
}

// ############################################################################################### 여성회원 Pannel
function FemalePannel() {
  const navigation = useNavigation<ScreenNavigationProp>();
  const route = useRoute();
  const me = useUserInfo();

  const onPressLimitShop = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_Shop });
  };
  const onPressMileageHistory = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_History });
  };
  const onPressLimitInfo = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Limit_Info });
  };
  const onPressMileageOrder = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_Order });
  };

  return (
    <>
    {me?.respect_grade == 'PLATINUM' || me?.respect_grade == 'DIAMOND' ?
      <SpaceView viewStyle={female.floatWrapper(route.name)}>
        <LinearGradient
          colors={['#7AAEDB', '#608B55']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{borderRadius: 10, paddingVertical: 10}}>

          <LinearGradient
            colors={['#C9F0FF', me?.respect_grade == 'DIAMOND' ? '#FCF9E4' : '#C9F0FF']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={female.respectLine}>
              <Image source={ICON.sparkler} style={styles.iconSquareSize(15)} />
              <Text style={female.repectGrade}>{me?.respect_grade}</Text>
          </LinearGradient>

          <SpaceView mt={20} pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween]}>
            <SpaceView mt={25} ml={15}>
              <Image source={ICON.icChip} style={styles.iconSquareSize(40)} />
            </SpaceView>

            <SpaceView ml={20}>
              <Text style={female.respectTitle}>닉네임</Text>
              <Text style={female.respectNickname}>{me?.nickname}</Text>
            </SpaceView>

            <SpaceView>
              <Text style={female.respectTitle}>보유RP</Text>
              <Text style={female.rpAmtText}>
                {CommaFormat(me?.mileage_point)}
                <Text style={female.rpText}>RP</Text>
              </Text>
              <Text style={female.rpAvailable}>이달 사용 가능한 RP</Text>

              {/* ################################################################################ 이달 사용 RP 영역 */}
              <SpaceView mt={5}>
                <SpaceView>
                  <SpaceView viewStyle={{overflow: 'hidden', borderRadius: 50}}>
                    <LinearGradient
                      colors={['#32F9E4', '#32F9E4']}
                      start={{ x: 1, y: 0 }}
                      end={{ x: 0, y: 0 }}
                      style={female.gradient(me?.mileage_point / 10000)}>
                    </LinearGradient>
                    <Slider
                      animateTransitions={true}
                      renderThumbComponent={() => null}
                      containerStyle={female.sliderContainerStyle}
                      trackStyle={female.sliderThumbStyle}
                      trackClickable={false}
                      disabled
                    />
                  </SpaceView>
                  <Text style={female.gradeTitle}>5,500RP 남음</Text>
                </SpaceView>
              </SpaceView>

            </SpaceView>
          </SpaceView>

          <SpaceView pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.alignEnd, layoutStyle.justifyBetween]}>
            <Image source={IMAGE.logoLeapTit} style={{width: 60, height: 25}} />
            <Text style={female.rpDescText}>RP는 획득 건 별로 60일 동안 보관됩니다.</Text>
          </SpaceView>
        </LinearGradient>
      </SpaceView>
    :
      <SpaceView mt={-40} viewStyle={[layoutStyle.row, layoutStyle.alignCenter, layoutStyle.justifyCenter]}>
        <Text>문구 들어갈 자리</Text>
      </SpaceView>
    }
      
    </>
  );
}

// ############################################################################################### 남성회원 Pannel
const PAY_INFO = {
  member_buy_price: 0
  , target_buy_price: 10
  , price_persent: 0
  , tmplt_name: ''
  , tmplt_level: 1
};

function MalePannel({ payInfo }) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();

  const onPressPointReward = () => {
    navigation.navigate(STACK.COMMON, { 
      screen: 'PointReward'
      , params: { 
          member_buy_price: payInfo.member_buy_price 
          , target_buy_price: payInfo.target_buy_price 
          , price_persent: payInfo.price_persent 
          , tmplt_name: payInfo.tmplt_name
          , tmplt_level: payInfo.tmplt_level
      }
    });
  };

  return (
    <View style={male.floatWrapper}>
      <View style={male.floatContainer}>
        <View>
          <TouchableOpacity onPress={onPressPointReward} hitSlop={commonStyle.hipSlop10}>
            <Text style={male.infoText}>매월 1일 시작되는 <Text style={male.cashbackText}>캐시백</Text> 생활</Text>
            <View style={male.pointIntroArea}>
              <Text style={male.pointText}>리프 포인트</Text>
              <View style={male.rewardBtn}><Text style={male.rewardAddText}>알아보기</Text></View>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onPressPointReward} hitSlop={commonStyle.hipSlop10}>

          <LinearGradient
            colors={['#7986EE', '#8854D2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={_styles.gradient(payInfo?.price_persent)}>
          </LinearGradient>

          <Slider
            //value={payInfo?.price_persent}
            animateTransitions={true}
            renderThumbComponent={() => null}
            maximumTrackTintColor={'transparent'}
            minimumTrackTintColor={'transparent'}
            containerStyle={male.sliderContainer}
            trackStyle={male.sliderTrack}
            trackClickable={false}
            disabled
          />
          <View style={{position: 'absolute', bottom: -15, right: 0}}>
            <Text style={male.infoText02}>
              캐시백 보상까지 {CommaFormat(payInfo?.member_buy_price)} / {CommaFormat(payInfo?.target_buy_price)}
            </Text>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={onPressPointReward} style={male.TooltipButton} hitSlop={commonStyle.hipSlop10}>
          <Image source={ICON.currencyTooltip} style={male.imageTooltip} />
        </TouchableOpacity>

        <View style={male.gradeArea}>
          <Text style={male.gradeText}><Text style={male.gradeEtc}>RANK</Text>{payInfo?.tmplt_name}</Text>
        </View>

      </View>
    </View>
  );
}





{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
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
});

const male = StyleSheet.create({
  floatWrapper: {
    width: `100%`,
    marginTop: -60,
  },
  floatContainer: {
    position: 'relative',
    padding: 25,
    backgroundColor: 'white',
    width: '100%',
    height: 120,
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    justifyContent: 'space-around',
  },
  pointIntroArea: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  pointText: {
    fontSize: 19,
    fontFamily: 'AppleSDGothicNeoEB00',
    color:'#333333'
  },
  rewardBtn: {
    marginLeft: 5,
    borderWidth: 1,
    borderColor: '#7986EE',
    borderRadius: 5,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  rewardAddText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 10,
    color: '#7986EE',
  },
  infoText: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'AppleSDGothicNeoM00',
    color: '#B1B1B1',
  },
  infoText02: {
    fontSize: 10,
    fontFamily: 'AppleSDGothicNeoM00',
    color: '#B1B1B1',
    textAlign: 'right',
  },
  cashbackText: {
    marginTop: 14,
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'AppleSDGothicNeoM00',
    color: Color.primary,
  },
  sliderContainer: {
    width: '100%',
    marginTop: 8,
    height: 4,
    borderRadius: 13,
    backgroundColor: '#E1E4FB',
  },
  sliderTrack: {
    height: 23,
    borderRadius: 13,
    backgroundColor: 'transparent',
    position: 'absolute',
  },
  TooltipButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  imageTooltip: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  gradeArea: {
    position: 'absolute',
    bottom: 18,
    right: 25,
  },
  gradeEtc: {
    fontSize: 9,
    fontFamily: 'AppleSDGothicNeoB00',
    opacity: 0.13,
    color: '#000',
  },
  gradeText: {
    fontSize: 72,
    fontFamily: 'AppleSDGothicNeoEB00',
    color: '#8657D4',
    fontWeight: 'bold',
    opacity: 0.13,
    textAlign: 'right',
    letterSpacing: 0,
  },
});

const female = StyleSheet.create({
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
