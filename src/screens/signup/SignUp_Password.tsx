import { RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { Color } from 'assets/styles/Color';
import { commonStyle, styles } from 'assets/styles/Styles';
import axios from 'axios';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { Image, ScrollView, StyleSheet, View, Platform, Text, Dimensions, TouchableOpacity, TextInput, Keyboard } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import * as properties from 'utils/properties';
import { usePopup } from 'Context';
import { SUCCESS, MEMBER_EMAIL_DUP } from 'constants/reusltcode';
import { regist_member_base_info } from 'api/models';
import { ROUTES } from 'constants/routes';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';


interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp_Password'>;
  route: RouteProp<StackParamList, 'SignUp_Password'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Password = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup();  // 공통 팝업
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const [isKeyboardVisible, setIsKeyboardVisible] = React.useState(false);

  const birthday = props.route.params?.birthday; // 생년월일
  const ci = props.route.params?.ci; // CI
  const name = props.route.params?.name; // 이름
  const gender = props.route.params?.gender; // 성별
  const age = props.route.params?.age; // 나이
  const mobile = props.route.params?.mobile; // 전화번호
  const mrktAgreeYn = props.route.params?.marketing_agree_yn; // 마케팅 정보 동의 여부
  const memberSeq = props.route.params?.memberSeq; // 회원 번호
  const orgEmailId = props.route.params?.emailId; // 기존 이메일 ID

  // 입력 변수
  const [emailId, setEmailId] = React.useState(props.route.params?.emailId);
  const [password, setPassword] = React.useState('');
  const [passwordChk, setPasswordChk] = React.useState('');
  
  // ######################################################################################################## 이메일 유효성 체크
  const emailValidChk = async () => {
    let isResult = true;

    if(emailId == '') {
      show({ content: '아이디를 입력해 주세요.' });
      isResult = false;
    }

    let regEmail = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if(!regEmail.test(emailId)) {
      show({ content: '이메일 형식의 아이디가 아닙니다.' });
      isResult = false;
    }

    return isResult;
  };

  // ######################################################################################################## 패스워드 유효성 체크
  const passwordValidChk = async () => {
    let isResult = true;

    if(password == '') {
      show({ content: '비밀번호를 입력해 주세요.' });
      isResult = false;
    };

    let regPass = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
    if(!regPass.test(password)) {
      show({ content: '영문, 숫자, 특수기호(!@#$%^*+=-) 조합으로\n8-25자리 입력해주세요.' });
      isResult = false;
    };

    if(passwordChk == '') {
      show({ content: '비밀번호 확인을 입력해 주세요.' });
      isResult = false;
    };

    if(password != passwordChk) {
      show({ content: '비밀번호 확인이 맞지 않습니다.' });
      isResult = false;
    };

    return isResult;
  };

  // ######################################################################################################## 회원가입
  const register = async () => {

    // 기존 저장되어 있는 회원 유무 구분 처리
    if(isEmptyData(memberSeq)) {

      if(orgEmailId != emailId || isEmptyData(password)) {
        if(orgEmailId != emailId) {
          const emailChkResult = await emailValidChk();
          if(!emailChkResult) {
            return;
          };
        };
  
        if(isEmptyData(password)) {
          const passwordChkResult = await passwordValidChk();
          if(!passwordChkResult) {
            return;
          };
        };

        saveRegistMember();

      } else {
        navigation.reset({
          routes: [
            {
              name : ROUTES.LOGIN
            },
            {
              name: ROUTES.SIGNUP_PASSWORD,
              params: {
                ci: ci,
                name: name,
                gender: gender,
                mobile: mobile,
                birthday: birthday,
                memberSeq: memberSeq,
                emailId: emailId
              }
            },
            {
              name: ROUTES.SIGNUP_IMAGE,
              params: {
                memberSeq: memberSeq,
                gender: gender,
              }
            }
          ]
        });
      }

    } else {

      if(!isEmptyData(ci)) {
        show({ content: '본인인증을 다시 진행해 주세요.' });
        return;
      };

      const emailChkResult = await emailValidChk();
      if(!emailChkResult) {
        return;
      };

      const passwordChkResult = await passwordValidChk();
      if(!passwordChkResult) {
        return;
      };
  
      saveRegistMember();
    }
  };

  // ########################################################### 회원가입
  const saveRegistMember = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);

      const body = {
        email_id: emailId,
        password: password,
        name: name,
        gender: gender,
        phone_number: mobile,
        ci: ci,
        birthday: birthday,
        device_gubun: Platform.OS,
        marketing_agree_yn: mrktAgreeYn,
        join_status: 'PASSWORD',
      };
  
      try {
        const { success, data } = await regist_member_base_info(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:  
              navigation.reset({
                routes: [
                  {
                    name : ROUTES.LOGIN
                  },
                  {
                    name: ROUTES.SIGNUP_PASSWORD,
                    params: {
                      ci: ci,
                      name: name,
                      gender: gender,
                      mobile: mobile,
                      birthday: birthday,
                      memberSeq: data?.member_seq,
                      emailId: emailId
                    }
                  },
                  {
                    name: ROUTES.SIGNUP_IMAGE,
                    params: {
                      memberSeq: data?.member_seq,
                      gender: gender,
                    }
                  }
                ]
              });
  
              break;
            case MEMBER_EMAIL_DUP:
              show({ content: '이미 사용하고 있는 이메일 입니다.' });
              break;
            default:
              show({ content: '오류입니다. 관리자에게 문의해주세요.' });
              break;
          }
         
        } else {
          show({
            content: '오류입니다. 관리자에게 문의해주세요.' ,
            confirmCallback: function() {}
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
      }
    }
  };

  return (
    <>
      <SpaceView viewStyle={_styles.wrap}>
        <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); }}>

          {/* ########################################################################################## HEADER */}
          <SpaceView>
            <CommonHeader title="" />
          </SpaceView>

          <SpaceView viewStyle={{justifyContent: 'space-between'}}>
            <SpaceView>
              <SpaceView mt={50}>
                <Text style={styles.fontStyle('H', 28, '#fff')}>사용하실{'\n'}비밀번호를 입력해 주세요.</Text>
                <SpaceView mt={10}>
                  <Text style={styles.fontStyle('SB', 12, '#fff')}>비밀번호는 8글자 이상, 영문포함, 숫자포함, 특수기호 허용</Text>
                </SpaceView>
              </SpaceView>

              
                <SpaceView mt={50} viewStyle={_styles.contentWrap}>
                  <TextInput
                    value={password}
                    onChangeText={(text) => setPassword(text)}
                    autoCapitalize={'none'}
                    style={[_styles.textInputStyle, styles.fontStyle('B', 28, '#fff')]}
                    maxLength={20}
                    placeholder={'비밀번호를 입력해 주세요.'}
                    placeholderTextColor={'#808080'}
                    secureTextEntry={true}
                  />
                </SpaceView>
                <SpaceView mt={20} viewStyle={_styles.contentWrap}>
                  <TextInput
                    value={passwordChk}
                    onChangeText={(text) => setPasswordChk(text)}
                    autoCapitalize={'none'}
                    style={[_styles.textInputStyle, styles.fontStyle('B', 28, '#fff')]}
                    maxLength={20}
                    placeholder={'비밀번호를 재입력해 주세요.'}
                    placeholderTextColor={'#808080'}
                    secureTextEntry={true}
                  />

                    {/* <TextInput
                      value={password}
                      onChangeText={(text) => setPassword(text)}
                      autoCapitalize={'none'}
                      style={_styles.textInputStyle('#F3E270')}
                      secureTextEntry={true}
                      maxLength={20}
                    /> */}
                </SpaceView>

            </SpaceView>
          </SpaceView>
        </TouchableWithoutFeedback>

        {/* ########################################################################################## 버튼 */}
        <SpaceView mb={20} viewStyle={_styles.bottomWrap}>
          <TouchableOpacity 
            disabled={!emailId}
            onPress={() => { register(); }}
            style={_styles.nextBtnWrap(isEmptyData(password) && isEmptyData(passwordChk) && password === passwordChk)}>
            <Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
            <SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
          </TouchableOpacity>
        </SpaceView>
        
      </SpaceView>
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
    height: height,
    backgroundColor: '#000000',
    paddingTop: 30,
    paddingHorizontal: 10,
    justifyContent: 'space-between',
  },
  contentWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemWrap: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  textWrap: {
    borderBottomWidth: 1,
    borderBottomColor: '#A8A8A8',
    paddingBottom: 5,
    paddingHorizontal: 8,
  },
  bottomWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 10,
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
  textInputStyle: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#A8A8A8',
    padding: 0,
    paddingBottom: 5,
    paddingTop: 5,
  },

});