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
      if(termsAgree) {
        setTermsAgree(false);
      } else {
        termsModalOpen();
      }
    } else if(type == 'privacy') {
      if(privacyAgree) {
        setPrivacyAgree(false);
      } else {
        privacyModalOpen();
      }
    } else if(type == 'location') {
      if(locationAgree) {
        setLocationAgree(false);
      } else {
        locationModalOpen();
      }
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

    navigation.navigate({
      name : ROUTES.SIGNUP_CHECK,
      params : {
        birthday: '19860429',
        ci: 'test50',
        name: '테스터',
        gender: 'M',
        marketing_agree_yn: 'Y',
        mobile: '01045759809',
      }
    });

    return;

    /* navigation.navigate({
      name : 'NiceAuth',
      params : {
        type : 'JOIN',
        mrktAgreeYn: mrktAgree ? 'Y' : 'N',
      }
    }); */

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
      <SpaceView viewStyle={_styles.wrap}>
        <SpaceView>
          <CommonHeader title="" />
        </SpaceView>

        <SpaceView mt={35}>
          <Text style={styles.fontStyle('H', 28, '#fff')}>이용약관 동의</Text>
          <SpaceView mt={10}><Text style={styles.fontStyle('SB', 12, '#fff')}>리프를 이용하기 위해 약관 확인과 동의가 필요합니다.</Text></SpaceView>
        </SpaceView>

        <SpaceView mt={220} pl={13} pr={13}>
          <SpaceView viewStyle={{justifyContent: 'space-between', alignContent: 'space-between', height: height-450}}>
            {/* <SpaceView mb={10} viewStyle={layoutStyle.rowBetween}>
              <TouchableOpacity
                style={_styles.allAgreeContainer}
                onPress={(value: boolean) => { allAgreeBtn(value); }}
              >
                <Image source={allAgree ? ICON.checkYellow : ICON.checkGold} style={[styles.iconSize16, {marginRight: 5, marginLeft: 'auto'}]} />
                <CommonText textStyle={_styles.agreeText}>모두 동의</CommonText>
              </TouchableOpacity>
            </SpaceView> */}

            <SpaceView>
              <SpaceView viewStyle={layoutStyle.rowBetween} mb={6} mt={20}>
                <Text style={styles.fontStyle('B', 16, '#fff')}>서비스 이용약관(필수)</Text>
                <TouchableOpacity 
                  onPress={(isOn) => toggleActive('terms', isOn)}
                  style={[_styles.btnWrap(termsAgree)]}
                  activeOpacity={0.8}>

                  {termsAgree && ( <Image source={ICON.checkWhite} style={styles.iconSquareSize(14)} />)}
                  <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>보기</Text>
                </TouchableOpacity>
              </SpaceView>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={6}>
                <Text style={styles.fontStyle('B', 16, '#fff')}>개인정보처리방침(필수)</Text>
                <TouchableOpacity 
                  onPress={(isOn) => toggleActive('privacy', isOn)}
                  style={[_styles.btnWrap(privacyAgree)]}
                  activeOpacity={0.8}>

                  {privacyAgree && ( <Image source={ICON.checkWhite} style={styles.iconSquareSize(14)} />)}
                  <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>보기</Text>
                </TouchableOpacity>
              </SpaceView>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={6}>
                <Text style={styles.fontStyle('B', 16, '#fff')}>위치기반서비스 이용약관(필수)</Text>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity 
                    onPress={(isOn) => toggleActive('location', isOn)}
                    style={[_styles.btnWrap(locationAgree)]}
                    activeOpacity={0.8}>

                    {locationAgree && ( <Image source={ICON.checkWhite} style={styles.iconSquareSize(14)} />)}
                    <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>보기</Text>
                  </TouchableOpacity>
                </View>
              </SpaceView>

              <SpaceView viewStyle={layoutStyle.rowBetween} mb={6}>
                <Text style={styles.fontStyle('B', 16, '#fff')}>마케팅 수신동의(선택)</Text>
                <View style={[layoutStyle.rowBetween]}>
                  <TouchableOpacity 
                    onPress={() => {
                      if(mrktAgree === false) { setMrktAgree(true);
                      } else { setMrktAgree(false); }       
                    }}
                    style={[_styles.btnWrap(mrktAgree)]}
                    activeOpacity={0.8}>
                    
                    {mrktAgree && ( <Image source={ICON.checkWhite} style={styles.iconSquareSize(14)} />)}
                    <Text style={[styles.fontStyle('SB', 11, '#fff'), {textAlign: 'center'}]}>동의</Text>
                  </TouchableOpacity>
                </View>
              </SpaceView>
            </SpaceView>

            <SpaceView viewStyle={_styles.bottomWrap}>
              <TouchableOpacity 
                disabled={!termsAgree || !privacyAgree || !locationAgree}
                onPress={() => { nextBtn(); }}
                style={_styles.nextBtnWrap(termsAgree && privacyAgree && locationAgree)}>
                <Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
                <SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>
        </SpaceView>
      </SpaceView>


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
  wrap: {
    flex: 1,
    minHeight: height,
    backgroundColor: '#000000',
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  btnWrap: (isOn:boolean) => {
		return {
			backgroundColor: isOn ? '#46F66F' : 'transparent',
      borderWidth: isOn ? 0 : 1,
      borderColor: '#FFFFFF',
      borderRadius: 25,
      width: 65,
      height: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: isOn ? 'space-between' : 'center',
      paddingHorizontal: 10,
    };
	},
  bottomWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  nextBtnWrap: (isOn:boolean) => {
		return {
			backgroundColor: isOn ? '#1F5AFB' : '#808080',
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
    };
	},

});