import AsyncStorage from '@react-native-community/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { ColorType } from '@types';
import { signin, get_app_version, get_member_chk } from 'api/models';
import { layoutStyle, modalStyle, styles, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { SUCCESS, LOGIN_REFUSE, LOGIN_EMPTY, LOGIN_WAIT, LOGIN_EXIT, SANCTIONS, PASSWORD_ERROR, LOGIN_BLOCK, LOGIN_SLEEP } from 'constants/reusltcode';
import { ROUTES } from 'constants/routes';
import storeKey, { JWT_TOKEN } from 'constants/storeKey';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import React, { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, TouchableOpacity, Text, View, Platform, PermissionsAndroid, StyleSheet, Alert, Linking, TextInput, Keyboard } from 'react-native';
import { useDispatch } from 'react-redux';
import { setPrincipal } from 'redux/reducers/authReducer';
import * as mbrReducer from 'redux/reducers/mbrReducer';
import { ICON, IMAGE } from 'utils/imageUtils';
import { Modalize } from 'react-native-modalize';
import { Color } from 'assets/styles/Color';
import Geolocation from 'react-native-geolocation-service';
import RNExitApp from 'react-native-exit-app';
import VersionCheck from 'react-native-version-check';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import { CommonCheckBox } from 'component/CommonCheckBox';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';




GoogleSignin.configure({
  webClientId:
    '535563482959-01e4bap45pcsvvafnis6sqndk1vokr0g.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
  offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
  forceCodeForRefreshToken: true, // [Android] related to `serverAuthCode`, read the docs link below *.
  accountName: '', // [Android] specifies an account name on the device that should be used
  iosClientId:
    '535563482959-vq2qcp0jb3o67soviq7sj0lihvh9skj6.apps.googleusercontent.com', // [iOS] if you want to specify the client ID of type iOS (otherwise, it is taken from GoogleService-Info.plist)
  googleServicePlistPath: '', // [iOS] if you renamed your GoogleService-Info file, new name here, e.g. GoogleService-Info-Staging
  openIdRealm: '', // [iOS] The OpenID2 realm of the home web server. This allows Google to include the user's OpenID Identifier in the OpenID Connect ID token.
  profileImageSize: 120, // [iOS] The desired height (and width) of the profile image. Defaults to 120px
});

const { width, height } = Dimensions.get('window');

export const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { show } = usePopup();
  const [id, setId] = React.useState('');
  const [password, setPassword] = React.useState('');
  const me = useUserInfo();
  const isFocus = useIsFocused();

  const [latitude, setLatitude] = React.useState(); // 위도
  const [longitude, setLongitude] = React.useState(); // 경도

  const [granted, setGranted] = React.useState('');

  const [activate, setActivate] = useState<boolean>(false); // 마케팅 수신동의

  // ########################################################################## 로그인 실행
  const loginProc = async (isSleepPass:boolean) => {
    const body = {
      email_id: id,
      password,
      latitude: latitude,
      longitude: longitude,
      sleepPassYn: isSleepPass ? 'Y' : 'N',
    };

    try {
      
      const { success, data } = await signin(body);

      console.log('data::::: '  , data);
      
      if (success) {
        switch (data.result_code) {
          case SUCCESS:
            await AsyncStorage.setItem(JWT_TOKEN, data.token_param.jwt_token);
            await AsyncStorage.setItem(
              storeKey.MEMBER_SEQ,
              data.mbr_base.member_seq + ''
            );
            delete data.result_code;
            dispatch(setPrincipal(data));
            dispatch(mbrReducer.setJwtToken(data.token_param.jwt_token));
            dispatch(mbrReducer.setMemberSeq(data.mbr_base.member_seq));
            dispatch(mbrReducer.setBase(data.mbr_base));
            dispatch(mbrReducer.setProfileImg(data.mbr_img_list));
            dispatch(mbrReducer.setSecondAuth(data.mbr_second_auth_list));
            dispatch(mbrReducer.setIdealType(data.mbr_ideal_type));
            dispatch(mbrReducer.setInterview(data.mbr_interview_list));
            dispatch(mbrReducer.setUserInfo(data));
            break;

          case LOGIN_WAIT:
            goJoinPage(data.mbr_base);
            break;

          case LOGIN_REFUSE:
            navigation.navigate(ROUTES.APPROVAL, {
              memberSeq: data.mbr_base.member_seq,
            });
            break;

          case PASSWORD_ERROR:
            show({ content: '비밀번호를 정확히 입력해주세요.' });
            break;
            
          case LOGIN_EMPTY:
            show({ content: '일치하는 회원이 없습니다.' });
            break;

          case LOGIN_EXIT:
            show({ content: '탈퇴 회원 입니다.' });
            break;

          case SANCTIONS:
            show({ title: '제재 알림', content: '<이용 약관>에 근거하여 회원 제재 상태로 전환되었습니다. \n' + data?.sanctions?.sanctions_msg});
            break;

          case LOGIN_BLOCK:
            show({ title: '제재 알림', content: '<이용 약관>에 근거하여 회원 영구 제재 상태로 전환되었습니다.' });
            break;

          case LOGIN_SLEEP:
            show({ 
              title: '휴면회원',
              content: '현재 휴면회원 상태입니다.\n휴면상태를 해제 하시겠습니까?',
              cancelCallback: function() {},
              confirmCallback: function() {
                loginProc(true);
              }
            });
            break;

          default:
            break;
        }
      }

    } catch (error) {
      console.log(error);
      show({ content: '일치하는 회원이 없습니다.' });
    } finally {
      
    }
  };

  // ########################################################################## 회원가입 실행
  const joinProc = async () => {
    const push_token = await AsyncStorage.getItem(storeKey.FCM_TOKEN);
    const body = {
      push_token : push_token
    };

    if(isEmptyData(push_token)) {
      const { success, data } = await get_member_chk(body);
      if(success) {
        if(isEmptyData(data.mbr_base)) {
          const memberStatus = data.mbr_base.status;

          console.log('memberStatus :::: ' , memberStatus);

          if (memberStatus == 'PROCEED' || memberStatus == 'APPROVAL') {
            goJoinPage(data.mbr_base);
          } else {
            show({ content: '이미 등록된 회원 입니다.\n로그인을 진행해 주세요.' });
          };

        } else {
          navigation.navigate('Policy');
        };
      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      }
    } else {
      navigation.navigate('Policy');
    }
  };

  // ########################################################################## 회원가입 페이지 이동
  const goJoinPage = async (mbr_base:any) => {
    const memberStatus = mbr_base.status;
    const joinStatus = mbr_base.join_status;
    const memberSeq = mbr_base.member_seq;
    const gender = mbr_base.gender;
    const mstImgPath = mbr_base.mst_img_path;

    if(memberStatus == 'PROCEED' || memberStatus == 'APPROVAL') {
      if(memberStatus == 'APPROVAL') {
        navigation.navigate(ROUTES.APPROVAL, { memberSeq: memberSeq });
      } else {
        if (isEmptyData(joinStatus)) {
          // PASSWORD, IMAGE, NICKNAME, ADD, INTEREST, INTRODUCE, AUTH

          if (joinStatus == 'PASSWORD') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                ],
              })
            );
          } else if (joinStatus == 'IMAGE') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                  { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                ],
              })
            );
          } else if (joinStatus == 'NICKNAME') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                  { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_COMMENT, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                ],
              })
            );
          } else if (joinStatus == 'MESSAGE') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                  { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_COMMENT, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_ADDINFO, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                ],
              })
            );
          } else if (joinStatus == 'ADD') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                  { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_ADDINFO, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_INTEREST, params: { memberSeq: memberSeq, gender: mbr_base.gender, nickname: mbr_base.nickname }},
                ],
              })
            );
          } else if (joinStatus == 'INTEREST') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                  { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_ADDINFO, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_INTEREST, params: { memberSeq: memberSeq, gender: mbr_base.gender, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_INTRODUCE, params: { memberSeq: memberSeq, gender: mbr_base.gender, nickname: mbr_base.nickname }},
                ],
              })
            );
          } else if (joinStatus == 'INTRODUCE') {
            navigation.dispatch(
              CommonActions.reset({
                index: 1,
                routes: [
                  { name: ROUTES.LOGIN },
                  { name: ROUTES.SIGNUP_PASSWORD, params: { ci: mbr_base.ci, name: mbr_base.name, gender: mbr_base.gender, mobile: mbr_base.mobile, birthday: mbr_base.birthday, memberSeq: memberSeq, emailId: mbr_base.emailId }},
                  { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: mbr_base.gender, }},
                  { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_ADDINFO, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_INTEREST, params: { memberSeq: memberSeq, gender: mbr_base.gender, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_INTRODUCE, params: { memberSeq: memberSeq, gender: mbr_base.gender, nickname: mbr_base.nickname }},
                  { name: ROUTES.SIGNUP_AUTH, params: { memberSeq: memberSeq, gender: mbr_base.gender, mstImgPath: mbr_base.mstImgPath, nickname: mbr_base.nickname }},
                ],
              })
            );
          } else if (joinStatus == 'AUTH') {
            navigation.navigate(ROUTES.APPROVAL, { memberSeq: memberSeq });
          }
        }
      }
    }

  }

  // ########################################################################## 사용자 위치 확인
  async function requestPermissions() {
    try {
      // IOS 위치 정보 수집 권한 요청
      if (Platform.OS === 'ios') {
        return await Geolocation.requestAuthorization('whenInUse');
      }

      // AOS 위치 정보 수집 권한 요청
      if (Platform.OS === 'android') {
        return await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
      }
    } catch (e) {
      console.log(e);
    }
  };

  // ########################################################################## 알림 권한 요청(AOS만)
  async function requestNotificationPermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('Post notifications permission granted.');
      } else {
        console.log('Post notifications permission denied.');
      }
    } catch (error) {
      console.warn('Error while requesting notification policy permission:', error);
    }
  };

  // ########################################################################## 위치 권한 요청
  const requestLocationPermission = async () => {
    requestPermissions().then((result) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLatitude(latitude);
          setLongitude(longitude);
          locationStorageSet(latitude, longitude);
        },
        (error) => {
          console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );

      if(Platform.OS == 'android') {
        //requestNotificationPermission();
      };
    });
  };

  // ########################################################################## 위치 데이터 적용
  const locationStorageSet = async (lat:any, lon:any) => {
    if(isEmptyData(lat)) {
      await AsyncStorage.setItem(storeKey.MEMBER_LAT, String(lat));
    }
    if(isEmptyData(lon)) {
      await AsyncStorage.setItem(storeKey.MEMBER_LON, String(lon));
    }
  };

  // ########################################################################## 초기 실행
  useEffect(() => {
    if(isFocus) {
      setActivate(false);
      requestLocationPermission();
    };
  }, [isFocus]);

  return (
    <>    
      <SpaceView viewStyle={_styles.wrap}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <SpaceView>
            <Image source={ICON.join_bg} style={styles.iconNoSquareSize('100%', '100%')} />
          </SpaceView>

          <SpaceView viewStyle={_styles.bodyWrap}>
            {/* <ScrollView horizontal={false}> */}
              <SpaceView viewStyle={{height: Platform.OS == 'android' ? height-80 : height-130}}>

                {/* ############################################################### 타이틀 */}
                <SpaceView mt={65}>
                  <SpaceView>
                    <Text style={[styles.fontStyle('H', 22, '#fff'), {textAlign: 'center'}]}>LEAP</Text>
                  </SpaceView>
                  <SpaceView mt={45}>
                    <Text style={[styles.fontStyle('B', 28, '#fff'), {textAlign: 'center'}]}>오늘 하루,{'\n'}편안한 리프를 취하세요.</Text>
                  </SpaceView>
                </SpaceView>

                <SpaceView>
                  {/* ############################################################### 입력 영역 */}
                  <SpaceView mt={80} pl={25} pr={25}>
                    <SpaceView>
                      <Text style={styles.fontStyle('EB', 15, '#fff')}>아이디(이메일)</Text>
                      <SpaceView>
                        <TextInput
                          value={id}
                          onChangeText={(text) => setId(text)}
                          autoCapitalize={'none'}
                          style={_styles.textInputStyle}
                          maxLength={50}
                          hitSlop={commonStyle.hipSlop25}
                          returnKeyType="done"
                        />
                      </SpaceView>
                    </SpaceView>
                    <SpaceView mt={25}>
                      <Text style={styles.fontStyle('EB', 15, '#fff')}>비밀번호</Text>
                      <SpaceView>
                        <TextInput
                          value={password}
                          onChangeText={(text) => setPassword(text)}
                          autoCapitalize={'none'}
                          style={_styles.textInputStyle}
                          maxLength={30}
                          secureTextEntry={true}
                          returnKeyType="done"
                        />
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>

                  {/* ############################################################### 버튼 영역 */}
                  <SpaceView mt={40}>
                    <SpaceView viewStyle={layoutStyle.alignCenter}>
                      <TouchableOpacity
                        style={_styles.loginBtn}
                        onPress={() => {
                          if (id == '') {
                            return show({ content: '아이디를 입력해 주세요.' });
                          }
                          if (password == '') {
                            return show({ content: '비밀번호를 입력해 주세요.' });
                          }
                          
                          loginProc(false);
                          //dispatch(loginReduce(id, password));
                        }}>
                        <Text style={styles.fontStyle('B', 18, '#fff')}>로그인</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={_styles.joinBtn}
                        onPress={() => { joinProc(); }}>
                        <Text style={styles.fontStyle('B', 18, '#fff')}>회원가입</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={_styles.joinBtn}
                        onPress={() => {
                          navigation.navigate('SearchIdAndPwd');
                        }}>
                        <Text style={styles.fontStyle('B', 18, '#fff')}>아이디/비밀번호 찾기</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </SpaceView>

                  <SpaceView mt={20}>
                    <Text style={[styles.fontStyle('SB', 10, '#CBCBCB'), {textAlign: 'center'}]}>
                      리프(LEAP)는 회원가입 절차에 직업 또는 학력 등의  인증이 필요합니다.{'\n'}
                      이는 피싱, 폭력으로부터 안전한 SNS 환경을 제공하기 위한 목적으로 활용됩니다.{'\n'}
                      제공받은 소중한 개인정보는 인증 과정동안 암호화 처리되어 관리되며 인증 심사{'\n'}
                      종료 후 인증 심사 이력만 남고 개인 정보는 모두 삭제됩니다.</Text>
                  </SpaceView>

                </SpaceView>

                {/* <View style={[layoutStyle.alignCenter, commonStyle.paddingHorizontal20, commonStyle.mb15, commonStyle.mt10]}>

                  <SpaceView mb={30} viewStyle={{width: '100%'}}>
                    <SpaceView mb={10}>
                      <Text style={styles.fontStyle('EB', 16, '#fff')}>아이디(이메일)</Text>
                    </SpaceView>
                    <SpaceView>
                      <TextInput
                        value={id}
                        onChangeText={(text) => setId(text)}
                        autoCapitalize={'none'}
                        style={_styles.textInputStyle}
                        maxLength={50}
                        hitSlop={commonStyle.hipSlop25}
                      />

                      {id.length > 0 && (
                        <TouchableOpacity 
                          style={_styles.removeTextBtn}
                          onPress={() => { setId(''); }}
                          hitSlop={commonStyle.hipSlop20}>
                          <Image source={ICON.xYellow} style={styles.iconSquareSize(10)} />
                        </TouchableOpacity>
                      )}
                    </SpaceView>
                  </SpaceView>

                  <SpaceView viewStyle={{width: '100%'}}>
                    <SpaceView mb={10}>
                      <Text style={_styles.emailPwdText}>비밀번호</Text>
                    </SpaceView>
                    <SpaceView>
                      <TextInput
                        value={password}
                        onChangeText={(text) => setPassword(text)}
                        autoCapitalize={'none'}
                        style={_styles.textInputStyle}
                        maxLength={30}
                        secureTextEntry={true}
                      />

                      {password.length > 0 && (
                        <TouchableOpacity
                          style={_styles.removeTextBtn}
                          onPress={() => { setPassword(''); }} 
                          hitSlop={commonStyle.hipSlop20}>
                          <Image source={ICON.xYellow} style={styles.iconSquareSize(10)} />
                        </TouchableOpacity>
                      )}
                    </SpaceView>

                  </SpaceView>

                  <View style={_styles.saveLogInfoContainer}>
                    <TouchableOpacity
                      style={_styles.checkWrap}
                      onPress={() => { 
                        if(activate === false) {
                          setActivate(true); 
                        }else {
                          setActivate(false); 
                        }
                      }}
                    >
                    </TouchableOpacity>
                  </View>
                </View> */}
              </SpaceView>
            {/* </ScrollView> */}
          </SpaceView>

        </TouchableWithoutFeedback>

        
      </SpaceView>
    </>
  );
};
// const google_signIn = async () => {
//   try {
//     console.log('google_signIn');
//     // Check if your device supports Google Play
//     const result = await GoogleSignin.hasPlayServices({
//       showPlayServicesUpdateDialog: true,
//     });
//     console.log(JSON.stringify(result));
//     // Get the users ID token
//     const { idToken } = await GoogleSignin.signIn();
//     const { success, data } = await signup_with_social('google', {
//       identityToken: idToken,
//     });
//     if (success) {
//       Alert.alert('구글로그인 성공', '', [
//         { text: '확인', onPress: () => {} },
//       ]);
//     }
//   } catch (error) {
//     console.log(error, error.code);
//     if (error.code === statusCodes.SIGN_IN_CANCELLED) {
//       // user cancelled the login flow
//     } else if (error.code === statusCodes.IN_PROGRESS) {
//       // operation (e.g. sign in) is in progress already
//     } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
//       // play services not available or outdated
//     } else {
//       // some other error happened
//     }
//   }
// };
// const onAppleButtonPress = async () => {
//   const appleAuthRequestResponse = await appleAuth.performRequest({
//     requestedOperation: appleAuth.Operation.LOGIN,
//     // Note: it appears putting FULL_NAME first is important, see issue #293
//     requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
//   });
//   const credentialState = await appleAuth
//     .getCredentialStateForUser(appleAuthRequestResponse.user)
//     .catch((e) => {
//       console.log('error1', e);
//     });
//   if (credentialState === appleAuth.State.AUTHORIZED) {
//     const { success, data } = await signup_with_social('apple', {
//       user: appleAuthRequestResponse.user,
//       identityToken: appleAuthRequestResponse.identityToken,
//       authorizationCode: appleAuthRequestResponse.authorizationCode,
//     });
//     if (success) {
//       Alert.alert('애플로그인 성공', '', [
//         { text: '확인', onPress: () => {} },
//       ]);
//     }
//     // user is authenticated
//   }
// };



const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    //flexGrow: 1,
  },
  bodyWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  loginBtn: {
    borderRadius: 25,
    backgroundColor: '#1F5AFB',
    alignItems: 'center',
    width: 270,
    paddingVertical: 12,
  },
  joinBtn: {
    borderRadius: 25,
    backgroundColor: '#000000',
    alignItems: 'center',
    width: 270,
    paddingVertical: 12,
    marginTop: 10,
  },
  textInputStyle: {
    borderBottomWidth: 1,
    borderBottomColor: '#A8A8A8',
    padding: 0,
    color: '#F3E270',
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    paddingBottom: 5,
    paddingTop: 5,
  },


});