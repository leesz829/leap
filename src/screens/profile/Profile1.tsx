import { Slider } from '@miblanchard/react-native-slider';
import { RouteProp, useIsFocused, useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { get_member_profile_info, insert_member_image, update_member_image, delete_member_image, save_profile_info } from 'api/models';
import CommonHeader from 'component/CommonHeader';
import ProfileAuth from 'component/match/ProfileAuth';
import { usePopup } from 'Context';
import { commonStyle, layoutStyle, styles, modalStyle } from 'assets/styles/Styles';
import { useProfileImg } from 'hooks/useProfileImg';
import { useSecondAth } from 'hooks/useSecondAth';
import React, { useEffect, useMemo, useState, useRef  } from 'react';
import { Modalize } from 'react-native-modalize';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View, TextInput, TouchableWithoutFeedback, Keyboard, Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import ReactNativeModal from 'react-native-modal';
import { findSourcePath, findSourcePathLocal, ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import { useDispatch } from 'react-redux';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { STACK, ROUTES } from 'constants/routes';
import { SUCCESS } from 'constants/reusltcode';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonLoading } from 'component/CommonLoading';
import SpaceView from 'component/SpaceView';
import LinearGradient from 'react-native-linear-gradient';
import Modal from 'react-native-modal';
import { isEmptyData, imagePickerOpen } from 'utils/functions';
import MemberIntro from 'component/match/MemberIntro';
import InterviewRender from 'component/match/InterviewRender';
import InterestRender from 'component/match/InterestRender';
import IntroduceRender from 'component/match/IntroduceRender';
import ImageComponent from 'component/profile/ImageComponent';
import AuthComponent from 'component/profile/AuthComponent';
import ProfileComponent from 'component/profile/ProfileComponent';


const { width, height } = Dimensions.get('window');

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Profile1'>;
  route: RouteProp<StackParamList, 'Profile1'>;
}

export const Profile1 = (props: Props) => {
  const { show } = usePopup(); // 공통 팝업
  const isFocus = useIsFocused();
  const secondAuth = useSecondAth();
  const myImages = useProfileImg();
  const dispatch = useDispatch();
  const navigation = useNavigation<ScreenNavigationProp>();
  const scrollViewRef = useRef();
  const [isLoading, setIsLoading] = useState(false);
  const memberBase = useUserInfo();

  const [isOnShrink, setIsOnShrink] = React.useState(false); // 쉬링크 상태 변수

  const [currentImgIdx, setCurrentImgIdx] = React.useState(0); // 현재 이미지 인덱스
  const [profileImageList, setProfileImageList] = React.useState([]); // 프로필 이미지 목록

  const [comment, setComment] = React.useState(memberBase?.comment); // 한줄 소개
  const [introduceComment, setIntroduceComment] = React.useState(memberBase?.introduce_comment); // 프로필 소개

  // ############################################################################# 사진 관리 컨트롤 변수
  const [imgMngData, setImgMngData] = React.useState<any>({
    member_img_seq: 0,
    img_file_path: '',
    order_seq: '',
    status: '',
    return_reason: '',
  });

  // 회원 관련 데이터
  const [profileData, setProfileData] = useState<any>({
    member_info: {},
    member_add: {},
    profile_img_list: [],
    second_auth_list: [],
    interview_list: [],
    interest_list: [],
    auth_percent: '',
    interview_apply_list: [],
  });

  // 인터뷰 데이터
  const [interviewData, setInterviewData] = useState([]);

  // 관심사 목록
	const [intList, setIntList] = React.useState([]);

  // 관심사 체크 목록
	const [checkIntList, setCheckIntList] = React.useState([{code_name: "", common_code: "", interest_seq: ""}]);

  // ############################################################  프로필 데이터 조회
  const getMemberProfileData = async () => {
    setIsLoading(true);

    try {
      const { success, data } = await get_member_profile_info();
      if (success) {
        const auth_list = data?.mbr_second_auth_list.filter(item => item.auth_status == 'ACCEPT');
        const interviewApplyList = data?.mbr_interview_list.filter(item => item.use_yn == 'Y' && isEmptyData(item?.answer));

        setProfileData({
            member_info: data?.mbr_base,
            member_add: data?.mbr_add,
            profile_img_list: data?.mbr_img_list,
            second_auth_list: auth_list,
            interview_list: data?.mbr_interview_list,
            interest_list: data?.mbr_interest_list,
            auth_percent: data?.auth_percent,
            interview_apply_list: interviewApplyList,
        });

        setProfileImageList(data?.mbr_img_list);

        dispatch(setPartialPrincipal({
          mbr_base: data?.mbr_base,
          mbr_img_list: data.mbr_img_list,
          mbr_interview_list: data.mbr_interview_list,
          mbr_second_auth_list: data.mbr_second_auth_list,
        }));

        //setComment(data?.mbr_base?.comment);
        //setIntroduceComment(data?.member_add?.introduce_comment);

      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ############################################################################# 사진 추가
  const imgAddProc = React.useCallback(async (index: number) => {
    imagePickerOpen(function(path:any, data:any) {
      let _data = {
        member_img_seq: 0,
        img_file_path: path,
        order_seq: index,
        org_order_seq: index,
        del_yn: 'N',
        status: 'PROGRESS',
        return_reason: '',
        file_base64: data,
      };
  
      setProfileImageList((prev) => {
        return [...prev, _data];
      });
    });
   }, []);

   // ############################################################################# 사진 변경
   const imgModifyProc = React.useCallback(async (imgData: any, index:number) => {
    imagePickerOpen(function(path:any, data:any) {
      imgDeleteProc(imgData);

      let _data = {
        member_img_seq: 0,
        img_file_path: path,
        order_seq: index,
        org_order_seq: index,
        del_yn: 'N',
        status: 'PROGRESS',
        return_reason: '',
        file_base64: data,
      };
  
      setProfileImageList((prev) => {
        return [...prev, _data];
      });
    });    
   }, []);

  // ############################################################################# 사진 삭제
  const imgDeleteProc = React.useCallback(async (imgData: any) => {
    if(isEmptyData(imgData?.member_img_seq)) {
      setProfileImageList((prev) => {
        return prev.map((item) => item.member_img_seq === imgData?.member_img_seq 
          ? { ...item, del_yn: 'Y' }
          : item
        );
      });
    } else {
      setProfileImageList(prev => prev.filter(item => item.order_seq != imgData?.order_seq))
    }

  }, []);

  // ############################################################################# 프로필 정보 저장
  const saveProfileInfo = async () => {
    setIsLoading(true);

    const body = {
      img_list : profileImageList,
      comment: comment,
      introduce_comment: introduceComment,
    };
    
    try {
      const { success, data } = await save_profile_info(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            getMemberProfileData();
            show({ type: 'RESPONSIVE', content: '프로필 정보가 저장되었습니다.' });

            break;
          default:
            show({ content: '오류입니다. 관리자에게 문의해주세요.' });
            break;
        }
      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ############################################################################# 스크롤 이동 함수
  const handleScroll = (event) => {
    let contentOffset = event.nativeEvent.contentOffset;
    if(contentOffset.y > 10) {
      setIsOnShrink(true);
    } else {
      setIsOnShrink(false);
    }
  };

  useEffect(() => {
    if(isFocus) {
      getMemberProfileData();
      //getMemberInterestData();
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>

        <SpaceView mt={isOnShrink ? 10 : 30} mb={isOnShrink ? 10 : 0}>
          <CommonHeader title="프로필 관리" isOnShrink={isOnShrink} />
        </SpaceView>

        {/* <SpaceView mt={isOnShrink ? 0 : 15} viewStyle={{height: isOnShrink ? 30 : 50}}>
          <TouchableOpacity
            onPress={() => { navigation.goBack(); }}
            style={_styles.backContainer}
            hitSlop={commonStyle.hipSlop20}
          >
            <Image source={ICON.backBtnType01} style={styles.iconSquareSize(35)} resizeMode={'contain'} />
          </TouchableOpacity>

          <SpaceView viewStyle={{width: width, alignItems: 'center'}}>
            <Text style={styles.fontStyle('H', isOnShrink ? 20 : 26, '#fff')}>프로필 관리</Text>
          </SpaceView>
        </SpaceView> */}

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1}} onScroll={handleScroll} scrollEventThrottle={16}>

          {/* ############################################################################################################# 프로필 이미지 영역 */}
          <SpaceView mt={15} mb={40} viewStyle={_styles.contentWrap}>
            <ImageComponent 
              //dataList={profileData.profile_img_list} 
              dataList={profileImageList}
              addFn={imgAddProc}
              modifyFn={imgModifyProc}
              deleteFn={imgDeleteProc}
            />
          </SpaceView>

          {/* ############################################################################################################# 메시지 영역 */}
          <SpaceView mb={30}>
            <LinearGradient
              colors={['rgba(65,25,104,0.5)', 'rgba(59,95,212,0.5)']}
              start={{ x: 0, y: 0.1 }}
              end={{ x: 0.8, y: 1 }}
              //useAngle={true}
              //locations={[1, 0.2, 0.8]}
              style={_styles.containerWrap}
            >
              <SpaceView>
                <Text style={styles.fontStyle('EB', 20, '#fff')}>프로필 메시지</Text>
                <SpaceView mt={10}><Text style={styles.fontStyle('SB', 12, '#fff')}>한줄소개로 간단한 프로필 인사말을, 프로필 소개로 확실하게 프로필 작성</Text></SpaceView>
              </SpaceView>

              <SpaceView mt={30}>
                <Text style={styles.fontStyle('EB', 20, '#fff')}>한줄 소개</Text>
                <SpaceView mt={10}>
                  <TextInput
                    value={comment}
                    onChangeText={(text) => setComment(text)}
                    autoCapitalize={'none'}
                    multiline={true}
                    numberOfLines={2}
                    style={_styles.textInputBox(40)}
                    placeholder={'한줄 소개 입력'}
                    placeholderTextColor={'#808080'}
                    maxLength={30}
                    //caretHidden={true}
                    textAlignVertical={'top'}
                    textAlign={'left'}
                  />
                </SpaceView>
              </SpaceView>

              <SpaceView mt={20}>
                <Text style={styles.fontStyle('EB', 20, '#fff')}>프로필 소개</Text>
                <SpaceView mt={10}>
                  <TextInput
                    value={introduceComment}
                    onChangeText={(text) => setIntroduceComment(text)}
                    autoCapitalize={'none'}
                    multiline={true}
                    numberOfLines={6}
                    style={_styles.textInputBox(110)}
                    placeholder={'프로필 소개 입력'}
                    placeholderTextColor={'#808080'}
                    maxLength={300}
                    //caretHidden={true}
                    textAlignVertical={'top'}
                    textAlign={'left'}
                  />
                </SpaceView>
              </SpaceView>
            </LinearGradient>

            {/* <MemberIntro 
              addData={profileData?.member_add}
              faceModifier={profileData?.member_info?.face_modifier}
              nickname={profileData?.member_info?.nickname}
              gender={profileData?.member_info?.gender}
              isEditBtn={true} /> */}
          </SpaceView>

          {/* ############################################################################################################# 멤버쉽 인증 영역 */}
          <SpaceView mb={30}>
            <AuthComponent dataList={profileData.second_auth_list} authPercent={profileData.auth_percent} />
            {/* <IntroduceRender 
              memberData={profileData?.member_info} 
              isEdit={true}
              comment={profileData?.member_add.introduce_comment} /> */}
          </SpaceView>

          {/* ############################################################################################################# 프로필 정보 영역 */}
          <SpaceView mb={130}>
            <ProfileComponent 
              data={profileData?.member_add} 
              authPercent={profileData.auth_percent} 
              interestCnt={profileData.interest_list.length} 
              interviewCnt={profileData.interview_apply_list.length}
            />
            {/* {profileData.second_auth_list.length > 0 && (
              <ProfileAuth 
                data={profileData.second_auth_list} 
                isEditBtn={true} 
                memberData={profileData?.member_info} />
            )} */}
          </SpaceView>

          {/* ############################################################################################################# 인터뷰 영역 */}
          {/* {profileData.interview_list.length > 0 && (
            <SpaceView pl={15} pr={15} mb={35}>
              <InterviewRender 
                title={memberBase?.nickname + '에 대한 필독서'} 
                isEdit={true}
                dataList={profileData.interview_list} />
            </SpaceView>
          )} */}

          {/* ############################################################################################################# 관심사 영역 */}
          {/* <SpaceView pl={15} pr={15} mb={40}>
            <InterestRender 
              memberData={profileData?.member_info} 
              isEditBtn={true}
              interestList={profileData.interest_list} />
          </SpaceView> */}

        </ScrollView>
      </SpaceView>

      <TouchableOpacity 
        style={_styles.saveBtnWrap}
        onPress={() => {
          saveProfileInfo();
        }}>
        <Image source={ICON.saveIcon} style={styles.iconSquareSize(15)} />
        <SpaceView ml={5} mb={3}><Text style={styles.fontStyle('B', 16, '#fff')}>저장하기</Text></SpaceView>
      </TouchableOpacity>
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
    backgroundColor: '#13111C',
    paddingHorizontal: 10,
  },
  backContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    justifyContent: 'center',
    zIndex: 1,
  },
  contentWrap: {
    /* flexDirection: 'row',
    justifyContent: 'space-between', */
  },
  containerWrap: {
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingTop: 30,
    paddingBottom: 20,
    overflow: 'hidden',
  },
  textInputBox: (_hegiht: number) => {
		return {
			width: '100%',
			height: _hegiht,
			backgroundColor: 'rgba(128,128,128,0.5)',
			borderRadius: 5,
			textAlign: 'center',
			fontFamily: 'Pretendard-Light',
			color: '#fff',
      paddingVertical: 10,
      paddingHorizontal: 10,
    };
	},
  saveBtnWrap: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: '#46F66F',
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    paddingHorizontal: 25,
  },


});