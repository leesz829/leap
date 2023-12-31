import { layoutStyle, styles, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { IMAGE, PROFILE_IMAGE, ICON, findSourcePathLocal } from 'utils/imageUtils';
import { RouteProp, useNavigation, useIsFocused, CommonActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { findSourcePath } from 'utils/imageUtils';
import { ROUTES } from 'constants/routes';
import { get_member_approval, join_cancel } from 'api/models';
import { usePopup } from 'Context';
import { isEmptyData } from 'utils/functions';
import { SUCCESS } from 'constants/reusltcode';
import LinearGradient from 'react-native-linear-gradient';
import { get_profile_imgage_guide, regist_profile_image, delete_profile_image, update_join_master_image } from 'api/models';


interface Props {
  navigation: StackNavigationProp<StackParamList, 'Approval'>;
  route: RouteProp<StackParamList, 'Approval'>;
}

const { width, height } = Dimensions.get('window');

export const Approval = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const { show } = usePopup();
  const isFocus = useIsFocused();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const memberSeq = props.route.params.memberSeq;         // 회원 번호

  // 심사 데이터
  const [apprData, setApprData] = React.useState({
    result_code: '',
    refuseImgCnt: 0,
    refuseAuthCnt: 0,
    authList: [],
    gender: '',
    mstImgPath: '',
    ci: '',
    name: '',
    mobile: '',
    birthday: '',
    emailId: '',
    nickname: '',
  });

  // ############################################################ 가입심사 정보 조회
  const getApprovalInfo = async () => {
    const body = {
      member_seq : memberSeq
    };
    const { success, data } = await get_member_approval(body);
      if(success) {
        if(isEmptyData(data.mbr_base)) {
          setApprData({
            ...apprData,
            result_code: data.result_code,
            refuseImgCnt: data.refuse_img_cnt,
            refuseAuthCnt: data.refuse_auth_cnt,
            authList: data.mbr_second_auth_list,
            gender: data.mbr_base.gender,
            mstImgPath: data.mbr_base.mst_img_path,
            ci: data.mbr_base.ci,
            name: data.mbr_base.name,
            mobile: data.mbr_base.phone_number,
            birthday: data.mbr_base.birthday,
            emailId: data.mbr_base.email_id,
            nickname: data.mbr_base.nickname,
          });
        };
      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      }
  };


  // 반려 사유 데이터
  const getRefuseData = function() {
    let code = 'IMAGE';
    let text = '';
    /* if(accessType === 'REFUSE') {
      if(refuseImgCnt > 0 && refuseAuthCnt > 0) {
        code = 'ALL';
        text += '프로필 사진, 프로필 인증';
      } else if(refuseImgCnt > 0) {
        code = 'IMAGE';
        text += '프로필 사진';
      } else if(refuseAuthCnt > 0) {
        code = 'AUTH';
        text += '프로필 인증';
      }
    } */

    if(apprData.refuseImgCnt > 0 && apprData.refuseAuthCnt > 0) {
      code = 'ALL';
      text += '프로필 사진, 프로필 인증';
    } else if(apprData.refuseImgCnt > 0) {
      code = 'IMAGE';
      text += '프로필 사진';
    } else if(apprData.refuseAuthCnt > 0) {
      code = 'AUTH';
      text += '프로필 인증';
    }

    return {code : code, text: text};
  };

  // ########################################################################## 수정하기 버튼
  const modifyBtn = async () => {

    // 반려인 경우 구분
    /* if(apprData.result_code == '0003') {
      if(apprData.refuseAuthCnt > 0) {
        goJoin('01');
      } else if(apprData.refuseImgCnt > 0) {
        goJoin('02');
      }
    } else {
      goJoin('01');
    }; */

    goJoin();
  };

  // ########################################################################## 탈퇴하기 버튼
  const exitBtn = async () => {
    show({
			title: '회원 탈퇴',
			content: '회원 탈퇴는 24시간 뒤 완료 처리되며, 암호화된\n모든 개인정보는 자동으로 폐기됩니다.\n단, 24시간 이내에 로그인 시 회원 탈퇴는 자동 철회됩니다.',
      cancelBtnText: '취소하기',
			cancelCallback: function() {},
			confirmCallback: function() {
				exitProc();
			}
		});
  };

  // ########################################################################## 회원가입 이동
  const goJoin = async (status:string) => {

    /* navigation.navigate(ROUTES.SIGNUP_IMAGE, {
      memberSeq: memberSeq,
      gender: apprData.gender,
    }); */


    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: ROUTES.LOGIN01 },
          { name: ROUTES.APPROVAL , params: { memberSeq: memberSeq, }},
          { name: ROUTES.SIGNUP_PASSWORD, params: { ci: apprData.ci, name: apprData.name, gender: apprData.gender, mobile: apprData.mobile, birthday: apprData.birthday, memberSeq: memberSeq, emailId: apprData.emailId }},
        ],
      })
    );

    /* navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: ROUTES.LOGIN01 },
          { name: ROUTES.APPROVAL , params: { memberSeq: memberSeq, }},
          { name: ROUTES.SIGNUP_PASSWORD, params: { ci: apprData.ci, name: apprData.name, gender: apprData.gender, mobile: apprData.mobile, birthday: apprData.birthday, memberSeq: memberSeq, emailId: apprData.emailId }},
          { name: ROUTES.SIGNUP_IMAGE, params: { memberSeq: memberSeq, gender: apprData.gender, }},
          { name: ROUTES.SIGNUP_NICKNAME, params: { memberSeq: memberSeq, gender: apprData.gender, mstImgPath: apprData.mstImgPath, nickname: apprData.nickname }},
          { name: ROUTES.SIGNUP_ADDINFO, params: { memberSeq: memberSeq, gender: apprData.gender, mstImgPath: apprData.mstImgPath, nickname: apprData.nickname }},
          { name: ROUTES.SIGNUP_INTEREST, params: { memberSeq: memberSeq, gender: apprData.gender, nickname: apprData.nickname }},
          { name: ROUTES.SIGNUP_INTRODUCE, params: { memberSeq: memberSeq, gender: apprData.gender, nickname: apprData.nickname }},
          { name: ROUTES.SIGNUP_AUTH, params: { memberSeq: memberSeq, gender: apprData.gender, mstImgPath: apprData.mstImgPath, nickname: apprData.nickname }},
        ],
      })
    ); */


    return;

    if(status == '01') {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Login01' },
            { 
              name: ROUTES.APPROVAL ,
              params: {
                memberSeq: memberSeq,
              }
            },
            {
              name: ROUTES.SIGNUP_PASSWORD,
              params: {
                ci: apprData.ci,
                name: apprData.name,
                gender: apprData.gender,
                mobile: apprData.mobile,
                birthday: apprData.birthday,
                memberSeq: memberSeq,
                emailId: apprData.emailId
              }
            },
            {
              name: ROUTES.SIGNUP01,
              params: {
                memberSeq: memberSeq,
                gender: apprData.gender,
              }
            },
          ],
        })
      );
    } else if(status == '02') {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Login01' },
            { 
              name: ROUTES.APPROVAL ,
              params: {
                memberSeq: memberSeq,
              }
            },
            {
              name: ROUTES.SIGNUP_PASSWORD,
              params: {
                ci: apprData.ci,
                name: apprData.name,
                gender: apprData.gender,
                mobile: apprData.mobile,
                birthday: apprData.birthday,
                memberSeq: memberSeq,
                emailId: apprData.emailId
              }
            },
            {
              name: ROUTES.SIGNUP01,
              params: {
                memberSeq: memberSeq,
                gender: apprData.gender,
              }
            },
            {
              name: ROUTES.SIGNUP02,
              params: {
                memberSeq: memberSeq,
                gender: apprData.gender,
              }
            },
          ],
        })
      );
    }
  };

  // ########################################################################## 탈퇴 처리
  const exitProc = async () => {
    const body = {
      member_seq : memberSeq,
    };
    const { success, data } = await join_cancel(body);
    if(success) {
      navigation.dispatch(
        CommonActions.reset({
          index: 1,
          routes: [
            { name: 'Login01' },
          ],
        })
      );
    } else {
      show({ content: '오류입니다. 관리자에게 문의해주세요.' });
    }
  };

  // ########################################################################## 초기 실행
  React.useEffect(() => {
    if(isFocus) {
      getApprovalInfo();
    };

  }, [isFocus]);

  return (
    <>
      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <SpaceView mt={20}>
            <Text style={_styles.title}>가입 심사 진행중</Text>
              <View style={{marginTop: 10}}>
                <Text style={_styles.subTitle}>심사 기간은 1 ~ 3일이며,{'\n'}결과는 PUSH 메세지로 전송됩니다.</Text>
              </View>
          </SpaceView>

          <SpaceView viewStyle={_styles.imgContainer}>
              <Image
                resizeMode="cover"
                resizeMethod="scale"
                style={_styles.profileImg}
                source={findSourcePathLocal(apprData.mstImgPath)}
              />
          </SpaceView>

          {(apprData.refuseImgCnt > 0 || (apprData.refuseAuthCnt > 0)) && (
            <>
              <SpaceView mt={30}>
                <View style={_styles.refNoticeContainer}>
                  <Image source={ICON.commentRed} style={styles.iconSize16} />
                  <Text style={_styles.refNoticeText}>반려사유 안내</Text>
                </View>
                <View style={_styles.refuseBox}>
                  <Text style={_styles.refBoxText}>가입 기준에 맞지 않거나 증빙 자료가 불충분한 대상이 있어요. '프로필 수정하기' 누르고 반려 내용을 확인해주세요.</Text>
                </View>
              </SpaceView>
            </>
          )}

          {/* {(apprData.refuseImgCnt > 0 || (apprData.refuseAuthCnt > 0)) && (
            <>
              <SpaceView mt={30}>
                <View style={_styles.refNoticeContainer}>
                  <Image source={ICON.commentRed} style={styles.iconSize16} />
                  <Text style={_styles.refNoticeText}>반려사유 안내</Text>
                </View>
                <View style={_styles.refuseBox}>
                  <Text style={_styles.refBoxText}>가입 기준에 맞지 않거나 증빙 자료가 불충분한 대상이 있어요. '프로필 수정하기' 누르고 반려 내용을 확인해주세요.</Text>
                </View>
              </SpaceView>
            </>
          )} */}

          <SpaceView viewStyle={_styles.btnContainer}>
            <TouchableOpacity style={_styles.exitBtnContainer} onPress={() => { exitBtn(); }}>
              <Text style={_styles.exitBtn}>가입철회</Text>
            </TouchableOpacity>
            <TouchableOpacity style={_styles.modBtnContainer} onPress={() => { modifyBtn(); }}>
              <Text style={_styles.modBtn}>프로필 수정하기</Text>
            </TouchableOpacity>
          </SpaceView>
        </ScrollView>
      </LinearGradient>      
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
		minHeight: height,
		padding: 30,
	},
	title: {
		fontSize: 30,
		fontFamily: 'Pretendard-Bold',
		color: '#D5CD9E',
	},
  subTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 19,
    color: '#E1DFD1',
  },
  imgContainer: {
    width: 230,
    height: 350,
    borderRadius: 50,
    backgroundColor: '#FFF',
    marginLeft: 'auto',
    marginTop: 10,
    overflow: 'hidden',
  },
  profileImg: {
    width: 230,
    height: 350,
  },
  refNoticeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refNoticeText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 15,
    marginLeft: 5,
    color: '#FF4D29',
  },
  refuseBox: {
    width: '100%',
    backgroundColor: '#445561',
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refBoxText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 13,
    color: '#FFFDEC',
    textAlign: 'center',
  },
  btnContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 50,
  },
  modBtnContainer: {
    width: '62%',
    height: 40,
    backgroundColor: '#FFDD00',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  modBtn: {
    fontFamily: 'Pretendard-Regular',
    color: '#3D4348',
  },
  exitBtnContainer: {
    width: '35%',
    height: 40,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  },
  exitBtn: {
    fontFamily: 'Pretendard-Regular',
    color: '#FF4D29',
  },
});