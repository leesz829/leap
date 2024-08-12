import { useIsFocused, useNavigation, useFocusEffect, RouteProp  } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, TextInput, InputAccessoryView, Platform, KeyboardAvoidingView, Keyboard } from 'react-native';
import { save_story_board, get_story_detail, story_profile_secret_proc } from 'api/models';
import { findSourcePath, IMAGE, GIF_IMG, findSourcePathLocal } from 'utils/imageUtils';
import { usePopup } from 'Context';
import { SUCCESS, NODATA } from 'constants/reusltcode';
import { useDispatch } from 'react-redux';
import Image from 'react-native-fast-image';
import { ICON } from 'utils/imageUtils';
import { useUserInfo } from 'hooks/useUserInfo';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData } from 'utils/functions';
import CommonHeader from 'component/CommonHeader';
import { STACK, ROUTES } from 'constants/routes';
import { CommonImagePicker } from 'component/CommonImagePicker';
import { Modalize } from 'react-native-modalize';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonLoading } from 'component/CommonLoading';
import { VoteEndRadioBox } from 'component/story/VoteEndRadioBox';
import { KeywordDropDown } from 'component/story/KeywordDropDown';
import { myProfile } from 'redux/reducers/authReducer';
import RNPickerSelect from 'react-native-picker-select';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';



/* ################################################################################################################
###### Story 등록 - 내용 입력
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: StackNavigationProp<StackParamList, 'StoryEdit'>;
  route: RouteProp<StackParamList, 'StoryEdit'>;
}

export default function StoryEdit(props: Props) {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { params } = props.route;

  const memberBase = useUserInfo(); // 회원 기본 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 체크
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부
  const inputRef = React.useRef();

  const [isSecret, setIsSecret] = useState(false); // 비밀 여부
  
  const [storyBoardSeq, setStoryBoardSeq] = useState(params.storyBoardSeq);
  const [imageList, setImageList] = useState(params.imgList); // 이미지 목록

  const [imgDelSeqStr, setImgDelSeqStr] = useState('');

  // 스토리 기본 데이터
  const [storyData, setStoryData] = useState({
    storyBoardSeq: params.storyBoardSeq,
    storyType: 'STORY',
    contents: params.contents,
    voteEndType: '',
    voteEndYn: params.voteEndYn,
    keywordData: {common_code: '', code_name: ''},
  });

  const [isPromptUse, setIsPromptUse] = useState(false); // 프롬트 사용 여부
  const [typeChoiceValue, setTypeChoiceValue] = useState(null); // 타입 - 초이스 값

  const [voteTypeValue, setVoteTypeValue] = useState(null); // 투표 유형 값
  const [voteOptionList, setVoteOptionList] = useState([]);

  // 투표 데이터
  const [voteData, setVoteData] = useState({
    voteSeq01: null,
    voteSeq02: null,
    voteName01: '',
    voteName02: '',
    voteImgUrl01: '',
    voteImgUrl02: '',
  });

  // 이미지 데이터
  const [imgData, setImgData] = React.useState<any>({
    orgImgUrl01: { story_board_img_seq: '', imgPath: '', delYn: '' },
    orgImgUrl02: { story_board_img_seq: '', imgPath: '', delYn: '' },
    orgImgUrl03: { story_board_img_seq: '', imgPath: '', delYn: '' },
  });

  // 투표 마감기한 유형
  const [voteEndTypeList, setVoteEndTypeList] = useState([
    {label: '6시간', value: 'HOURS_6'},
    {label: '12시간', value: 'HOURS_12'},
    {label: '1일', value: 'DAY_1'},
    {label: '2일', value: 'DAY_2'},
    {label: '3일', value: 'DAY_3'},
  ]);

  // 키워드 목록
  const [keywordList, setKeywordList] = useState([]);

  // 타입 목록
  const [typeList, setTypeList] = useState([
    {label: '기본', value: 'STORY'},
    /* {label: '초이스픽', value: 'CHOICE'},
    {label: '릴레이', value: 'RELAY'}, */
    {label: '투표', value: 'VOTE'},
  ]);

  // 타입 초이스 목록
  const [typeChoiceList, setTypeChoiceList] = useState([
    {label: '12시간 후 닫힘', value: '12_HOUR', price: 'FREE'},
    {label: '1일 후 닫힘', value: '1_DAY', price: '1'},
    {label: '2일 후 닫힘', value: '2_DAY', price: '2'},
    {label: '3일 후 닫힘', value: '3_DAY', price: '3'},
  ]);

  // 프롬트 목록
  const [promptList, setPromptList] = useState([
    {label: '테마', value: 'THEMA', selectedValue: {}},
    {label: '감정', value: 'EMOTION', selectedValue: {}},
    {label: '로그 그룹핑', value: 'LOGG', selectedValue: {}},
  ]);

  // 테마 목록
  const [themaList, setThemaList] = useState([]);

  // 감정 목록
  const [emotionList, setEmotionList] = useState([]);

  // 로그 그룹핑 목록
  const [logList, setLogList] = useState([]);

  // 키워드 선택
  const fnKeywordSelect = () => {
    show({
      type: 'SELECT',
      title: '키워드 선택',
      dataList: keywordList,
      confirmCallback: async function(data:any) {
        console.log('data :::: ' ,data);
        setStoryData({...storyData, keywordData: data});
      },
    });
  };

  // 타입 선택
  const fnTypeSelect = (value:any) => {
    setStoryData({...storyData, storyType: value});
  };

  // 프롬트 사용 선택
  const fnPromptSelect = (item:any) => {
    let list;
    if(item.value == 'THEMA') {
      list = themaList;
    } else if(item.value == 'EMOTION') {
      list = emotionList;
    } else if(item.value == 'LOGG') {
      list = logList;
    }

    show({
      type: 'SELECT',
      title: item.label + ' 선택',
      dataList: list,
      confirmCallback: async function(data:any) {
        setPromptList((prev) =>
          prev.map((_item: any) =>
            _item.value === item.value ? { ..._item, selectedValue: {prompt_seq: data?.prompt_seq, prompt_name: data?.prompt_name} } : _item
          )
        );
      },
    });
  };

  // 초이스 선택
  const fnTypeChoiceSelect = (item:any) => {
    setTypeChoiceValue(item);
  };

  // 투표 유형 선택
  const fnVoteTypeSelect = () => {
    show({
      type: 'SELECT',
      title: '투표 유형 선택',
      dataList: voteEndTypeList,
      confirmCallback: async function(data:any) {
        //setVoteTypeValue(data);
        setStoryData({...storyData, voteEndType: data?.value});
      },
    });
  };

  // 투표 선택지 추가
  const fnVoteOptionAdd = () => {

    if(voteOptionList.length < 4) {
      const optionData = {
        idx: voteOptionList.length+1,
        value: '',
      };
  
      setVoteOptionList([...voteOptionList, optionData]);
    }
  };

  // 투표 선택지 삭제
  const fnVoteOptionDel = () => {
    setVoteOptionList(voteOptionList.slice(0, -1));
  };

  // 투표 선택지 입력 핸들러
  const voteOptionHandler = (idx: any, text: any) => {
    setVoteOptionList((prev:any) => prev.map((item: any) => item.idx === idx ? { ...item, value: text } : item));
  };

  // 타입 값 변경 useEffect
  React.useEffect(() => {
    if(storyData.storyType == 'CHOICE') {
      setTypeChoiceValue(typeChoiceList[0]);
    }
  }, [storyData.storyType]);

  // ############################################################################# 스토리 등록
  const storyRegister = async () => {

    console.log('storyData ::::: ' , storyData);


    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        let voteList = [];

        if(!isEmptyData(storyData.keywordData?.common_code)) {
          show({ content: '키워드를 선택해 주세요.' });
          return false;
        };
        
        // 투표 목록 셋팅
        if(storyData.storyType == 'VOTE') {
          /* if(!isEmptyData(voteData.voteName01) || !isEmptyData(voteData.voteName02)) {
            show({ content: '선택지를 작성해 주세요.' });
            return false;
          };

          if((!isEmptyData(voteData.voteImgUrl01) && !isEmptyData(inputVoteFileData01)) || (!isEmptyData(voteData.voteImgUrl02) && !isEmptyData(inputVoteFileData02))) {
            show({ content: '선택지를 작성해 주세요.' });
            return false;
          };

          if(!isEmptyData(storyData.voteEndType)) {
            show({ content: '투표 마감기한을 선택해 주세요.' });
            return false;
          };

          voteList = [
            {story_vote_seq: voteData.voteSeq01, order_seq: 1, vote_name: voteData.voteName01, file_base64: inputVoteFileData01},
            {story_vote_seq: voteData.voteSeq02, order_seq: 2, vote_name: voteData.voteName02, file_base64: inputVoteFileData02}
          ] */

          voteOptionList?.map((item, index) => {
            if(isEmptyData(item?.value)) {
              voteList.push({vote_name: item?.value, order_seq: item?.idx});
            }
          });
        };

        // 프롬프트 목록 셋팅
        let prompt_list = [];
        promptList?.map((item, index) => {
          if(isEmptyData(item.selectedValue?.prompt_name)) {
            prompt_list.push(item.selectedValue);
          }
        });
        
        const body = {
          story_board_seq: isEmptyData(storyBoardSeq) && storyBoardSeq != 0 ? storyBoardSeq : null,
          story_type: storyData.storyType,
          contents: storyData.contents,
          img_file_list: imageList,
          img_del_seq_str: storyData.storyType == 'STORY' ? imgDelSeqStr : '',
          vote_list: voteList,
          vote_end_type: storyData.voteEndType,
          secret_yn: isSecret ? 'Y' : 'N',
          keyword_code: storyData?.keywordData?.common_code,
          prompt_use_yn: isPromptUse ? 'Y' : 'N',
          prompt_list: prompt_list,
        };

        //console.log('voteOptionList :::::: ' , voteOptionList);
        console.log('body :::::: ' , body);

        //return;

        const { success, data } = await save_story_board(body);
        if(success) {
          switch (data.result_code) {
          case SUCCESS:

            if(!isEmptyData(storyBoardSeq) && isSecret) {
              dispatch(myProfile());
            }

            if(isEmptyData(storyBoardSeq)) {
              navigation.navigate(STACK.COMMON, {
                screen: ROUTES.STORY_DETAIL,
                params: {
                  storyBoardSeq: storyBoardSeq
                }
              });
            } else {
              navigation.navigate(STACK.TAB, {
                screen: 'Story',
                params: {
                  isRefresh: true,
                }
              });
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
        setIsClickable(true);
        setIsLoading(false);
      }

    }
  };

  // ############################################################################# 스토리 조회
  const getStoryBoard = async () => {
    try {
      setIsLoading(true);

      const body = {
        story_board_seq: storyBoardSeq,
      };

      const { success, data } = await get_story_detail(body);
      if(success) {
        switch (data.result_code) {
        case SUCCESS:
          console.log('data.story ::: ' , data.story);

          if(isEmptyData(data.story?.story_board_seq)) {
            setStoryData({
              ...storyData,
              //storyBoardSeq: data.story?.story_board_seq,
              storyType: data.story?.story_type,
              //contents: data.story?.contents,
              voteEndType: data.story?.vote_end_type,
              keywordData: {common_code: data?.story?.keyword_code, code_name: data?.story?.keyword_code_name},
            });
          };

          setIsPromptUse(data.story?.prompt_use_yn == 'Y' ? true : false);

          // 스토리 이미지 데이터 구성
          /* if(isEmptyData(null != data.story_img_list) && data.story_img_list?.length > 0) {
            let imgData: any = {
              orgImgUrl01: { story_board_img_seq: '', imgPath: '', delYn: '' },
              orgImgUrl02: { story_board_img_seq: '', imgPath: '', delYn: '' },
              orgImgUrl03: { story_board_img_seq: '', imgPath: '', delYn: '' },
            };

            data?.story_img_list?.map(({story_board_img_seq, img_file_path, order_seq}: { story_board_img_seq: any; img_file_path: any; order_seq: any; }) => {
              let data = {
                story_board_img_seq: story_board_img_seq,
                imgPath: img_file_path,
                delYn: 'N',
              };
              if(order_seq == 1) { imgData.orgImgUrl01 = data; }
              if(order_seq == 2) { imgData.orgImgUrl02 = data; }
              if(order_seq == 3) { imgData.orgImgUrl03 = data; }
            });

            setImgData({ ...imgData, imgData });
          }; */

          // 스토리 투표 데이터 구성
          if(isEmptyData(data.story_vote_list) && data.story_vote_list?.length > 0) {

            let voteSeq01 = null;
            let voteSeq02 = null;
            let voteName01 = '';
            let voteName02 = '';
            let voteImgUrl01 = '';
            let voteImgUrl02 = '';

            data?.story_vote_list?.map((item, index) => {
              if(item.order_seq == 1) {
                voteSeq01 = item.story_vote_seq;
                voteName01 = item.vote_name;
                voteImgUrl01 = item.file_path;
              } else if(item.order_seq == 2) {
                voteSeq02 = item.story_vote_seq;
                voteName02 = item.vote_name;
                voteImgUrl02 = item.file_path;
              }
            });

            setVoteData({
              ...voteData,
              voteSeq01: voteSeq01,
              voteSeq02: voteSeq02,
              voteName01: voteName01,
              voteName02: voteName02,
              voteImgUrl01: voteImgUrl01,
              voteImgUrl02: voteImgUrl02,
            })
          };

          // 프롬프트 데이터 구성
          if(data?.story_prompt_list.length > 0) {
            data?.story_prompt_list?.map((item, index) => {
              const groupCode = item?.prompt_group_code;
              console.log('groupCode :::::: ' , groupCode);

              if(!isEmptyData(groupCode)) {
                setPromptList((prev) =>
                  prev.map((_item: any) =>
                    _item.value === 'LOGG' ? { ..._item, selectedValue: {prompt_seq: item?.prompt_seq, prompt_name: item?.prompt_name} } : _item
                  )
                );
              } else {
                setPromptList((prev) =>
                  prev.map((_item: any) =>
                    _item.value === groupCode ? { ..._item, selectedValue: {prompt_seq: item?.prompt_seq, prompt_name: item?.prompt_name} } : _item
                  )
                );
              }
            });
          }

          // 키워드 공통코드 목록 설정
          setKeywordList(data?.keyword_list);

          // 프롬프트 공통코드 목록 설정
          setThemaList(data?.thema_list);
          setEmotionList(data?.emotion_list);
          setLogList(data?.log_list);

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






















  // ############################################################ 프로필 감추기 팝업 활성화
  const hideProfilePopupOpen = async () => {
    if(isSecret) {
      //setIsSecret(false);
    } else {
      if(memberBase?.pass_has_amt >= 6) {
        show({
          title: '블라인드 모드',
          content: '큐브 6개로 블라인드 모드로 변경 하시겠습니까?\n회원님의 프로필은 메가큐브로만 열람 가능합니다.\n글 작성 취소 시 소모한 큐브는 복구되지 않아요🥺',
          passAmt: 6,
          confirmBtnText: '변경하기',
          cancelCallback: function() {
            
          },
          confirmCallback: function () {
            //setIsSecret(true);
            blindProcApply();
          },
        });
      } else {
        show({
          title: '블라인드 모드',
          content: '보유 큐브가 부족합니다.',
          confirmBtnText: '상점 이동',
          cancelCallback: function() {
            
          },
          confirmCallback: function () {
            navigation.navigate(STACK.TAB, { screen: 'Cashshop' });
          },
        });
      }
    }
  };


  

  // ############################################################################# 블라인드 처리 적용
  const blindProcApply = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        const body = {          
        };

        const { success, data } = await story_profile_secret_proc(body);
        if(success) {
          switch (data.result_code) {
          case SUCCESS:

            dispatch(myProfile());
            setIsSecret(true);

            show({
              type: 'RESPONSIVE',
              content: '큐브가 사용되었습니다.',
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

  

  /* ##################################################################################################################################
  ################## 초기 실행 함수
  ################################################################################################################################## */
  React.useEffect(() => {
    if(isFocus) {
      getStoryBoard();

      if(isEmptyData(props.route.params.storyBoardSeq)) {
        
      }
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView pt={30} viewStyle={_styles.wrap}>

        <CommonHeader type={'STORY_REGI'} title={isEmptyData(params.storyBoardSeq) ? '새글수정' : '새글등록'} callbackFunc={storyRegister} />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

          <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{paddingHorizontal: 10, marginTop: 35}}>
            <SpaceView mb={150}>

              {/* ##############################################################################################################
              ##### 키워드 선택 영역
              ############################################################################################################## */}
              <SpaceView viewStyle={_styles.keywordWrap}>
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center', flex: 0.25}}>
                  <Text style={styles.fontStyle('B', 14, '#fff')}>키워드 선택</Text>
                </SpaceView>
                <TouchableOpacity 
                  onPress={fnKeywordSelect} 
                  style={_styles.keywordSelectWrap}>
                  <SpaceView><Text style={styles.fontStyle('SB', 10, '#CBCBCB')}>{!isEmptyData(storyData?.keywordData?.code_name) && '게시글을 등록할 채널 키워드를 선택해주세요.'}</Text></SpaceView>
                  <SpaceView ml={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                    <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{storyData?.keywordData?.code_name}</Text></SpaceView>
                    <Image source={ICON.story_moreAdd} style={styles.iconNoSquareSize(10, 17)} />
                  </SpaceView>
                </TouchableOpacity>
                {/* <KeywordDropDown /> */}
              </SpaceView>

              {/* ##############################################################################################################
              ##### 타입 선택 영역
              ############################################################################################################## */}
              <SpaceView viewStyle={_styles.typeWrap}>
                <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  <Image source={ICON.story_calculator} style={styles.iconSquareSize(16)} />
                  <SpaceView ml={8} mr={10}><Text style={styles.fontStyle('B', 14, '#fff')}>타입</Text></SpaceView>
                  <Text style={styles.fontStyle('B', 10, '#CBCBCB')}>함께 참여할 수 있는 다양한 타입의 게시글이 준비되어 있습니다.</Text>
                </SpaceView>
                <SpaceView mt={15} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                  {typeList.map((item, index) => {

                    console.log('storyData.storyType ::::: ' , storyData.storyType);

                    return (
                      <>
                        <TouchableOpacity 
                          key={item.value}
                          //disabled={isEmptyData(props.route.params.storyBoardSeq)} 
                          onPress={() => (fnTypeSelect(item.value))} 
                          style={_styles.typeItemWrap(storyData.storyType == item.value)}>

                          <Text style={_styles.typeItemText(storyData.storyType == item.value)}>{item.label}</Text>
                        </TouchableOpacity>
                      </>
                    )
                  })}
                </SpaceView>

                {isEmptyData(storyData.storyType) && storyData.storyType != 'STORY' && (
                  <>
                    <SpaceView mt={20}>
                      <SpaceView>
                        <Text style={styles.fontStyle('SB', 10, '#CBCBCB')}>
                        {storyData.storyType == 'CHOICE' && (
                          <>
                            전문성 있는 답변이 필요하신가요? 리프에도 도움을 줄 수 있는 분이 계실 거예요.{'\n'}
                            질문 기간 동안 도움이 된 댓글 1개를 채택해 주세요.
                          </>
                        )}
                        {storyData.storyType == 'RELAY' && (
                          <>
                            사람들의 생각이 궁금한가요? 팔로워 또는 팔로잉 회원을 지명해 보세요.{'\n'}
                            참여자가 늘어날수록 모두에게 지급되는 보상도 커집니다.
                          </>
                        )}
                        {storyData.storyType == 'VOTE' && (
                          <>
                            최대 5가지 선택지에 대한 투표를 진행할 수 있습니다.
                          </>
                        )}
                          
                        </Text>
                      </SpaceView>
                      <SpaceView mt={20}>
                        {storyData.storyType == 'CHOICE' && (
                          <SpaceView>
                            {typeChoiceList.map((item, index) => {
                              return (
                                <>
                                  <TouchableOpacity
                                    onPress={() => (fnTypeChoiceSelect(item))} 
                                    style={_styles.typeBaseItemWrap(item.value == typeChoiceValue?.value)}
                                    activeOpacity={0.8}>
                                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                                      <SpaceView viewStyle={{width:16}}>
                                        {item.value == typeChoiceValue?.value && <Image source={ICON.story_promptYGreen} style={styles.iconSquareSize(16)} /> }
                                      </SpaceView>
                                      <SpaceView ml={5}><Text style={styles.fontStyle('SB', 12, '#fff')}>{item.label}</Text></SpaceView>
                                    </SpaceView>
                                    <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                                      <Text style={styles.fontStyle('SB', 12, item.value == typeChoiceValue?.value ? '#fff' : '#808080')}>{item.price}</Text>
                                      <SpaceView ml={5}><Image source={ICON.cube} style={styles.iconSquareSize(19)} /></SpaceView>
                                    </SpaceView>
                                  </TouchableOpacity>
                                </>
                              )
                            })}
                          </SpaceView>
                        )}

                        {storyData.storyType == 'RELAY' && (
                          <SpaceView>
                            <TouchableOpacity style={{flexDirection: 'row', justifyContent: 'center'}}>
                              <LinearGradient
                                colors={['#8BAAFF', '#2CDEA1']}
                                start={{ x: 0, y: 1 }}
                                end={{ x: 1, y: 0 }}
                                style={_styles.typeRelayTrgtBtn}
                              >
                                <Image source={ICON.story_people} style={styles.iconSquareSize(16)} />
                                <SpaceView ml={5}><Text style={styles.fontStyle('SB', 12, '#fff')}>대상자 선택</Text></SpaceView>
                              </LinearGradient>
                            </TouchableOpacity>

                            <SpaceView mt={20} viewStyle={_styles.typeRelayWrap}>
                              <SpaceView viewStyle={_styles.typeRelayCube}><Image source={ICON.cube} style={styles.iconSquareSize(20)} /></SpaceView>
                              <SpaceView mt={10}>
                                <Text style={[styles.fontStyle('SB', 10, '#CBCBCB'), {textAlign: 'center'}]}>최초 작성자 포함 릴레이 참여자 5명 이상부터 큐브  제공되며,{'\n'}30명 참여 시 인당 30개까지 지급!</Text>
                              </SpaceView>
                            </SpaceView>
                          </SpaceView>
                        )}

                        {/* ########################## 투표 */}
                        {storyData.storyType == 'VOTE' && (
                          <SpaceView>
                            <TouchableOpacity 
                              onPress={() => (fnVoteTypeSelect())}
                              style={_styles.selectItemWrap}>

                              <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
                                <Image source={isEmptyData(storyData?.voteEndType) ? ICON.story_promptYGreen : ICON.story_promptNRed} style={styles.iconSquareSize(16)} />
                                <SpaceView ml={8}><Text style={styles.fontStyle('B', 14, '#fff')}>투표기간</Text></SpaceView>
                              </SpaceView>

                              <SpaceView ml={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                                {/* <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{voteTypeValue?.label || '선택'}</Text></SpaceView> */}
                                <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>
                                  {storyData?.voteEndType ? voteEndTypeList.filter((item, index) => item.value == storyData?.voteEndType)[0]?.label : '선택'}</Text>
                                </SpaceView>
                                <Image source={ICON.story_moreAdd} style={styles.iconNoSquareSize(10, 17)} />
                              </SpaceView>
                            </TouchableOpacity>

                            <SpaceView mt={20}>
                              <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'flex-end'}}>
                                <TouchableOpacity onPress={() => (fnVoteOptionAdd())}>
                                  <Image source={ICON.story_plusCircle} style={styles.iconSquareSize(28)} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => (fnVoteOptionDel())} style={{marginLeft: 10}}>
                                  <Image source={ICON.story_minusCircle} style={styles.iconSquareSize(28)} />
                                </TouchableOpacity>
                              </SpaceView>
                              <SpaceView mt={10}>

                                {voteOptionList.map((item, index) => {
                                  return (
                                    <>
                                      <SpaceView mb={10} viewStyle={_styles.voteItemWrap}>
                                        <SpaceView ml={3} mb={-2}>
                                          <Text style={styles.fontStyle('SB', 12, '#fff')}>선택지</Text>
                                        </SpaceView>
                                        <TextInput
                                          //value={voteData[`voteName0${i+1}`]}
                                          //value={item.value}
                                          defaultValue={item?.value}
                                          //onChangeText={(text) => setVoteData({...voteData, [`voteName0${i+1}`] : text})}
                                          onChangeText={(text) => voteOptionHandler(item?.idx, text)}
                                          multiline={false}
                                          autoCapitalize="none"
                                          style={_styles.voteItemInput}
                                          //editable={(storyData.storyType == 'VOTE' && storyData.voteEndYn == 'Y') ? false : true}
                                          secureTextEntry={false}
                                          maxLength={100}
                                          numberOfLines={1}
                                          placeholder={'내용을 입력해 주세요.'}
                                          placeholderTextColor={'#606060'}
                                        />
                                      </SpaceView>
                                    </>
                                  )
                                })}
                              </SpaceView>
                            </SpaceView>
                          </SpaceView>
                        )}
                      </SpaceView>
                    </SpaceView>
                  </>
                )}
              </SpaceView>

              {/* ##############################################################################################################
              ##### 프롬프트 사용 설정 영역
              ############################################################################################################## */}
              <SpaceView viewStyle={_styles.promptWrap}>
                <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
                  <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={styles.fontStyle('B', 14, '#fff')}>프롬트 사용</Text>
                    <SpaceView ml={10}><Text style={styles.fontStyle('SB', 10, '#CBCBCB')}>내 이야기의 로그를 남길 수 있습니다.</Text></SpaceView>
                  </SpaceView>
                  <SpaceView viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity style={_styles.promptBtn(!isPromptUse)} onPress={() => (setIsPromptUse(false))}>
                      <Image source={ICON.story_promptN} style={styles.iconSquareSize(20)} />
                    </TouchableOpacity>
                    <TouchableOpacity style={[_styles.promptBtn(isPromptUse), {marginLeft: 10}]} onPress={() => (setIsPromptUse(true))}>
                      <Image source={ICON.story_promptY} style={styles.iconSquareSize(20)} />
                    </TouchableOpacity>
                  </SpaceView>
                </SpaceView>

                {isPromptUse && (
                  <SpaceView mt={20}>
                    {promptList.map((item, index) => {
                      return (
                        <>
                          <SpaceView mb={10} viewStyle={_styles.selectItemWrap}>
                            <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
                              <Image source={isEmptyData(item?.selectedValue?.prompt_seq) ? ICON.story_promptYGreen : ICON.story_promptNRed} style={styles.iconSquareSize(16)} />
                              <SpaceView ml={8}><Text style={styles.fontStyle('B', 14, '#fff')}>{item.label}</Text></SpaceView>
                            </SpaceView>
                            <SpaceView>
                              {/* <KeywordDropDown /> */}
                              <TouchableOpacity 
                                onPress={() => (fnPromptSelect(item))}
                                style={_styles.keywordSelectWrap}>
                                <SpaceView ml={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                                  <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{item?.selectedValue?.prompt_name || '선택'}</Text></SpaceView>
                                  <Image source={ICON.story_moreAdd} style={styles.iconNoSquareSize(10, 17)} />
                                </SpaceView>
                              </TouchableOpacity>
                            </SpaceView>
                          </SpaceView>
                        </>
                      )
                    })}
                  </SpaceView>
                )}
              </SpaceView>

            </SpaceView>
          </ScrollView>
        </TouchableWithoutFeedback>
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
    backgroundColor: '#000',
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  keywordWrap: {
    borderTopWidth: 1,
    borderTopColor: '#BCBCBC',
    paddingHorizontal: 10,
    paddingVertical: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  keywordSelectWrap: {
    flex: 0.85,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  typeWrap: {
    borderTopWidth: 1,
    borderTopColor: '#BCBCBC',
    paddingHorizontal: 10,
    paddingVertical: 25,
  },
  typeItemWrap: (isOn:boolean) => {
    return {
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: isOn ? '#fff' : 'transparent',
      borderRadius: 15,
    }
  },
  typeItemText: (isOn:boolean) => {
    return {
      fontFamily: 'SUITE-SemiBold',
      fontSize: 14,
      color: isOn ? '#8BAAFF' : '#808080',
    }
  },
  typeBaseItemWrap: (isOn:boolean) => {
    return {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: isOn ? '#fff' : '#606060',
      borderRadius: 25,
      overflow: 'hidden',
      paddingHorizontal: 10,
      height: 30,
      marginBottom: 8,
    }
  },
  typeRelayTrgtBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 25,
    paddingHorizontal: 13,
    height: 30,
  },
  typeRelayWrap: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#808080',
    borderRadius: 10,
    paddingVertical: 10,
  },
  typeRelayCube: {
    backgroundColor: '#181A41',
    borderRadius: 50,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center'
  },
  promptWrap: {
    borderTopWidth: 1,
    borderTopColor: '#BCBCBC',
    borderBottomWidth: 1,
    borderBottomColor: '#BCBCBC',
    paddingHorizontal: 10,
    paddingVertical: 25,
  },
  promptBtn: (isOn:boolean) => {
    return {
      backgroundColor: isOn ? '#46F66F' : '#808080',
      borderRadius: 50,
      paddingHorizontal: 5,
      paddingVertical: 5,
    }
  },
  selectItemWrap: {
    borderWidth: 1,
    borderColor: '#606060',
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    paddingHorizontal: 10,
  },
  voteSetBtn: {
    backgroundColor: '#808080',
    borderRadius: 50,
    paddingHorizontal: 5,
    paddingVertical: 5,
  },
  voteItemWrap: {
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 5,
    height: 50,
  },
  voteItemInput: {
    fontFamily: 'SUITE-SemiBold',
    fontSize: 11,
    color: '#fff',
    textAlign: 'left',
  },
  


});