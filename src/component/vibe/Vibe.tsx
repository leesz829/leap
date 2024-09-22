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
      <SpaceView viewStyle={{minHeight: height}}> 
        {!isEmpty ? (

          <LinearGradient
            colors={['#44B6E5', '#8080E2']}
            start={{ x: 0, y: 0 }}
            end={{ x: -0.05, y: 0.1 }}
            style={_styles.wrap}
          >

            {/* 서브 배경 영역 */}
            <LinearGradient
              colors={['#8080E2', '#16112A']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={_styles.subBg} />

            <SpaceView pt={105}>
              <SpaceView mb={10} viewStyle={_styles.imgAreaWrap}>

                <LinearGradient
                  colors={['#46F66F', '#FFFF5D']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{borderRadius: 10, overflow: 'hidden', paddingHorizontal: 2, paddingVertical: 2}}
                >

                  {isLoad ? (
                    <>

                      {/* ########################################################################## 상단 정보 표시 */}
                      <SpaceView viewStyle={_styles.topArea}>

                        {/* 리스펙트 등급 표시 */}
                        <SpaceView viewStyle={_styles.gradeArea}>
                          <Image source={ICON.sparkler} style={styles.iconSquareSize(15)} />
                          <Text style={_styles.gradeText}>{data.live_member_info?.respect_grade}</Text>
                        </SpaceView>

                        {/* 인상 수식어 표시 */}
                        {isEmptyData(data.live_member_info?.face_modifier) && (
                          <LinearGradient
                            colors={['#40E0D0', '#4C4CC2']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={_styles.faceModifierArea}
                          >
                            <Text style={_styles.faceModifierText}>#{data.live_member_info?.face_modifier}</Text>
                          </LinearGradient>
                        )}
                      </SpaceView>

                      {/* ########################################################################## 이미지 영역 */}
                      {imgList.length > 0 && (
                        <Image
                          source={{uri: imgList[currentImgIdx]?.url?.uri}}
                          style={{
                            width: width - 20,
                            height: Platform.OS == 'ios' ? height * 0.6 : height * 0.65, 
                            borderRadius: 10,
                          }}
                          resizeMode={'cover'}
                        />
                      )}

                      <SpaceView viewStyle={_styles.bottomArea}>
                        <SpaceView ml={15} mr={15} mb={5}>
                          <SpaceView><Text style={styles.fontStyle('B', 12, '#fff')}>{data.live_member_info.comment}</Text></SpaceView>
                        </SpaceView>

                        {/* ########################################################################## 하단 정보 표시 */}
                        <SpaceView viewStyle={_styles.baseInfoArea}>
                          <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'flex-end', width: '70%', flexWrap: 'wrap'}}>
                            <Text style={styles.fontStyle('H', 28, '#fff')}>{data.live_member_info.nickname}</Text>
                            <SpaceView ml={5} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                              <Image source={ICON.distanceIcon} style={styles.iconSquareSize(18)} />
                              <SpaceView ml={3}><Text style={styles.fontStyle('SB', 12, '#3AF246')}>{data.live_member_info.distance}Km</Text></SpaceView>
                            </SpaceView>
                          </SpaceView>
                        </SpaceView>
                      </SpaceView>

                      {/* ############################ 이전 버튼 */}
                      <TouchableOpacity 
                        onPress={() => { prevImage(); }}
                        style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: (width * 0.85) / 2, zIndex: 1}} />

                      {/* ############################ 다음 버튼 */}
                      <TouchableOpacity 
                        onPress={() => { nextImage(); }}
                        style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: (width * 0.85) / 2, zIndex: 1}} />

                      {/* ########################################################################## 이미지 인디케이터 */}
                      <SpaceView viewStyle={_styles.pagingContainer}>
                        <Text style={styles.fontStyle('SB', 12, '#000')}>{currentImgIdx+1}/{imgList.length}</Text>
                      </SpaceView>

                      <Watermark value={memberBase?.phone_number}/>
                    </>
                  ) : (
                    <>
                      <SpaceView viewStyle={{width: width - 20, height: Platform.OS == 'ios' ? height * 0.6 : height * 0.65, borderRadius: 10, backgroundColor: '#9A9A9A', opacity: 1 }} />
                    </>
                  )}

                  {/* 하단 딤처리 영역 */}
                  <LinearGradient
                    colors={['transparent', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={_styles.thumnailDimArea} />

                </LinearGradient>
              </SpaceView>

              {/* 최하단 스킵, 인상 선택 버튼 */}
              <SpaceView mb={10} viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
                <TouchableOpacity 
                  style={[_styles.bottomBtn, {width: width * 0.4, marginRight: 10, backgroundColor: '#FF516F',}]}
                  onPress={() => openImpressPop('SKIP', 'FACE_TYPE_SKIP', '6')}
                >
                  <Text style={[styles.fontStyle('B', 14, '#fff'), {textAlign: 'center'}]}>넘어가기</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[_styles.bottomBtn, {width: width * 0.53, backgroundColor: '#46F66F'}]}
                  onPress={() => { 
                    if(isLoad) {
                      setLiveModalVisible(true);
                    }
                  }} >
                  <Text style={[styles.fontStyle('B', 14, '#fff'), {textAlign: 'center'}]}>바이브 호감 보내기</Text>
                </TouchableOpacity>
              </SpaceView>

              {/* #########################################################################################################################
              ##### 인상 리스트 팝업
              ######################################################################################################################### */}
              <Modal visible={liveModalVisible} style={{margin: 0}} transparent={true}>

                <BlurView 
                  style={_styles.liveModalBlur}
                  blurType={'dark'}
                  blurAmount={30}
                  //overlayColor={'rgba(0,0,0,0.6)'}
                />

                <SpaceView pt={50}>

                  <SpaceView viewStyle={_styles.liveModalXBtn}>
                    <TouchableOpacity hitSlop={commonStyle.hipSlop20} onPress={() => { setLiveModalVisible(false); }}>
                      <Image source={ICON.backBtnType01} style={styles.iconSquareSize(40)} />
                    </TouchableOpacity>
                  </SpaceView>

                  <SpaceView viewStyle={_styles.liveModalWrap}>
                    <SpaceView mb={30}>
                      <SpaceView mb={15}><Text style={[styles.fontStyle('EB', 28, '#fff'), {textAlign: 'center'}]}>바이브 선택하기</Text></SpaceView>
                      <Text style={[styles.fontStyle('SB', 12, '#fff'), {textAlign: 'center'}]}>아래 선택지에서 상대방에게 주고 싶은{'\n'}바이브를 선택해 주세요.</Text>
                    </SpaceView>

                    <SpaceView mb={30}>
                      {data?.face_type_list.map((item, index) => {
                        return item.common_code != 'FACE_TYPE_SKIP' && (
                          <TouchableOpacity 
                            key={'face_' + item.common_code} 
                            onPress={() => openImpressPop('#' + item.code_name, item.common_code, item.code_memo)}
                            style={_styles.liveModalFaceItem}>
                            <Text style={[styles.fontStyle('B', 15, '#44B6E5'), {textAlign: 'center', marginBottom: 3}]}>#{item.code_name}</Text>
                          </TouchableOpacity>
                        )
                      })}
                    </SpaceView>

                    <SpaceView>
                      <Text style={[styles.fontStyle('SB', 12, '#fff'), {textAlign: 'center'}]}>바이브 선택이 많아질수록 리프에서{'\n'}선호하는 친구를 찾는 게 더 수월해질 거예요.</Text>
                    </SpaceView>
                  </SpaceView>
                  
                </SpaceView>
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
                            <CommonText fontWeight={'600'} color={'#3D4348'} textStyle={{fontSize: 16}}>취소하기</CommonText>
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
          </LinearGradient>
        ) : (
          <>
            <SpaceView viewStyle={{width: width, height: height}}>
              <LinearGradient
                colors={['#545295', '#16112A']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{height: height/2}} />

              <SpaceView viewStyle={{backgroundColor: '#16112A', height: height/2}} />
            
              <SpaceView pt={230} viewStyle={_styles.vibeEmptyContent}>
                <Image source={ICON.vibeEmpty} style={[styles.iconSquareSize(180)]} />
                <Text style={styles.fontStyle('EB', 20, '#fff')}>새로운 친구를 찾는 중이에요.</Text>
              </SpaceView>
            </SpaceView>
          </>
        )}
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
  subBg: {
    height: height / 2.1,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  imgAreaWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumnailDimArea: {
    position: 'absolute',
    bottom: 2,
    left: 2,
    right: 2,
    opacity: 0.8,
    height: height * 0.24,
    borderRadius: 10,
  },
  bottomBtn: {
    padding: 15,
    borderRadius: 5,
  },
  pagingContainer: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 5,
    paddingTop: 5,
    paddingBottom: 6,
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
  topArea: {
    position: 'absolute',
    top: 15,
    left: 15,
    flexDirection: 'row',
    zIndex: 1,
  },
  gradeArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  gradeText:  {
    fontFamily: 'SUITE-SemiBold',
    fontSize: 13,
    color: '#000000',
    marginLeft: 2,
    marginBottom: 2,
  },
  bottomArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  baseInfoArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
  faceModifierArea: {
    borderRadius: 12, 
    overflow: 'hidden', 
    paddingHorizontal: 12, 
    paddingVertical: 3,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceModifierText: {
    fontFamily: 'SUITE-SemiBold',
    fontSize: 14,
    color: '#ffffff',
    borderRadius: 10,
    overflow: 'hidden',
  },


  liveModalBlur: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  liveModalXBtn: {
    paddingHorizontal: 10,
    /* position: 'absolute',
    top: 50,
    left: 10, */
  },
  liveModalWrap: {
    flexDirection: 'column',
    textAlign: 'center',
    justifyContent: 'flex-start',
    alignItems: 'center',
    alignContent: 'center',
    width: width,
    height: height,
    paddingTop: 30,
  },
  liveModalFaceItem: {
    borderWidth: 1,
    borderColor: '#44B6E5',
    borderRadius: 25,
    width: width-60,
    paddingVertical: 8,
    justifyContent: 'center',
    marginBottom: 13,
  },
  vibeEmptyContent: {
    height: height,
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent:'flex-start',
  },


});