import { useIsFocused, useNavigation, useFocusEffect  } from '@react-navigation/native';
import {
  CommonCode,
  FileInfo,
  LabelObj,
  ProfileImg,
  LiveMemberInfo,
  LiveProfileImg,
  ScreenNavigationProp,
} from '@types';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import axios from 'axios';
import { CommonText } from 'component/CommonText';
import { RadioCheckBox } from 'component/RadioCheckBox';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { ViualSlider } from 'component/ViualSlider';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Modal, ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, Animated, Easing, PanResponder, Platform, TouchableWithoutFeedback } from 'react-native';
import { LivePopup } from 'screens/commonpopup/LivePopup';
import { get_live_members, regist_profile_evaluation, get_common_code, update_additional } from 'api/models';
import { useMemberseq } from 'hooks/useMemberseq';
import { findSourcePath, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import { myProfile } from 'redux/reducers/authReducer';
import Image from 'react-native-fast-image';
import { ICON } from 'utils/imageUtils';
import { Watermark } from 'component/Watermark';
import { useUserInfo } from 'hooks/useUserInfo';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
//import { Easing } from 'react-native-reanimated';
import RatingStar from 'component/RatingStar';
import LinearGradient from 'react-native-linear-gradient';
import { ColorType } from '@types';
import { isEmptyData } from 'utils/functions';


/* ################################################################################################################
###### LIVE
################################################################################################################ */

const { width, height } = Dimensions.get('window');

export const Live = () => {
  const isFocus = useIsFocused();
  const { show } = usePopup(); // 공통 팝업
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 본인 데이터

  const [page, setPage] = useState(0); // 이미지 인덱스

  const [liveModalVisible, setLiveModalVisible] = useState(false); // Live 팝업 Modal
  const [isPopVisible, setIsPopVisible] = useState(false);

  const [isLoad, setIsLoad] = useState(false); // 로딩 상태 체크
  const [isEmpty, setIsEmpty] = useState(false);
  const [isClickable, setIsClickable] = useState(true); // 평가 확인 클릭 여부 함수

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

      if(pick == 'SKIP') {
        insertLiveMatch(pick, code, profileScore);
      } else {
        setLiveModalVisible(false);
        setIsPopVisible(true);
      }
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
    setPage(index);
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
      setPage(0);
    }

  };

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

  React.useEffect(() => {
    if(isFocus) {
      setCurrentImgIdx(0);
    };
  }, [isFocus]);


  return (
    <>
      <TopNavigation currentPath={'LIVE'} />

      <SpaceView pb={50} viewStyle={{backgroundColor: '#3D4348', minHeight: height}}> 
        {!isEmpty ? (
          <SpaceView>
            <SpaceView mb={15} viewStyle={_styles.imgItemWrap}>
              {/* <View style={_styles.mmbrStatusView}>
                <Text style={{color: '#A29552', fontSize: 12, fontFamily: 'Pretendard-Bold'}}>NEW</Text>
              </View> */}

              <SpaceView viewStyle={{borderRadius: 20, overflow: 'hidden'}}>

                {isLoad ? (
                  <>
                    {imgList.length > 0 && (
                      <Image
                        source={{uri: imgList[currentImgIdx]?.url?.uri}}
                        style={{
                          width: width - 40,
                          height: height * 0.68, 
                        }}
                        resizeMode={'cover'}
                      />
                    )}

                    <TouchableOpacity 
                      onPress={() => { prevImage(); }}
                      style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: (width * 0.85) / 2, zIndex: 1}} />

                    <TouchableOpacity 
                      onPress={() => { nextImage(); }}
                      style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: (width * 0.85) / 2, zIndex: 1}} />

                    {/* 인디케이터 */}
                    <SpaceView viewStyle={_styles.pagingContainer}>
                      {imgList?.map((i, n) => {
                        return n <= 5 && (
                          <View style={_styles.dotContainerStyle} key={'dot' + n}>
                            <View style={[_styles.pagingDotStyle, n == currentImgIdx && _styles.activeDot]} />
                          </View>
                        )
                      })}
                    </SpaceView>

                    <SpaceView viewStyle={_styles.infoArea}>
                      <SpaceView viewStyle={{justifyContent: 'center', alignItems: 'center'}}>
                        {data.live_member_info.distance && data.live_member_info.distance > 0 && (
                            <Text style={_styles.distanceText}>{data.live_member_info.distance}Km</Text>
                        )}
                        <Text style={_styles.nicknameText}>{data.live_member_info.nickname}, {data.live_member_info.age}</Text>
                        <Text style={_styles.introText}>{data.live_member_info.comment}</Text>
                      </SpaceView>
                    </SpaceView>

                    <Watermark value={memberBase?.phone_number}/>
                  </>
                ) : (
                  <>
                    <SpaceView viewStyle={{width: width - 40, height: height * 0.68, borderRadius: 20, backgroundColor: '#707070', opacity: 0.2 }} />
                  </>
                )}

                <LinearGradient
                  colors={['transparent', '#000000']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 0, y: 1 }}
                  style={_styles.thumnailDimArea} />

              </SpaceView>
            </SpaceView>

            {/* 최하단 스킵, 인상 선택 버튼 */}
            <View style={{flexDirection: 'row', justifyContent: 'center'}}>
              <TouchableOpacity 
                style={[_styles.bottomBtn,{width: width * 0.36, marginRight: 10}]}
                onPress={() => openImpressPop('SKIP', 'FACE_TYPE_SKIP', '6')}
              >
                <Text style={[_styles.bottomTxt, {color: '#656565'}]}>스킵</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[_styles.bottomBtn,{width: width * 0.47, backgroundColor: '#FCBB15'}]}
                onPress={() => { 
                  if(isLoad) {
                    setLiveModalVisible(true);
                  }
                }} >
                <Text style={[_styles.bottomTxt, {color: '#FFF'}]}>인상 선택하기</Text>
              </TouchableOpacity>
            </View>

            {/* #########################################################################################################################
            ##### 인상 리스트 팝업
            ######################################################################################################################### */}
            <Modal visible={liveModalVisible} style={{margin: 0}} transparent={true}>
              <LinearGradient
                colors={['rgba(9, 32, 50, 0.85)', 'rgba(52, 71, 86, 0.85)']}
                start={{ x: 0, y: 1 }}
                end={{ x: 0, y: 0 }} 
                style={_styles.liveModalBackground}
              >
                <ScrollView>
                    {data?.face_type_list.map((item, index) => {
                      return item.common_code != 'FACE_TYPE_SKIP' && (
                        <TouchableOpacity 
                          key={'face'+index} 
                          onPress={() => openImpressPop('#' + item.code_name, item.common_code, item.code_memo)}>
                          <Text style={_styles.faceModalText}>#{item.code_name}</Text>
                        </TouchableOpacity>
                      )
                    })}
                </ScrollView>
                
                <SpaceView viewStyle={_styles.liveModalXBtn}>
                  <TouchableOpacity hitSlop={commonStyle.hipSlop20} onPress={() => { setLiveModalVisible(false); }}>
                    <Image source={ICON.circleX} style={styles.iconSize40} />
                  </TouchableOpacity>
                </SpaceView>
              </LinearGradient>
            </Modal>

            {/* #########################################################################################################################
            ##### 인상 선택 팝업
            ######################################################################################################################### */}
            <Modal visible={isPopVisible} style={{margin: 0}} transparent={true}>
              <View style={modalStyle.modalBackground}>
                <View style={[modalStyle.modalStyle1, {overflow: 'hidden'}]}>
                  <LinearGradient
                    colors={['#1A1E1C', '#333B41']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }} >
                    <SpaceView viewStyle={{padding: 20}}>
                      <Text style={_styles.impressPopTitle}>인상 투표</Text>
                    </SpaceView>
                    <SpaceView viewStyle={[layoutStyle.alignCenter, modalStyle.modalBody]}>
                      <SpaceView viewStyle={_styles.impressImgBox}>
                        <Image source={findSourcePath(data.live_profile_img[0].url.uri)} style={styles.iconSize80} />
                      </SpaceView>
                      <SpaceView mt={30}>
                        <Text style={_styles.pickImpressText}>{pickFace}</Text>
                      </SpaceView>
                    </SpaceView>

                    <SpaceView mb={-20} mt={20}>
                      <View style={_styles.impressBtnContaniner}>
                        <TouchableOpacity
                          style={[_styles.impressBtn, {backgroundColor: '#FFF', borderTopLeftRadius: 10, borderBottomLeftRadius: 10}]}
                          onPress={cancelImpressPop}
                        >
                          <CommonText fontWeight={'600'} color={'#3D4348'} textStyle={{fontSize: 16}}>
                            취소하기
                          </CommonText>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[_styles.impressBtn, {backgroundColor: '#FFDD00', borderTopRightRadius: 10, borderBottomRightRadius: 10}]}
                          onPress={insertLiveMatch}
                        >
                          <CommonText fontWeight={'600'} color={'#3D4348'} textStyle={{fontSize: 16}}>
                            확인하기
                          </CommonText>
                        </TouchableOpacity>
                      </View>
                    </SpaceView>
                  </LinearGradient>
                </View>
              </View>
            </Modal>
          </SpaceView>
        ) : (
          <>
            <SpaceView viewStyle={{width: width, height: height}}>
              <View style={{height:height / 2, alignItems: 'center', justifyContent:'center', flexDirection: 'row'}}>
                <Text style={{fontSize: 25, fontFamily: 'Pretendard-Regular', color: '#646467'}}><Text style={{fontSize: 30, color: '#BAFAFC', fontFamily:'Pretendard-Bold'}}>{memberBase?.nickname}님</Text>을 위한{'\n'}새로운 이성을 찾는 중입니다.</Text>
                <Image source={ICON.digitalClock} style={[styles.iconSize40, {marginTop: 25, marginLeft: 5}]} />
              </View>
            </SpaceView>
          </>
        )}
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
  imgItemWrap: {
    paddingHorizontal: 20,
    overflow: 'hidden',
  },
  infoArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingVertical: 25,
  },
  distanceText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#FFF',
    marginBottom: 5,
  },
  nicknameText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 25,
    color: '#FFF',
    marginBottom: 3,
  },
  introText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    color: '#FFF',
  },
  thumnailDimArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.8,
    height: height * 0.24,
  },
  faceModalText: {
    color: '#FFF',
    marginBottom: 25,
    fontSize: 26,
    fontFamily: 'Pretendard-SemiBold',
    textAlign: 'center',
  },
  mmbrStatusView: {
    position: 'absolute',
    top: 30,
    left: 30,
    zIndex: 10,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
    paddingVertical:3,
    borderRadius: 10,
  },
  bottomBtn: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
  },
  bottomTxt: {
    textAlign: 'center',
    fontFamily: 'pretendard-Bold',
  },
  pagingContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 0,
    zIndex: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pagingDotStyle: {
    width: 20,
    height: 2,
    backgroundColor: '#34447A',
    borderRadius: 4,
  },
  dotContainerStyle: {
    //marginRight: 2,
    //marginLeft: 2,
  },
  activeDot: {
    backgroundColor: '#A29552',
  },
  impressImgBox: {
    zIndex: 1,
    backgroundColor: '#fff',
    borderRadius: 50,
    overflow: 'hidden',
  },
  impressPopTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    color: '#D5CD9E',
  },
  impressBtnContaniner: {
    width: width - 62,
    //borderTopWidth: 1,
    //borderTopColor: Color.grayEEEE,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  pickImpressText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#D5CD9E',
  },
  impressBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginBottom: 40,
  },
  liveModalBackground: {
    height,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 150,
  },
  liveModalXBtn: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },

});