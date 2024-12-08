import { RouteProp, useIsFocused, useNavigation, CommonActions, StackActions } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { StackParamList, BottomParamList, ColorType, ScreenNavigationProp } from '@types';
import { request_reexamination, peek_member, update_setting, set_member_phone_book, update_additional, get_bm_product } from 'api/models';
import { commonStyle, layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import { ROUTES, STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { useProfileImg } from 'hooks/useProfileImg';
import React, { useRef, useState, useEffect } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, TouchableOpacity, View, Text, Platform, PermissionsAndroid, Animated, ImageBackground } from 'react-native';
import { useDispatch } from 'react-redux';
import { findSourcePath, ICON, IMAGE, GIF_IMG } from 'utils/imageUtils';
import { usePopup } from 'Context';
import LinearGradient from 'react-native-linear-gradient';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import CommonHeader from 'component/CommonHeader';
import { BlurView, VibrancyView } from "@react-native-community/blur";
import { SpeechBubble } from 'component/SpeechBubble';
import Select from 'component/scenario/Select';
import Result from 'component/scenario/Result';
import { insert_ccs_member_ans, get_random_scnr_tmplt_list, profile_open } from 'api/models';



/* ################################################################################################################
###################################################################################################################
###### 커플 시나리오 - 선택
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Scenario'>;
  route: RouteProp<StackParamList, 'Scenario'>;
}

const { width, height } = Dimensions.get('window');

export const Scenario = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const isFocus = useIsFocused();
  const dispatch = useDispatch();

  const { show } = usePopup(); // 공통 팝업
  const [isLoading, setIsLoading] = useState(false); // 로딩 여부
  const [isClickable, setIsClickable] = useState(true); // 클릭 여부

  const [selectCode, setSelectCode] = useState('');

  const [pageGubun, setPageGubun] = useState('SELECT');

  const [ccsTitle, setCcsTitle] = useState(''); // 시나리오 제목
  const [ccsTitleCd, setCcsTitleCd] = useState(''); // 시나리오 제목 코드
  const [ccsList, setCcsList] = useState([]); // 시나리오 목록

  const [matchMemberSeq, setMatchMemberSeq] = useState(''); // 매칭 멤버 일련번호
  const [matchMemberNickname, setMatchMemberNickname] = useState(''); // 매칭 멤버 닉네임
  const [matchMemberMstImgPath, setMatchMemberMstImgPath] = useState(''); // 매칭 멤버 대표 사진

  const [selectAnswerList, setSelectAnswerList] = useState([]); // 선택한 답변 목록

  const [answerAgreeRate, setAnswerAgreeRate] = useState(0);


  // 회원 기본 정보
  const memberBase = useUserInfo();

  const mbrProfileImgList = useProfileImg();

  const answerSelect = async (code:string) => {
    setSelectCode(code);
  };

  // ####################################################################### 커플 시나리오 조회
  const getScenario = async () => {
    setIsLoading(true);

    const body = {
      
    };
    try {
      const { success, data } = await get_random_scnr_tmplt_list(body);
      if (success) {
        if (data.result_code == '0000') {          
          const ccsData = data.result;
          //console.log('list ::::::: ' , ccsData?.list);

          setCcsTitle(ccsData?.ccs_title);
          setCcsTitleCd(ccsData?.ccs_title_cd);
          setCcsList(ccsData?.list);

          setMatchMemberSeq(ccsData?.match_member_seq);
          setMatchMemberNickname(ccsData?.nickname);
          setMatchMemberMstImgPath(ccsData?.mst_img_path);

          setPageGubun('SELECT');
          //setPageGubun('RESULT');

        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ####################################################################################################### 답변 선택 완료 함수
  const answerSelectSuccess = async (codeList:any, dupAnswerCnt:number) => {
    setSelectAnswerList(codeList);
    console.log('codeList length ::::: ' , codeList.length);
    console.log('codeList ::::: ' , codeList);

    /* setPageGubun('RESULT');
    setAnswerAgreeRate(dupAnswerCnt*100/codeList.length); */

    const body = {
      ansList: codeList,
    };
    try {
      const { success, data } = await insert_ccs_member_ans(body);
      if (success) {
        if (data.result_code == '0000') {
          setPageGubun('RESULT');
          setAnswerAgreeRate(dupAnswerCnt*100/codeList.length);
        } else {
          show({ content: '오류입니다. 관리자에게 문의해주세요.' });
          return false;
        }
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ####################################################################################################### 결과 이동 함수
  const resultMove = async (type:string) => {
    if(type == '01') { // 나가기
      navigation.goBack();
    } else if(type == '02') {
      getScenario();
    }
  };

  // ####################################################################################################### 결과 이동 함수
  const profileOpenFn = async (passUseYn:string) => {

    // 이전 스택 제거
    navigation.dispatch(StackActions.pop(1));

    if(passUseYn == 'Y') {
      if(memberBase?.pass_has_amt >= 15) {

        navigation.navigate(STACK.COMMON, { 
          screen: 'MatchDetail',
          params: {
            trgtMemberSeq: matchMemberSeq,
            type: 'OPEN',
          }
        });

        // 중복 클릭 방지 설정
        /* if(isClickable) {
          try {
            setIsClickable(false);
            setIsLoading(true);
      
            const body = {
              type: 'MATCH',
              trgt_member_seq: matchMemberSeq,
            };
      
            const { success, data } = await profile_open(body);
            if(success) {
              switch (data.result_code) {
                case SUCCESS:
                  navigation.navigate(STACK.COMMON, { 
                    screen: 'MatchDetail',
                    params: {
                      trgtMemberSeq: matchMemberSeq,
                      type: 'OPEN',
                    } 
                  });  

                  break;
                case EXIST:
                  show({ content: '이미 보관함에 존재하는 회원입니다.', isCross: true });
                  break;
                case '6010':
                  show({ content: '보유 큐브가 부족합니다.', isCross: true, });
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
            setIsLoading(false);
          }
        } */

      } else {
        show({ content: '보유 큐브가 부족합니다.' });
      }

    } else {
      navigation.navigate(STACK.COMMON, { 
        screen: 'MatchDetail',
        params: {
          trgtMemberSeq: matchMemberSeq,
          type: 'OPEN',
        }
      });
    }
  };

  // ####################################################################################################### 초기 실행 함수
  useEffect(() => {
    if(isFocus) {
      getScenario();
      setSelectCode('');
    };
  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}> 
        <ImageBackground
            source={ICON.scenario_bgImg}
            style={_styles.bgWrap}
        >
          <CommonHeader title={'커플 시나리오'} /* callbackFunc={nextBtn} */ />

          <SpaceView>
            {pageGubun == 'SELECT' && 
              <Select 
                ccsTitle={ccsTitle}
                ccsList={ccsList}
                nickname={matchMemberNickname}
                mstImgPath={matchMemberMstImgPath}
                resultCallbackFn={answerSelectSuccess}
              />
            }
            {pageGubun == 'RESULT' && 
              <Result 
                ccsTitle={ccsTitle}
                answerList={selectAnswerList}
                nickname={matchMemberNickname}
                mstImgPath={matchMemberMstImgPath}
                answerAgreeRate={answerAgreeRate}
                resultCallbackFn={resultMove}
                profileOpenFn={profileOpenFn}
              />
            }
            

            {/* {pageGubun == 'SELECT' && 
              <Result 
                ccsTitle={ccsTitle}
                ccsList={ccsList}
                nickname={matchMemberNickname}
                mstImgPath={matchMemberMstImgPath}
                resultCallbackFn={move} 
              />
            } */}
          </SpaceView>

        </ImageBackground>
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
  bgWrap: {
    height: height,
    paddingTop: 30,
    paddingHorizontal: 10,
  },
});