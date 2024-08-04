import { styles, layoutStyle, modalStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, Text, Modal, FlatList } from 'react-native';
import * as React from 'react';
import { FC, useState, useEffect, useRef, useCallback } from 'react';
import { CommonBtn } from 'component/CommonBtn';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { ColorType, StackParamList, BottomParamList, ScreenNavigationProp } from '@types';
import { useDispatch } from 'react-redux';
import { STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { get_common_code, update_additional, get_member_introduce, save_member_introduce } from 'api/models';
import { usePopup } from 'Context';
import { myProfile } from 'redux/reducers/authReducer';
import { Color } from 'assets/styles/Color';
import { ICON } from 'utils/imageUtils';
import { Modalize } from 'react-native-modalize';
import { SUCCESS } from 'constants/reusltcode';
import { isEmptyData } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import SetSelectPopup from 'screens/commonpopup/SetSelectPopup';
import SetLocalSelectPopup from 'screens/commonpopup/SetLocalSelectPopup';
import SetJobSelectPopup from 'screens/commonpopup/SetJobSelectPopup';



/* ################################################################################################################
###################################################################################################################
###### 프로필 소개 상세
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Profile_Introduce'>;
  route: RouteProp<StackParamList, 'Profile_Introduce'>;
}

const { width, height } = Dimensions.get('window');

export const Profile_Introduce = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch();

  const { show } = usePopup();  // 공통 팝업
	const isFocus = useIsFocused();
	const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부
	const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부
  const [isModalVisible, setIsModalVisible] = React.useState(false); // 모달 visible 여부
  const [isLocalModalVisible, setIsLocalModalVisible] = React.useState(false); // 선호지역 모달 visible 여부
  const [isJobModalVisible, setIsJobModalVisible] = React.useState(false); // 직업 모달 visible 여부

  const memberBase = useUserInfo(); // 회원 기본정보

  const [comment, setComment] = React.useState(memberBase?.comment);	// 한줄 소개
  const [interviewList, setInterviewList] = React.useState([]); // 인터뷰 목록


  /* ########################################################################################
  ###### 목록 데이터 변수 
  ######################################################################################## */

  // 목록
  const [selectList, setSelectList] = React.useState([
    {code: 'HEIGHT', name: '키(cm)', isEssential: true, vName: '', vCode: ''},
    {code: 'BODY', name: '체형', isEssential: true, vName: '', vCode: ''},
    {code: 'JOB', name: '직업', isEssential: true, vName: '', value1: '', value2: ''},
    {code: 'MBTI', name: 'MBTI', isEssential: false, vName: '', vCode: ''},
    {code: 'LOCAL', name: '선호지역', isEssential: false, vList: []},
    {code: 'RELIGION', name: '종교', isEssential: false, vName: '', vCode: ''},
    {code: 'DRINK', name: '음주', isEssential: false, vName: '', vCode: ''},
    {code: 'SMOKE', name: '흡연', isEssential: false, vName: '', vCode: ''},
  ]);

  // 키 목록
  let heightList = [];
  for (let i = 155; i <= 190; i++) {
    heightList.push({ label: i.toString() + 'cm', value: i });
  };

  // 직업 목록
  let jobList = [
    {label: '일반', value: 'JOB_00'}, {label: '공군/군사', value: 'JOB_01'}, {label: '교육/지식/연구', value: 'JOB_02'}, 
    {label: '경영/사무', value: 'JOB_03'}, {label: '기획/통계', value: 'JOB_04'}, {label: '건설/전기', value: 'JOB_05'}, 
    {label: '금융/회계', value: 'JOB_06'}, {label: '기계/기술', value: 'JOB_07'}, {label: '보험/부동산', value: 'JOB_08'}, 
    {label: '생활', value: 'JOB_09'}, {label: '식음료/여가/오락', value: 'JOB_10'}, {label: '법률/행정', value: 'JOB_11'},
    {label: '생산/제조/가공', value: 'JOB_12'}, {label: '영업/판매/관리', value: 'JOB_13'}, {label: '운송/유통', value: 'JOB_14'}, 
    {label: '예체능/예술/디자인', value: 'JOB_15'}, {label: '의료/건강', value: 'JOB_16'}, {label: '인터넷/IT', value: 'JOB_17'}, 
    {label: '미디어', value: 'JOB_18'}, {label: '기타', value: 'JOB_19'},
  ];


  // 공통 코드 목록 데이터
	const [codeData, setCodeData] = React.useState({
		localCdList: [],
		manBodyCdList: [],
		womanBodyCdList: [],
		religionCdList: [],
		drinkCdList: [],
		smokeCdList: [],
		mbtiCdList: [],
	});

  /* ########################################################################################
  ###### 선택 설정 팝업 변수 
  ######################################################################################## */

  // 팝업 데이터
  const [popupData, setPopupData] = React.useState({
    name: '',
    code: '',
    value: '',
    value1: '',
    value2: '',
    valueList: [],
    dataList: [],
    isMinMax: false,
  });

  // 팝업 활성화
  const popupOpen = async (item:any) => {
    const _code = item.code;
    
    let list = [];
    let isMinMax = false;

    if(_code == 'HEIGHT') {
      list = heightList;
    } else if(_code == 'BODY') {
      if(memberBase.gender == 'M') {
        list = codeData.manBodyCdList;
      } else {
        list = codeData.womanBodyCdList;
      }
    } else if(_code == 'MBTI') {
      list = codeData.mbtiCdList;
    } else if(_code == 'LOCAL') {
      list = codeData.localCdList;
    } else if(_code == 'RELIGION') {
      list = codeData.religionCdList;
    } else if(_code == 'DRINK') {
      list = codeData.drinkCdList;
    } else if(_code == 'SMOKE') {
      list = codeData.smokeCdList;
    } else if(_code == 'JOB') {
      list = jobList;
    }

    setPopupData({
      ...popupData,
      name: item?.name,
      code: _code,
      value: item?.vCode,
      value1: item?.value1,
      value2: item?.value2,
      valueList: item?.vList,
      dataList: list,
      isMinMax: isMinMax,
    });

    if(_code == 'LOCAL') {
      setIsLocalModalVisible(true);
    } else if(_code == 'JOB') {
      setIsJobModalVisible(true);
    } else {
      setIsModalVisible(true);
    }
    
  };

  // 팝업 닫기
  const popupClose = useCallback(async (code:string) => {
    if(code == 'LOCAL') {
      setIsLocalModalVisible(false);
    } else if(code == 'JOB') {
      setIsJobModalVisible(false);
    } else {
      setIsModalVisible(false);
    }
  }, []);

  // 팝업 확인
  const popupConfirm = useCallback(async (code:string, vName:string, vCode:string, vList:any, value1:string, value2:string) => {
    popupClose(code);

    let isChk = true;
    let isSave = true;
    /* if(code == 'AGE' || code == 'DISTANCE' || code == 'HEIGHT') {
      if(!isEmptyData(value1) || !isEmptyData(value2)) {
        isChk = false;
        show({ content: '값을 모두 선택해 주세요.' });
      } else if(value1 > value2) {
        isChk = false;
        show({ content: '최소값이 최대값 보다 작은 숫자를 선택해 주세요.' });
      }
    } */

    if(isChk) {
      let list = selectList.filter((d, i) => {
        if(d.code == code) {
          if(code == 'LOCAL') {
            if(vList.length > 0) {
              let dupCnt = 0;

              vList.map((item, index) => {
                d.vList.map((itm, idx) => {
                  if(itm.value == item.value) {
                    dupCnt = dupCnt+1;
                  }
                });
              });

              if(dupCnt > 1) {
                isSave = false;
              } else {
                d.vList = vList;
              }
            } else {
              isSave = false;
            }

          } else if(code == 'JOB') {
            if(d.value2 == value2) {
              isSave = false;
            } else {
              d.vName = vName;
              d.value1 = value1;
              d.value2 = value2;
            }
          } else {
            if(d.vCode == vCode) {
              isSave = false;
            } else {
              d.vName = vName;
              d.vCode = vCode;
            }
          }
        }

        return d;
      });

      if(isSave) {
        setSelectList(list);
        saveFn(list);
      }
    }
  }, [selectList]);


  // ############################################################ 회원 소개 정보 조회 함수
  const getMemberIntro = async () => {
    const body = {
      exp_interest_yn: 'N',
      exp_interview_yn: 'Y',
    };
    try {
      setIsLoading(true);
      const { success, data } = await get_member_introduce(body);
      if(success) {
        switch (data.result_code) {
          case SUCCESS:

            const memberAdd = data?.member_add;

            let localList = [];
            if(isEmptyData(memberAdd?.prefer_local1)) {
              localList.push({label: memberAdd?.prefer_local1_name, value: memberAdd?.prefer_local1});
            }
            if(isEmptyData(memberAdd?.prefer_local2)) {
              localList.push({label: memberAdd?.prefer_local2_name, value: memberAdd?.prefer_local2});
            }

            setSelectList([
              {code: 'HEIGHT', name: '키(cm)', isEssential: true, vName: memberAdd?.height, vCode: memberAdd?.height},
              {code: 'BODY', name: '체형', isEssential: true, vName: memberAdd?.form_body_name, vCode: memberAdd?.form_body},
              {code: 'JOB', name: '직업', isEssential: true, vName: memberAdd?.job_name, value1: memberAdd?.business, value2: memberAdd?.job},
              {code: 'MBTI', name: 'MBTI', isEssential: false, vName: memberAdd?.mbti_type_name, vCode: memberAdd?.mbti_type},
              {code: 'LOCAL', name: '선호지역', isEssential: false, vList: localList},
              {code: 'RELIGION', name: '종교', isEssential: false, vName: memberAdd?.religion_name, vCode: memberAdd?.religion},
              {code: 'DRINK', name: '음주', isEssential: false, vName: memberAdd?.drinking_name, vCode: memberAdd?.drinking},
              {code: 'SMOKE', name: '흡연', isEssential: false, vName: memberAdd?.smoking_name, vCode: memberAdd?.smoking},
            ]);

            setCodeData({
              manBodyCdList: data?.man_body_code_list,
							womanBodyCdList: data?.woman_body_code_list,
              jobCdList: data?.code_list,
              mbtiCdList: data?.mbti_code_list,
              localCdList: data?.local_code_list,
              religionCdList: data?.religion_code_list,
							drinkCdList: data?.drink_code_list,
							smokeCdList: data?.smoke_code_list,
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

  // ############################################################ 내 소개 정보 저장
  const saveFn = async (list:any) => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        let _data = {};

        list.map((item: any, index) => {
          const code = item.code;
          const vCode = item.vCode;

          if(code == 'JOB') {
            _data.business = item.value1;
            _data.job = item.value2;
          } else if(code == 'LOCAL') {
            if(isEmptyData(item?.vList) && item?.vList.length > 0) {
              for(let i=0 ; i<item?.vList.length ; i++) {
                if(i == 0) {
                  _data.prefer_local1 = item?.vList[0].value;
                } else if(i == 1) {
                  _data.prefer_local2 = item?.vList[1].value;
                }
              }
            }
          } else if(code == 'HEIGHT') { _data.height = item.vCode;
          } else if(code == 'BODY') { _data.form_body = item.vCode;
          } else if(code == 'MBTI') { _data.mbti_type = item.vCode;
          } else if(code == 'RELIGION') { _data.religion = item.vCode;
          } else if(code == 'DRINK') { _data.drinking = item.vCode;
          } else if(code == 'SMOKE') { _data.smoking = item.vCode;
          }
        });

        const body = _data;

        console.log('body ::::: ' ,body);

        const { success, data } = await save_member_introduce(body);
        if(success) {
          switch (data.result_code) {
            case SUCCESS:

              // 갱신된 회원 기본 정보 저장
              //dispatch(setPartialPrincipal({ mbr_base : data.mbr_base }));

              show({ type: 'RESPONSIVE', content: '내 소개 정보가 저장되었습니다.' });

              /* navigation.navigate(STACK.TAB, {
                screen: 'Roby',
              }); */

              //navigation.goBack();
            
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

  // 첫 렌더링 때 실행
  React.useEffect(() => {
    if(isFocus) {
      getMemberIntro();
    }

  }, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="내 소개 정보" />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>

          {/* ####################################################################################### 필수 설정 */}
          <SpaceView mb={30}>
            <SpaceView>
              <Text style={styles.fontStyle('EB', 16, '#fff')}>필수 설정</Text>
            </SpaceView>
            <SpaceView mt={15}>
              {selectList.map((item, index) => {
              
								return item?.isEssential && (
                  <>
                    <SpaceView mb={10}>
                      <TouchableOpacity 
                        style={_styles.itemWrap}
                        onPress={() => { popupOpen(item); }}>
                        <Text style={styles.fontStyle('EB', 16, '#fff')}>{item?.name}</Text>
                        <SpaceView viewStyle={layoutStyle.rowCenter}>
                          <Text style={styles.fontStyle('EB', 16, '#fff')}>{item?.vName}</Text>
                          <SpaceView ml={10}><Image source={ICON.story_moreAdd} style={styles.iconNoSquareSize(11, 18)} /></SpaceView>
                        </SpaceView>
                      </TouchableOpacity>
                    </SpaceView>
                  </>
                );
							})}
            </SpaceView>
          </SpaceView>

          {/* ####################################################################################### 선택 설정 */}
          <SpaceView>
            <SpaceView>
              <Text style={styles.fontStyle('EB', 16, '#fff')}>선택 설정</Text>
            </SpaceView>
            <SpaceView mt={15}>
              {selectList.map((item, index) => {

                let selectName:any = '';

                if(item.code == 'LOCAL') {
                  let _list:any = item?.vList;
                  if(isEmptyData(_list) && _list.length > 0) {
                    for(let i=0 ; i<_list.length ; i++) {
                      if(selectName != '') {
                        selectName += ', ';
                      }
                      selectName += _list[i].label;
                    }
                  }
                } else {
                  selectName = item?.vName;
                }


                return !item?.isEssential && (
                  <>
                    <SpaceView mb={10}>
                      <TouchableOpacity 
                        style={_styles.itemWrap}
                        onPress={() => { popupOpen(item); }}>
                        <Text style={styles.fontStyle('EB', 16, '#fff')}>{item?.name}</Text>
                        <SpaceView viewStyle={layoutStyle.rowCenter}>
                          <Text style={styles.fontStyle('EB', 16, '#fff')}>{selectName}</Text>
                          <SpaceView ml={10}><Image source={ICON.story_moreAdd} style={styles.iconNoSquareSize(11, 18)} /></SpaceView>
                        </SpaceView>
                      </TouchableOpacity>
                    </SpaceView>
                  </>
                );
              })}
            </SpaceView>
          </SpaceView>

        </ScrollView>
      </SpaceView>


      {/* ################################################################################# 설정 팝업 */}
      <SetSelectPopup 
        isVisible={isModalVisible}
        closeFunc={popupClose}
        confirmCallbackFunc={popupConfirm}
        data={popupData}
      />

      {/* ################################################################################# 선호지역 설정 팝업 */}
      <SetLocalSelectPopup 
        isVisible={isLocalModalVisible}
        closeFunc={popupClose}
        confirmCallbackFunc={popupConfirm}
        data={popupData}
      />

      {/* ################################################################################# 직업 설정 팝업 */}
      <SetJobSelectPopup 
        isVisible={isJobModalVisible}
        closeFunc={popupClose}
        confirmCallbackFunc={popupConfirm}
        data={popupData}
      />


      {/* <LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={_styles.wrap}
			>

        <KeyboardAwareScrollView
          keyboardShouldPersistTaps="always"
          keyboardOpeningTime={0}
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}
          contentInsetAdjustmentBehavior="automatic"
          showsHorizontalScrollIndicator={false}
          showsVerticalScrollIndicator={false}
          automaticallyAdjustContentInsets={false}
          extraScrollHeight={100}
          enableOnAndroid>

          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <ScrollView showsVerticalScrollIndicator={false} style={{height: height - 250, marginBottom: 50}}>
              <SpaceView mt={20} mb={30}>
                <Text style={_styles.title}><Text style={{color: '#F3E270'}}>{memberBase?.nickname}</Text>님의{'\n'}프로필 정보 수정하기</Text>
              </SpaceView>

              <SpaceView>
                <SpaceView>
                  <Text style={_styles.introduceText}>한줄 소개</Text>
                </SpaceView>
                <SpaceView>
                  <TextInput
                    value={comment}
                    onChangeText={(text) => setComment(text)}
                    autoCapitalize={'none'}
                    multiline={true}
                    style={_styles.textInputBox(70)}
                    placeholder={'프로필 카드 상단에 공개되는 내 상세 소개 입력'}
                    placeholderTextColor={'#FFFDEC'}
                    maxLength={50}
                    //caretHidden={true}
                    textAlignVertical={'top'}
                    textAlign={'left'}
                  />
                  <SpaceView mt={5}>
                    <Text style={_styles.countText}>({isEmptyData(comment) ? comment.length : 0}/50)</Text>
                  </SpaceView>
                </SpaceView>
              </SpaceView>

              <SpaceView>
                <SpaceView>
                  <Text style={_styles.introduceText}>프로필 소개</Text>
                </SpaceView>
                <SpaceView>
                  <TextInput
                    value={addData?.introduceComment}
                    onChangeText={(text) => setAddData({...addData, introduceComment: text})}
                    autoCapitalize={'none'}
                    multiline={true}
                    style={_styles.textInputBox(110)}
                    placeholder={'프로필 카드 상단에 공개되는 내 상세 소개 입력'}
                    placeholderTextColor={'#FFFDEC'}
                    maxLength={3000}
                    textAlignVertical={'top'}
                    textAlign={'left'}
                  />
                  <SpaceView mt={5}>
                    <Text style={_styles.countText}>({isEmptyData(addData?.introduceComment) ? addData?.introduceComment.length : 0}/3000)</Text>
                  </SpaceView>
                </SpaceView>
              </SpaceView>

              <SpaceView mt={10}>
                {interviewList.map((item, index) => {

                  return (isEmptyData(item?.common_code)) && (
                    <>
                      <SpaceView mb={15}>
                        <Text style={_styles.introduceText}>Q. {item?.code_name}</Text>
                        <TextInput
                          defaultValue={item?.answer}
                          onChangeText={(text) => answerChangeHandler(item?.common_code, text) }
                          autoCapitalize={'none'}
                          multiline={true}
                          style={_styles.textInputBox(70)}
                          placeholder={'인터뷰 답변 입력(가입 후 변경 가능)'}
                          placeholderTextColor={'#FFFDEC'}
                          maxLength={200}
                          textAlignVertical={'top'}
                          textAlign={'left'}
                        />
                        <SpaceView mt={5}>
                          <Text style={_styles.countText}>({isEmptyData(item?.answer) ? item?.answer.length : 0}/200)</Text>
                        </SpaceView>
                      </SpaceView>
                    </>
                  )
                })}
              </SpaceView>
            </ScrollView>
          </TouchableWithoutFeedback>

          <SpaceView viewStyle={_styles.btnArea}>
            <SpaceView>
              <CommonBtn
                value={'저장하기'}
                type={'reNewId'}
                fontSize={16}
                fontFamily={'Pretendard-Bold'}
                borderRadius={5}
                onPress={() => {
                  saveFn();
                }}
              />
            </SpaceView>

            <SpaceView mt={10}>
              <CommonBtn
                value={'이전으로'}
                type={'reNewGoBack'}
                isGradient={false}
                fontFamily={'Pretendard-Light'}
                fontSize={14}
                borderRadius={5}
                onPress={() => {
                  navigation.goBack();
                }}
              />
            </SpaceView>
          </SpaceView>
        </KeyboardAwareScrollView>
			</LinearGradient> */}

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
    backgroundColor: '#13111C',
    paddingHorizontal: 10,
    paddingTop: 30,
	},
  itemWrap: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 45,
    paddingHorizontal: 15,
  },
  modalWrap: {
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 35,
    paddingBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },
  confirmBtn: {
    backgroundColor: '#46F66F',
    borderRadius: 25,
    width: 100,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelWrap: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },



  heightItemWrap: {
    borderWidth: 1,
    borderColor: '#44B6E5',
    borderRadius: 15,
    width: '48.8%',
    paddingVertical: 5,
    marginBottom: 5,
  },



  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 10, // 그라데이션 높이를 조정하세요
    zIndex: 1,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 10, // 그라데이션 높이를 조정하세요
    zIndex: 1,
  },















	title: {
		fontSize: 30,
		fontFamily: 'Pretendard-Bold',
		color: '#D5CD9E',
	},
	textInputBox: (_hegiht: number) => {
		return {
			width: '100%',
			height: _hegiht,
			backgroundColor: '#445561',
			borderRadius: 5,
			textAlign: 'center',
			fontFamily: 'Pretendard-Light',
			color: '#F3E270',
      paddingVertical: 10,
      paddingHorizontal: 10,
    };
	},
	introduceText: {
		fontFamily: 'Pretendard-Regular',
		color: '#FFDD00',
		marginBottom: 10,
   
	},
	countText: {
		marginLeft: 3,
		fontFamily: 'Pretendard-Regular',
		fontSize: 12,
		color: '#fff',
		textAlign: 'right',
	},
  btnArea: {
    marginTop: -45,
  },
});