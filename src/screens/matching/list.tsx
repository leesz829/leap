import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import { get_daily_match_list, profile_open, update_additional } from 'api/models';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, RefreshControl } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData } from 'utils/functions';
import { Watermark } from 'component/Watermark';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { ROUTES, STACK } from 'constants/routes';
import AsyncStorage from '@react-native-community/async-storage';
import { clearPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';
import { CommonText } from 'component/CommonText';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import SocialGrade from 'component/common/SocialGrade';
import { iapConnection } from 'utils/initIAP';



interface Props {
  navigation: StackNavigationProp<BottomParamList, 'MatchingList'>;
  route: RouteProp<BottomParamList, 'MatchingList'>;
}

const { width, height } = Dimensions.get('window');

/* ################################################################################################################
###################################################################################################################
###### 매칭 목록 화면
###################################################################################################################
################################################################################################################ */
export default function MatchingList(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const scrollRef = React.useRef();

  const { show } = usePopup(); // 공통 팝업

  const [isLoad, setIsLoad] = React.useState(false); // 로딩 여부
  const [isEmpty, setIsEmpty] = React.useState(false); // 빈 데이터 여부
  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const memberBase = useUserInfo(); // 본인 데이터

  const [matchList, setMatchList] = React.useState([]); // 매칭 목록 데이터

  const [data, setData] = React.useState({
    introSecondYn: '',
    matchList: [],
    freeOpenCnt: 0,
  })

  // 팝업 목록
  let popupList = [];
  let isPopup = true;

  // ##################################################################################### 목록 새로고침
  const handleRefresh = () => {
    console.log('refresh!!!!!!!!!!!!!!');
    getDailyMatchList(false);
  };

  // ############################################################ 데일리 매칭 목록 조회
  const getDailyMatchList = async (isPopupShow:boolean) => {

    try {
      const body = {

      }
      const { success, data } = await get_daily_match_list(body);
      
      if (success) {
        if (data.result_code == '0000') {
          setData({
            introSecondYn: data?.intro_second_yn,
            matchList: data?.match_list,
            freeOpenCnt: data?.free_open_cnt,
          });

          if(data?.match_list.length > 0) {
            setIsEmpty(false);
          } else {
            setIsEmpty(true);
          }

          /* if(data?.match_member_info == null) {
            setIsLoad(false);
            setIsEmpty(true);
          } else {
            setIsLoad(true);
          } */

          // 이벤트 팝업 노출
          /* if(data.popup_list?.length > 0) {
            popupList = data.popup_list;

            // 튜토리얼 팝업 닫혀있는 경우 호출
            if(isPopupShow) {
              popupShow();
            }
          }; */

        } else {
          setIsLoad(false);
          setIsEmpty(true);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
    }
  };

  // ############################################################ 팝업 활성화
  const popupShow = async () => {
    if(popupList.length > 0 && isPopup) {
      let type = popupList[0].type;  // 팝업 유형
      let nowDt = formatNowDate().substring(0, 8);
      let endDt = await AsyncStorage.getItem('POPUP_ENDDT_' + type);

      if(null == endDt || endDt < nowDt) {
        show({
          type: 'EVENT',
          eventType: 'EVENT',
          eventPopupList: popupList,
          confirmCallback: async function(isNextChk) {
            if(isNextChk) {
              // 팝업 종료 일시 Storage 저장
              await AsyncStorage.setItem('POPUP_ENDDT_' + type, nowDt);
              isPopup = false;
            }
          },
          etcCallback: async function(pop_bas_seq, sub_img_path, index) {
            navigation.navigate(STACK.COMMON, { 
              screen: 'EventDetail',
              params: {
                index: index,
                view_type: 'MATCH',
              }
            });
          },
        });
      }
    }
  };

  // ############################################################ 회원 튜토리얼 노출 정보 저장
  const saveMemberTutorialInfo = async () => {
    const body = {
      tutorial_daily_yn: 'N'
    };
    const { success, data } = await update_additional(body);
    if(success) {
      if(null != data.mbr_base && typeof data.mbr_base != 'undefined') {
        dispatch(setPartialPrincipal({
          mbr_base : data.mbr_base
        }));
      }
    }
  };

  // ############################################################ 매칭 상세 이동
  const goMatchDetail = async (trgtMemberSeq:number) => {
    navigation.navigate(STACK.COMMON, { 
      screen: 'MatchDetail',
      params: {
        trgtMemberSeq: trgtMemberSeq,
        type: 'OPEN',
      } 
    });
  };

  // ############################################################ 프로필 열람
  const profileOpen = async (trgtMemberSeq:number) => {
    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoad(true);
  
        const body = {
          type: 'MATCH',
          trgt_member_seq: trgtMemberSeq,
        };
  
        const { success, data } = await profile_open(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              goMatchDetail(trgtMemberSeq);
              break;
            case EXIST:
              show({ content: '이미 보관함에 존재하는 회원입니다.', isCross: true });
              break;
            case '6010':
              show({ content: '보유 패스가 부족합니다.', isCross: true, });
              break;
            default:
              show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true });
              break;
          }
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.', isCross: true });
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoad(false);
      }
    }
  };

  // ################################################################ 초기 실행 함수
  React.useEffect(() => {
    if(isFocus) {
      if(memberBase?.status == 'BLOCK') {
        show({
          title: '서비스 이용 제한 알림',
          content: '서비스 운영정책 위반으로 회원님의 계정상태가\n이용제한 상태로 전환되었습니다.',
          confirmCallback: function() {
            dispatch(clearPrincipal());
          }
        });
      } else {

        //checkUserReport();
        setIsEmpty(false);
        
        let isPopupShow = true;

        // 튜토리얼 팝업 노출
        /* if(!isEmptyData(memberBase?.tutorial_daily_yn) || memberBase?.tutorial_daily_yn == 'Y') {
          isPopupShow = false;

          show({
            type: 'GUIDE',
            guideType: 'DAILY',
            guideSlideYn: 'Y',
            guideNexBtnExpoYn: 'Y',
            confirmCallback: function(isNextChk) {
              if(isNextChk) {
                saveMemberTutorialInfo();
              }
              popupShow();
            }
          });
        }; */

        // 데일리 매칭 정보 조회
        getDailyMatchList(isPopupShow);
      }

      // IAP 연결
      iapConnection();
    };
  }, [isFocus]);

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // 스크롤 최상단 이동
        /* scrollRef.current?.scrollTo({y: 0, animated: false});
        setIsLoad(false);
        setIsEmpty(false); */
      };
    }, []),
  );

  return (
    <>
      <TopNavigation currentPath={'LEAP'} />

      <LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
        style={_styles.wrap}
			>

        {!isEmpty ? (
          <>
            <SpaceView pb={150}>
              <FlatList
                ref={scrollRef}
                data={data.matchList}
                renderItem={(props) => {
                  //console.log('props : ', JSON.stringify(props));
                  const { item, index } = props;
                  return (
                    <>
                      <MatchRenderItem 
                        item={item} 
                        fnDetail={goMatchDetail} 
                        fnProfileOpen={profileOpen} 
                        freeOpenCnt={data?.freeOpenCnt} 
                        respectGrade={memberBase?.respect_grade} />
                    </>
                  )
                }}
                //onScroll={handleScroll}
                pagingEnabled
                showsVerticalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={height * 0.73 + 30}
                refreshControl={
                  <RefreshControl
                    refreshing={isRefreshing}
                    onRefresh={handleRefresh}
                    tintColor="#ff0000" // Pull to Refresh 아이콘 색상 변경
                    //title="Loading..." // Pull to Refresh 아이콘 아래에 표시될 텍스트
                    titleColor="#ff0000" // 텍스트 색상 변경
                    colors={['#ff0000', '#00ff00', '#0000ff']} // 로딩 아이콘 색상 변경
                    progressBackgroundColor="#ffffff" >
                  </RefreshControl>
                }
              />
            </SpaceView>
          </>
        ) : (
          <>
            <SpaceView viewStyle={{width: width, height: height}}>
              <SpaceView ml={20} viewStyle={{height:height / 2, alignItems: 'center', justifyContent:'flex-start', flexDirection: 'row'}}>
                <Text style={{fontSize: 25, fontFamily: 'Pretendard-Regular', color: '#646467'}}>
                  소개하여 드릴 <Text style={{fontSize: 30, color: '#BAFAFC', fontFamily:'Pretendard-Bold'}}>이성</Text>을{"\n"}준비중이에요!
                  {'\n'}{'\n'}
                  {data.introSecondYn == 'Y' ? (
                    <>새로운 이성을 자정에{'\n'}다시 확인해 보세요!</>
                  ) : (
                    <>새로운 이성을 오후 3시에{'\n'} 다시 확인해 보세요!</>
                  )}
                </Text>
                {/* <Image source={ICON.digitalClock} style={[styles.iconSize40, {marginTop: 25, marginLeft: 5}]} /> */}
              </SpaceView>
            </SpaceView>

            {/* <View style={[layoutStyle.justifyCenter, layoutStyle.flex1, {backgroundColor: 'white'} ]}>
              <SpaceView mb={50} viewStyle={[layoutStyle.alignCenter]}>
                <Text style={_styles.emptyText}>
                  {data.introSecondYn == 'Y' ? (
                    <>
                      오늘 소개하여 드린 <Text style={{color: '#7986EE'}}>데일리 뷰</Text>가 마감되었어요.{"\n"}
                      <Text style={{color: '#7986EE'}}>데일리 뷰</Text>에서 제공해드리는 프로필 카드는 {"\n"}매일 오후3시와 자정에 확인 가능합니다. 🎁
                    </>
                  ) : (
                    <>
                      오후 3시에 한번 더 제공해드리는{"\n"}
                      새로운 <Text style={{color: '#7986EE'}}>데일리 뷰</Text>를 확인해 보세요!
                    </>
                  )}
                </Text>

                <View style={{position: 'absolute', top: 0, left: 0, bottom: 0, right: 0, justifyContent: 'center', alignItems: 'center'}}>
                  <Image source={IMAGE.logoIcon03} style={styles.iconSquareSize(230)} />
                </View>

                <View style={{position: 'absolute', top: -50, left: 75}}><Image source={IMAGE.heartImg01} style={styles.iconSquareSize(40)} /></View>
                <View style={{position: 'absolute', top: 80, right: 75}}><Image source={IMAGE.heartImg01} style={styles.iconSquareSize(40)} /></View>
              </SpaceView>
            </View> */}
          </>
        )}

      </LinearGradient>
    </>
  );
};

/* #####################################################################################################################################
####### 매칭 아이템 렌더링
##################################################################################################################################### */
function MatchRenderItem({ item, fnDetail, fnProfileOpen, freeOpenCnt, respectGrade }) {
  const imgList = item?.img_list; // 이미지 목록
  const [currentImgIdx, setCurrentImgIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const _renderWidth = width - 40;
  const _renderHeight = height * 0.73;

  // 이전 이미지
  const prevImage = async () => {
    if(currentImgIdx > 0) {
      setCurrentImgIdx(currentImgIdx-1);
    }
  };

  // 다음 이미지
  const nextImage = async () => {
    if(currentImgIdx+1 < imgList.length && currentImgIdx < 2) {
      setCurrentImgIdx(currentImgIdx+1);
    }
  };

  // 상세 실행
  const detailProc = async () => {
    if(item?.open_yn == 'Y') {
      fnDetail(item?.member_seq);
    } else {
      setIsOpen(true);
    }
  };

  // 열람 실행
  const openProc = async() => {
    if(item?.open_yn == 'Y') {
      fnDetail(item?.member_seq);
    } else {
      fnProfileOpen(item?.member_seq);
    }
  };

  // 열람 취소
  const openCancel = async() => {
    setIsOpen(false);
  };

  useFocusEffect(
    React.useCallback(() => {
      return () => {
        setIsOpen(false);
      };
    }, []),
  );

  return (
    <>
      <SpaceView mb={30}>
        <SpaceView viewStyle={_styles.blindCardShadow}>

          <SpaceView viewStyle={{borderRadius: 20, overflow: 'hidden'}}>

            {/* 이미지 */}
            {imgList.length > 0 && (
              <Image
                source={findSourcePath(imgList[currentImgIdx].img_file_path)}
                style={{ flex: 1, width: _renderWidth, height: _renderHeight }}
                resizeMode={'cover'}
              />
            )}

            {/* 인디케이터 */}
            <SpaceView viewStyle={_styles.pagingContainer}>
              {imgList?.map((i, n) => {
                return n < 3 && (
                  <View style={_styles.dotContainerStyle} key={'dot' + n}>
                    <View style={[_styles.pagingDotStyle, n == currentImgIdx && _styles.activeDot]} />
                  </View>
                )
              })}
            </SpaceView>

            <TouchableOpacity 
              onPress={() => { prevImage(); }}
              style={{position: 'absolute', top: 0, bottom: 0, left: 0, width: (width * 0.85) / 2}} />

            <TouchableOpacity 
              onPress={() => { nextImage(); }}
              style={{position: 'absolute', top: 0, bottom: 0, right: 0, width: (width * 0.85) / 2}} />

            <SpaceView viewStyle={_styles.infoArea}>
              {currentImgIdx == 0 && (
                <SpaceView pl={30} pr={30} viewStyle={{justifyContent: 'center', alignItems: 'center'}}>

                  {/* 거리 */}
                  <SpaceView mb={5}><Text style={_styles.infoText(14)}>{item.distance}Km</Text></SpaceView>

                  {/* 닉네임, 나이 */}
                  <SpaceView mb={3}><Text style={_styles.infoText(25)}>{item.nickname}, {item.age}</Text></SpaceView>

                  {/* 한줄소개 */}
                  <SpaceView ml={25} mr={25}><Text style={_styles.infoText(16)}>{item.comment}</Text></SpaceView>

                  {/* 상세 버튼 */}
                  <TouchableOpacity
                    onPress={() => { detailProc(); }}
                    style={{position: 'absolute', bottom: -10, right: 10, zIndex: 2}}
                  >
                    <Image source={ICON.blindDetail} style={styles.iconSquareSize(40)} />
                  </TouchableOpacity>

                </SpaceView>
              )}
              {currentImgIdx == 1 && (
                <SpaceView ml={15} mr={15} viewStyle={{justifyContent: 'center', alignItems: 'flex-start'}}>
                  <SpaceView mb={8} viewStyle={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>

                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image source={findSourcePath(imgList[0].img_file_path)} style={_styles.mstImgStyle} />
                      <SpaceView ml={5}><Text style={_styles.infoText(16)}>{item.nickname}</Text></SpaceView>

                      {/* 인상 수식어 표시 */}
                      {isEmptyData(item?.face_modifier) && (
                        <SpaceView ml={8}><Text style={_styles.faceModifierText}>#{item?.face_modifier}</Text></SpaceView>
                      )}
                    </SpaceView>

                    <TouchableOpacity onPress={() => { detailProc(); }}>
                      <Image source={ICON.blindDetail} style={styles.iconSquareSize(40)} />
                    </TouchableOpacity>
                  </SpaceView>
                  <SpaceView viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {item?.face_list.length > 0 && (
                      <>
                        {item?.face_list?.map((i, n) => {
                          return isEmptyData(i.face_code_name) && (
                            <>
                              <SpaceView key={n} mb={7} mr={5} viewStyle={_styles.faceItemWrap}>
                                <Text style={_styles.faceText}>#{i.face_code_name}</Text>
                              </SpaceView>
                            </>
                          )
                        })}
                      </>
                    )}
                  </SpaceView>
                </SpaceView>
              )}
              {currentImgIdx == 2 && (
                <SpaceView ml={15} mr={15} viewStyle={{justifyContent: 'center', alignItems: 'flex-start'}}>
                  <SpaceView mb={8} viewStyle={{width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                      <Image source={findSourcePath(imgList[0].img_file_path)} style={_styles.mstImgStyle} />
                      <SpaceView ml={5}><Text style={_styles.infoText(16)}>{item.nickname}</Text></SpaceView>
                    </SpaceView>

                    <TouchableOpacity onPress={() => { detailProc(); }}>
                      <Image source={ICON.blindDetail} style={styles.iconSquareSize(40)} />
                    </TouchableOpacity>
                  </SpaceView>
                  <SpaceView viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
                    {item?.auth_list.length > 0 && (
                      <>
                        {item?.auth_list?.map((i, n) => {
                          const authCode = i.common_code;
                          let authIcon = ICON.authJob;

                          if(authCode == 'EDU') {
                            authIcon = ICON.authEdu;
                          } else if(authCode == 'INCOME') {
                            authIcon = ICON.authAsset;
                          } else if(authCode == 'ASSET') {
                            authIcon = ICON.authAsset;
                          } else if(authCode == 'SNS') {
                            authIcon = ICON.authAsset;
                          } else if(authCode == 'VEHICLE') {
                            authIcon = ICON.authAsset;
                          }

                          return isEmptyData(i.slogan_name) && (
                            <SpaceView key={'auth'+n} mb={7} mr={5} viewStyle={_styles.authItemWrap}>
                              {/* <Image source={authIcon} style={styles.iconSquareSize(16)} />
                              <SpaceView ml={8}><Text style={_styles.faceText}>{i.slogan_name}</Text></SpaceView> */}

                              <SpaceView><Text style={_styles.faceText}>#{i.auth_type_name}</Text></SpaceView>
                            </SpaceView>
                          )
                        })}
                      </>
                    )}
                  </SpaceView>
                </SpaceView>
              )}
            </SpaceView>

            <LinearGradient
              colors={['transparent', '#000000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={_styles.thumnailDimArea} />

            {/* ############################### 열람 블러 영역 */}
            {isOpen && (
              <>
                <BlurView 
                  style={_styles.blurArea(_renderWidth, _renderHeight)}
                  blurType='light'
                  blurAmount={15}
                />

                <SpaceView viewStyle={_styles.blurArea(_renderWidth, _renderHeight)}>
                  {freeOpenCnt > 0 ? (
                    <SpaceView>
                      <SpaceView viewStyle={_styles.blurDesc}>
                        <SpaceView mr={5}><SocialGrade grade={respectGrade} sizeType={'SMALL'} /></SpaceView>
                        <Text style={_styles.blurDescText}>무료 열람 활성화</Text>
                      </SpaceView>

                      <SpaceView mt={5} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Text style={_styles.blurAddText('#FFDD00')}>{freeOpenCnt}회남음</Text>
                      </SpaceView>
                    </SpaceView>
                  ) : (
                    <SpaceView>
                      <SpaceView viewStyle={_styles.blurDesc}>
                        <Text style={_styles.blurDescText}>큐브를 사용하여 블라인드 카드를 열람합니다.</Text>
                      </SpaceView>

                      <SpaceView mt={5} viewStyle={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                        <Image source={ICON.cubeCyan} style={styles.iconSquareSize(35)} />
                        <Text style={_styles.blurAddText('#32F9E4')}>15</Text>
                      </SpaceView>
                    </SpaceView>
                  )}

                  <SpaceView viewStyle={_styles.bluBtnArea}>
                    <LinearGradient
                      colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={_styles.bluBtnGradient}>
                      
                      <TouchableOpacity style={_styles.bluBtnTouch(true)} onPress={() => { openCancel(); }}>
                        <Text style={_styles.bluBtnText('#E1DFD1')}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={_styles.bluBtnTouch(false)} onPress={() => { openProc(); }}>
                        <Text style={_styles.bluBtnText('#FFDD00')}>열람하기</Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </SpaceView>
                </SpaceView>
              </>
            )}
          </SpaceView>


          {/* ############################################################ 슬라이드 형식 */}
          {/* <FlatList
            contentContainerStyle={{ overflow: 'visible', paddingHorizontal: 20 }}
            data={imgList}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            snapToAlignment="center"
            decelerationRate="fast"
            snapToInterval={width * 0.85 + 5}
            renderItem={({ item: _item, index: _index }) => {

              return _index < 3 && (
                <TouchableOpacity 
                  key={_index} 
                  onPress={() => { fnDetail(item?.member_seq); }}
                  style={_styles.imgItemWrap}
                  activeOpacity={0.8} 
                >
                  <SpaceView viewStyle={{borderRadius: 20, overflow: 'hidden'}}>
                    <Image
                      source={findSourcePath(_item?.img_file_path)}
                      style={{ flex: 1, width: width * 0.85, height: height * 0.75 }}
                      resizeMode={'cover'}
                    />

                    <SpaceView viewStyle={_styles.infoArea}>
                      {_index == 0 && (
                        <SpaceView viewStyle={{justifyContent: 'center', alignItems: 'center'}}>
                          <SpaceView mb={5}><Text style={_styles.infoText(14)}>{item.distance}Km</Text></SpaceView>
                          <SpaceView mb={3}><Text style={_styles.infoText(25)}>{item.nickname}, {item.age}</Text></SpaceView>
                          <SpaceView><Text style={_styles.infoText(16)}>{item.comment}</Text></SpaceView>
                        </SpaceView>
                      )}
                      {_index == 1 && (
                        <SpaceView ml={15} mr={15} viewStyle={{justifyContent: 'center', alignItems: 'flex-start'}}>
                          <SpaceView mb={8} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={findSourcePath(imgList[0].img_file_path)} style={_styles.mstImgStyle} />
                            <SpaceView ml={5}><Text style={_styles.infoText(16)}>{item.nickname}</Text></SpaceView>
                          </SpaceView>
                          <SpaceView viewStyle={{flexDirection: 'row'}}>
                            {item?.face_list.length > 0 && (
                              <>
                                {item?.face_list?.map((i, n) => {
                                  return isEmptyData(i.face_code_name) && (
                                    <SpaceView mb={7} mr={5} viewStyle={_styles.faceItemWrap}>
                                      <Text style={_styles.faceText}>#{i.face_code_name}</Text>
                                    </SpaceView>
                                  )
                                })}
                              </>
                            )}
                          </SpaceView>
                        </SpaceView>
                      )}
                      {_index == 2 && (
                        <SpaceView ml={15} mr={15} viewStyle={{justifyContent: 'center', alignItems: 'flex-start'}}>
                          <SpaceView mb={8} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                            <Image source={findSourcePath(imgList[0].img_file_path)} style={_styles.mstImgStyle} />
                            <SpaceView ml={5}><Text style={_styles.infoText(16)}>{item.nickname}</Text></SpaceView>
                          </SpaceView>
                          <SpaceView viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
                            {item?.auth_list.length > 0 && (
                              <>
                                {item?.auth_list?.map((i, n) => {
                                  const authCode = i.common_code;
                                  let authIcon = ICON.authJob;

                                  if(authCode == 'EDU') {
                                    authIcon = ICON.authEdu;
                                  } else if(authCode == 'INCOME') {
                                    authIcon = ICON.authAsset;
                                  } else if(authCode == 'ASSET') {
                                    authIcon = ICON.authAsset;
                                  } else if(authCode == 'SNS') {
                                    authIcon = ICON.authAsset;
                                  } else if(authCode == 'VEHICLE') {
                                    authIcon = ICON.authAsset;
                                  }

                                  return isEmptyData(i.slogan_name) && (
                                    <SpaceView mb={7} mr={5} viewStyle={_styles.authItemWrap}>
                                      <Image source={authIcon} style={styles.iconSquareSize(16)} />
                                      <SpaceView ml={8}><Text style={_styles.faceText}>{i.slogan_name}</Text></SpaceView>
                                    </SpaceView>
                                  )
                                })}
                              </>
                            )}
                          </SpaceView>
                        </SpaceView>
                      )}
                    </SpaceView>

                    <LinearGradient
                      colors={['transparent', '#000000']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={_styles.thumnailDimArea} />
                  </SpaceView>
                </TouchableOpacity>
              )
            }}
          /> */}
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
    minHeight: height,
  },
  imgItemWrap: {
    marginHorizontal: 5,
  },
  infoArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
    paddingVertical: 25,
  },
  infoText: (fs:number, cr:string) => {
    return {
      fontFamily: 'Pretendard-Regular',
      fontSize: fs,
      color: isEmptyData(cr) ? cr : '#fff',
    };
  },
  thumnailDimArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.8,
    height: height * 0.24,
  },
  mstImgStyle: {
    width: 28,
    height: 28,
    borderRadius: 65,
    overflow: 'hidden',
  },
  faceItemWrap: {
    backgroundColor: 'rgba(135,135,135,0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  faceText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#EEEAEB',
  },
  authItemWrap: {
    backgroundColor: 'rgba(135,135,135,0.5)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: 'Pretendard-Regular',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 23,
    minHeight: 50,
    textAlignVertical: 'center',
  },
  blindCardShadow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,

    shadowColor: '#000000',   
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 5,
  },
  pagingContainer: {
    position: 'absolute',
    top: 30,
    left: 0,
    right: 10,
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
  faceModifierText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#4A4846',
    backgroundColor: '#FFF8CC',
    borderRadius: 10,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  blurArea: (_width:number, _height:number) => {
    return {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      width: _width,
      height: _height,
      zIndex: 2,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
    };
  },
  blurArea22: {
    position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      alignItems: 'center',
      alignContent: 'center',
      justifyContent: 'center',
  },
  blurDesc: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurDescText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 12,
    color: '#D5CD9E',
  },
  blurAddText: (cr:string) => {
    return {
      fontFamily: 'Pretendard-Medium',
      fontSize: 23,
      color: '#32F9E4',
    };
  },
  bluBtnArea: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
  },
  bluBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
  },
  bluBtnTouch: (isBorder:boolean) => {
    return {
      width: '50%',
      paddingVertical: 20,
      borderRightWidth: isBorder ? 1 : 0,
      borderRightColor: '#64614B',
    };
  },
  bluBtnText: (cr:string) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 16,
      color: cr,
      textAlign: 'center',
    };
  },

});


