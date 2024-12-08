import { RouteProp, useIsFocused, useNavigation, useFocusEffect, CommonActions } from '@react-navigation/native';
import React, { useEffect, useState, FC } from 'react';
import { BottomParamList, ColorType, ScreenNavigationProp, CommonCode, LabelObj, LiveMemberInfo, LiveProfileImg } from '@types';
import { get_random_scnr_tmplt_list } from 'api/models';
import SpaceView from 'component/SpaceView';
import { CommonLoading } from 'component/CommonLoading';
import { usePopup } from 'Context';
import { useUserInfo } from 'hooks/useUserInfo';
import { styles, modalStyle, layoutStyle, commonStyle } from 'assets/styles/Styles';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, FlatList, Platform, Modal, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux'; 
import { findSourcePath, ICON, IMAGE, GUIDE_IMAGE, GIF_IMG } from 'utils/imageUtils';
import { formatNowDate, isEmptyData, CommaFormat } from 'utils/functions';
import { ROUTES, STACK } from 'constants/routes';
import { useProfileImg } from 'hooks/useProfileImg';
import LinearGradient from 'react-native-linear-gradient';
import { Slider } from '@miblanchard/react-native-slider';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SpeechBubble } from 'component/SpeechBubble';


/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 참여하기 선택 Component
###################################################################################################################
################################################################################################################ */

interface Props {
  ccsTitle: string; // 시나리오 제목
  ccsList: any; // 시나리오 목록
  nickname: string; // 닉네임
  mstImgPath: string; // 대표사진경로
  resultCallbackFn: (codeList:any, dupAnswerCnt:number) => void; // 결과 콜백 함수
}

const { width, height } = Dimensions.get('window');

const Select: FC<Props> = React.memo((props) => {

  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const [answerStep, setAnswerStep] = useState(0);
  const [selectCode, setSelectCode] = useState({});
  const [selectCodeList, setSelectCodeList] = useState([]);

  const [dupAnswerCnt, setDupAnswerCnt] = useState(0); // 같은 답변 카운트

  const codeList = [
    {code: '01', name: '코인 노래방'},
    {code: '02', name: '이자카야'},
    {code: '03', name: '심야영화'}
  ]

  const memberBase = useUserInfo(); // 회원 기본 정보
  const mbrProfileImgList = useProfileImg(); // 회원 프로필 이미지 목록

  const move = async (list:any, dupCnt:number) => {
    props.resultCallbackFn(list, dupCnt);
  };

  const getTextForNumber = (num:number) => {
    switch(num) {
      case 1: return '첫번째';
      case 2: return '두번째';
      case 3: return '세번째';
      case 4: return '네번째';
      case 5: return '다섯번째';
      case 6: return '여섯번째';
      case 7: return '일곱번째';
      case 8: return '여덞번째';
      case 9: return '아홉번째';
      case 10: return '열번째';
      default: return '첫번째';
    }
  };

  const nextAnswer = () => {
    if(props.ccsList.length-2 == selectCodeList.length) {
      let applyList = selectCodeList.filter(item => item);
      applyList.push({'ccs_cd': selectCode?.ccs_cd, 'ccs_ans_cd': selectCode?.ccs_ans_cd, 'ccs_member_seq': selectCode?.ccs_member_seq});
      console.log('list ::::: ' , applyList.length);

      let applyDupCnt = isEmptyData(selectCode?.ccs_member_seq) ? dupAnswerCnt+1 : dupAnswerCnt;

      move(applyList, applyDupCnt);
    } else {
      setSelectCodeList((prevItems) => [...prevItems, {'ccs_cd': selectCode?.ccs_cd, 'ccs_ans_cd': selectCode?.ccs_ans_cd, 'ccs_member_seq': selectCode?.ccs_member_seq}]);
      if(isEmptyData(selectCode?.ccs_member_seq)) {
        setDupAnswerCnt(dupAnswerCnt+1);
      }
    }
    
    answerReset();
  };

  const answerReset = async () => {
    setSelectCode({});
    setAnswerStep(0);
  };

  useFocusEffect(
    React.useCallback(() => {
      answerReset();
      
      return () => {
        //setSelectCodeList([]);
      };
    }, []),
  );

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView mt={40} viewStyle={_styles.contentWrap}>
        <SpaceView viewStyle={_styles.titleWrap}>
          <Text style={styles.fontStyle('EB', 20, '#fff')}>{props.ccsTitle}</Text>
        </SpaceView>
        <SpaceView pl={13} pr={13}>
          <SpaceView pt={50} viewStyle={{flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start'}}>
            <SpaceView viewStyle={_styles.imgWrap}>
              <Image source={findSourcePath(props.mstImgPath)} style={_styles.imgStyle} />
              <BlurView 
                style={_styles.blurArea}
                blurType='light'
                blurAmount={10}
              />
            </SpaceView>
            <SpaceView ml={10} mt={13}>
              <SpaceView><Text style={styles.fontStyle('H', 30, '#fff')}>{props.nickname}</Text></SpaceView>
              {/* <SpaceView mt={8} viewStyle={layoutStyle.rowStart}>
                <SpaceView><Text style={styles.fontStyle('SB', 9, '#8BAAFF')}>예상 친밀도</Text></SpaceView>
                <SpaceView ml={10} viewStyle={{overflow: 'hidden', width: 80}}>
                  <LinearGradient
                    colors={['#8BAAFF', '#8BAAFF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={_styles.sliderActiveStyle(40 / 100)}>
                  </LinearGradient>
                  <Slider
                    animateTransitions={true}
                    renderThumbComponent={() => null}
                    containerStyle={_styles.sliderContainerStyle}
                    trackStyle={_styles.sliderThumbStyle}
                    trackClickable={false}
                    disabled
                  />
                </SpaceView>
                <SpaceView ml={5}>
                  <Text style={styles.fontStyle('R', 6, '#8BAAFF')}>40%</Text>
                </SpaceView>
              </SpaceView> */}
              <SpaceView mt={8} viewStyle={layoutStyle.rowStart}>
                <SpaceView><Text style={[styles.fontStyle('SB', 9, '#FFFF5D'), {textAlign: 'right'}]}>긍정 반응</Text></SpaceView>
                <SpaceView ml={18} viewStyle={layoutStyle.rowStart}>

                  {Array.from({ length: dupAnswerCnt }).map((_, idx) => (
                    <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  ))}

                  {/* <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView>
                  <SpaceView mr={2}><Image source={ICON.scenario_heartYellow} style={styles.iconSquareSize(12)} /></SpaceView> */}
                </SpaceView>
              </SpaceView>
            </SpaceView>
          </SpaceView>

          {/* ############################################################################################################################## 
          ###### 상황 및 선택지 영역
          ############################################################################################################################## */}
          <SpaceView mt={30}>
            <SpaceView>
              {answerStep == 2 && ( 
                <TouchableOpacity 
                  style={_styles.nextBubbleWrap}
                  onPress={() => {
                    nextAnswer();
                  }}
                >
                  <SpeechBubble arrowPosition={'left'} text={'화면을 터치하고 다음 상황 보기'} />
                </TouchableOpacity>
              )}

              <SpaceView><Text style={styles.fontStyle('SB', 16, '#fff')}>{getTextForNumber(selectCodeList.length+1)} 상황</Text></SpaceView>
              <SpaceView mt={5}>
                <Text style={styles.fontStyle('SB', 14, '#fff')}>{props.ccsList.length > 0 && props.ccsList[selectCodeList.length]?.ccs_contents}</Text>
              </SpaceView>
            </SpaceView>
            <SpaceView mt={50} mb={20}>
              {props.ccsList.length > 0 && (
                <>
                  {props.ccsList[selectCodeList.length]?.ans_list.map((item, index) => {
                    const ccsCd = item?.ccs_cd;
                    const ccsAnsCd = item?.ccs_ans_cd;
                    const ccsMemberSeq = item?.ccs_member_seq;

                    let wrapBgColor = 'rgba(162,223,255,0.5)';

                    if(answerStep == 0) {
                      wrapBgColor = 'rgba(162,223,255,0.5)';
                    } else if(answerStep == 1) {
                      if(selectCode?.ccs_ans_cd == ccsAnsCd) {
                        wrapBgColor = '#46F66F';
                      } else {
                        wrapBgColor = 'rgba(162,223,255,0.5)';
                      }
                    } else if(answerStep == 2) {
                      if(isEmptyData(ccsMemberSeq)) {
                        if(selectCode?.ccs_ans_cd == ccsAnsCd) {
                          wrapBgColor = '#46F66F';
                        } else {
                          wrapBgColor = '#FF516F';
                        }
                      } else {
                        if(selectCode?.ccs_ans_cd == ccsAnsCd) {
                          wrapBgColor = '#46F66F';
                        } else {
                          wrapBgColor = 'rgba(162,223,255,0.5)';
                        }
                      }
                    }

                    return (
                      <TouchableOpacity
                        style={_styles.answerItemWrap(wrapBgColor)}
                        activeOpacity={0.7}
                        onPress={() => {

                          if(answerStep == 0) {
                            setAnswerStep(1);
                            setSelectCode(item);
                          } else if(answerStep == 1) {
                            if(selectCode?.ccs_ans_cd == ccsAnsCd) {
                              setAnswerStep(2);
                            } else {
                              setSelectCode(item);
                            }
                          }
                        }}
                      >
                        {answerStep == 2 && selectCode?.ccs_ans_cd == ccsAnsCd && (
                          <SpaceView viewStyle={{position: 'absolute', top: 0, bottom: 0, left: 3, justifyContent: 'center', alignItems: 'center'}}>
                            <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.mstImgStyle} />
                          </SpaceView>
                        )}
                        <Text style={styles.fontStyle('SB', 14, '#fff')}>{item.ccs_ans_contents}</Text>
                        {(isEmptyData(selectCode?.ccs_ans_cd) && selectCode?.ccs_ans_cd == ccsAnsCd && answerStep == 1) && ( 
                          <SpaceView viewStyle={_styles.answerOnemoreWrap}>
                            <SpeechBubble arrowPosition={'right'} text={'한 번 더 눌러 주세요!'} />
                          </SpaceView>
                        )}
                        {answerStep == 2 && isEmptyData(ccsMemberSeq) && (
                          <SpaceView viewStyle={{position: 'absolute', top: 0, bottom: 0, right: 3, justifyContent: 'center', alignItems: 'center'}}>
                            <SpaceView viewStyle={{flexDirection: 'row', overflow: 'hidden', borderRadius: 20}}>
                              <Image source={findSourcePath(props.mstImgPath)} style={_styles.mstImgStyle} />
                              <BlurView 
                                style={_styles.blurArea}
                                blurType='light'
                                blurAmount={10}
                              />
                            </SpaceView>
                          </SpaceView>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </>
              )}
            </SpaceView>

          </SpaceView>
        </SpaceView>
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
  contentWrap: {
    backgroundColor: 'rgba(52,52,52,0.5)',
    borderRadius: 20,
    overflow: 'hidden',
  },
  titleWrap: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  imgWrap: {
    borderRadius: 50,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#fff',
  },
  imgStyle: {
    width: 50,
    height: 50,
    borderRadius: 50,
    overflow: 'hidden',
  },
  answerItemWrap: (bg:any) => {
    return {
      backgroundColor: bg,
      borderRadius: 25,
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 40,
      marginBottom: 10,
      /* flexDirection: 'row',
      justifyContent: 'space-between', */
    };
  },
  sliderActiveStyle: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 5,
      zIndex: 1,
      borderRadius: 25,
    };
  },
  sliderContainerStyle: {
    height: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(106,106,106,0.5)',
  },
  sliderThumbStyle: {
    height: 5,
    borderRadius: 50,
    backgroundColor: 'rgba(106,106,106,0.5)',
  },
  blurArea: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		width: '100%',
		height: '100%',
		zIndex: 1,
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
	},
  answerOnemoreWrap: {
    position: 'absolute',
    top: -30,
    right: 12,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextBubbleWrap: {
    position: 'absolute',
    top: -35,
    left: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mstImgStyle: {
    width: 33,
    height: 33,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#fff',
  },

});


export default Select;