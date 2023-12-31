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
import { Image, ScrollView, StyleSheet, View, Platform } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import * as properties from 'utils/properties';
import { usePopup } from 'Context';
import { SUCCESS, MEMBER_EMAIL_DUP } from 'constants/reusltcode';
import { regist_member_base_info } from 'api/models';
import { ROUTES } from 'constants/routes';
import { isEmptyData } from 'utils/functions';


interface Props {
  navigation: StackNavigationProp<StackParamList, 'Signup00'>;
  route: RouteProp<StackParamList, 'Signup00'>;
}

export const Signup00 = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup();  // 공통 팝업
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const memberSeq = props.route.params?.memberSeq;
  const orgEmailId = props.route.params?.emailId;
  const birthday = props.route.params?.birthday;
  const ci = props.route.params?.ci;

  const [id, setId] = React.useState(props.route.params?.emailId);
  const [password, setPassword] = React.useState('');
  const [passwordChk, setPasswordChk] = React.useState('');
  const [name, setName] = React.useState(props.route.params?.name);
  const [age, setAge] = React.useState(function () {
    let age_d;
    let today = new Date();
    let birthDay = props.route.params?.birthday;
    let birthYear = birthDay?.substring(0, 4);
    age_d = Number(today.getFullYear()) - Number(birthYear) + 1;
    return age_d.toString();
  });
  const [gender, setGender] = React.useState(props.route.params?.gender);
  const [mobile, setMobile] = React.useState(
    props.route.params?.mobile
      .replace(/[^0-9]/g, '')
      .replace(/^(\d{2,3})(\d{3,4})(\d{4})$/, `$1-$2-$3`)
  );

  const [snsType, setSnsType] = React.useState(props.route.params?.sns_type);
  const [snsToken, setSnsToken] = React.useState(props.route.params?.sns_token);
  const [mrktAgreeYn, setMrktAgreeYn] = React.useState(props.route.params?.marketing_agree_yn);

  // 성별 항목 목록
  const genderItemList = [
    { label: '남자', value: 'M' },
    { label: '여자', value: 'W' },
  ];

  const genderCallbackFn = (value: string) => {
    setGender(value);
  };

  // ########################################################### 이메일 유효성 체크
  const emailValidChk = async () => {
    let isResult = true;

    if(id == '') {
      show({ content: '아이디를 입력해 주세요.' });
      isResult = false;
    }

    let regEmail = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
    if(!regEmail.test(id)) {
      show({ content: '이메일 형식의 아이디가 아닙니다.' });
      isResult = false;
    }

    return isResult;
  };

  // ########################################################### 패스워드 유효성 체크
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


  // ########################################################### 회원가입
  const register = async () => {

    // 기존 저장되어 있는 회원 유무 구분 처리
    if(isEmptyData(memberSeq)) {

      if(orgEmailId != id || isEmptyData(password)) {
        if(orgEmailId != id) {
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
              name : ROUTES.LOGIN01
            },
            {
              name: ROUTES.SIGNUP00,
              params: {
                ci: ci,
                name: name,
                gender: gender,
                mobile: mobile,
                birthday: birthday,
                memberSeq: memberSeq,
                emailId: orgEmailId
              }
            },
            {
              name: ROUTES.SIGNUP01,
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
        email_id: id,
        password: password,
        name: name,
        gender: gender,
        phone_number: mobile,
        ci: ci,
        birthday: birthday,
        snsType: snsType,
        snsToken: snsToken,
        device_gubun: Platform.OS,
        marketing_agree_yn: mrktAgreeYn,
      };
  
      try {
        const { success, data } = await regist_member_base_info(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:  
              navigation.reset({
                routes: [
                  {
                    name : ROUTES.LOGIN01
                  },
                  {
                    name: ROUTES.SIGNUP00,
                    params: {
                      ci: ci,
                      name: name,
                      gender: gender,
                      mobile: mobile,
                      birthday: birthday,
                      memberSeq: data.member_seq,
                      emailId: id
                    }
                  },
                  {
                    name: ROUTES.SIGNUP01,
                    params: {
                      memberSeq: data.member_seq,
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
  }

  return (
    <>
      <CommonHeader title={'가입정보'} />
      <ScrollView style={[styles.scrollContainerAll]}>
        <SpaceView mb={45} viewStyle={[commonStyle.paddingHorizontal20]}>
          <SpaceView mb={15}>
            <Image source={IMAGE.signImg} style={styles.signImg} resizeMode="contain" />
          </SpaceView>
          <CommonText type={'h3'} fontWeight={'200'}>
            본인 인증을 기반으로{'\n'}회원님의 정보가 자동입력됩니다.
          </CommonText>
        </SpaceView>

        <SpaceView viewStyle={[commonStyle.paddingHorizontal20, commonStyle.mb70]}>

          <SpaceView mb={24}>
            <CommonInput
              label="이메일"
              value={id}
              onChangeText={(id) => setId(id)}
              maxLength={50}
              placeholderTextColor={'#c6ccd3'}
              placeholder={'이메일 주소'}
              borderBottomType={'black'}
            />
          </SpaceView>

          {/* <View style={styles.infoContainer}>
            <SpaceView mt={4}>
              <Image source={ICON.info} style={styles.iconSize} />
            </SpaceView>

            <SpaceView ml={8}>
              <CommonText color={ColorType.gray6666}>
                아이디는 이메일로 입력해 주세요.
              </CommonText>
            </SpaceView>
          </View> */}

          <SpaceView mb={24}>
            <CommonInput
              label="비밀번호"
              value={password}
              onChangeText={(password) => setPassword(password)}
              isMasking={true}
              maxLength={20}
              placeholderTextColor={'#c6ccd3'}
              placeholder={'영문, 숫자, 특수기호(!@#$%^*+=-) 포함 8글자 이상'}
              borderBottomType={'black'}
              fontSize={15}
            />
          </SpaceView>

          <SpaceView mb={24}>
            <CommonInput
              label="비밀번호 확인"
              value={passwordChk}
              onChangeText={(passwordChk) => setPasswordChk(passwordChk)}
              isMasking={true}
              maxLength={20}
              placeholderTextColor={'#c6ccd3'}
              placeholder={'영문, 숫자, 특수기호(!@#$%^*+=-) 포함 8글자 이상'}
              borderBottomType={'black'}
              fontSize={15}
            />
          </SpaceView>

          <SpaceView mb={24}>
            <CommonInput
              label="이름"
              value={name}
              onChangeText={(name) => setName(name)}
              maxLength={5}
              disabled={true}
              placeholderTextColor={'#c6ccd3'}
              borderBottomType={'black'}
            />
          </SpaceView>

          <SpaceView mb={24}>
            <View style={styles.halfContainer}>
              <View style={styles.halfItemLeft}>
                <CommonInput
                  label="나이"
                  value={age}
                  keyboardType="number-pad"
                  onChangeText={(age) => setAge(age)}
                  disabled={true}
                  maxLength={2}
                  placeholderTextColor={'#c6ccd3'}
                  borderBottomType={'black'}
                />
              </View>
              <View style={styles.halfItemRight}>
                <CommonInput
                  label="성별"
                  value={gender == 'M' ? '남자' : '여자'}
                  disabled={true}
                  placeholderTextColor={'#c6ccd3'}
                  borderBottomType={'black'}
                />

                {/* <View style={selectStyles.selectContainer}>
                  <View>
                    <CommonSelect label={'성별'} items={genderItemList} selectValue={gender} callbackFn={genderCallbackFn} />
                  </View>
                  <View style={selectStyles.selectImgContainer}>
                    <Image source={ICON.arrRight} style={selectStyles.icon} />
                  </View>
                </View> */}
              </View>
            </View>
          </SpaceView>

          <SpaceView mb={24}>
            <CommonInput
              label="전화번호"
              value={mobile}
              onChangeText={(mobile) => setMobile(mobile)}
              keyboardType="number-pad"
              maxLength={13}
              disabled={true}
              placeholderTextColor={'#c6ccd3'}
              borderBottomType={'black'}
            />
          </SpaceView>
        </SpaceView>
      </ScrollView>

      <SpaceView>
        <CommonBtn
          value={'다음 (1/4)'}
          type={'primary'}
          height={60}
          borderRadius={1}
          onPress={() => {
            register();
          }}
        />
      </SpaceView>
    </>
  );
};

const selectStyles = StyleSheet.create({
  selectImgContainer: {
    position: 'absolute',
    height: '100%',
    justifyContent: 'center',
    right: 16,
  },
  selectContainer: {},
  labelContainer: {
    marginBottom: 8,
  },
  labelStyle: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'AppleSDGothicNeoR00',
    color: Color.gray6666,
    marginBottom: 8,
  },
  inputContainer: {
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: Color.grayDDDD,
  },
  icon: {
    width: 16,
    height: 16,
    transform: [{ rotate: '90deg' }],
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    lineHeight: 24,
    color: Color.black2222,
    fontFamily: 'AppleSDGothicNeoM00',
    padding: 0,
    marginTop: 8,
  },
  inputAndroid: {
    fontSize: 16,
    lineHeight: 24,
    color: Color.black2222,
    fontFamily: 'AppleSDGothicNeoM00',
    padding: 0,
  },
});
