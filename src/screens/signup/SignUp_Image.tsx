import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import React, { useRef } from 'react';
import { View, ScrollView, Image, TouchableOpacity, StyleSheet, Dimensions, Text } from 'react-native';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ICON, IMAGE, findSourcePath, findSourcePathLocal } from 'utils/imageUtils';
import { Modalize } from 'react-native-modalize';
import { usePopup } from 'Context';
import { get_profile_imgage_guide, join_save_profile_image, update_join_master_image } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { ROUTES } from 'constants/routes';
import { CommonLoading } from 'component/CommonLoading';
import { isEmptyData, imagePickerOpen } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import { CommonImagePicker } from 'component/CommonImagePicker';
import CommonHeader from 'component/CommonHeader';



/* ################################################################################################################
###################################################################################################################
###### 회원가입 - 프로필 사진
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'SignUp_Image'>;
  route: RouteProp<StackParamList, 'SignUp_Image'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Image = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const isFocus = useIsFocused();
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const memberSeq = props.route.params?.memberSeq; // 회원 번호
  const gender = props.route.params?.gender; // 성별

  const [currentImgIdx, setCurrentImgIdx] = React.useState(0); // 현재 이미지 인덱스
  const [profileImageList, setProfileImageList] = React.useState([]); // 프로필 이미지 목록

  // 프로필 이미지 삭제 시퀀스 문자열
  const [imgDelSeqStr, setImgDelSeqStr] = React.useState('');

  // ############################################################################# 사진 삭제
  const imageDelete = async (imgData: any, orderSeq: any) => {
    // 프로필 이미지 목록 재구성
    let _profileImgList:any = [];
    profileImageList.map((item, index) => {
      if(index+1 != orderSeq) {
        _profileImgList.push(item);
      }
    });
    _profileImgList.map((item, index) => {
      item.order_seq = index+1;
    });
    setProfileImageList(_profileImgList);

    // 삭제 데이터 저장
    if(isEmptyData(imgData.member_img_seq) && 0 != imgData.member_img_seq) {
      let delArr = imgDelSeqStr;
      if (delArr == '') {
        delArr = imgData.member_img_seq;
      } else {
        delArr = delArr + ',' + imgData.member_img_seq;
      }

      setImgDelSeqStr(delArr);
    }
  };

  // ############################################################################# 사진 선택
  const imgSelected = (idx:number, isNew:boolean) => {
    imagePickerOpen(function(path:any, data:any) {
      let _data = {
        member_img_seq: 0,
        img_file_path: path,
        order_seq: profileImageList.length+1,
        org_order_seq: profileImageList.length+1,
        del_yn: 'N',
        status: 'PROGRESS',
        return_reason: '',
        file_base64: data,
      };

      setProfileImageList((prev) => {
        return [...prev, _data];
      });
    });
  }

  // ############################################################################# 사진 변경
  /* const imgModfyProc = () => {
    imagePickerOpen(function(path:any, data:any) {

      // 삭제 데이터 저장
      if(isEmptyData(imgMngData.member_img_seq) && 0 != imgMngData.member_img_seq) {
        let delArr = imgDelSeqStr;
        if (delArr == '') {
          delArr = imgMngData.member_img_seq;
        } else {
          delArr = delArr + ',' + imgMngData.member_img_seq;
        }
        setImgDelSeqStr(delArr);
      }

      // 목록 재구성
      setProfileImageList((prev) => {
        const dupChk = prev.some(item => item.order_seq === imgMngData.order_seq);
        if(dupChk) {
          return prev.map((item) => item.order_seq === imgMngData.order_seq 
              ? { ...item, img_file_path: path, file_base64: data, status: 'PROGRESS' }
              : item
          );
        }
      });

      // 모달 닫기
      imgMng_onClose();
    });
  }; */

  // ############################################################################# 프로필 이미지 정보 조회
  const getProfileImage = async () => {
    const body = {
      member_seq: props.route.params.memberSeq,
    };
    try {
      const { success, data } = await get_profile_imgage_guide(body);
      if (success) {
        switch (data.result_code) {
          case SUCCESS:
            if(isEmptyData(data.imgList)) {
              let _profileImgList:any = [];
              data?.imgList?.map((item, index) => {
                let data = {
                  member_img_seq: item.member_img_seq,
                  img_file_path: item.img_file_path,
                  order_seq: index+1,
                  org_order_seq: item.org_order_seq,
                  del_yn: 'N',
                  status: item.status,
                  return_reason: item.return_reason,
                  file_base64: null,
                };                
                _profileImgList.push(data);
              });

              setProfileImageList(_profileImgList);
            }

            break;
          default:
            show({
              content: '오류입니다. 관리자에게 문의해주세요.',
              confirmCallback: function () {},
            });
            break;
        }
      } else {
        show({
          content: '오류입니다. 관리자에게 문의해주세요.',
          confirmCallback: function () {},
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ############################################################################# 프로필 이미지 저장
  const saveProfileImage = async () => {

    let tmpCnt = 0;
    profileImageList.map((item, index) => {
      if(item.status != 'REFUSE') {
        tmpCnt++;
      }
    });

    /* if(tmpCnt < 3) {
      show({ content: '프로필 사진은 얼굴이 선명하게 나온 사진을\n포함하여 최소3장이 등록 되어야 합니다.' });
      return;
    }; */

    //return;

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      const body = {
        member_seq: memberSeq,
        file_list: profileImageList,
        img_del_seq_str: imgDelSeqStr,
      };
      try {
        const { success, data } = await join_save_profile_image(body);
        if (success) {
          switch (data.result_code) {
            case SUCCESS:
              navigation.navigate(ROUTES.SIGNUP_NICKNAME, {
                memberSeq: memberSeq,
                gender: gender,
                mstImgPath: data.mst_img_path,
              });
              break;
            default:
              show({
                content: '오류입니다. 관리자에게 문의해주세요.',
                confirmCallback: function () {},
              });
              break;
          }
        } else {
          show({
            content: '오류입니다. 관리자에게 문의해주세요.',
            confirmCallback: function () {},
          });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      };
    }
  };

  // ############################################################  대표 사진 설정
  const updateMasterImage = async () => {
    const body = {
      member_seq: props.route.params.memberSeq,
      //member_img_seq: imgMngData.member_img_seq
    };

    setIsLoading(true);

    try {
      const { success, data } = await update_join_master_image(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            //imgDel_onClose();
            getProfileImage();

            show({
              type: 'RESPONSIVE',
              content: '대표사진이 변경되었어요.',
            });

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

  // ############################################################################# 최초 실행
  React.useEffect(() => {
    setProfileImageList([]);
    setCurrentImgIdx(0);
    setImgDelSeqStr('');
    getProfileImage();
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>
        <SpaceView>

          {/* ########################################################################################## HEADER */}
          <SpaceView>
            <CommonHeader title="" />
          </SpaceView>

          <SpaceView viewStyle={{justifyContent: 'space-between'}}>
            <SpaceView>
              <SpaceView mt={50}>
                <Text style={styles.fontStyle('H', 28, '#fff')}>프로필 사진을 등록해 주세요.</Text>
                <SpaceView mt={10}>
                  <Text style={styles.fontStyle('SB', 12, '#fff')}>얼굴이 가려지지 않은 셀카 1장이 포함되어야 가입 심사가 진행됩니다.</Text>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={50} viewStyle={_styles.contentWrap}>
                {[0,1,2,3,4,5].map((i, index) => {
                  return (
                    <>
                      {index == 0 && <ProfileImageItem index={index} imgData={profileImageList.length > 0 ? profileImageList[0] : null} delFn={imageDelete} imgSelectedFn={imgSelected}  /> }
                      {index == 1 && <ProfileImageItem index={index} imgData={profileImageList.length > 1 ? profileImageList[1] : null} delFn={imageDelete} imgSelectedFn={imgSelected}  /> }
                      {index == 2 && <ProfileImageItem index={index} imgData={profileImageList.length > 2 ? profileImageList[2] : null} delFn={imageDelete} imgSelectedFn={imgSelected}  /> }
                      {index == 3 && <ProfileImageItem index={index} imgData={profileImageList.length > 3 ? profileImageList[3] : null} delFn={imageDelete} imgSelectedFn={imgSelected}  /> }
                      {index == 4 && <ProfileImageItem index={index} imgData={profileImageList.length > 4 ? profileImageList[4] : null} delFn={imageDelete} imgSelectedFn={imgSelected}  /> }
                      {index == 5 && <ProfileImageItem index={index} imgData={profileImageList.length > 5 ? profileImageList[5] : null} delFn={imageDelete} imgSelectedFn={imgSelected}  /> }
                    </>
                  )
                })}
              </SpaceView>
            </SpaceView>
          </SpaceView>

        </SpaceView>

        {/* ########################################################################################## 버튼 */}
        <SpaceView mb={20} viewStyle={_styles.bottomWrap}>
          <TouchableOpacity 
            //disabled={!emailId}
            onPress={() => { saveProfileImage(); }}
            style={_styles.nextBtnWrap(true)}>
            <Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
            <SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
          </TouchableOpacity>
        </SpaceView>
      </SpaceView>
    </>
  );
};


{/* #######################################################################################################
###################### 프로필 이미지 렌더링
####################################################################################################### */}

function ProfileImageItem({ index, imgData, delFn, imgSelectedFn }) {
  /* const imgUrl = imgData.url;
  const imgDelYn = imgData.delYn;
  const imgStatus = imgData.status; */

  const isNew = imgData?.member_img_seq == 0;
  //const imgUrl = isNew ? {uri : imgData?.img_file_path} : findSourcePath(imgData?.img_file_path); // 이미지 경로
  const imgUrl = IMAGE.storySecretFemale  // 이미지 경로
  const imgDelYn = imgData?.del_yn; // 이미지 삭제 여부
  const imgStatus = imgData?.status; // 이미지 상태
  const imgStatusNm = imgStatus == 'PROGRESS' ? '심사' : imgStatus == 'REFUSE' ? '반려' : '승인';
  const titleNm = index == 0 ? '대표사진' : index > 2 ? '선택사진' : '필수사진';

  return (
    <SpaceView viewStyle={_styles.imgWrap}>
      <SpaceView viewStyle={_styles.imgTextWrap}>
        <Text style={styles.fontStyle('SB', 9, '#fff')}>{titleNm}</Text>
      </SpaceView>

      {/* 이미지 선택 버튼 */}
      <TouchableOpacity 
        style={_styles.imgSelectBtnWrap} 
        onPress={() => { 
          imgSelectedFn(index, isNew);
        }}
      >
        <Image source={ICON.join_imgSelect} style={styles.iconSquareSize(24)} />
      </TouchableOpacity>

      {isEmptyData(imgUrl) && imgDelYn == 'N' ? (
        <>
          {/* 이미지 삭제 버튼 */}
          <TouchableOpacity 
            style={_styles.imgDeleteBtnWrap} 
            onPress={() => { 
              delFn(imgData, index+1);
            }}
          >
            <Image source={ICON.join_close} style={styles.iconSquareSize(16)} />
          </TouchableOpacity>

          <SpaceView>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={_styles.imageStyle}
              key={imgUrl}
              source={imgUrl}
            />
            <View style={_styles.imageDisabled(false)}>
              <Text style={styles.fontStyle('R', 9, (imgStatus == 'PROGRESS' ? '#fff' : imgStatus == 'REFUSE' ? '#FF516F' : '#46F66F'))}>{imgStatusNm}</Text>
            </View>
          </SpaceView>
        </>
      ) : (
        <>
          <SpaceView viewStyle={_styles.subImgNoData}>
            {/* <Image source={ICON.userAdd} style={styles.iconSquareSize(22)} /> */}
          </SpaceView>
        </>
      )}
    </SpaceView>
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
    justifyContent: 'space-between'
  },
  imgWrap: {
    width: (width - 60) / 3,
    height: (width - 60) / 2,
    backgroundColor: '#CBCBCB',
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 20,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  imgTextWrap: {
    position: 'absolute',
    top: 7,
    left: 7,
    zIndex: 1,
    backgroundColor: '#3875DF',
    borderRadius: 12,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  imgSelectBtnWrap: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    zIndex: 1,
  },
  imgDeleteBtnWrap: {
    position: 'absolute',
    top: -2,
    right: -2,
    zIndex: 1,
  },
  imageStyle: {
    width: (width - 60) / 3,
    height: (width - 60) / 2,
    margin: 0,
    borderRadius: 20,
  },
  imageDisabled: (isMaster: boolean) => {
    return {
      position: 'absolute',
      left: 5,
      bottom: 5,
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius: 25,
      overflow: 'hidden',
      backgroundColor: !isMaster ? 'rgba(0, 0, 0, 0.66)' : 'transparent',
    };
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
  contentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  subImgNoData: {
    width: 64,
    height: 64,
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },


});