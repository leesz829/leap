import { RouteProp, useNavigation } from '@react-navigation/native';
import React, { useRef, useState, useEffect } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { Color } from 'assets/styles/Color';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { Image, ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { ICON } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { CommonSwich } from 'component/CommonSwich';
import { Modalize } from 'react-native-modalize';
import Terms from 'screens/commonpopup/terms/Terms';
import Privacy from 'screens/commonpopup/terms/Privacy';
import LocationService from 'screens/commonpopup/terms/LocationService';
import ToggleSwitch from 'toggle-switch-react-native';
import { ROUTES } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';



/* ################################################################################################################
###### 서비스 정책 화면
################################################################################################################### */
interface Props {
  navigation: StackNavigationProp<StackParamList, 'Policy'>;
  route: RouteProp<StackParamList, 'Policy'>;
}

const { width, height } = Dimensions.get('window');

export const Policy = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup();  // 공통 팝업
  
  const [allAgree, setAllAgree] = useState<boolean>(false);
  const [termsAgree, setTermsAgree] = useState<boolean>(false); // 이용약관
  const [privacyAgree, setPrivacyAgree] = useState<boolean>(false); // 개인정보처리방침
  const [locationAgree, setLocationAgree] = useState<boolean>(false); // 위치기반서비스
  const [mrktAgree, setMrktAgree] = useState<boolean>(false); // 마케팅 수신동의
  

  /* const PLATFORM_FULLPAGE_AD_ID = Platform.select({
    ios: 'ca-app-pub-7259908680706846~2194056790',
    android: 'ca-app-pub-7259908680706846~5492241778',
  }) || '';
  const { adLoaded, adDismissed, show, load } = useInterstitialAd(PLATFORM_FULLPAGE_AD_ID); */

  // 전체 동의
  const allAgreeBtn = async (value: boolean) => {
    if(value && (termsAgree === false || privacyAgree === false || locationAgree === false || mrktAgree === false)) {
      setAllAgree(true);
      setTermsAgree(true);
      setPrivacyAgree(true);
      setLocationAgree(true);
      setMrktAgree(true);
    } else {
      setAllAgree(false);
      setTermsAgree(false);
      setPrivacyAgree(false);
      setLocationAgree(false);
      setMrktAgree(false);
    }
  };
  
  // 이용약관 팝업 Ref
  const terms_modalizeRef = useRef<Modalize>(null);

  // 이용약관 팝업 활성화
  const termsModalOpen = () => {
    terms_modalizeRef?.current?.open();
  };

  // 이용약관 팝업 콜백 함수
  const callbackTermsPopup = (isAgree:boolean) => {
    if(isAgree) {
      setTermsAgree(true);
    }
  };

  // 개인정보 취급방침 팝업
  const privacy_modalizeRef = useRef<Modalize>(null);

  // 개인정보 취급방침 팝업 활성화
  const privacyModalOpen = () => {
    privacy_modalizeRef?.current?.open();
  };
  
  // 개인정보 취급방침 팝업 콜백 함수
  const callbackPrivacyPopup = (isAgree:boolean) => {
    if(isAgree) {
      setPrivacyAgree(true);
    }
  };

  // 위치기반 서비스 이용약관 팝업
  const location_modalizeRef = useRef<Modalize>(null);

  // 위치기반 서비스 이용약관 팝업 활성화
  const locationModalOpen = () => {
    location_modalizeRef?.current?.open();
  };

  // 위치기반 서비스 이용약관 팝업 콜백 함수
  const callbackLocationPopup = (isAgree:boolean) => {
    if(isAgree) {
      setLocationAgree(true);
    }
  };

  // toggle 활성화
  const toggleActive = async (type:string, value: boolean) => {
    if(type == 'terms') {
      termsModalOpen();
    } else if(type == 'privacy') {
      privacyModalOpen();
    } else if(type == 'location') {
      locationModalOpen();
    } else if(type == 'marketing') {
      setMrktAgree(value);
    }
  };

  // 다음 버튼
  const nextBtn = async () => {
    if(!termsAgree) {
      show({ content: '이용약관에 동의해 주세요.' });
      return;
    }

    if(!privacyAgree) {
      show({ content: '개인정보처리방침에 동의해 주세요.' });
      return;
    }

    if(!locationAgree) {
      show({ content: '위치기반서비스 이용약관에 동의해 주세요.' });
      return;
    }

    /* navigation.navigate({
      name : ROUTES.SIGNUP_CHECK,
      params : {
        birthday: '19860429',
        ci: 'test46',
        name: '테스터',
        gender: 'M',
        marketing_agree_yn: 'Y',
        mobile: '01045759809',
      }
    });

    return; */

    navigation.navigate({
      name : 'NiceAuth',
      params : {
        type : 'JOIN',
        mrktAgreeYn: mrktAgree ? 'Y' : 'N',
      }
    });

  }

  /* useEffect(() => {
    const userVisitedToAd = adLoaded && adDismissed;
    if (userVisitedToAd) {
      // stage save
      navigation.push('Policy');
      
      // load new ad for next time
      load();
      show();
    }
    
  }, [adLoaded, adDismissed]); */

  return (
    <>
      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.policyContainer}
      >
        <ScrollView>
          <SpaceView pl={15} pr={15}>

            <SpaceView mb={20}>
              <CommonText textStyle={_styles.title}>
                리프(LEAP){'\n'}서비스 이용약관
              </CommonText>
            </SpaceView>

            <SpaceView mt={80} mb={24} viewStyle={[_styles.container]}>
              <SpaceView mb={10} viewStyle={layoutStyle.rowBetween}>
                <TouchableOpacity
                  style={_styles.allAgreeContainer}
                  onPress={(value: boolean) => { allAgreeBtn(value); }}
                >
                  <Image source={allAgree ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5, marginLeft: 'auto'}]} />
                  <CommonText textStyle={_styles.agreeText}>모두 동의</CommonText>
                </TouchableOpacity>
              </SpaceView>

              <View style={_styles.straight}></View>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={10} mt={20}>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() => {
                      if(termsAgree === false) {
                        setTermsAgree(true);
                      }else {
                        setTermsAgree(false);
                      }
                    }}
                  >
                    <Image source={termsAgree ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5}]} />
                    <Text style={_styles.policyTxt}>서비스 이용약관(필수)</Text>
                  </TouchableOpacity> 
                </View>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity onPress={(isOn) => toggleActive('terms', isOn)}>
                    <Text style={_styles.viewTxt}>보기</Text>
                  </TouchableOpacity>
                </View>
              </SpaceView>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={10}>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() => {
                      if(privacyAgree === false) {
                        setPrivacyAgree(true);
                      }else {
                        setPrivacyAgree(false);
                      }                 
                    }}
                  >
                    <Image source={privacyAgree ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5}]} />
                    <Text style={_styles.policyTxt}>개인정보처리방침(필수)</Text>
                  </TouchableOpacity>
                </View>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity onPress={(isOn) => toggleActive('privacy', isOn)}>
                    <Text style={_styles.viewTxt}>보기</Text>
                  </TouchableOpacity>
                </View>
              </SpaceView>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={10}>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity
                    style={{flexDirection: 'row'}}
                    onPress={() => {
                      if(locationAgree === false) {
                        setLocationAgree(true);
                      }else {
                        setLocationAgree(false);
                      }           
                    }}
                  >
                    <Image source={locationAgree ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5}]} />
                    <Text style={_styles.policyTxt}>위치기반서비스 이용약관(필수)</Text>
                  </TouchableOpacity>
                </View>

                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity onPress={(isOn) => toggleActive('location', isOn)}>
                    <Text style={_styles.viewTxt}>보기</Text>
                  </TouchableOpacity>

                  {/* <TouchableOpacity onPress={location_onOpen}>
                    <CommonText type={'h6'} textStyle={commonStyle.fontSize13}>보기</CommonText>
                  </TouchableOpacity> */}
                </View>
              </SpaceView>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={16}>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity
                      style={{flexDirection: 'row'}}
                      onPress={() => {
                        if(mrktAgree === false) {
                          setMrktAgree(true);
                        }else {
                          setMrktAgree(false);
                        }       
                      }}
                    >
                    <Image source={mrktAgree ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5}]} />
                    <Text style={_styles.policyTxt}>마케팅 수신동의(선택)</Text>
                  </TouchableOpacity>
                </View>
                <View style={[layoutStyle.rowBetween]}>
                  {/* <ToggleSwitch
                    isOn={mrktAgree}
                    onColor={Color.primary}
                    offColor={Color.grayDDDD}
                    size="small"
                    onToggle={(isOn) => toggleActive('marketing', isOn)}
                    trackOffStyle={{width: 45 ,height: 25}}
                  /> */}

                {/*  <CommonSwich
                    callbackFn={(value: boolean) => {
                      allAgreeBtn('MRKT', value);
                    }}
                    isOn={mrktAgree} /> */}
                </View>
              </SpaceView>
              <SpaceView mt={190}>
                <CommonBtn
                  value={'회원가입 계속'}
                  type={'reNewId'}
                  fontSize={16}
                  fontFamily={'Pretendard-Bold'}
                  borderRadius={5}
                  onPress={() => {
                    nextBtn();
                  }}
                />
              </SpaceView>

              <SpaceView mt={20}>
                <CommonBtn
                  value={'처음으로'}
                  type={'reNewGoBack'}
                  isGradient={false}
                  fontFamily={'Pretendard-Light'}
                  fontSize={14}
                  borderRadius={5}
                  onPress={() => {
                    navigation.navigate(ROUTES.LOGIN);
                  }}
                />
              </SpaceView>
            </SpaceView>
          </SpaceView>
        </ScrollView>
      </LinearGradient>


      {/* ###############################################
                    이용약관 팝업
      ############################################### */}
      <Terms modalRef={terms_modalizeRef} callBackFunc={callbackTermsPopup} />

      {/* ###############################################
                     개인정보 취급방침 팝업
         ############################################### */}
      <Privacy modalRef={privacy_modalizeRef} callBackFunc={callbackPrivacyPopup} />

      {/* ###############################################
                     위치기반 서비스 이용약관 팝업
         ############################################### */}
      <LocationService modalRef={location_modalizeRef} callBackFunc={callbackLocationPopup} />

    </>
  );
};



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}
const _styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  policyContainer: {
    minHeight: height,
    paddingTop: 50,
    paddingLeft: 16,
    paddingRight: 16,
    flexGrow: 1,
  },
  title: {
    fontFamily: 'Pretendard-Bold',
    color: '#D5CD9E',
    fontSize: 30,
    lineHeight: 35,
    marginBottom: 15
  },
  allAgreeContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  subTitle: {
    fontSize: 14,
    color: 'gray',
    lineHeight: 20
  },
  agreeText: {
    fontFamily: 'Pretendard-Regular',
    color: '#D5CD9E',
    fontSize: 14,
  },
  policyTxt: {
    fontFamily: 'Pretendard-Light',
    fontSize: 14,
    color: '#D5CD9E',
  },
  viewTxt: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#E1DFD1',
  },
  straight: {
    borderColor: '#E1DFD1',
    borderBottomWidth: 1,
    width: '100%',
  }
});