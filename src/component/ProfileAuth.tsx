import * as React from 'react';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { Dimensions, Image, StyleSheet, Text, View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { SimpleGrid } from 'react-native-super-grid';
import { ICON } from 'utils/imageUtils';
import { CommonBtn } from './CommonBtn';
import { CommonText } from 'component/CommonText';
import SpaceView from './SpaceView';
import { STACK } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import Carousel from 'react-native-snap-carousel';
import { commonStyle } from 'assets/styles/Styles';
import { isEmptyData } from 'utils/functions';
import AuthLevel from 'component/common/AuthLevel';
import { Slider } from '@miblanchard/react-native-slider';
import { useUserInfo } from 'hooks/useUserInfo';


const { width } = Dimensions.get('window');

export default function ProfileAuth({ level, data, isButton, callbackAuthCommentFn }) {
  const navigation = useNavigation<ScreenNavigationProp>();

  const memberBase = useUserInfo();

  const authRef = React.useRef();
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 프로필 인증 변경 버튼 클릭 함수
  const onPressSecondAuth = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'SecondAuth', });
  };

  const onPressAuthDot = (index) => {
    authRef?.current?.snapToItem(index);
  };

  return (
    <>
      {memberBase?.member_seq != 905 && data.length > 0 ? (
        <>
          <View style={_styles.profileTitleContainer}>
            <SpaceView viewStyle={{flexDirection: `row`, alignItems: `center`, justifyContent: `center`,}}>
              <Text style={_styles.title}>프로필 인증</Text>
              <View style={[_styles.levelBadge, {marginRight: 0, marginTop: 1}]}>
                <AuthLevel authAcctCnt={level} type={'BASE'} />
              </View>
            </SpaceView>
            
            {typeof isButton != 'undefined' && isButton && 
              <SpaceView viewStyle={{flexDirection: `row`, alignItems: `center`, justifyContent: `center`,}}>
                <TouchableOpacity 
                  onPress={() => { navigation.navigate(STACK.COMMON, { screen: 'SecondAuth' }); }} 
                  style={{marginTop: 3, borderWidth:1, borderColor: '#7986EE', backgroundColor: '#ffffff', borderRadius: 5, paddingHorizontal: 5}}
                  hitSlop={commonStyle.hipSlop25}>
                  
                  <CommonText type={'h7'} color={'#7986EE'} fontWeight={'200'}>프로필 인증 변경</CommonText>
                </TouchableOpacity>
              </SpaceView>
            }
          </View>
          
          {/* <SimpleGrid
            style={{ marginTop: 10}}
            // staticDimension={width}
            staticDimension={width + 20}
            itemContainerStyle={{
              width: '32%',
            }}
            spacing={width * 0.01}
            data={
              data?.length > 0 ? data : dummy
            }
            renderItem={renderAuthInfo}
          /> */}

          <SpaceView mt={8}>
            <SpaceView mt={8} mb={5} viewStyle={{flexDirection: 'row'}}>
                {data?.map((item, index) => (
                  <TouchableOpacity 
                    key={index}
                    onPress={() => { onPressAuthDot(index); }}
                    hitSlop={commonStyle.hipSlop15}>

                    <SpaceView key={index} viewStyle={_styles.authIndicatorItem(index == currentIndex ? true : false)}>
                      {item.common_code == 'JOB' && <Image source={ICON.jobNew} style={{width: 25, height: 17}} />}
                      {item.common_code == 'EDU' && <Image source={ICON.degreeNew} style={{width: 25, height: 17}} />}
                      {item.common_code == 'INCOME' && <Image source={ICON.incomeNew} style={{width: 25, height: 17}} />}
                      {item.common_code == 'ASSET' && <Image source={ICON.assetNew} style={{width: 25, height: 17}} />}
                      {item.common_code == 'SNS' && <Image source={ICON.snsNew} style={{width: 25, height: 17}} />}
                      {item.common_code == 'VEHICLE' && <Image source={ICON.vehicleNew} style={{width: 25, height: 17}} />}

                      <Text style={_styles.authIndicatorText}>{item.code_name}</Text>
                    </SpaceView>
                  </TouchableOpacity>
                ))}
            </SpaceView>

            <Carousel
              ref={authRef}
              data={data}
              //layout={'default'}
              onSnapToItem={setCurrentIndex}
              sliderWidth={Math.round(width)} 
              itemWidth={Math.round(width-40)}
              horizontal={true}
              useScrollView={true}
              inactiveSlideScale={1}
              inactiveSlideOpacity={1}
              inactiveSlideShift={1}
              firstItem={data.length}
              loop={false}
              autoplay={false}
              style={_styles.authWrapper}
              containerCustomStyle={{ marginLeft: -22 }}
              //pagingEnabled
              renderItem={({ item, index }) => {
                return (
                  <RenderAuthInfoNew
                    key={`RednerAuth-${index}`}
                    item={item}
                    isButton={isButton}
                    onPressSecondAuthFunc={onPressSecondAuth}
                    onPressSecondCommentFunc={callbackAuthCommentFn}
                  />
                )
              }}
            />
          </SpaceView>
        </>
      ) : (
        <>
        
        </>
      )}
    </>
  );
}

const renderAuthInfo = ({ item }: { item: auth }) => (

  <View
    style={
      item?.auth_status === 'ACCEPT'
        ? _styles.certificateItemContainerOn
        : _styles.certificateItemContainerOff
    }>

    <View style={_styles.rowCenter}>
      <Image
        source={convertTypeToImage(item)}
        style={_styles.certificateItemImage}
      />
      <Text
        style={
          item?.auth_status === 'ACCEPT'
            ? _styles.certificateItemTextOn
            : _styles.certificateItemTextOff
        }
      >
        {item.code_name}
      </Text>
    </View>

    {item?.auth_status === 'ACCEPT' && (
      <Text style={_styles.levelText}>
        LV.
        <Text style={{ fontSize: 15, color: '#000000' }}>{item.auth_level}</Text>
      </Text>
    )}
  </View>
);

/* #################################################### 인증 정보 렌더링 */
function RenderAuthInfoNew({ item, isButton, onPressSecondAuthFunc, onPressSecondCommentFunc }) {
  const code = item?.common_code;
  let imgSrc = ICON.jobNew;
  let textDesc = '"비교불가의 전문성을 갖춘 리더이자 역경을 이겨낸 승리자"';
  let maxLevel = 7;

  if(code == 'JOB') {
    imgSrc = ICON.jobNew;
  } else if(code == 'EDU') {
    imgSrc = ICON.degreeNew;
  } else if(code == 'INCOME') {
    imgSrc = ICON.incomeNew;
  } else if(code == 'ASSET') {
    imgSrc = ICON.assetNew;
  } else if(code == 'SNS') { 
    imgSrc = ICON.snsNew;
  } else if(code == 'VEHICLE') {
    imgSrc = ICON.vehicleNew;
  }

  if(code == 'VEHICLE') {
    maxLevel = 5;
  }

  return (
    <View style={_styles.authShadowArea}>
      <LinearGradient
        colors={['#FFFFFF', '#ABFFFB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={_styles.authArea(Platform.OS)}>

        {/* {typeof isButton != 'undefined' && isButton && 
          <SpaceView viewStyle={{position: 'absolute', top: 8, right: 10, alignItems: `center`, justifyContent: `center`,}}>
            <TouchableOpacity 
              onPress={() => { onPressSecondAuthFunc(); }} 
              style={{marginTop: 1, borderWidth:1, borderColor: '#7986EE', backgroundColor: '#ffffff', borderRadius: 5, paddingHorizontal: 5}}
              hitSlop={commonStyle.hipSlop20}>
              
              <CommonText type={'h7'} color={'#7986EE'} fontWeight={'200'}>프로필 인증 변경</CommonText>
            </TouchableOpacity>
          </SpaceView>
        } */}

        <SpaceView mb={5}>
          <Image source={imgSrc} style={_styles.authIcon} resizeMode={'contain'} />
        </SpaceView>

        {/* 레벨 게이지 표시 영역 */}
        {isEmptyData(item?.auth_level) && item?.auth_level > 0 && (
          <SpaceView mt={8} viewStyle={{width: '100%'}}>
            <SpaceView mt={13} viewStyle={{zIndex: 1, alignItems: 'flex-start', marginHorizontal: 70}}>
              <View style={[_styles.scoreContainer, { left: item?.auth_level == 0 ? 0 : (item?.auth_level/maxLevel) * 100 - 7 + '%' }]}>
                <Text style={_styles.scoreText}>Lv.{item?.auth_level}</Text>
                <View style={_styles.triangle}></View>
              </View>

              <LinearGradient
                colors={['#ABEFE6', '#20E1E8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={_styles.gradient(item?.auth_level/maxLevel)}>
              </LinearGradient>
              
              <Slider
                animateTransitions={true}
                renderThumbComponent={() => null}
                containerStyle={_styles.sliderContainerStyle}
                trackStyle={_styles.sliderThumbStyle}
                trackClickable={false}
                disabled
              />

              <View style={_styles.gageContainer}>
                <Text style={_styles.gageText}>Lv.1</Text>
                <Text style={_styles.gageText}>Lv.{maxLevel}</Text>
              </View>
            </SpaceView>
          </SpaceView>
        )}

        <SpaceView viewStyle={{minHeight: 35, justifyContent: 'center'}}>
          <Text style={_styles.authText}>{item?.slogan_name != null ? '"' + item?.slogan_name + '"' : '"프로필 인증 변경 심사 후 인증 레벨을 부여 받을 수 있어요."'}</Text>
        </SpaceView>

        <SpaceView viewStyle={{justifyContent: 'flex-start'}}>
          {typeof onPressSecondCommentFunc != 'undefined' && onPressSecondAuthFunc != null ? (
            <>
              <TouchableOpacity onPress={() => { onPressSecondCommentFunc(item?.member_auth_seq, code, item?.code_name, item?.auth_comment); }}>
                <SpaceView mt={10} viewStyle={_styles.authIntroArea}>
                  {isEmptyData(item?.auth_comment) ? (
                    <Text style={_styles.authIntroText}>{item?.auth_comment}</Text>
                  ) : (
                    <Text style={_styles.authIntroTextInput}>터치하여 내 인증 코멘트 작성하기</Text>
                  )}
                </SpaceView>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {isEmptyData(item?.auth_comment) ? (
                <SpaceView mt={10} viewStyle={_styles.authIntroArea}>
                  <Text style={_styles.authIntroText}>{item?.auth_comment}</Text>
                </SpaceView>
              ) : (
                <SpaceView mt={10} viewStyle={_styles.authIntroArea}>
                  <Text style={_styles.authIntroText}>작성한 인증 코멘트가 없습니다.</Text>
                </SpaceView>
              )}
            </>
          )}
        </SpaceView>
      </LinearGradient>
    </View>
  );
};



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  profileTitleContainer: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 19,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // lineHeight: 26,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#333333',
    // marginTop: 20,
  },
  levelBadge: {
    width: 51,
    height: 21,
    borderRadius: 5,
    //backgroundColor: '#7986ee',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    marginLeft: 8,
  },
  levelBadgeImg: {
    marginLeft: -5,
    marginRight: -2,
    marginTop: 1
  },
  levelBadgeImg02: {
    marginLeft: -9,
    marginRight: -4,
    marginTop: -3
  },
  levelText: {
    // opacity: 0.83,
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    // letterSpacing: 0,
    textAlign: 'left',
    color: '#000000',
  },
  whiteText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 10,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },

  certificateItemContainerOn: {
    width: '100%',
    height: 39,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#7986ee',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  certificateItemContainerOff: {
    width: '100%',
    height: 39,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#b7b7b9',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  certificateItemImage: {
    width: 15.6,
    height: 13.9,
  },
  certificateItemTextOn: {
    marginLeft: 5,
    fontFamily: 'AppleSDGothicNeoR00',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#7986ee',
  },
  certificateItemTextOff: {
    marginLeft: 5,
    fontFamily: 'AppleSDGothicNeoR00',
    fontSize: 15,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 22,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#b1b1b1',
  },
  rowCenter: {
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  authWrapper: {
    width: '100%',
    marginTop: 15,
  },
  authShadowArea: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.23,
    shadowRadius: 3,
    elevation: 5,
    overflow: 'visible',
  },
  authArea: (device:any) => {
    if(device == 'ios') {
      return {
        width: width - 55,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 15,
        marginLeft: 4,
        marginVertical: 10,
      };
    } else {
      return {
        width: width - 55,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        paddingVertical: 15,
        marginLeft: 4,
        marginVertical: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.23,
        shadowRadius: 3,
        elevation: 5,
        overflow: 'visible',
      };
    }    
  },
  authIcon: {
    width: 95,
    height: 71,
  },
  authTit: {
    fontFamily: 'AppleSDGothicNeoH00',
    fontSize: 10,
    backgroundColor: '#7986EE',
    color: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  authText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 11,
    color: '#7986EE',
    paddingHorizontal: 35,
  },
  authIntroArea: {
    width: width - 80,
    backgroundColor: '#fff',
    borderRadius: 17,
    paddingVertical: 3,
    paddingHorizontal: 5,
    minHeight: 70,
    justifyContent: 'center',
  },
  authIntroText: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 11,
    color: '#B1B3C7',
    textAlign: 'center',
    paddingHorizontal: 35,
  },
  authIntroTextInput: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 11,
    color: '#A3A3A3',
    textAlign: 'center',
    paddingHorizontal: 35,
    paddingVertical: 8,
  },
  authIndicatorItem: (isOn: boolean) => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isOn ? '#7986EE' : '#B1B3C7',
      width: 52,
      borderRadius: 50,
      marginRight: 3,
    };
  },
  authIndicatorText: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 10,
    color: '#FFFFFF',
    marginRight: 7,
  },
  sliderContainerStyle: {
    width: '100%',
    height: 11,
    borderRadius: 50,
    backgroundColor: ColorType.primary,
  },
  sliderThumbStyle: {
    height: 11,
    borderRadius: 50,
    backgroundColor: 'white',
  },
  gageContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 3,
  },
  gageText: {
    fontFamily: 'AppleSDGothicNeoM00',
    fontSize: 10,
    color: '#8A8DA4',
  },
  gradient: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 11,
      zIndex: 1,
      borderRadius: 13,
    };
  },
  scoreContainer: {
    position: 'absolute',
    transform: [{ translateY: -19 }], // 수직 중앙 정렬을 위한 translateY
    alignItems: 'center',
  },
  scoreText: {
    backgroundColor: '#151515',
    color: ColorType.white,
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 10,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    borderBottomColor: '#151515',
    overflow: 'hidden',
  },
  triangle: {
    marginTop: -1,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#151515',
    transform: [{ rotate: '180deg' }],
  },
});

const dummy = [
  {
    member_auth_seq: 26,
    auth_level: 1,
    auth_status: 'ACCEPT',
    code_name: '직업',
    member_seq: 9,
    common_code: 'JOB',
  },
  {
    member_auth_seq: 25,
    auth_level: 1,
    auth_status: 'ACCEPT',
    code_name: '학업',
    member_seq: 9,
    common_code: 'EDU',
  },
  { code_name: '소득', common_code: 'INCOME' },
  {
    member_auth_seq: 27,
    auth_level: 1,
    auth_status: 'ACCEPT',
    code_name: '자산',
    member_seq: 9,
    common_code: 'ASSET',
  },
  { code_name: 'SNS', common_code: 'SNS' },
  { code_name: '차량', common_code: 'VEHICLE' },
];

function convertTypeToImage(auth: auth) {
  switch (auth.common_code) {
    case 'JOB':
      if (auth.auth_status === 'ACCEPT') return ICON.jobNew;
      else return ICON.jobNew;

    case 'EDU':
      if (auth.auth_status === 'ACCEPT') return ICON.degreeNew;
      else return ICON.degreeNew;

    case 'INCOME':
      if (auth.auth_status === 'ACCEPT') return ICON.incomeNew;
      else return ICON.incomeNew;
      
    case 'ASSET':
      if (auth.auth_status === 'ACCEPT') return ICON.assetNew;
      else return ICON.assetNew;

    case 'SNS':
      if (auth.auth_status === 'ACCEPT') return ICON.snsNew;
      else return ICON.snsNew;

    case 'VEHICLE':
      if (auth.auth_status === 'ACCEPT') return ICON.vehicleNew;
      else return ICON.vehicleNew;
    default:
      break;
  }
}
