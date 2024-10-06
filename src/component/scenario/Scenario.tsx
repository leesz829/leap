import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, FC } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomParamList, ColorType, ScreenNavigationProp, CommonCode, LabelObj, LiveMemberInfo, LiveProfileImg } from '@types';
import { get_live_members, regist_profile_evaluation, get_common_code, update_additional } from 'api/models';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, RefreshControl, Platform, Modal } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { Watermark } from 'component/Watermark';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { ROUTES, STACK } from 'constants/routes';
import { clearPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';
import { CommonText } from 'component/CommonText';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import { iapConnection } from 'utils/initIAP';
import ListItem from 'component/match/ListItem';
import { myProfile } from 'redux/reducers/authReducer';


/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 화면
###################################################################################################################
################################################################################################################ */

interface Props {
  label: string;
  value?: string;
  callBackFunction?: (value: string, check: boolean) => void;
}

const { width, height } = Dimensions.get('window');

export const Vibe: FC<Props> = (props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const { show } = usePopup(); // 공통 팝업

  const memberBase = useUserInfo(); // 본인 데이터
  
  const [isLoad, setIsLoad] = React.useState(false); // 로딩 여부
  const [isEmpty, setIsEmpty] = React.useState(false); // 빈 데이터 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const [imgIdx, setImgIdx] = useState(0); // 이미지 인덱스

  const [liveModalVisible, setLiveModalVisible] = useState(false); // Live 팝업 Modal
  const [isPopVisible, setIsPopVisible] = useState(false);

  // 선택 인상 코드
  const [pickFaceCode, setPickFaceCode] = useState('');

  // 선택 인상 점수
  const [pickProfileScore, setPickProfileScore] = useState('');

  // 라이브 관련 데이터
  const [data, setData] = useState<any>({
    live_member_info: LiveMemberInfo,
    live_profile_img: [LiveProfileImg],
    face_type_list: [],
  });

  const imgList = data.live_profile_img;
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  // 이전 이미지
  const prevImage = async () => {
    if(currentImgIdx > 0) {
      setCurrentImgIdx(currentImgIdx-1);
    }
  }

  // 다음 이미지
  const nextImage = async () => {
    if(currentImgIdx+1 < imgList.length && currentImgIdx < 6) {
      setCurrentImgIdx(currentImgIdx+1);
    }
  }

  const [pickFace, setPickFace] = useState(''); // 선택한 인상

  // 인상 선택 팝업 열기
  const openImpressPop = async (pick:string, code:string, profileScore:string) => {
    if(isLoad) {
      setPickFaceCode(code);
      setPickFace(pick);
      setPickProfileScore(profileScore);

      insertLiveMatch(pick, code, profileScore);

      /* if(pick == 'SKIP') {
        insertLiveMatch(pick, code, profileScore);
      } else {
        setLiveModalVisible(false);
        //setIsPopVisible(true);
        //insertLiveMatch();
      } */
    }
  };

  // 인상 선택 팝업 끄기
  const cancelImpressPop = async () => {
    setIsPopVisible(false);
  };

  // ####################################################################################### 이미지 스크롤 처리
  const handleScroll = (event) => {
    let contentOffset = event.nativeEvent.contentOffset;
    let index = Math.floor(contentOffset.x / (width - 80));
    setImgIdx(index);
  };

  const liveMemberSeq = data.live_member_info.member_seq;
  const approvalProfileSeq = data.live_member_info?.approval_profile_seq;

  // ####################################################################################### 라이브 등록
  const insertLiveMatch = async (pick:string, code:string, profileScore:string) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);

      try {
        const body = {
          profile_score: pick == 'SKIP' ? profileScore : pickProfileScore,
          face_code: pick == 'SKIP' ? code : pickFaceCode,
          member_seq: liveMemberSeq,
          approval_profile_seq: approvalProfileSeq,
          newYn: 'Y',
        };
  
        const { success, data } = await regist_profile_evaluation(body);
  
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              dispatch(myProfile());
              setIsLoad(false);
              setIsEmpty(false); 
              setLiveModalVisible(false);
              getLiveMatchTrgt();
  
              break;
            default:
              show({ content: '오류입니다. 관리자에게 문의해주세요.' , });
              break;
          }
        }else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
        }
      } catch (error) {
        console.log(error);
        show({ content: '오류입니다. 관리자에게 문의해주세요.' });
      } finally {
        setIsPopVisible(false);
        setIsClickable(true);
      }
    };
  };

  // ####################################################################################### LIVE 평가 회원 조회
  const getLiveMatchTrgt = async () => {
    try {
      const body = {
        newYn: 'Y',
      };
      const { success, data } = await get_live_members(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            let tmpMemberInfo = LiveMemberInfo;
            let tmpProfileImgList = [LiveProfileImg];
            let tmpFaceTypeList = [LabelObj];
            let commonCodeList = [CommonCode];
    
            tmpMemberInfo = data.live_member_info;
            
            if(tmpMemberInfo != null && tmpMemberInfo.member_seq != null) {
              
              // LIVE 회원 프로필 사진
              data.live_profile_img_list.map((item) => {
                tmpProfileImgList.push({
                  url: findSourcePath(item.img_file_path)
                  , member_img_seq: item.member_img_seq
                  , order_seq: item.order_seq
                });
              });
    
              // 인상 유형 목록
              commonCodeList = data.face_type_list;
    
              // CommonCode
              commonCodeList.map((commonCode) => {
                tmpFaceTypeList.push({
                  label: commonCode.code_name,
                  value: commonCode.common_code,
                });
              });

              tmpProfileImgList = tmpProfileImgList.filter((x) => x.url);

              setData({
                live_member_info: tmpMemberInfo,
                live_profile_img: tmpProfileImgList,
                face_type_list: data?.face_type_list,
              });

              setIsLoad(true);              
            };

            break;
          case NODATA:
            setIsLoad(false);
            setIsEmpty(true);
            break;
          default:
            show({ content: '오류입니다. 관리자에게 문의해주세요.' , });
            break;
        }
       
      } else {
        show({ content: '오류입니다. 관리자에게 문의해주세요.' , });
      }
    } catch (error) {
      console.log(error);
    } finally {
      setImgIdx(0);
    }

  };

  // ################################################################ 초기 실행 함수
  React.useEffect(() => {
    if(isFocus) {
      setCurrentImgIdx(0);
    };
  }, [isFocus]);

  useFocusEffect(
    React.useCallback(() => {
      getLiveMatchTrgt();

      return () => {
        setIsLoad(false);
        setIsEmpty(false);
        setLiveModalVisible(false);
      };
    }, []),
  );

  return (
    <>
      <SpaceView viewStyle={_styles.wrap}> 
        
      </SpaceView>
    </>
  );
}



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
  },
  


});