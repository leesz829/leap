import { layoutStyle, styles, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import * as React from 'react';
import { View, Image, StyleSheet, ScrollView, TouchableOpacity, Text, Dimensions } from 'react-native';
import { IMAGE, ICON, findSourcePathLocal } from 'utils/imageUtils';
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
          { name: ROUTES.LOGIN },
          { name: ROUTES.APPROVAL , params: { memberSeq: memberSeq, }},
          { name: ROUTES.SIGNUP_PASSWORD, params: { ci: apprData.ci, name: apprData.name, gender: apprData.gender, mobile: apprData.mobile, birthday: apprData.birthday, memberSeq: memberSeq, emailId: apprData.emailId }},
        ],
      })
    );

    /* navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: ROUTES.LOGIN },
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
      <SpaceView viewStyle={_styles.wrap}>
        <SpaceView>
          <Image source={ICON.join_bg} style={styles.iconNoSquareSize('100%', '100%')} />
        </SpaceView>

        <ScrollView horizontal={false} showsVerticalScrollIndicator={false} style={_styles.bodyWrap}>

          {/* ############################################################### 타이틀 */}
          <SpaceView mt={65}>
            <SpaceView>
              <Text style={[styles.fontStyle('H', 22, '#fff'), {textAlign: 'center'}]}>LEAP</Text>
            </SpaceView>
            <SpaceView mt={45}>
              <Text style={[styles.fontStyle('H', 28, '#fff'), {textAlign: 'left'}]}>가입 심사 진행 중</Text>
            </SpaceView>
            <SpaceView mt={15}>
              <Text style={[styles.fontStyle('SB', 12, '#fff'), {textAlign: 'left'}]}>심사 기간은 1~3일이며, 결과는 PUSH로 메시지로 전송됩니다.</Text>
            </SpaceView>
          </SpaceView>

          <SpaceView mt={70} viewStyle={layoutStyle.alignCenter}>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={[styles.iconSquareSize(120), _styles.imgWrap]}
              //source={findSourcePath(apprData.mstImgPath)}
              source={IMAGE.storySecretFemale}
            />
          </SpaceView>

          {(apprData.refuseImgCnt > 0 || (apprData.refuseAuthCnt > 0)) && (
            <SpaceView mt={40} pl={13} pr={13}>
              <SpaceView viewStyle={layoutStyle.rowStart}>
                <Image source={ICON.join_exclamation} style={styles.iconSquareSize(17)} />
                <SpaceView ml={5}>
                  <Text style={styles.fontStyle('B', 14, '#fff')}>반려 사유 안내</Text>
                </SpaceView>
              </SpaceView>
              <SpaceView mt={10} viewStyle={_styles.refuseWrap}>
                <Text style={[styles.fontStyle('SB', 12, '#fff'), {textAlign: 'center'}]}>반려 사유 안내{'\n'}반려 사유 안내{'\n'}반려 사유 안내{'\n'}반려 사유 안내{'\n'}반려 사유 안내{'\n'}</Text>
              </SpaceView>
            </SpaceView>
          )}

          <SpaceView mt={30} viewStyle={layoutStyle.alignCenter}>
            <TouchableOpacity style={_styles.modBtnWrap} onPress={() => { modifyBtn(); }}>
              <Text style={[styles.fontStyle('B', 20, '#fff'), {textAlign: 'center'}]}>프로필 수정하기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={_styles.cancelBtnWrap} onPress={() => { exitBtn(); }}>
              <Text style={[styles.fontStyle('B', 20, '#fff'), {textAlign: 'center'}]}>가입철회</Text>
            </TouchableOpacity>
          </SpaceView>

          <SpaceView mt={20} mb={50}>
            <Text style={[styles.fontStyle('SB', 10, '#CBCBCB'), {textAlign: 'center'}]}>
              리프(LEAP)는 회원가입 절차에 직업 또는 학력 등의  인증이 필요합니다.{'\n'}
              이는 피싱, 폭력으로부터 안전한 SNS 환경을 제공하기 위한 목적으로 활용됩니다.{'\n'}
              제공받은 소중한 개인정보는 인증 과정동안 암호화 처리되어 관리되며 인증 심사{'\n'}
              종료 후 인증 심사 이력만 남고 개인 정보는 모두 삭제됩니다.
            </Text>
          </SpaceView>

        </ScrollView>
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
		minHeight: height,
	},
  bodyWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingHorizontal: 10,
    height: height,
  },
  imgWrap: {
    borderRadius: 60,
  },
  refuseWrap: {
    borderWidth: 1,
    borderColor: 'rgba(203,203,203,0.5)',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 19,
  },
  modBtnWrap: {
    backgroundColor: '#1F5AFB',
    borderRadius: 25,
    paddingVertical: 13,
    width: 280,
    marginBottom: 10,
  },
  cancelBtnWrap: {
    backgroundColor: '#000000',
    borderRadius: 25,
    paddingVertical: 13,
    width: 280,
  },
});