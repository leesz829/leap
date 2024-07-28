import { useIsFocused, useNavigation, useFocusEffect, RouteProp  } from '@react-navigation/native';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { styles, layoutStyle, commonStyle, modalStyle } from 'assets/styles/Styles';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import TopNavigation from 'component/TopNavigation';
import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { ScrollView, View, StyleSheet, Text, FlatList, Dimensions, TouchableOpacity, TextInput, InputAccessoryView, Platform, KeyboardAvoidingView } from 'react-native';
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
import { STACK } from 'constants/routes';
import { CommonImagePicker } from 'component/CommonImagePicker';
import { Modalize } from 'react-native-modalize';
import { CommonTextarea } from 'component/CommonTextarea';
import { CommonLoading } from 'component/CommonLoading';
import { CommonInput } from 'component/CommonInput';
import { VoteEndRadioBox } from 'component/story/VoteEndRadioBox';
import { KeywordDropDown } from 'component/story/KeywordDropDown';
import { CommonBtn } from 'component/CommonBtn';
import { myProfile } from 'redux/reducers/authReducer';
import RNPickerSelect from 'react-native-picker-select';



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

  const memberBase = useUserInfo(); // 회원 기본 데이터
  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태 체크
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부
  const inputRef = React.useRef();

  const [title, setTitle] = useState(''); // 제목
  const [isSecret, setIsSecret] = useState(false); // 비밀 여부
  
  const [storyBoardSeq, setStoryBoardSeq] = useState(props.route.params.storyBoardSeq);
  const [imageList, setImageList] = useState([]); // 이미지 목록

  const [imgDelSeqStr, setImgDelSeqStr] = useState('');

  // 스토리 기본 데이터
  const [storyData, setStoryData] = useState({
    storyBoardSeq: props.route.params.storyBoardSeq,
    storyType: isEmptyData(props.route.params.storyType) ? props.route.params.storyType : '',
    contents: '',
    voteEndType: '',
    voteEndYn: props.route.params.voteEndYn,
  });

  const [keywordValue, setKeywordValue] = useState(null); // 키워드 값
  const [typeValue, setTypeValue] = useState('BASE'); // 타입 값
  const [isPromptUse, setIsPromptUse] = useState(false); // 프롬트 사용 여부
  const [typeChoiceValue, setTypeChoiceValue] = useState(null); // 타입 - 초이스 값

  const [themaValue, setThemaValue] = useState(null); // 테마 값
  const [emaotionValue, setEmotionValue] = useState(null); // 감정 값
  const [loggValue, setLoggValue] = useState(null); // 로그 그룹핑 값

  const [voteTypeValue, setVoteTypeValue] = useState(null); // 투표 유형 값

  const [voteOptionList, setVoteOptionList] = useState([]);


  const [inputVoteName01, setInputVoteName01] = useState('');
  const [inputVoteName02, setInputVoteName02] = useState('');
  const [inputVoteFileData01, setInputVoteFileData01] = useState('');
  const [inputVoteFileData02, setInputVoteFileData02] = useState('');

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
  const [keywordList, setKeywordList] = useState([
    {label: '나들이 명소', value: 'KW01'},
    {label: 'OTT 뭐볼까?', value: 'KW02'},
    {label: '이력서/면접', value: 'KW03'},
  ]);

  // 타입 목록
  const [typeList, setTypeList] = useState([
    {label: '기본', value: 'BASE'},
    {label: '초이스픽', value: 'CHOICE'},
    {label: '릴레이', value: 'RELAY'},
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
  const [themaList, setThemaList] = useState([
    {label: '테마1', value: 'THEMA1'},
    {label: '테마2', value: 'THEMA2'},
    {label: '테마3', value: 'THEMA3'},
  ]);

  // 감정 목록
  const [emotionList, setEmotionList] = useState([
    {label: '감정1', value: 'EMOTION1'},
    {label: '감정2', value: 'EMOTION2'},
    {label: '감정3', value: 'EMOTION3'},
  ]);

  // 로그 그룹핑 목록
  const [logList, setLogList] = useState([
    {label: '로그 그룹핑1', value: 'LOGG1'},
    {label: '로그 그룹핑2', value: 'LOGG2'},
    {label: '로그 그룹핑3', value: 'LOGG3'},
  ]);

  // 키워드 선택
  const fnKeywordSelect = () => {
    show({
      type: 'SELECT',
      title: '키워드 선택',
      dataList: keywordList,
      confirmCallback: async function(data:any) {
        setKeywordValue(data);
      },
    });
  };

  // 타입 선택
  const fnTypeSelect = (value:any) => {
    setTypeValue(value);
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
            _item.value === item.value ? { ..._item, selectedValue: data } : _item
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
        setVoteTypeValue(data);
      },
    });    
  };

  // 투표 선택지 추가
  const fnVoteOptionAdd = () => {
    const optionData = {
      idx: voteOptionList.length+1,
      value: '',
    };

    setVoteOptionList([...voteOptionList, optionData]);
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
    if(typeValue == 'CHOICE') {
      setTypeChoiceValue(typeChoiceList[0]);
    }
  }, [typeValue]);










  // 투표 종료 유형 콜백 함수
  const voteEndTypeCallbackFn = (value: string) => {
    setStoryData({...storyData, voteEndType: value});
  };


  const voteFileCallBack01 = async (uri: any, base64: string, i: number) => {
    setInputVoteFileData01(base64);
  };

  const voteFileCallBack02 = async (uri: any, base64: string, i: number) => {
    setInputVoteFileData02(base64);
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


  // ############################################################################# 스토리 등록
  const storyRegister = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        let voteList = [];
        if(!isEmptyData(storyData.contents)) {
          show({ content: '내용을 입력해 주세요.' });
          return false;
        };

        if(storyData.contents.length < 10) {
          show({ content: '최소 10글자 이상 입력해 주세요.' });
          return false;
        }
        
        if(storyData.storyType == 'VOTE') {
          if(!isEmptyData(voteData.voteName01) || !isEmptyData(voteData.voteName02)) {
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
          ]
        };

        //return;
    
        const body = {
          story_board_seq: storyBoardSeq,
          story_type: storyData.storyType,
          contents: storyData.contents,
          img_file_list: imageList,
          img_del_seq_str: storyData.storyType == 'STORY' ? imgDelSeqStr : '',
          vote_list: voteList,
          vote_end_type: storyData.voteEndType,
          secret_yn: isSecret ? 'Y' : 'N',
        };

        const { success, data } = await save_story_board(body);
        if(success) {
          switch (data.result_code) {
          case SUCCESS:

            if(!isEmptyData(storyBoardSeq) && isSecret) {
              dispatch(myProfile());
            }

            if(isEmptyData(storyBoardSeq)) {
              navigation.goBack();
            } else {
              navigation.navigate(STACK.TAB, {
                screen: 'Story',
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

          setTitle(data.story?.story_type == 'STORY' ? '스토리 수정' : data.story?.story_type == 'VOTE' ? '투표 수정' : '시크릿 수정');

          if(data.story?.story_type == 'VOTE') {
            setCurrentIndex(1);
          } else if(data.story?.story_type == 'SECRET') {
            setCurrentIndex(2);
          }


          setStoryData({
            ...storyData,
            storyBoardSeq: data.story?.story_board_seq,
            storyType: data.story?.story_type,
            contents: data.story?.contents,
            voteEndType: data.story?.vote_end_type,
          });

          // 스토리 이미지 데이터 구성
          if(isEmptyData(null != data.story_img_list) && data.story_img_list?.length > 0) {
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
          };

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
      if(isEmptyData(props.route.params.storyBoardSeq)) {
        getStoryBoard();
      } else {
        setTitle(storyData.storyType == 'STORY' ? '스토리 등록' : storyData.storyType == 'VOTE' ? '투표 등록' : '시크릿 등록');
      }
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView pt={30} viewStyle={_styles.wrap}>
        <CommonHeader 
          type={'STORY_REGI'}
          title={'새글등록'}
          callbackFunc={storyRegister} />

        <SpaceView pl={10} pr={10} mt={35}>

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
              <SpaceView><Text style={styles.fontStyle('SB', 10, '#CBCBCB')}>{!isEmptyData(keywordValue?.label) && '게시글을 등록할 채널 키워드를 선택해주세요.'}</Text></SpaceView>
              <SpaceView ml={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{keywordValue?.label}</Text></SpaceView>
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
                return (
                  <>
                    <TouchableOpacity 
                      key={item.value}
                      //disabled={isEmptyData(props.route.params.storyBoardSeq)} 
                      onPress={() => (fnTypeSelect(item.value))} 
                      style={_styles.typeItemWrap(typeValue == item.value)}>

                      <Text style={_styles.typeItemText(typeValue == item.value)}>{item.label}</Text>
                    </TouchableOpacity>
                  </>
                )
              })}
            </SpaceView>

            {typeValue != 'BASE' && (
              <>
                <SpaceView mt={20}>
                  <SpaceView>
                    <Text style={styles.fontStyle('SB', 10, '#CBCBCB')}>
                    {typeValue == 'CHOICE' && (
                      <>
                        전문성 있는 답변이 필요하신가요? 리프에도 도움을 줄 수 있는 분이 계실 거예요.{'\n'}
                        질문 기간 동안 도움이 된 댓글 1개를 채택해 주세요.
                      </>
                    )}
                    {typeValue == 'RELAY' && (
                      <>
                        사람들의 생각이 궁금한가요? 팔로워 또는 팔로잉 회원을 지명해 보세요.{'\n'}
                        참여자가 늘어날수록 모두에게 지급되는 보상도 커집니다.
                      </>
                    )}
                    {typeValue == 'VOTE' && (
                      <>
                        최대 5가지 선택지에 대한 투표를 진행할 수 있습니다.
                      </>
                    )}
                      
                    </Text>
                  </SpaceView>
                  <SpaceView mt={20}>
                    {typeValue == 'CHOICE' && (
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

                    {typeValue == 'RELAY' && (
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

                    {/* 투표 */}
                    {typeValue == 'VOTE' && (
                      <SpaceView>
                        <TouchableOpacity 
                          onPress={() => (fnVoteTypeSelect())}
                          style={_styles.selectItemWrap}>

                          <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'center'}}>
                            <Image source={isEmptyData(voteTypeValue?.value) ? ICON.story_promptYGreen : ICON.story_promptNRed} style={styles.iconSquareSize(16)} />
                            <SpaceView ml={8}><Text style={styles.fontStyle('B', 14, '#fff')}>투표기간</Text></SpaceView>
                          </SpaceView>

                          <SpaceView ml={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                            <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{voteTypeValue?.label || '선택'}</Text></SpaceView>
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
                          <Image source={isEmptyData(item?.selectedValue?.value) ? ICON.story_promptYGreen : ICON.story_promptNRed} style={styles.iconSquareSize(16)} />
                          <SpaceView ml={8}><Text style={styles.fontStyle('B', 14, '#fff')}>{item.label}</Text></SpaceView>
                        </SpaceView>
                        <SpaceView>
                          {/* <KeywordDropDown /> */}
                          <TouchableOpacity 
                            onPress={() => (fnPromptSelect(item))}
                            style={_styles.keywordSelectWrap}>
                            <SpaceView ml={10} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                              <SpaceView mr={10}><Text style={styles.fontStyle('SB', 12, '#CBCBCB')}>{item?.selectedValue?.label || '선택'}</Text></SpaceView>
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
      </SpaceView>

      <SpaceView mt={300}></SpaceView>
      
      {/* <LinearGradient
          colors={['#333B41', '#545454']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={_styles.tabContainer}
        >
         
        {!isEmptyData(props.route.params.storyBoardSeq) && (
          <SpaceView mb={10} viewStyle={_styles.tabArea}>
            <TouchableOpacity disabled={isEmptyData(props.route.params.storyBoardSeq)} onPress={() => (tab('STORY'))}>
              <Text style={_styles.tabText, {color: currentIndex == 0 ? '#FFDD00' : '#445561'}}>스토리</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={isEmptyData(props.route.params.storyBoardSeq)} style={{marginHorizontal: 20}} onPress={() => (tab('VOTE'))}>
              <Text style={_styles.tabText, {color: currentIndex == 1 ? '#FFDD00' : '#445561'}}>투표</Text>
            </TouchableOpacity>
            <TouchableOpacity disabled={isEmptyData(props.route.params.storyBoardSeq)} onPress={() => (tab('SECRET'))}>
              <Text style={_styles.tabText, {color: currentIndex == 2 ? '#FFDD00' : '#445561'}}>시크릿</Text>
            </TouchableOpacity>     
          </SpaceView>
        )}
      </LinearGradient> */}
      

      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: '#fff'}}
        behavior={Platform.OS === 'ios' ? 'padding' : null} // iOS에서는 'padding'을 사용합니다.
      >      

        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={_styles.wrap}
        >
          <ScrollView showsVerticalScrollIndicator={false}>

            <SpaceView mt={20} pb={400} pl={20} pr={20}>

              {/* ##############################################################################################################
              ##### 타이틀 영역
              ############################################################################################################## */}
              <SpaceView mb={10}>
                <Text style={_styles.titleText}>
                  {storyData.storyType == 'SECRET' ? (
                    <>이야기 앞에 "비밀"이 붙으면{'\n'}더 재밌어지는 법이죠!</>
                  ) : storyData.storyType == 'VOTE' ? (
                    <>오늘은 뭘 먹지?{'\n'}고민되는 메뉴 선택권도 다른 고민들도{'\n'}리프 피플들이 골라 드려요.</>
                  ) : (
                    <>소소한 일상부터 음식, 여행 등{'\n'}주제에 관계없이 자유롭게 소통해 보세요.</>
                  )}
                </Text>
                <View style={_styles.titleUnderline(storyData.storyType)} />
              </SpaceView>

              {/* ##############################################################################################################
              ##### 투표 설정 영역(투표형)
              ############################################################################################################## */}
              {storyData.storyType == 'VOTE' && (
                <>
                  {/* ############### 선택지 입력 영역 */}
                  <SpaceView mb={20}>
                    <SpaceView viewStyle={_styles.voteArea}>
                        {[0,1].map((i, index) => {
                          return (
                            <>
                              <SpaceView mb={7} viewStyle={{borderRadius: 10, backgroundColor: '#445561', height: 45}}>
                                <TextInput
                                  value={voteData[`voteName0${i+1}`]}
                                  onChangeText={(text) => setVoteData({...voteData, [`voteName0${i+1}`] : text})}
                                  multiline={false}
                                  autoCapitalize="none"
                                  style={_styles.voteInput(isEmptyData(voteData[`voteName0${i+1}`]))}
                                  editable={(storyData.storyType == 'VOTE' && storyData.voteEndYn == 'Y') ? false : true}
                                  secureTextEntry={false}
                                  maxLength={50}
                                  numberOfLines={1}
                                />

                                {/* <SpaceView viewStyle={_styles.voteImgArea}>
                                  {index == 0 && <VoteImageRenderItem index={index} _imgData={voteData.voteImgUrl01} delFn={imgDel_onOpen} fileCallBackFn={voteFileCallBack01} storyType={storyData.storyType} />}
                                  {index == 1 && <VoteImageRenderItem index={index} _imgData={voteData.voteImgUrl02} delFn={imgDel_onOpen} fileCallBackFn={voteFileCallBack02} storyType={storyData.storyType} />}
                                </SpaceView> */}
                              </SpaceView>
                            </>
                          )
                        })}

                    </SpaceView>
                  </SpaceView>

                  {/* ############### 투표 마감기한 입력 영역 */}
                  {/* <SpaceView mb={25}>
                    <SpaceView mb={20}>
                      <Text style={_styles.subTitleText}>투표 마감기한을 선택해 주세요.</Text>
                    </SpaceView>

                    <SpaceView>
                      <VoteEndRadioBox
                        value={storyData.voteEndType}
                        items={voteEndTypeList}
                        callBackFunction={voteEndTypeCallbackFn}
                        isModfy={isEmptyData(storyBoardSeq) ? false : true}
                      />
                    </SpaceView>
                  </SpaceView> */}
                </>
              )}

              {/* ##############################################################################################################
              ##### 블라인드 모드 설정 영역(스토리, 투표)
              ############################################################################################################## */}
              {(storyData.storyType == 'STORY' || storyData.storyType == 'VOTE') && (
                <>
                  {!isEmptyData(storyBoardSeq) ? (
                    <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <SpaceView>
                      <SpaceView mb={-3} viewStyle={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={_styles.hideProfileTitle}>블라인드 모드</Text>
                      </SpaceView>
                      <Text style={_styles.hideProfileDesc}>대표사진 대신 랜덤 닉네임으로 대체되어 게시글이 등록되요.</Text>
                    </SpaceView>
                    <TouchableOpacity 
                      disabled={isEmptyData(storyBoardSeq) ? true : false || isSecret}
                      style={_styles.hideProfileArea(isSecret)} 
                      onPress={() => { hideProfilePopupOpen(); }}
                    >
                      <Text style={_styles.hideProfileBtn(isSecret)}>{isSecret ? 'ON' : 'OFF'}</Text>
                    </TouchableOpacity>
                  </SpaceView>
                  ) : (
                    <>
                      {/* <SpaceView mb={20}>
                        <Text style={_styles.subTitleText}>투표 내용을 작성해 주세요.</Text>
                      </SpaceView> */}
                    </>
                  )}
                </>
              )}

              {/* ##############################################################################################################
              ##### 내용 입력 영역
              ############################################################################################################## */}
              {storyData.storyType == 'SECRET' && (
                <>
                  <SpaceView>
                    <Text style={_styles.hideProfileTitle}>누구에게도 내 정체를 밝히고 싶지 않다면?</Text>
                    <Text style={_styles.hideProfileDesc}>내가 올린 시크릿은 프로필 열람이 불가능하니 안심하세요:)</Text>
                  </SpaceView>
                </>
              )}

              <SpaceView mt={15}>
                <CommonTextarea
                  value={storyData.contents}
                  onChangeText={(text) => setStoryData({...storyData, contents: text})}
                  placeholder={'최소 10글자 이상 입력해 주세요.\n\n이용 약관 또는 개인 정보 취급 방침 등 위배되는 게시글을 등록하는 경우 작성자의 동의없이 게시글이 삭제 될 수 있으며, 이용 제재 대상이 될 수 있습니다.\n\n상대를 배려하는 마음으로 이용해 주세요.'}
                  placeholderTextColor={'#E1DFD1'}
                  maxLength={1000}
                  exceedCharCountColor={'#990606'}
                  fontSize={13}
                  height={storyData.storyType == 'VOTE' ? 220 : 350}
                  backgroundColor={'#445561'}
                  fontColor={'#E1DFD1'}
                  //borderColor={isEmptyData(storyData.contents) ? '#7986EE' : '#DDDDDD'}
                  borderColor={'#445561'}
                  borderRadius={10}
                  padding={20}
                  paddingTop={20}
                />
              </SpaceView>

            </SpaceView>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>

    </>
  );

};

// ############################################################################# 이미지 렌더링 아이템
function ImageRenderItem ({ index, _imgData, delFn, fileCallBackFn, storyType }) {

  const imgUrl = findSourcePath(_imgData?.imgPath);
  const imgDelYn = _imgData?.delYn;

  return (
    <View style={_styles.imgItem}>
      {((isEmptyData(imgUrl) && imgDelYn == 'Y') || !isEmptyData(imgUrl)) ? (
        <>
          <CommonImagePicker 
            type={'STORY'}
            callbackFn={fileCallBackFn} 
            uriParam={''}
            imgWidth={(width - 70) / 3} 
            imgHeight={(width - 70) / 3}
          />
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => { delFn(_imgData?.story_board_img_seq, index+1, storyType); }}>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={_styles.imageStyle}
              key={imgUrl}
              source={imgUrl}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

// ############################################################################# 투표 이미지 렌더링 아이템
function VoteImageRenderItem ({ index, _imgData, delFn, fileCallBackFn, storyType }) {

  const imgUrl = findSourcePath(_imgData);
  const imgDelYn = _imgData?.delYn;

  return (
    <View style={_styles.imgItem}>
      {((isEmptyData(imgUrl) && imgDelYn == 'Y') || !isEmptyData(imgUrl)) ? (
        <>
          <CommonImagePicker 
            type={'STORY'} 
            callbackFn={fileCallBackFn} 
            uriParam={''}
            imgWidth={35}
            imgHeight={35}
            iconSize={15}
          />
        </>
      ) : (
        <>
          <TouchableOpacity onPress={() => { delFn(_imgData, index+1, storyType); }}>
            <Image
              resizeMode="cover"
              resizeMethod="scale"
              style={{width: 35, height: 35, borderRadius: 10, overflow: 'hidden'}}
              key={imgUrl}
              source={imgUrl}
            />
          </TouchableOpacity>
        </>
      )}
    </View>
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
  },
  tabArea: {
    backgroundColor: '#292F33',
    width: '50%',
    alignSelf: 'center',
    borderRadius: 30,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContainer: {
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    //height: 100,
  },
  tabText: {
    fontFamily: 'SUITE-Bold',
  },
  titleText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 20,
    color: '#FFF',
    lineHeight: 30,
  },
  subTitleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 14,
    color: '#D5CD9E',
  },
  titleUnderline: (storyType:string) => {
    let _top = 49;
    let _left = 0;
    let _width = 200;

    if(storyType == 'SECRET') {
      _top = 19;
      _left = 96;
      _width = 51;
    } else if(storyType == 'VOTE') {
      _top = 78;
      _left = 0;
      _width = 208;
    }

    return {
      position: 'absolute',
      top: _top,
      left: _left,
      width: _width,
      height: 8,
      backgroundColor: '#FFDD00',
      zIndex: -1,
    };
  },
  imgArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imgItem: {
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'dotted',
    borderColor: '#E1DFD1',
    overflow: 'hidden',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
  },
  imageStyle: {
    width: (width - 70) / 3,
    height: (width - 70) / 3,
    //margin: 0,
    borderRadius: 20,
    overflow: 'hidden',
  },
  btnArea: {
    position: 'absolute',
    bottom: 5,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  regiBtn: {
    backgroundColor: '#eee',
    width: '90%',
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  regiActiveBtn: {
    width: '90%',
    paddingVertical: 5,
    borderRadius: 20,
    overflow: 'hidden',
  },
  regiBtnText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    paddingVertical: 8,
  },
  voteArea: {
    //{borderColor: '#7986EE'} : {borderColor:'#DDDDDD'}
  },
  voteInput: (isOn:boolean) => {
    return {
      fontFamily: 'Pretendard-Regular',
      paddingHorizontal: 10,
      paddingVertical: 10,
      //borderColor: isOn ? '#7986EE' : '#DDDDDD',
      width: '90%',
      height: 45,
      color: '#E1DFD1',
      // elevation: isOn ? 10 : 0,
      // shadowColor: "#0047FF",
      // shadowOffset: {
      //   width: 0,
      //   height: 2,
      // },
      // shadowOpacity: 0.25,
      // shadowRadius: 3.84,
    };
  },
  voteImgArea: {
    position: 'absolute',
    top: 4,
    right: 3,
  },
  modalCloseText: {
    width: '100%',
    backgroundColor: '#7984ED',
    paddingVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentInputText: (isOn:boolean) => {
    return {
      borderColor: isOn ? '#7986EE' : '#ebe9ef',
      backgroundColor: '#fff',
      fontFamily: 'Pretendard-Regular',
      fontSize: 13,
      color: '#000',
      borderRadius: 20,
      borderWith: 1,
      padding: 20,
      height: 240,
    };
  },
  hideProfileTitle: {
    fontFamily: 'Pretendard-SemiBold',
    color: '#D5CD9E',
    fontSize: 14,
  },
  hideProfileDesc: {
    fontFamily: 'Pretendard-Light',
    color: '#ABA99A',
    fontSize: 12,
    marginTop: 5,
  },
  hideProfileArea: (isOn:boolean) => {
    return {
      borderWidth: 1,
      borderColor: '#D5CD9E',
      backgroundColor: isOn ? '#D5CD9E' : 'transparent',
      borderRadius: 20,
      paddingHorizontal: isOn ? 14 : 11,
      paddingVertical: 5,
    };
  },
  hideProfileBtn: (isOn:boolean) => {
    return {
      fontFamily: 'Pretendard-Regular',
      fontSize: 11,
      color: isOn ? '#ffffff' : '#D5CD9E',
      overflow: 'hidden',
    };
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