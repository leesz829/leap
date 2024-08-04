import { layoutStyle, styles } from 'assets/styles/Styles';
import { ScreenNavigationProp } from '@types';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View, Text, Platform, ScrollView, Dimensions, FlatList, RefreshControl } from 'react-native';
import { useNavigation, useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Color } from 'assets/styles/Color';
import { useDispatch, useSelector } from 'react-redux';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ICON, findSourcePath } from 'utils/imageUtils';
import { STACK, ROUTES } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { useUserInfo } from 'hooks/useUserInfo';
import SocialGrade from 'component/common/SocialGrade';
import TalkItem from 'component/story/TalkItem';
import { usePopup } from 'Context';
import { get_story_board_list, profile_open } from 'api/models';
import { SUCCESS, NODATA, EXIST } from 'constants/reusltcode';



const { width, height } = Dimensions.get('window');

//export default function Talk({ type, item, index, profileOpenFn }) {
const Talk = React.memo(({ isRefresh }) => {

  const navigation = useNavigation<ScreenNavigationProp>();

  const { show } = usePopup(); // 공통 팝업
  const isFocus = useIsFocused();

  const [isLoading, setIsLoading] = React.useState(false); // 로딩 상태 체크
  const [isRefreshing, setIsRefreshing] = useState(false); // 새로고침 여부
  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const [isLoadingMore, setIsLoadingMore] = useState(false); // 더보기 로딩 여부

  const [pageNum, setPageNum] = useState(1); // 페이지 번호
  const [isListFinally, setIsListFinally] = useState(false); // 목록 마지막 여부
  const [isTopBtn, setIsTopBtn] = useState(false);

  const flatListRef = React.useRef(null);

  const [storyList, setStoryList] = React.useState<any>([]);

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

  // ##################################################################################### 스토리 상세 이동
  const goStoryDetail = async (storyBoardSeq:number) => {
    navigation.navigate(STACK.COMMON, {
      screen: 'StoryDetail',
      params: {
        storyBoardSeq: storyBoardSeq,
      }
    });
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
              content: '큐브가 부족합니다.',
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

  /* ################################################################################ 스크롤 제어 */
  const handleScroll = async (event) => {
    const yOffset = event.nativeEvent.contentOffset.y;
    if(yOffset > 300) {
      setIsTopBtn(true);
    } else {
      setIsTopBtn(false);
    }
  };

  // ##################################################################################### 초기 함수
  React.useEffect(() => {
    if(isFocus) {
      setIsRefreshing(false);

      if(storyList.length == 0 || isRefresh) {
        getStoryBoardList('ADD', pageNum == 0 ? 1 : pageNum);
      }
    } else {
      //setStoryList([]);
    }
  }, [isFocus]);


  return (
    <>
      {/* ############################################################################################################
        ################################################################################################################
        ###### 키워드 영역
        ################################################################################################################
        ############################################################################################################ */}
        <SpaceView>
          <SpaceView mb={13} viewStyle={layoutStyle.rowBetween}>
            <SpaceView viewStyle={layoutStyle.rowStart}>
              <SpaceView mr={10}>
                <Text style={styles.fontStyle('EB', 19, '#fff')}>키워드</Text>
              </SpaceView>
              <TouchableOpacity style={_styles.keywordAllBtn}>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>전체보기</Text>
                <Text style={styles.fontStyle('SB', 11, '#fff')}>{'>'}</Text>
              </TouchableOpacity>
            </SpaceView>

            <SpaceView>
              <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.fontStyle('B', 11, '#fff')}>즐겨찾기만 보기</Text>
                <SpaceView ml={3}><Image source={ICON.story_starOff} style={styles.iconSquareSize(11)} /></SpaceView>
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>

          <ScrollView horizontal={true}>
            <SpaceView viewStyle={{flexDirection: 'row'}}>
              <TouchableOpacity>
                <Text style={_styles.keywordItemText(true)}>ALL</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={_styles.keywordItemText(false)}>나들이명소</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={_styles.keywordItemText(false)}>OTT뭐볼까?</Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={_styles.keywordItemText(false)}>이력서·면접</Text>
              </TouchableOpacity>
            </SpaceView>
          </ScrollView>
        </SpaceView>

        {/* ############################################################################################################
        ################################################################################################################
        ###### 목록 영역
        ################################################################################################################
        ############################################################################################################ */}
        <SpaceView mt={25} viewStyle={{height: height-300}}>
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
                //onEndReached={loadMoreData}
                onEndReachedThreshold={0.1}
                ListFooterComponent={isLoadingMore && <Text>Loading more...</Text>}
                renderItem={({ item, index }) => {

                  return (
                    <>
                      <TalkItem item={item} profileOpenFn={null} goDetailFn={goStoryDetail} />
                    </>
                  )
                }}
              />
            </>
          ) : (
            <>
              {/* <SpaceView viewStyle={_styles.noData}>
                <Text style={_styles.noDataText}>스토리가 없습니다.</Text>
              </SpaceView> */}
            </>
          )}
        </SpaceView>


    </>
  );
});



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
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

  contentWrap: {
    //flexDirection: 'row',
    //flexWrap: 'wrap',
    paddingBottom: 50,
    //width: width,
    height: height-120,
  },


});





export default Talk;