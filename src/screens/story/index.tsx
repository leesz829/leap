import { useIsFocused, useNavigation, useFocusEffect, RouteProp } from '@react-navigation/native';
import { ScreenNavigationProp, StackParamList } from '@types';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { StackNavigationProp } from '@react-navigation/stack';
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
import Talk from 'component/story/Talk';
import TalkItem from 'component/story/TalkItem';



/* ################################################################################################################
###### Story
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Story'>;
  route: RouteProp<StackParamList, 'Story'>;
}

const { width, height } = Dimensions.get('window');

export const Story = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const memberBase = useUserInfo(); // 본인 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크

  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  const [isTopBtn, setIsTopBtn] = useState(false);
  const [currentTab, setCurrentTab] = useState('TALK');

  const [isOnShrink, setIsOnShrink] = React.useState(false); // 쉬링크 상태 변수

  const flatListRef = React.useRef(null);

  const [isEmpty, setIsEmpty] = useState(false); 
  //const [storyList, setStoryList] = useState<any>([]); // 스토리 목록
  const [storyList, setStoryList] = React.useState<any>([]);
  const [pageNum, setPageNum] = useState(1); // 페이지 번호
  const [isListFinally, setIsListFinally] = useState(false); // 목록 마지막 여부

  const [activeData, setActiveData] = React.useState({
    alarmData: [],
    storyData: [],
  });

  // 스토리 유형 선택
  const goStoryEdit = async (type:string) => {
    navigation.navigate(STACK.COMMON, {
    screen: 'StoryRegi',
      params: {
        storyType : 'STORY',
      }
    });
  };

  // ##################################################################################### 목록 새로고침
  const handleRefresh = () => {
    console.log('refresh!!!!!!!!!!!!!!');
    //getStoryBoardList('REFRESH', 1);
  };

  // ##################################################################################### 목록 더보기
  const loadMoreData = () => {
    console.log('ADD!!!!!!!!!!!!!!');
    //getStoryBoardList('ADD', pageNum+1);
  };

  // ##################################################################################### 맨위 이동
  const scrollToTop = () => {
    flatListRef.current.scrollToIndex({ animated: true, index: 0 });
  };

  /* ################################################################################ 스크롤 제어 */
  const handleScroll = async (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    /* if(yOffset > 300) {
      setIsTopBtn(true);
    } else {
      setIsTopBtn(false);
    }; */

    if(yOffset > 150) {
      setIsOnShrink(true);
    } else {
      setIsOnShrink(false);
    }
  };

  // ##################################################################################### 스토리 상세 이동
  const goStoryDetail = async (storyBoardSeq:number) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryDetail',
      params: {
        storyBoardSeq: storyBoardSeq,
      }
    });
  };

  // ############################################################################# 스토리 목록 조회
  const getStoryBoardList = async (_type:string, _pageNum:number, _keyword:string) => {
    if(_type == 'ADD' && _pageNum > 1 && isListFinally) {

    } else {
      try {
        if(_type == 'REFRESH') {
          setIsListFinally(false);
          setIsRefreshing(true);
        } else {
          setIsLoading(true);
        };

        //let searchKeywordCode = isEmptyData(_keyword) ? _keyword : selectedKeyword;
        let searchKeywordCode = _keyword;
  
        const body = {
          load_type: _type,
          page_num: _pageNum,
          keyword_code: searchKeywordCode == 'ALL' ? '' : searchKeywordCode,
        };
  
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

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  /* React.useEffect(() => {
    if(isFocus) {
      //getStoryActive();
    } else {
      //setStoryList([]);
    }
  }, [isFocus]); */

  React.useEffect(() => {
    if(isFocus) {
      setIsRefreshing(false);

      if(storyList.length == 0 || isRefreshing) {
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

      <SpaceView viewStyle={_styles.wrap}>

        {/* ########################################################################################
        ####### 쉬링크 ON UI
        #########################################################################################*/}
        {isOnShrink && (
          <SpaceView viewStyle={_styles.headerWrap}>
            <SpaceView viewStyle={layoutStyle.alignCenter}>
              <TouchableOpacity
                onPress={() => { scrollToTop(); }}
                style={_styles.backContainer}
                hitSlop={commonStyle.hipSlop20}
              >
                <Image source={ICON.backBtnType01} style={styles.iconSquareSize(24)} resizeMode={'contain'} />
              </TouchableOpacity>

              <SpaceView viewStyle={_styles.tabWrap}>
                <SpaceView viewStyle={{flexDirection: 'row'}}>
                  <TouchableOpacity
                    //style={{marginRight: 10}}
                    //onPress={() => (setCurrentTab('TALK'))}
                  >
                    <Text style={_styles.tabText(currentTab == 'TALK', 20)}>리프Talk</Text>
                  </TouchableOpacity>
                  {/* <TouchableOpacity
                    onPress={() => (setCurrentTab('STORY'))}>
                    <Text style={_styles.tabText(currentTab == 'STORY', 20)}>FEED</Text>
                  </TouchableOpacity> */}
                </SpaceView>
              </SpaceView>

            </SpaceView>
          </SpaceView>
        )}

        <FlatList
          data={storyList}
          ref={flatListRef}
          keyExtractor={(item, index) => index.toString()}
          style={_styles.contentWrap}
          contentContainerStyle={{ paddingBottom: 30, width: '100%', paddingHorizontal: 10 }} // 하단 여백 추가
          contentInset={{ bottom: 60 }}
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          onScroll={handleScroll} // 스크롤 감지 이벤트 핸들러
          scrollEventThrottle={10}
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
          //onEndReached={loadMoreData}
          onEndReachedThreshold={0.1}
          ListHeaderComponent={<StoryHeader selectFn={getStoryBoardList} />}
          //ListFooterComponent={isLoadingMore && <Text>Loading more...</Text>}
          renderItem={({ item, index }) => {

            return (
              <>
                <TalkItem item={item} profileOpenFn={null} goDetailFn={goStoryDetail} />
              </>
            )
          }}
        />

        {/* ############################################################################################################
        ################################################################################################################
        ###### 컨텐츠 영역
        ################################################################################################################
        ############################################################################################################ */}

        {/* <SpaceView>
          {currentTab == 'TALK' && <Talk isRefresh={props.route.params?.isRefresh} />}

        </SpaceView> */}











        {/* <SpaceView mt={500}></SpaceView> */}


        <SpaceView viewStyle={{height: height-200}}>

          {/* ############################################################################################################
          ###### 알림
          ############################################################################################################ */}
          {/* {currentIndex == 1 && (
            <>
              <SpaceView>
                <ActiveRender dataList={activeData.alarmData} type={'ALARM'} selectCallbackFn={getStoryActive} />
              </SpaceView>
            </>
          )} */}

          {/* ############################################################################################################
          ###### 내가쓴글
          ############################################################################################################ */}
          {/* {currentIndex == 2 && (
            <>
              <SpaceView>
                <ActiveRender dataList={activeData.storyData} type={'BOARD'} selectCallbackFn={getStoryActive} />
              </SpaceView>
            </>
          )} */}
        </SpaceView>

      </SpaceView>

      {/* ###################################################################################################### 맨위 이동 버튼 */}
      {/* {(storyList.length > 0 && isTopBtn) && (currentIndex == 0) && (
        <SpaceView viewStyle={_styles.topBtnArea}>
          <TouchableOpacity onPress={() => { scrollToTop(); }}>
            <Text style={_styles.topBtnText}>맨위로</Text>
          </TouchableOpacity>
        </SpaceView>
      )} */}

      {/* ##################################################################### 하단 버튼 */}
      <SpaceView viewStyle={_styles.btnArea}>
        <TouchableOpacity 
          onPress={() => { goStoryEdit(); }}
          style={_styles.btnRegi}>
          <Image source={ICON.story_write} style={styles.iconNoSquareSize(23, 19)} />
          <SpaceView><Text style={styles.fontStyle('B', 16, '#fff')}>새글등록</Text></SpaceView>
        </TouchableOpacity>
      </SpaceView>
    </>
  );
};


/* #######################################################################################################################
############## 스토리 헤더
####################################################################################################################### */
const StoryHeader = React.memo(({selectFn}) => {
  const [selectedKeyword, setSelectedKeyword] = useState('ALL'); // 선택된 키워드
  const [currentTab, setCurrentTab] = useState('TALK');

  const keywordList = [
    {name: 'ALL', code: 'ALL'},
    {name: '나들이명소', code: 'PLACE'},
    {name: 'OTT뭐볼까?', code: 'OTT'},
    {name: '이력서·면접', code: 'RESUME'},
  ];

  // ##################################################################################### 키워드 선택
  const keywordSelectFn = async (code:string) => {
    selectFn('REFRESH', 1, code);
    setSelectedKeyword(code);
  };

  return (
    <>
      <SpaceView mb={20}>
        <SpaceView mt={50}>
          <Text style={styles.fontStyle('H', 32, '#fff')}>스토리</Text>
        </SpaceView>

        {/* ########################################################### 탭 영역 */}
        <SpaceView mt={25} mb={25} viewStyle={_styles.tabWrap}>
          <SpaceView viewStyle={{flexDirection: 'row'}}>
            <TouchableOpacity
              style={{marginRight: 10}}
              onPress={() => (setCurrentTab('TALK'))}>
              <Text style={_styles.tabText(currentTab == 'TALK', 25)}>리프Talk</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => (setCurrentTab('STORY'))}>
              <Text style={_styles.tabText(currentTab == 'STORY', 25)}>FEED</Text>
            </TouchableOpacity>
          </SpaceView>
        </SpaceView>

        {/* ########################################################### 키워드 영역 */}
        <SpaceView>
          <SpaceView mb={13} viewStyle={layoutStyle.rowBetween}>
            <SpaceView viewStyle={layoutStyle.rowStart}>
              <SpaceView mr={10}>
                <Text style={styles.fontStyle('EB', 19, '#fff')}>키워드</Text>
              </SpaceView>
              <TouchableOpacity 
                style={_styles.keywordAllBtn}
                onPress={() => { keywordSelectFn('ALL') }}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>전체보기</Text>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>{'>'}</Text>
              </TouchableOpacity>
            </SpaceView>

            {/* <SpaceView>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.fontStyle('B', 11, '#fff')}>즐겨찾기만 보기</Text>
                <SpaceView ml={3}><Image source={ICON.story_starOff} style={styles.iconSquareSize(11)} /></SpaceView>
              </TouchableOpacity>
            </SpaceView> */}
          </SpaceView>

          <ScrollView horizontal={true}>
            <SpaceView viewStyle={{flexDirection: 'row'}}>
              {keywordList?.map((item, index) => {
                return (
                  <TouchableOpacity onPress={() => { keywordSelectFn(item?.code) }}>
                  <Text style={_styles.keywordItemText(item?.code == selectedKeyword)}>{item?.name}</Text>
                </TouchableOpacity>
                )
              })}
            </SpaceView>
          </ScrollView>
        </SpaceView>
      </SpaceView>
    </>
  )
})





{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    backgroundColor: '#000',
    //paddingHorizontal: 10,
  },
  contentWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingBottom: 50,
    width: width,
    height: height-120,
  },
  btnArea: {
    position: 'absolute',
    bottom: 13,
    right: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  btnRegi: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#46F66F',
    borderRadius: 25,
    overflow: 'hidden',
    paddingHorizontal: 18,
    width: 140,
    height: 40,
  },
  headerWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 50,
    backgroundColor: '#000',
    zIndex: 1,
    justifyContent: 'center',
  },
  backContainer: {
    position: 'absolute',
    top: 0,
    left: 10,
    justifyContent: 'center',
    zIndex: 1,
  },
  tabWrap: {
    zIndex:10, 
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tabText: (isOn:boolean, _fs:number) => {
    return {
      fontFamily: 'SUITE-ExtraBold',
      fontSize: _fs,
      color: isOn ? '#46F66F' : '#A6B8CF',
      borderBottomColor: '#46F66F',
      borderBottomWidth: isOn ? 2 : 0,
      paddingBottom: 3,
      overflow: 'hidden',
    };
  },
  keywordAllBtn: {
    backgroundColor: '#44B6E5',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 75,
    height: 20,
    paddingHorizontal: 10,
  },
  keywordItemText: (isOn:boolean) => {
    return {
      fontFamily: 'SUITE-SemiBold',
      fontSize: 11,
      color: isOn ? '#46F66F' : '#808080',
      backgroundColor: isOn ? '#fff' : 'transparent',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 3,
      overflow: 'hidden',
    };
  },
  

});