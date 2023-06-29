import { ColorType, BottomParamList, ScreenNavigationProp } from '@types';
import { commonStyle, styles, layoutStyle, modalStyle } from 'assets/styles/Styles';
import { CommonSwich } from 'component/CommonSwich';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import { Wallet } from 'component/TopNavigation';
import * as React from 'react';
import {
  Image,
  ScrollView,
  View,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  Text,
  ImageBackground,
} from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import LinearGradient from 'react-native-linear-gradient';
import { useState, useRef } from 'react';
import axios from 'axios';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  RouteProp,
  useNavigation,
  useIsFocused,
  CommonActions,
} from '@react-navigation/native';
import * as dataUtils from 'utils/data';
import { useDispatch } from 'react-redux';
import { get_member_storage, update_match } from 'api/models';
import { useMemberseq } from 'hooks/useMemberseq';
import { usePopup } from 'Context';
import { STACK } from 'constants/routes';
import CommonHeader from 'component/CommonHeader';
import { myProfile } from 'redux/reducers/authReducer';
import Carousel from 'react-native-snap-carousel';
import ToggleSwitch from 'toggle-switch-react-native';
import { Color } from 'assets/styles/Color';
import { isEmptyData } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';



/* ################################################################################################################
###### 보관함
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<BottomParamList, 'Storage'>;
  route: RouteProp<BottomParamList, 'Storage'>;
}

const { width, height } = Dimensions.get('window');

export const Storage = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocusStorage = useIsFocused();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const { show } = usePopup();  // 공통 팝업

  const memberSeq = useMemberseq(); // 회원번호

  const [btnStatus, setBtnStatus] = useState(true);
  const [btnStatus1, setBtnStatus1] = useState(true);
  const [btnStatus2, setBtnStatus2] = useState(true);

  const [isSpecialVisible, setIsSpecialVisible] = React.useState(false);
  const [isLiveResVisible, setIsLiveResVisible] = React.useState(true);
  const [isLiveReqVisible, setIsLiveReqVisible] = React.useState(true);

  /* ################################################
   ######## Storage Data 구성
   ######## - resLikeList : 내가 받은 관심 목록
   ######## - reqLikeList : 내가 받은 관심 목록
   ######## - matchTrgtList : 내가 받은 관심 목록
   #################################################*/
  const [dataStorage, setDataStorage] = React.useState<any>({
    resLikeList: [],
    reqLikeList: [],
    matchTrgtList: [],
    zzimTrgtList: [],
    liveHighList: [],
    resSpecialCnt: 0,
    reqSpecialCnt: 0,
    matchSpecialCnt: 0,
    zzimItemUseYn: 'N',
  });

  // 탭 목록
  const [tabs, setTabs] = React.useState([
    {
      type: 'RES',
      title: '받은 관심',
      color: '#FF7E8C',
      data: []
    },
    {
      type: 'REQ',
      title: '보낸 관심',
      color: '#697AE6',
      data: []
    },
    {
      type: 'MATCH',
      title: '성공 매칭',
      color: '#8669E6',
      data: []
    },
  ]);

  // ################################################################################# 보관함 정보 조회
  const getStorageData = async () => {
    setIsLoading(true);

    try {
      const { success, data } = await get_member_storage();
      if(success) {
        if (data.result_code != '0000') {
          console.log(data.result_msg);
          return false;
        } else {
          let tabsData = [];

          let resLikeListData = [];
          let reqLikeListData = [];
          let matchTrgtListData = [];
          let zzimTrgtListData = [];
          let liveHighListData = [];
          let zzimItemUseYn = data.zzimItemUseYn;

          resLikeListData = dataUtils.getStorageListData(
            data.res_like_list
          );

          reqLikeListData = dataUtils.getStorageListData(
            data.req_like_list
          );

          matchTrgtListData = dataUtils.getStorageListData(
            data.match_trgt_list
          );

          if(typeof data.zzim_trgt_list != 'undefined') {
            zzimTrgtListData = dataUtils.getStorageListData(
              data.zzim_trgt_list
            );
          }

          liveHighListData = dataUtils.getStorageListData(
            data.live_high_list
          );

          // tabs 데이터 구성
          tabsData = [
            {
              type: 'RES',
              title: '받은 관심',
              color: '#FF7E8C',
              data: resLikeListData
            },
            {
              type: 'REQ',
              title: '보낸 관심',
              color: '#697AE6',
              data: reqLikeListData
            },
            {
              type: 'MATCH',
              title: '성공 매칭',
              color: '#8669E6',
              data: matchTrgtListData
            },
          ];

          if(zzimItemUseYn == 'Y') {
            tabsData.push({
              type: 'ZZIM',
              title: '찜 목록',
              color: '#69C9E6',
              data: zzimTrgtListData
            });
          };

          if(liveHighListData.length > 0) {
            tabsData.push({
              type: 'LIVE',
              title: 'LIVE',
              color: '#FFC100',
              data: liveHighListData
            });
          };


          let tmpResSpecialCnt = 0;
          let tmpReqSpecialCnt = 0;
          let tmpMatchSpecialCnt = 0;

          if(data?.res_like_list.length > 0) {
            data?.res_like_list.map(({ special_interest_yn } : { special_interest_yn: any }) => {
                if (special_interest_yn == 'Y') {
                  tmpResSpecialCnt++;
                }
              }
            );
          };

          if(data?.req_like_list.length > 0) {
            data?.req_like_list.map(({ special_interest_yn }: { special_interest_yn: any }) => {
                if (special_interest_yn == 'Y') {
                  tmpReqSpecialCnt++;
                }
              }
            );
          };

          if(data?.match_trgt_list.length > 0) {
            data?.match_trgt_list.map(({ special_interest_yn }: { special_interest_yn: any }) => {
                if (special_interest_yn == 'Y') {
                  tmpMatchSpecialCnt++;
                }
              }
            );
          };

          setDataStorage({
            ...dataStorage,
            resLikeList: resLikeListData,
            reqLikeList: reqLikeListData,
            matchTrgtList: matchTrgtListData,
            zzimTrgtList: zzimTrgtListData,
            liveHighList: liveHighListData,
            resSpecialCnt: tmpResSpecialCnt,
            reqSpecialCnt: tmpReqSpecialCnt,
            matchSpecialCnt: tmpMatchSpecialCnt,
            zzimItemUseYn: zzimItemUseYn,
          });

          setTabs(tabsData);
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ################################################################################# 프로필 열람 팝업 활성화
  const popupProfileOpen = async (
    match_seq: any,
    tgt_member_seq: any,
    type: any,
    profile_open_yn: any,
    member_status: any,
    match_type: any,
  ) => {
    
    if(member_status != 'ACTIVE') {
      let msg = '최근에 휴면 또는 탈퇴를 하신 회원이에요.';
      
      if(member_status == 'APPROVAL') {
        msg = '해당 회원은 가입심사 대기중 회원이에요.';
      } else if(member_status == 'BLOCK' || member_status == 'RESTRICT') {
        msg = '해당 회원은 계정이 정지된 회원이에요.';
      }

      show({
        title: '프로필 열람 실패',
        content: msg,
      });

      return;
    }
    
    if (profile_open_yn == 'N') {
      show({
        title: '프로필 열람',
        content: '패스를 소모하여 프로필을 열람하시겠습니까?\n패스 x15',
        cancelCallback: function() {

        },
        confirmCallback: function() {
          goProfileOpen(match_seq, tgt_member_seq, type, match_type);
        },
      });

    } else {
      navigation.navigate(STACK.COMMON, { screen: 'StorageProfile', params: {
        matchSeq: match_seq,
        tgtMemberSeq: tgt_member_seq,
        type: type,
        matchType: match_type,
      } });
    }
  };

  // ################################################################################# 프로필 열람 이동
  const goProfileOpen = async (match_seq:any, tgt_member_seq:any, type:any, match_type:any) => {
    let req_profile_open_yn = '';
    let res_profile_open_yn = '';

    if (type == 'REQ' || match_type == 'LIVE_REQ') {
      req_profile_open_yn = 'Y';
    } else if (type == 'RES' || match_type == 'LIVE_RES') {
      res_profile_open_yn = 'Y';
    }

    const body = {
      match_seq: match_seq,
      req_profile_open_yn: req_profile_open_yn,
      res_profile_open_yn: res_profile_open_yn,
    };

    try {
      const { success, data } = await update_match(body);
      if(success) {
        if (data.result_code == '0000') {
          dispatch(myProfile());
          navigation.navigate(STACK.COMMON, { screen: 'StorageProfile', params: {
            matchSeq: match_seq,
            tgtMemberSeq: tgt_member_seq,
            type: type,
          } });

        } else if (data.result_code == '6010') {
          show({ content: '보유 패스가 부족합니다.' });
          return false;
        } else {
          console.log(data.result_msg);
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
        }
      }
    } catch (error) {
      console.log(error);
    } finally {

    }
  };

  // 라이브 탭 활성
  const onLiveTab = (type:string) => {
    if(type == 'RES') {
      setIsLiveResVisible(isLiveResVisible ? false : true);
    } else if(type == 'REQ') {
      setIsLiveReqVisible(isLiveReqVisible ? false : true);
    }
  };

  // ######################################################################################## 초기 실행 함수
  React.useEffect(() => {
    if(isFocusStorage) {
      getStorageData();
    }
  }, [isFocusStorage]);


  // #######################################################################################################
  const { route } = props;
  const params = route.params;
  const pageIndex = params?.pageIndex || 0;
  const ref = useRef();
  const [currentIndex, setCurrentIndex] = useState(pageIndex);

  const onPressDot = (index) => {
    ref?.current?.snapToItem(index);
  };


  // 이미지 스크롤 처리
  const handleScroll = (event) => {
    let contentOffset = event.nativeEvent.contentOffset;
    let index = Math.floor(contentOffset.x / (width-10));
    setCurrentIndex(index);
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      <View style={_styles.root}>
        {/* <CommonHeader title={tabs[currentIndex].title} right={<Wallet theme />} /> */}

        {props.route.params?.headerType == 'common' ? (
          <CommonHeader title={'보관함'} />
        ) : (
          <TopNavigation currentPath={''} />
        )}

        <SpaceView mt={30} mb={6}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={_styles.topContainer}>
            <View style={_styles.dotContainer}>
              {tabs.map((item, index) => (
                <>
                  <TouchableOpacity key={index} onPress={() => { onPressDot(index); }}>
                    <View style={[_styles.tabItem(index === currentIndex, item.color)]}>
                      <Text style={_styles.tabItemText}>{item.title} | {item.data.length}</Text>
                    </View>
                  </TouchableOpacity>
                </>
              ))}
            </View>
          </ScrollView>
        </SpaceView>

        <SpaceView mt={7} mb={13} viewStyle={commonStyle.paddingHorizontal25}>
          <View style={[_styles.row, {minHeight: 30}]}>
            {currentIndex < 3 &&
              <>
                <Text style={_styles.showText}>찐심만 보기</Text>
                <ToggleSwitch
                  isOn={isSpecialVisible}
                  onColor={Color.primary}
                  offColor={Color.grayDDDD}
                  size="small"
                  onToggle={(isOn) => setIsSpecialVisible(isOn) }
                />
              </>
            }

            {tabs[currentIndex].type == 'LIVE' &&
              <View style={_styles.liveTabArea}>
                <TouchableOpacity onPress={() => { onLiveTab('RES'); }} style={_styles.liveTabItem(isLiveResVisible, 'RES')}>
                  <Text style={_styles.liveTabText(isLiveResVisible, 'RES')}>받은 LIVE</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { onLiveTab('REQ'); }} style={_styles.liveTabItem(isLiveReqVisible, 'REQ')}>
                  <Text style={_styles.liveTabText(isLiveReqVisible, 'REQ')}>보낸 LIVE</Text>
                </TouchableOpacity>
              </View>
            }
          </View>
        </SpaceView>

        <SpaceView>
          <Carousel
            ref={ref}
            data={tabs}
            firstItem={pageIndex}
            onSnapToItem={setCurrentIndex}
            sliderWidth={width}
            itemWidth={width}
            pagingEnabled
            renderItem={({item, index}) => {
              return (
                <>
                  {item.data.length == 0 ? (
                    <SpaceView viewStyle={_styles.noData}>
                      <Text style={_styles.noDataText}>{item.title}이 없습니다.</Text>
                    </SpaceView>
                  ) : (
                    <ScrollView showsVerticalScrollIndicator={false} style={{width: '100%', height: height-220}}>
                      <View style={_styles.imageWarpper}>
                        {item.data.map((i, n) => (
                          <RenderItem item={i} index={n} type={item.type} />
                        ))}
                      </View>

                      <View style={{ height: 50 }} />
                    </ScrollView>
                  )}
                </>
              )
            }}
          />
        </SpaceView>
      </View>
    </>
  );

  function RenderItem({ item, index, type }) {

    let matchType = item.match_type;  // 매칭 유형

    let isShow = true;  // 노출 여부
    let tgt_member_seq = '';
    let profile_open_yn = 'N';

    // 노출 여부 설정
    if(type == 'REQ' || type == 'RES' || type == 'MATCH') {
      if(isSpecialVisible && item.special_interest_yn == 'N') {
        isShow = false;
      }
    } else if(type == 'LIVE') {
      if((matchType == 'LIVE_RES' && !isLiveResVisible) || (matchType == 'LIVE_REQ' && !isLiveReqVisible)) {
        isShow = false;
      }
    }

    // 대상 회원 번호, 프로필 열람 여부 설정
    if(type == 'RES' || matchType == 'LIVE_RES') {
      tgt_member_seq = item.req_member_seq;
      profile_open_yn = item.res_profile_open_yn;
    } else if(type == 'REQ' || matchType == 'LIVE_REQ') {
      tgt_member_seq = item.res_member_seq;
      profile_open_yn = 'Y';
    } else if(type == 'MATCH' || type == 'ZZIM') {
      if (item.req_member_seq != memberSeq) {
        tgt_member_seq = item.req_member_seq;
      } else {
        tgt_member_seq = item.res_member_seq;
      }
      profile_open_yn = 'Y';
    };

    return (
      <>
        {isShow && 

          <TouchableOpacity
            onPress={() => {
              popupProfileOpen(
                item.match_seq,
                tgt_member_seq,
                type,
                profile_open_yn,
                item.member_status,
                matchType
              );
            }}>

            <ImageBackground source={item.img_path} style={_styles.renderItemContainer}>
              <View style={_styles.renderItemTopContainer}>

                {type == 'ZZIM' ? (
                  <>
                    <Image style={_styles.renderItemTopZzimIcon} source={ICON.zzimCircle} />
                    <Text style={[_styles.renderItemTopText, {marginTop: 5}]}>
                      {item.dday > 0 ? item.dday + '일 남음' : '오늘까지'}
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                      {type == 'LIVE' ? (
                        <>
                          {item.req_profile_score != null &&
                            <View style={_styles.liveScoreArea(item.match_type)}>
                              {/* <Text>★</Text> */}
                              <Text style={_styles.liveScoreText(item.match_type)}>★ {item.req_profile_score}</Text>
                            </View>
                          }
                        </>
                      ) : (
                        <>
                          <Image style={_styles.renderItemTopIcon} source={item.special_interest_yn == 'N' ? ICON.passCircle : ICON.royalPassCircle} />
                          {isEmptyData(item?.special_level) && <Text style={_styles.levelText}>Lv.{item.special_level}</Text>}
                        </>
                      )}
                    </View>
                    <Text style={[_styles.renderItemTopText, ((type == 'RES' || matchType == 'LIVE_RES') && profile_open_yn == 'N' && {color: '#787878'})]}>
                      {item.dday > 0 ? item.dday + '일 남음' : '오늘까지'}
                    </Text>
                  </>
                )}
              </View>

              <View style={[_styles.renderItemBottomContainer]}>
                <View style={{flexDirection: 'row', marginBottom: -2, justifyContent: 'space-between'}}>
                  {/* ############# 인증 레벨 노출 */}

                  {item.auth_acct_cnt > 0 && item.auth_acct_cnt < 10 &&
                    <LinearGradient colors={['#7986EE', '#7986EE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                      <Text style={_styles.whiteText}>LV.{item.auth_acct_cnt}</Text>
                    </LinearGradient>
                  }

                  {item.auth_acct_cnt >= 10 && item.auth_acct_cnt < 15 &&
                    <LinearGradient colors={['#E0A9A9', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                      <Image source={ICON.level10Icon} style={[_styles.authBadgeImg, {width: 18, height: 18}]} />
                      <Text style={_styles.whiteText}>LV.{item.auth_acct_cnt}</Text>
                    </LinearGradient>
                  }

                  {item.auth_acct_cnt >= 15 && item.auth_acct_cnt < 20 &&
                    <LinearGradient colors={['#A9BBE0', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                      <Image source={ICON.level15Icon} style={[_styles.authBadgeImg, {width: 18, height: 18}]} />
                      <Text style={_styles.whiteText}>LV.{item.auth_acct_cnt}</Text>
                    </LinearGradient>
                  }

                  {item.auth_acct_cnt >= 20 && item.auth_acct_cnt < 25 &&
                    <LinearGradient colors={['#FEB961', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                      <Image source={ICON.level20Icon} style={[_styles.authBadgeImg02, {width: 18, height: 18}]} />
                      <Text style={_styles.whiteText}>LV.{item.auth_acct_cnt}</Text>
                    </LinearGradient>
                  }

                  {item.auth_acct_cnt >= 25 && item.auth_acct_cnt < 30 &&
                    <LinearGradient colors={['#9BFFB5', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                      <Image source={ICON.level25Icon} style={[_styles.authBadgeImg02, {width: 20, height: 20}]} />
                      <Text style={_styles.whiteText}>LV.{item.auth_acct_cnt}</Text>
                    </LinearGradient>
                  }

                  {item.auth_acct_cnt >= 30 &&
                    <LinearGradient colors={['#E84CEE', '#79DEEE']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.authBadge}>
                      <Image source={ICON.level30Icon} style={[_styles.authBadgeImg02, {width: 20, height: 20}]} />
                      <Text style={_styles.whiteText}>LV.{item.auth_acct_cnt}</Text>
                    </LinearGradient>
                  }

                  {/* ############# 프로필 평점 노출 */}
                  {item.profile_score < 6.0 &&
                    <LinearGradient colors={['#FF7EA6', '#FF7EA6']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                      <Image source={ICON.score5Icon} style={[{width: 8, height: 8}]} />
                      <Text style={_styles.yellowText}>{item.profile_score}</Text>
                    </LinearGradient>
                  }

                  {item.profile_score >= 6.0 && item.profile_score < 7.0 &&
                    <LinearGradient colors={['#FF4381', '#FF4381']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                      <Image source={ICON.score6Icon} style={[{width: 10, height: 10}]} />
                      <Text style={_styles.yellowText}>{item.profile_score}</Text>
                    </LinearGradient>
                  }

                  {item.profile_score >= 7.0 && item.profile_score < 8.0 &&
                    <LinearGradient colors={['#FF4381', '#FF4381']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                      <Image source={ICON.score7Icon} style={[{width: 10, height: 10}]} />
                      <Text style={_styles.yellowText}>{item.profile_score}</Text>
                    </LinearGradient>
                  }

                  {item.profile_score >= 8.0 && item.profile_score < 9.0 &&
                    <LinearGradient colors={['#FE0456', '#FF82AB']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                      <Image source={ICON.scoreKingIcon} style={[{width: 10, height: 10}]} />
                      <Text style={_styles.yellowText}>{item.profile_score}</Text>
                    </LinearGradient>
                  }

                  {item.profile_score >= 9.0 && item.profile_score < 10.0 &&
                    <LinearGradient colors={['#FE0456', '#9E6DF5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                      <Image source={ICON.scoreDiamondIcon} style={[{width: 10, height: 10}]} />
                      <Text style={_styles.yellowText}>{item.profile_score}</Text>
                    </LinearGradient>
                  }

                  {item.profile_score >= 10.0 &&
                    <LinearGradient colors={['#FE0456', '#9E41E5']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={_styles.scoreBadge}>
                      <Image source={ICON.score10Icon} style={[{width: 10, height: 10}]} />
                      <Text style={_styles.yellowText}>{item.profile_score}</Text>
                    </LinearGradient>
                  }

                </View>

                <Text style={_styles.renderItemBottomTextName}>{item.nickname}, {item.age}</Text>

                {/* {isEmptyData(item.job_name) && isEmptyData(item.height) && 
                  <Text style={_styles.renderItemBottomTextSpec}>
                    {item.job_name} {isEmptyData(item.height) && item.height + 'cm'}
                  </Text>
                } */}
              </View>

              {(type == 'RES' || matchType == 'LIVE_RES') && profile_open_yn == 'N' && (
                <>
                  <View style={_styles.reqRenderThumb}></View>
                  <View style={_styles.reqRenderItem}>
                    <Image source={IMAGE.logoMark} style={{width: 70, height: 70, marginTop: 20, opacity: 0.6}} resizeMode="contain" />
                    <Text style={_styles.reqRenderItemText}>터치하고 열어보기</Text>
                  </View>
                </>
              )}
            </ImageBackground>

          </TouchableOpacity>
        }
      </>
    );
  }
};



{/* ######################################################################################################
################################################ Style 영역 ##############################################
###################################################################################################### */}

const _styles = StyleSheet.create({
  root: {
    //flex: 1,
    /* flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start', */
    backgroundColor: 'white',
    height: height,
    width: width,
  },
  topContainer: {
    marginHorizontal: 24,
    overflow: 'hidden',
  },
  dotContainer: {
    flexDirection: 'row',
  },
  dot: {
    width: 9,
    height: 9,
    backgroundColor: '#e2e2e2',
    borderRadius: 5,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'flex-end'
  },
  showText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 14,
    fontWeight: 'normal',
    fontStyle: 'normal',
    lineHeight: 26,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#333333',
    marginRight: 8,
  },
  imageWarpper: {
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    paddingHorizontal: 21,
  },

  renderItemContainer: {
    width: (width - 54) / 2,
    height: (width - 54) / 2,
    marginBottom: 12,
    borderRadius: 15,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#ebe9ef',
    overflow: 'hidden',
  },
  renderItemTopContainer: {
    position: 'absolute',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
    left: 0,
    right: 0,
    top: 3,
    zIndex: 1,
    paddingHorizontal: 5,
  },
  renderItemTopIcon: {
    width: 25,
    height: 25,
    marginRight: 1,
    marginTop: 5,
    borderRadius: 10,
  },
  renderItemTopZzimIcon: {
    width: 20,
    height: 20,
    marginRight: 3,
    marginTop: 5,
  },
  renderItemTopText: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 13,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
    marginRight: 3,
  },
  renderItemBottomContainer: {
    position: 'absolute',
    flexDirection: 'column',
    justifyContent: `center`,
    left: 10,
    bottom: 10,
  },
  renderItemBottomTextName: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 14,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
    marginTop: 2,
  },
  renderItemBottomTextSpec: {
    opacity: 0.86,
    fontFamily: 'AppleSDGothicNeoR00',
    fontSize: 10,
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  levelText: {
    fontFamily: 'AppleSDGothicNeoB00',
    fontSize: 13,
    color: '#fff',
  },
  tabItem: (isOn: boolean, itemColor: string) => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      height: 25,
      borderRadius: 20,
      marginRight: 5,
      backgroundColor: isOn ? itemColor : '#ECECEC',
    }
  },
  tabItemText: {
    //flexDirection: `row`,
    fontSize: 14,
    fontFamily: 'AppleSDGothicNeoEB00',
    color: ColorType.white,
    letterSpacing: 0,
    textAlign: 'left',
  },
  noData: {
    paddingHorizontal: 20,
    height: height - 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    fontFamily: 'AppleSDGothicNeoB00',
    color: '#646467',
  },
  reqRenderThumb: {
    width: '100%', 
    height: '100%', 
    backgroundColor: '#fff', 
    opacity: 0.9,
  },
  reqRenderItem: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%', 
    height: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  reqRenderItemText: {
    color: '#787878',
    fontSize: 14,
    fontFamily: 'AppleSDGothicNeoB00',
    marginTop: 10,
  },
  whiteText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 8,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  yellowText: {
    fontFamily: 'AppleSDGothicNeoEB00',
    fontSize: 8,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#FDFFD8',
  },
  authBadgeImg: {
    marginLeft: -5,
    marginRight: -2,
    marginTop: -2
  },
  authBadgeImg02: {
    marginLeft: -9,
    marginRight: 0,
    marginTop: -3
  },
  scoreBadge: {
    width: 36,
    height: 14,
    borderRadius: 5,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `space-between`,
    paddingHorizontal: 3,
  },
  authBadge: {
    width: 40,
    height: 14,
    borderRadius: 5,
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    marginRight: 5,
  },
  liveTabArea: {
    flexDirection: 'row',
  },
  liveTabItem: (isOn: boolean, type: string) => {
    return {
      backgroundColor: isOn ? type == 'RES' ? '#FE0456' : '#7986EE' : '#fff',
      borderWidth: 1,
      borderColor: type == 'RES' ? '#FE0456' : '#7986EE',
      borderRadius: 8,
      width: 70,
      height: 22,
      alignItems: `center`,
      justifyContent: `center`,
      marginLeft: 4,
    }
  },
  liveTabText: (isOn: boolean, type: string) => {
    return {
      fontFamily: 'AppleSDGothicNeoEB00',
      fontSize: 11,
      color: !isOn ? type == 'RES' ? '#FE0456' : '#7986EE' : '#fff',
    };
  },
  liveScoreArea: (type: string) => {
    return {
      flexDirection: `row`,
      alignItems: `center`,
      justifyContent: `center`,
      borderWidth: 1,
      borderColor: type == 'LIVE_RES' ? '#FE0456' : '#7986EE',
      borderRadius: 5,
      paddingHorizontal: 5,
      height: 19,
      backgroundColor: '#fff',
      marginTop: 2,
      marginLeft: 3,
    };
  },
  liveScoreText: (type: string) => {
    return {
      fontFamily: 'AppleSDGothicNeoB00',
      fontSize: 12,
      color: type == 'LIVE_RES' ? '#FE0456' : '#7986EE',
    };
  }


  
});