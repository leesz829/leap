import { useIsFocused, useNavigation, useFocusEffect  } from '@react-navigation/native';
import { CommonCode, FileInfo, LabelObj, ProfileImg, LiveMemberInfo, LiveProfileImg, ScreenNavigationProp } from '@types';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, RefreshControl, Platform } from 'react-native';
import { get_story_board_list, profile_open, get_story_active } from 'api/models';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import Image from 'react-native-fast-image';
import { ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import { ColorType } from '@types';
import { isEmptyData } from 'utils/functions';
import { STACK } from 'constants/routes';
import MasonryList from '@react-native-seoul/masonry-list';
import { CommonLoading } from 'component/CommonLoading';
import LinearGradient from 'react-native-linear-gradient';
import ActiveRender from 'component/story/ActiveRender';



/* ################################################################################################################
###### Story
################################################################################################################ */

const { width, height } = Dimensions.get('window');

export const Story = () => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 본인 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 더보기 로딩 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const flatListRef = useRef(null);

  const [isTopBtn, setIsTopBtn] = useState(false);

  const [isEmpty, setIsEmpty] = useState(false); 
  //const [storyList, setStoryList] = useState<any>([]); // 스토리 목록
  const [storyList, setStoryList] = React.useState<any>([]);
  const [pageNum, setPageNum] = useState(1); // 페이지 번호
  const [isListFinally, setIsListFinally] = useState(false); // 목록 마지막 여부

  const [activeData, setActiveData] = React.useState({
    alarmData: [],
    storyData: [],
  });

  // 스토리 등록 이동
  // const goStoryRegister = async () => {
  //   navigation.navigate(STACK.COMMON, { screen: 'StoryRegi', });
  // };

  // 스토리 유형 선택
  const goStoryEdit = async (type:string) => {
    navigation.navigate(STACK.COMMON, {
    screen: 'StoryEdit',
      params: {
        storyType : 'STORY',
      }
    });
  }

  // 스토리 알림 이동
  const goStoryActive = async () => {
    navigation.navigate(STACK.COMMON, { screen: 'StoryActive', });
  };

  // 스토리 상세 이동
  const goStoryDetail = async (storyBoardSeq:number) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryDetail',
      params: {
        storyBoardSeq: storyBoardSeq,
      }
    });
  };

  // ##################################################################################### 탭 관련
  const [currentIndex, setCurrentIndex] = useState(0);
  const dataRef = useRef(null);

  // 탭 목록
  const [tabs, setTabs] = React.useState([
    {
      type: 'STORY',
      title: '스토리',
      data: [],
      isNew: false,
    },
    {
      type: 'ALARM',
      title: '알림',
      data: [],
      isNew: false,
    },
    {
      type: 'BOARD',
      title: '내가쓴글',
      data: [],
      isNew: false,
    },
  ]);

  const onPressDot = async (index:any, type:any) => {
    console.log('index ::::: ' , index);
    setCurrentIndex(index);
  };



  // ##################################################################################### 목록 새로고침
  const handleRefresh = () => {
    console.log('refresh!!!!!!!!!!!!!!');
    getStoryBoardList('REFRESH', 1);
  };

  // ##################################################################################### 목록 더보기
  const loadMoreData = () => {
    console.log('ADD!!!!!!!!!!!!!!');
    getStoryBoardList('ADD', pageNum+1);
  };

  // ##################################################################################### 맨위 이동
  const scrollToTop = () => {
    flatListRef.current.scrollToIndex({ animated: true, index: 0 });
  };

  // ##################################################################################### 프로필 카드 열람 팝업 활성화
  const profileCardOpenPopup = (memberSeq:number, openCnt:number) => {
    if(openCnt > 0) {
      navigation.navigate(STACK.COMMON, { 
        screen: 'MatchDetail',
        params: {
          trgtMemberSeq: memberSeq,
          type: 'OPEN',
          //matchType: 'STORY',
        } 
      });

    } else {
      show({
        title: '프로필 카드 열람',
        content: '(7일간)프로필을 열람하시겠습니까?',
        passAmt: '15',
        confirmCallback: function() {
          if(memberBase?.pass_has_amt >= 15) {
            profileCardOpen(memberSeq);
          } else {
            show({
              content: '패스가 부족합니다.',
              isCross: true,
            });
          }
        },
        cancelCallback: function() {
        },
      });
    }
  };

  // ##################################################################################### 프로필 카드 열람
  const profileCardOpen =  async (memberSeq:number) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      try {
        setIsClickable(false);
        setIsLoading(true);
  
        const body = {
          type: 'STORY',
          trgt_member_seq: memberSeq
        };
  
        const { success, data } = await profile_open(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              getStoryBoardList('ADD', pageNum);
              navigation.navigate(STACK.COMMON, { 
                screen: 'MatchDetail',
                params: {
                  trgtMemberSeq: memberSeq,
                  type: 'OPEN',
                  //matchType: 'STORY',
                } 
              });
              break;
            case EXIST:
              show({
                content: '이미 보관함에 존재하는 회원입니다.',
                isCross: true,
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
        setIsClickable(true);
        setIsLoading(false);
      }
    }
  };

  // ############################################################################# 스토리 목록 조회
  const getStoryBoardList = async (_type:string, _pageNum:number) => {
    console.log('_type :::::: ' , _type);

    if(_type == 'ADD' && _pageNum > 1 && isListFinally) {

    } else {
      try {
        if(_type == 'REFRESH') {
          setIsListFinally(false);
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        };
  
        const body = {
          load_type: _type,
          page_num: _pageNum,
        };
  
        console.log('body ::::: ' , body);
  
        const { success, data } = await get_story_board_list(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:
              /* if(_type == 'ADD') {
                let dataArray = storyList;
                data?.story_list.map((item: any) => {
                  dataArray.push(item);
                })
                setStoryList(dataArray);
              } else {
                setStoryList(data?.story_list);
              }; */
  
              setStoryList(data?.story_list);
  
              /* if(data?.story_list.length > 0) {
                console.log('data?.page_num :::: ' ,data?.page_num);
                setPageNum(isEmptyData(data?.page_num) ? data?.page_num : 0);
              } */
  
              if(_type == 'REFRESH') {
                setPageNum(1);
              } else {
                if(data?.story_list.length > storyList.length) {
                  setPageNum(isEmptyData(data?.page_num) ? data?.page_num : 0);
                }
              };

              console.log('data?.finally_yn :::::: '  ,data?.finally_yn);
  
              if(isEmptyData(data?.finally_yn) && data?.finally_yn == 'Y') {
                setIsListFinally(true);
              }
  
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
        if(_type == 'REFRESH') {
          setIsRefreshing(false);
        } else {
          setIsLoading(false);
        }
      } 
    }
  };

  // ############################################################################# 스토리 활동 정보 조회
  const getStoryActive = async () => {
    try {
      setIsLoading(true);

      const body = {
        
      };

      const { success, data } = await get_story_active(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:
            setActiveData({
              alarmData: data?.alarm_data,
              storyData: data?.story_data,
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

  /* ################################################################################ 스크롤 제어 */
  const handleScroll = async (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if(yOffset > 300) {
      setIsTopBtn(true);
    } else {
      setIsTopBtn(false);
    }
  };

  /* ##################################################################################################################################
  ################## 아이템 렌더링 관련 함수
  ################################################################################################################################## */

  // ###############################  목록 아이템 렌더링
  const RenderListItem = React.memo(({ item, type }) => {
    const storyBoardSeq = item.story_board_seq; // 스토리 게시글 번호
    const storyType = item?.story_type; // 스토리 유형
    const imgPath = findSourcePath(item?.story_img_path);
    const voteImgPath01 = findSourcePath(item?.vote_img_path_01);
    const voteImgPath02 = findSourcePath(item?.vote_img_path_02);
    const secretYn = item?.secret_yn;

    let _width = 0; // 가로길이
    let _height = 0; // 세로길이

    if(type == 'LARGE') {
      /* _width = width - 16;
      _height = width - 43; */

      _width = width - 16;
      _height = width + 30;
    } else if(type == 'MEDIUM') {
      /* _width = (width - 40) / 1.91;
      _height = width - 40; */

      _width = (width - 40) / 1.91;
      _height = width + 50;
    } else {
      /* _width = (width - 40) / 1.91;
      _height = (width - 45) / 2; */

      _width = (width - 40) / 1.91;
      _height = (width + 44) / 2;
    }

    let isNoImageLayout = (storyType == 'SECRET' || storyType == 'STORY') && !isEmptyData(imgPath) ? true : false; // 노이미지 레이아웃 여부
    let bgColor:any = []; // 배경색
    let applyMstImg = findSourcePath(item?.mst_img_path); // 적용 대표 이미지

    if(storyType == 'SECRET') {
      bgColor = ['#8E1DFF', '#000000'];
    } else if(storyType == 'STORY') {
      bgColor = ['#FFD76B', '#FFB801'];
    } else if(storyType == 'VOTE') {
      bgColor = ['#A9DBFF', '#7B81EC'];
    }

    if(storyType == 'SECRET' || secretYn == 'Y') {
      if(item?.gender == 'M') {
        applyMstImg = ICON.storyMale;
      } else {
        applyMstImg = ICON.storyFemale;
      }      
    }

    return (
      <>
        <SpaceView mb={type == 'SMALL' ? 0 : 5} viewStyle={_styles.itemArea02(_width, _height)}>
          <TouchableOpacity activeOpacity={0.7} onPress={() => { goStoryDetail(storyBoardSeq); }}>

            {/* ########################################## 스토리 유형 */}
            <SpaceView viewStyle={_styles.typeArea(storyType)}>
              <Text style={_styles.typeText}>{item?.story_type_name}</Text>
            </SpaceView>

            {/* ########################################## 이미지 영역 */}
            <SpaceView>
              {storyType != 'SECRET' && isNoImageLayout ? (
                <>
                  <LinearGradient
                    colors={['#5A707F', '#3D4348']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={_styles.noImageArea(item?.gender, storyType, _height-55)} >

                    {/* 내용 */}
                    <SpaceView mt={type == 'SMALL' ? 10 : 20} pl={10} pr={10}>
                      <Text style={_styles.contentsText('#FFF6BE')} numberOfLines={type == 'SMALL' ? 1 : 6}>{item?.contents}</Text>
                    </SpaceView>
                  </LinearGradient>
                </>
              ) : (
                <>
                  {/* 이미지가 2개 이상인 경우 표시 */}
                  {item.img_cnt > 1 && (
                    <SpaceView viewStyle={_styles.multiImageArea}>
                      <Image source={ICON.murtipleImage} style={styles.iconSquareSize(18)} resizeMode={'cover'} />
                    </SpaceView>
                  )}

                  {/* 썸네일 이미지 */}
                  <SpaceView>
                    {storyType == 'VOTE' ? (
                      <Image source={voteImgPath01} style={{width: _width, height: _height-55}} resizeMode={'cover'} />
                    ) : storyType == 'SECRET' ? (
                      <Image source={item?.gender == 'M' ? IMAGE.storySecretMale : IMAGE.storySecretFemale} style={{width: _width, height: _height-55}} resizeMode={'cover'} />
                    ) : (
                      <Image source={imgPath} style={{width: _width, height: _height-55}} resizeMode={'cover'} />
                    )}
                  </SpaceView>

                  {/* 내용 */}
                  <SpaceView pr={10} pl={10} viewStyle={{position: 'absolute', bottom: 10, left: 0, right: 0, zIndex: 1,}}>
                    <SpaceView>
                      <Text style={_styles.contentsText('#FFF6BE')} numberOfLines={type == 'SMALL' ? 4 : 10}>{item?.contents}</Text>
                    </SpaceView>
                  </SpaceView>

                  {/* 딤 처리 영역 */}
                  <LinearGradient
                    colors={['transparent', '#000000']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={_styles.dimsArea} />
                </>
              )}
            </SpaceView>

            {/* ########################################## 프로필 영역 */}
            <SpaceView viewStyle={_styles.profileArea}>

              {/* 대표 사진 노출 */}
              <SpaceView mr={5}>
                <Image source={applyMstImg} style={_styles.mstImgStyle(30, 20)} resizeMode={'cover'} />
              </SpaceView>

              <SpaceView>
                
                {/* 인증 레벨, 인상 수식어 노출 */}
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  {(storyType != 'SECRET' && secretYn != 'Y' && (isEmptyData(item?.face_modifier) || (isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5))) && (
                    <>
                      {(isEmptyData(item?.auth_acct_cnt) && item?.auth_acct_cnt >= 5) && (
                        <SpaceView mr={2}><Text style={_styles.profileText}>LV {item?.auth_acct_cnt}</Text></SpaceView>
                      )}

                      {isEmptyData(item?.face_modifier) && (
                        <SpaceView>
                          <SpaceView><Text style={_styles.profileText}>#{item?.face_modifier}</Text></SpaceView>
                        </SpaceView>
                      )}
                    </>
                  )}
                </SpaceView>

                {/* 닉네임 노출 */}
                {(storyType == 'SECRET' || secretYn == 'Y') ? (
                  <Text style={_styles.nicknameText('#D5CD9E', 12, type)} numberOfLines={2}>{item?.nickname_modifier}{'\n'}{item?.nickname_noun}</Text>
                ) : (
                  <Text style={_styles.nicknameText('#D5CD9E', 12, type)} numberOfLines={1}>{item?.nickname}</Text>
                )}
              </SpaceView>
            </SpaceView>

          </TouchableOpacity>
        </SpaceView>
      </>
    );
  });

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  React.useEffect(() => {
    if(isFocus) {
      setIsRefreshing(false);

      //getStoryBoardList('BASE', 0);
      getStoryActive();

      if(storyList.length == 0) {
        getStoryBoardList('ADD', pageNum == 0 ? 1 : pageNum);
      }
    } else {
      //setStoryList([]);
    }
  }, [isFocus]);


  function CustomRefreshControl({ refreshing, onRefresh }) {
    console.log('refreshing ::::::: ' , refreshing);
    console.log('onRefresh ::::::: ' , onRefresh);

    return (
      <>
        <View style={{ position: 'absolute', top: 0, height: 100, backgroundColor: '#fff' }}>
          {refreshing ? (
            <Text>Pull to Refresh</Text>
          ) : (
            <Text>Pull to Refresh</Text>
          )}
        </View>
      </>
      
    );
  }

  return (
    <>
      {isLoading && <CommonLoading />}

      <TopNavigation currentPath={'Story'} />

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={_styles.wrap}
      >

        {/* ############################################################################################################
        ################################################################################################################
        ###### 탭 영역
        ################################################################################################################
        ############################################################################################################ */}
        <SpaceView mt={10} mb={20} viewStyle={{zIndex:10}}>
          <SpaceView viewStyle={layoutStyle.alignCenter}>
            <SpaceView viewStyle={_styles.tabArea}>
              {tabs.map((item, index) => (
                <>
                  <TouchableOpacity 
                    key={'story_'+index} 
                    hitSlop={commonStyle.hipSlop10}
                    disabled={currentIndex == index}
                    onPress={() => { onPressDot(index); }}
                  >
                    <Text style={_styles.tabText(currentIndex == index)}>{item.title}</Text>
                  </TouchableOpacity>
                </>
              ))}
            </SpaceView>
          </SpaceView>
        </SpaceView>

        {/* ############################################################################################################
        ################################################################################################################
        ###### 컨텐츠 영역
        ################################################################################################################
        ############################################################################################################ */}
        <SpaceView viewStyle={{height: height-200}}>

          {/* ############################################################################################################
          ###### 스토리
          ############################################################################################################ */}
          {currentIndex == 0 && (
            <>
              {storyList.length > 0 ? (
                <>
                  <FlatList
                    data={storyList}
                    ref={flatListRef}
                    keyExtractor={(item, index) => index.toString()}
                    style={_styles.contentWrap}
                    contentContainerStyle={{ paddingBottom: 30 }} // 하단 여백 추가
                    contentInset={{ bottom: 60 }}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    onScroll={handleScroll} // 스크롤 감지 이벤트 핸들러
                    /* getItemLayout={(data, index) => (
                      {
                          length: (width - 54) / 2,
                          offset: ((width - 54) / 2) * index,
                          index
                      }
                    )} */
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
                    onEndReached={loadMoreData}
                    onEndReachedThreshold={0.1}
                    ListFooterComponent={isLoadingMore && <Text>Loading more...</Text>}
                    renderItem={({ item:innerItem, index:innerIndex }) => {

                      return (
                        <>
                          <SpaceView key={innerIndex} viewStyle={_styles.itemWrap(innerItem.type)}>

                            {innerItem.type == 'ONLY_LARGE' ? (
                              <>
                                {innerItem.large_list.map((item, index) => {
                                  return (
                                    <RenderListItem key={'ol' + index} item={item} type={item?.size_type} />
                                  )
                                })}
                              </>
                            ) : innerItem.type == 'ONLY_MEDIUM' ? (
                              <>
                                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                  {innerItem.medium_list.map((item, index) => {
                                    return (
                                      <RenderListItem key={'om' + index} item={item} type={item?.size_type} />
                                    )
                                  })}

                                  {innerItem.medium_list.length < 2 && (
                                    <LinearGradient colors={['#5A707F', '#3D4348']} style={_styles.dummyArea('M')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                                      {/* <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} /> */}
                                      <Text style={_styles.dummyText}>LEAP</Text>
                                    </LinearGradient>
                                  )}
                                </SpaceView>
                              </>
                            ) : innerItem.type == 'ONLY_SMALL' ? (
                              <>
                                <SpaceView mb={5} viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                  {innerItem.small_list.map((item, index) => {
                                    return (
                                      <RenderListItem key={'os' + index} item={item} type={item?.size_type} />
                                    )
                                  })}

                                  {innerItem.small_list.length < 2 && (
                                    <LinearGradient colors={['#5A707F', '#3D4348']} style={_styles.dummyArea('S')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                                      {/* <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} /> */}
                                      <Text style={_styles.dummyText}>LEAP</Text>
                                    </LinearGradient>
                                  )}
                                </SpaceView>
                              </>
                            ) : innerItem.type == 'COMPLEX_MEDIUM' ? (
                              <>
                                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                  {innerItem.medium_list.map((item, index) => {
                                    return (
                                      <RenderListItem key={'cmm' + index} item={item} type={item?.size_type} />
                                    )
                                  })}
                                  <SpaceView viewStyle={{flexDirection: 'column'}}>
                                    {innerItem.small_list.map((item, index) => {
                                      return (
                                        <SpaceView key={'cms' + index} mb={index == 0 ? 5 : 0}>
                                          <RenderListItem item={item} type={item?.size_type} />
                                        </SpaceView>
                                      )
                                    })}

                                    {innerItem.small_list.length < 2 && (
                                      <LinearGradient colors={['#5A707F', '#3D4348']} style={_styles.dummyArea('S')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                                        {/* <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} /> */}
                                        <Text style={_styles.dummyText}>LEAP</Text>
                                      </LinearGradient>
                                    )}
                                  </SpaceView>
                                </SpaceView>
                              </>
                            ) : innerItem.type == 'COMPLEX_SMALL' ? (
                              <>
                                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                  <SpaceView viewStyle={{flexDirection: 'column'}}>
                                    {innerItem.small_list.map((item, index) => {
                                      return (
                                        <SpaceView key={'css' + index} mb={index == 0 ? 5 : 0}>
                                          <RenderListItem item={item} type={item?.size_type} />
                                        </SpaceView>
                                      )
                                    })}
                                    {innerItem.small_list.length < 2 && (
                                        <LinearGradient colors={['#5A707F', '#3D4348']} style={_styles.dummyArea('S')} start={{ x: 1, y: 0 }} end={{ x: 1, y: 1 }} >
                                          {/* <Image source={IMAGE.logoStoryTmp} style={{width: 150, height: 45}} resizeMode={'cover'} /> */}
                                          <Text style={_styles.dummyText}>LEAP</Text>
                                        </LinearGradient>
                                    )}
                                  </SpaceView>
                                  {innerItem.medium_list.map((item, index) => {
                                    return (
                                      <RenderListItem key={'csm' + index} item={item} type={item?.size_type} />
                                    )
                                  })}
                                </SpaceView>
                              </>
                            ) : (
                              <>
                                
                              </>
                            )}

                          </SpaceView>
                        </>
                      )
                    }}
                  />
                </>
              ) : (
                <>
                  <SpaceView viewStyle={_styles.noData}>
                    <Text style={_styles.noDataText}>스토리가 없습니다.</Text>
                  </SpaceView>
                </>
              )}
            </>
          )}

          {/* ############################################################################################################
          ###### 알림
          ############################################################################################################ */}
          {currentIndex == 1 && (
            <>
              <SpaceView>
                <ActiveRender dataList={activeData.alarmData} type={'ALARM'} selectCallbackFn={getStoryActive} />
              </SpaceView>
            </>
          )}

          {/* ############################################################################################################
          ###### 내가쓴글
          ############################################################################################################ */}
          {currentIndex == 2 && (
            <>
              <SpaceView>
                <ActiveRender dataList={activeData.storyData} type={'BOARD'} selectCallbackFn={getStoryActive} />
              </SpaceView>
            </>
          )}
        </SpaceView>

      </LinearGradient>

      {/* ###################################################################################################### 맨위 이동 버튼 */}

      {(storyList.length > 0 && isTopBtn) && (currentIndex == 0) && (
        <SpaceView viewStyle={_styles.topBtnArea}>
          <TouchableOpacity onPress={() => { scrollToTop(); }}>
            <Text style={_styles.topBtnText}>맨위로</Text>
          </TouchableOpacity>
        </SpaceView>
      )}

      {/* ##################################################################### 하단 버튼 */}
      {currentIndex == 0 && (
        <SpaceView viewStyle={_styles.btnArea}>
          <SpaceView viewStyle={_styles.btnTextArea}>
            {/* <TouchableOpacity onPress={() => { goStoryActive(); }} style={_styles.btnItemArea}>
              <Image source={ICON.clockIcon} style={styles.iconSquareSize(18)} />
            </TouchableOpacity> */}
            <TouchableOpacity onPress={() => { goStoryEdit(); }}>
              <Text style={_styles.btnRegiText}>스토리 등록</Text>
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>
      )}
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
  tabArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#292F33',
    borderRadius: Platform.OS == 'ios' ? 20 : 50,
    paddingHorizontal: 10,
  },
  tabText: (isOn: boolean) => {
		return {
			fontFamily: 'MinSans-Bold',
			color: isOn ? '#FFDD00' : '#445561',
      width: 60,
      textAlign: 'center',
      paddingVertical: 3,
		};
	},
  contentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingTop: 5,
    paddingBottom: 50,
    paddingHorizontal: 5,
    width: width,
    height: height-120,
  },
  itemWrap: (type:string) => {
    let loc = 'center';
    /* if(type == 'COMPLEX_RIGHT') {
      loc = 'flex-end';
    } else if(type == 'COMPLEX_LEFT') {
      loc = 'flex-start';
    } */

    return {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: loc,
      width: '100%',
    };
  },
  itemArea02: (width:number, height:number) => {
    return {
      width: width,
      height: height,
      borderRadius: 10,
      overflow: 'hidden',
      marginHorizontal: 3,
    };
  },
  itemArea: (size:number) => {
    return {
      width: size,
      height: size,
      borderRadius: 10,
      overflow: 'hidden',
    };
  },
  dummyArea: (type:string) => {
    let _w = (width - 40) / 1.91;
    let _h = width + 40;

    if(type == 'S') {
      _w = (width - 40) / 1.91;
      _h = (width + 40) / 2;
    }

    return {
      width: _w,
      height: _h,
      backgroundColor: '#FE0456',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
      overflow: 'hidden',
      marginHorizontal: 3,
    };
  },
  dummyText: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 22,
    color: '#FFF6BE',
  },
  btnArea: {
    position: 'absolute',
    bottom: 13,
    right: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  btnTextArea: {
    flexDirection: 'row',
  },
  btnItemArea: {
    //width: 50,
    paddingHorizontal: 25,
    paddingVertical: 15,
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(38,38,38,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnRegiText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 14,
    color: '#3D4348',
    backgroundColor: '#FFDD00',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: Platform.OS == 'android' ? 50 : 20,
    overflow: 'hidden',
  },
  profileArea: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    overflow: 'hidden',
  },
  bottomArea: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
  },
  typeArea: (type:string) => {
    let bgColor = '#FF9900';

    if(type == 'VOTE') {
      bgColor = '#7B81EC';
    } else if(type == 'SECRET') {
      bgColor = '#B873FF';
    }

    return {
      position: 'absolute',
      top: 10,
      left: 10,
      //backgroundColor: 'rgba(0,0,0,0.5)',
      backgroundColor: '#FFDD00',
      borderRadius: 15,
      paddingVertical: 2,
      width: 45,
      zIndex: 1,
    };
  },
  typeText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
  },
  mstImgStyle: (size:number, bdRadius:number) => {
    return {
      width: size,
      height: size,
      borderRadius: bdRadius,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#FFDD00',
    };
  },
  secretIconStyle: (sizeType:string) => {
    let size = 230;

    if(sizeType == 'MEDIUM') {
      size = 160;
    } else if(sizeType == 'SMALL') {
      size = 120;
    }

    return {
      width: size,
      height: size,
      overflow: 'hidden',
    };
  },
  contentsText: (_color:string) => {
    return {
      fontFamily: 'Pretendard-Light',
      fontSize: 12,
      color: _color,
    };
  },
  activeText: (_color:string) => {
    return {
      fontFamily: 'Pretendard-SemiBold',
      fontSize: 12,
      color: _color,
      backgroundColor: '#FFDD00',
    };
  },
  profileText: {
    backgroundColor: '#FFDD00',
    borderTopRightRadius: 5,
    fontFamily: 'Pretendard-Regular',
    fontSize: 11,
    color: '#fff',
    paddingHorizontal: 3,
  },
  nicknameText: (_color:string, _fontSize:number, _sizeType:string) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: _fontSize,
      color: _color,
      width: _sizeType == 'LARGE' ? '100%' : width - 260,
    };
  },
  noImageArea: (gender:string, storyType:string, _height:number) => {
    return {
      width: '100%',
      height: _height,
      //backgroundColor: gender == 'M' ? '#D5DAFC' : '#FEEFF2',
      alignItems: storyType == 'SECRET' ? 'flex-start' : 'center',
      justifyContent: storyType == 'SECRET' ? 'flex-end' : 'center',
    };
  },
  topBtnArea: {
    position: 'absolute',
    top: 125,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  topBtnText: {
    textAlign: 'center',
    backgroundColor: '#1A1E1C',
    width: 85,
    paddingVertical: 2,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    color: '#D5CD9E',
    borderRadius: 10,
    overflow: 'hidden',
  },
  dimsArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    opacity: 0.6,
    height: 80,
  },
  noData: {
    paddingHorizontal: 20,
    height: height,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 180,
  },
  noDataText: {
    fontFamily: 'Pretendard-Medium',
    color: '#555555',
    fontSize: 15,
  },
  multiImageArea: {
    position: 'absolute',
    top: 13,
    right: 13,
    zIndex: 1,
  },
  







});