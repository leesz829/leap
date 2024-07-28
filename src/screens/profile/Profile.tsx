import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Modal, TouchableOpacity, Alert, StyleSheet, Dimensions, Text, TextInput } from 'react-native';
import * as React from 'react';
import { CommonBtn } from 'component/CommonBtn';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { ROUTES, STACK } from 'constants/routes';
import { clearPrincipal } from 'redux/reducers/authReducer';
import { useUserInfo } from 'hooks/useUserInfo';
import { update_setting, member_logout, update_member_exit, update_member_sleep } from 'api/models';
import { usePopup } from 'Context';
import { SUCCESS } from 'constants/reusltcode';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';


/* ################################################################################################################
###################################################################################################################
###### 내 계정 정보
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Profile'>;
  route: RouteProp<StackParamList, 'Profile'>;
}

const { width, height } = Dimensions.get('window');

export const Profile = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch();
  const { width, height } = Dimensions.get('window');

  const { show } = usePopup(); // 공통 팝업

  const memberBase = useUserInfo(); // 회원 기본정보

  const [emailId, setEmailId] = React.useState<any>(memberBase?.email_id);
  const [nickname, setNickname] = React.useState<any>(memberBase?.nickname);
  const [name, setName] = React.useState<any>(memberBase?.name);
  const [gender, setGender] = React.useState<any>(memberBase?.gender);
  const [age, setAge] = React.useState<any>(String(memberBase?.age));
  const [phoneNumber, setPhoneNumber] = React.useState<any>(
    memberBase?.phone_number
  );
  const [recommender, setRecommender] = React.useState<any>(memberBase?.recommender);


  // 닉네임 변경 유형
  const [nicknameModType, setNicknameModType] = React.useState<any>('NONE');
  const [isNicknameEdit, setIsNicknameEdit] = React.useState<any>(false);
  
  const nicknameModActive = async (type:string) => {
    if(type == 'NONE') {
      setNickname(memberBase?.nickname);
      setIsNicknameEdit(false);
    } else if(type == 'MOD') {
      setIsNicknameEdit(true);
    }

    setNicknameModType(type);
  };

  // ###################################################################### 닉네임 저장 버튼
  const btnSaveNickName = async () => {
    let special_pattern = /[^a-zA-Z0-9ㄱ-힣]/g;

    if(nickname == '' || typeof nickname == 'undefined' || nickname == null || !nickname.trim()) {
			show({ content: '닉네임을 입력해 주세요.' });
			return;
		}

    if(nickname.length > 12 || special_pattern.test(nickname) == true) {
			show({ content: '한글, 영문, 숫자 12글자까지 입력할 수 있어요.' });
			return;
		}

    // 닉네임 변경 여부 체크
    if (memberBase?.nickname == nickname) {
      show({
        title: '알림',
        content: '동일한 닉네임 입니다.',
        confirmCallback: function() {

        },
      });

    } else {
      show({
        title: '닉네임 변경',
        content: '닉네임을 변경하시겠습니까?\n패스 x25',
        cancelCallback: function() {
  
        },
        confirmCallback: function() {
          let dataJson = {
            nickname: nickname,
            comment: '',
            match_yn: '',
            use_pass_yn: 'Y',
            friend_mathch_yn: '',
            recommender: '',
          };

          saveMemberBase(dataJson);
        },
      });
    }
  };

  // ###################################################################### 추천인 저장 버튼
  const btnSaveRecommender = async () => {

    if(!recommender) {
      show({
        title: '알림',
        content: '추천인을 입력해주세요.',
      });
    } else if (memberBase?.nickname == recommender) {
      show({
        title: '알림',
        content: '다른 회원의 닉네임만 추천할 수 있습니다.',
      });
    } else {
      show({
        title: '알림',
        content: '추천인을 등록하시겠습니까?',
        cancelCallback: function() {
  
        },
        confirmCallback: function() {
          let dataJson = {
            nickname: '',
            comment: '',
            match_yn: '',
            use_pass_yn: 'N',
            friend_mathch_yn: '',
            recommender: recommender,
          };
    
          saveMemberBase(dataJson);
        },
      });
    }
  }

	// ###################################################################### 비밀번호 변경 버튼
	const btnChangePassword = async () => {
		navigation.navigate('ChangePassword', {});
	};

  // ###################################################################### 내 계정 정보 저장
  const saveMemberBase = async (dataJson:any) => {
    const body = dataJson;
    try {
      const { success, data } = await update_setting(body);
      if (success) {
        if (data.result_code == '0000' || data.result_code == '0055') {
          dispatch(setPartialPrincipal({
            mbr_base : data.mbr_base
          }));

          //let content = data.result_code == '0055'?'입력하신 추천인이 등록되었습니다.':'저장되었습니다.';
          let content = '저장되었습니다.';

          if(isEmptyData(dataJson.nickname)) {
            content = '닉네임이 변경되었습니다.';
          } else if(isEmptyData(dataJson.recommender)) {
            content = '추천인이 등록되었습니다.';
          }

          show({
            type: 'RESPONSIVE',
            content: content,
          });

          /* navigation.navigate(STACK.TAB, {
            screen: 'Roby',
          }); */

        } else if (data.result_code == '6010') {
          show({ content: '보유 큐브가 부족합니다.' });
          return false;
        } else if (data.result_code == '8005') {
          show({ content: '존재하지 않는 추천인 입니다.' });
          return false;
        } else if (data.result_code == '8006') {
          show({ content: '이미 사용하고 있는 닉네임 입니다.' });
          return false;
        } else {
          show({ content: '오류입니다. 관리자에게 문의해 주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  // ###################################################################### 휴면계정 전환하기
  const btnMemberSleep = async () => {
    show({
			title: '휴면회원 전환',
			content: '휴면회원 전환을 진행하시겠습니까?\n휴면회원 전환 시 보유하고 있는 아이템은 그대로 유지되며,\n상대방에게 회원님에 정보는 노출되지 않습니다.',
			cancelCallback: function() {},
			confirmCallback: function() {
				sleepProc();
			}
		});
  };

  // ###################################################################### 휴면계정 전환하기
  const sleepProc = async () => {
    const { success, data } = await update_member_sleep();
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            dispatch(clearPrincipal());
          break;
          default:
            show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          break;
        }
      
      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      }
  }

  // ################### 팝업 관련 #####################
  const [nickNameUpdatePopup, setNicknameUpdatePopup] = React.useState(false); // 닉네임 변경 팝업

  const logout = async () => {
    console.log('logout');
    // #todo pushtoken 비워줄 로그아웃 api
    // await AsyncStorage.clear();
    //#todo mbr base = > principal reducer
    //navigation.navigate(STACK.AUTH, { screen: ROUTES.LOGIN });

    try {
      const { success, data } = await member_logout();
      if (success) {
        if (data.result_code == '0000') {
          dispatch(clearPrincipal());
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      
    }

  };

  return (
    <>
      <SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="계정 관리" />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
          <SpaceView mb={30}>
            <SpaceView viewStyle={_styles.inputWrap}>
              <SpaceView>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>계정</Text>
                <SpaceView mt={2}>
                  <TextInput
                    value={emailId}
                    editable={false}
                    autoCapitalize={'none'}
                    style={_styles.textInputBox(20)}
                  />
                </SpaceView>
              </SpaceView>
            </SpaceView>
            <SpaceView viewStyle={_styles.inputWrap}>
              <SpaceView>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>전화번호</Text>
                <SpaceView mt={2}>
                  <TextInput
                    value={phoneNumber}
                    editable={false}
                    autoCapitalize={'none'}
                    style={_styles.textInputBox(20)}
                  />
                </SpaceView>
              </SpaceView>
              <SpaceView>
                <TouchableOpacity 
                  onPress={() => {
                    navigation.navigate({
                      name : 'NiceAuth',
                      params : {
                        type : 'HP_MODFY'
                      }
                    });
                  }}
                  style={_styles.btnWrap('#46F66F', 70, 5)}>
                  <Text style={styles.fontStyle('B', 14, '#fff')}>변경</Text>
                </TouchableOpacity>
              </SpaceView>
            </SpaceView>
            <SpaceView viewStyle={_styles.inputWrap}>
              <SpaceView viewStyle={{width: '50%'}}>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>닉네임</Text>
                <SpaceView mt={2}>
                  <TextInput
                    value={nickname}
                    onChangeText={(nickname) => setNickname(nickname)}
                    autoCapitalize={'none'}
                    style={_styles.textInputBox(20)}
                    placeholder={'닉네임을 입력하세요.'}
                    placeholderTextColor={'#606060'}
                    maxLength={20}
                    editable={isNicknameEdit}
                    //caretHidden={true}
                  />
                </SpaceView>
              </SpaceView>
              <SpaceView>
                {nicknameModType == 'NONE' && (
                  <TouchableOpacity 
                    onPress={() => { nicknameModActive('MOD'); }}
                    style={_styles.btnWrap('#44B6E5', 70, 5)}>
                    <Text style={styles.fontStyle('B', 14, '#fff')}>수정</Text>
                  </TouchableOpacity>
                )}
                {nicknameModType == 'MOD' && (
                  <SpaceView viewStyle={layoutStyle.rowCenter}>
                    <TouchableOpacity 
                      onPress={() => { nicknameModActive('NONE'); }}
                      style={[_styles.btnWrap('#FF516F', 70, 5), {marginRight: 8}]}>
                      <Text style={styles.fontStyle('B', 14, '#fff')}>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      onPress={() => { btnSaveNickName(); }}
                      disabled={memberBase?.nickname == nickname}
                      style={_styles.btnWrap(memberBase?.nickname == nickname ? '#808080' : '#46F66F', 70, 5)}>
                      <Text style={styles.fontStyle('B', 14, '#fff')}>저장</Text>
                    </TouchableOpacity>
                  </SpaceView>
                )}
              </SpaceView>
            </SpaceView>
          </SpaceView>

          <SpaceView>
            <SpaceView mb={10}>
              <TouchableOpacity onPress={btnChangePassword} style={_styles.btnWrap('#44B6E5')}>
                <Text style={styles.fontStyle('B', 12, '#fff')}>개인정보 변경 및 관리</Text>
              </TouchableOpacity>
            </SpaceView>
            <SpaceView mb={10}>
              <TouchableOpacity onPress={btnMemberSleep} style={_styles.btnWrap('#44B6E5')}>
                <Text style={styles.fontStyle('B', 12, '#fff')}>휴면회원 전환하기</Text>
              </TouchableOpacity>
            </SpaceView>
            <SpaceView>
              <TouchableOpacity onPress={logout} style={_styles.btnWrap('#44B6E5')}>
                <Text style={styles.fontStyle('B', 12, '#fff')}>로그아웃</Text>
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>
        </ScrollView>
      </SpaceView>
    </>
  );
};

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    backgroundColor: '#16112A',
    paddingHorizontal: 10,
    paddingTop: 30,
  },
  btnWrap: (_color: string, _width: number, _pv: number) => {
		return {
			backgroundColor: _color,
      borderRadius: 25,
      alignItems: 'center',
      paddingVertical: isEmptyData(_pv) ? _pv : 13,
      width: isEmptyData(_width) ? _width : '100%',
    };
	},
  inputWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 10,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textInputBox: (_hegiht: number) => {
		return {
			width: '100%',
			height: _hegiht,
			textAlign: 'left',
			fontFamily: 'Pretendard-SemiBold',
      fontSize: 11,
			color: '#606060',
      padding: 0,
      margin: 0,
    };
	},

});