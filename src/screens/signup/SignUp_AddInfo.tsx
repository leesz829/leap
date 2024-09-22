import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import React, { useRef, useState, useCallback } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Text, Dimensions, Modal } from 'react-native';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePopup } from 'Context';
import { regist_introduce, get_member_introduce_guide, get_common_code_list, join_save_profile_add } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { ROUTES } from 'constants/routes';
import { CommonLoading } from 'component/CommonLoading';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import { ICON, findSourcePath, findSourcePathLocal } from 'utils/imageUtils';
import SetSelectPopup from 'screens/commonpopup/SetSelectPopup';
import SetLocalSelectPopup from 'screens/commonpopup/SetLocalSelectPopup';
import SetJobSelectPopup from 'screens/commonpopup/SetJobSelectPopup';


/* ################################################################################################################
###################################################################################################################
###### 회원가입 - 간편정보
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation : StackNavigationProp<StackParamList, 'SignUp_AddInfo'>;
	route : RouteProp<StackParamList, 'SignUp_AddInfo'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_AddInfo = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();

	const { show } = usePopup();  // 공통 팝업
	const isFocus = useIsFocused();
	const [isLoading, setIsLoading] = React.useState(false);
	const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

	const memberSeq = props.route.params?.memberSeq; // 회원 번호
	const gender = props.route.params?.gender; // 성별
	const mstImgPath = props.route.params?.mstImgPath; // 대표 사진 경로
	const nickname = props.route.params?.nickname; // 닉네임

	const [isModalVisible, setIsModalVisible] = React.useState(false); // 모달 visible 여부
  const [isLocalModalVisible, setIsLocalModalVisible] = React.useState(false); // 선호지역 모달 visible 여부
  const [isJobModalVisible, setIsJobModalVisible] = React.useState(false); // 직업 모달 visible 여부


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
		busiCdList: [],
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
      if(gender == 'M') {
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
        //saveFn(list);
      }
    }
  }, [selectList]);


	// ############################################################ 회원 소개 정보 조회
	const getMemberIntro = async() => {
		const body = {
			member_seq : memberSeq
		};
		try {
			const { success, data } = await get_member_introduce_guide(body);

			if(success) {
				switch (data.result_code) {
					case SUCCESS:

						const memberAdd = data?.add_info;

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
							busiCdList: [],
							localCdList: data?.local_code_list,
							manBodyCdList: data?.man_body_code_list,
							womanBodyCdList: data?.woman_body_code_list,
							religionCdList: data?.religion_code_list,
							drinkCdList: data?.drink_code_list,
							smokeCdList: data?.smoke_code_list,
							mbtiCdList: data?.mbti_code_list,
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
			
		}
	};

	// ############################################################################# 저장 함수
	const saveFn = async () => {

		let _data = {};
		_data.member_seq = memberSeq;
		_data.join_status = 'ADD';

		selectList.map((item: any, index) => {
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

		if(!isEmptyData(_data.height)) {
			show({ content: '키를 입력해 주세요.' });
			return;
		}

		if(!isEmptyData(_data.form_body)) {
			show({ content: '체형을 선택해 주세요.' });
			return;
		}

		if(!isEmptyData(_data.job)) {
			show({ content: '직업을 선택해 주세요.' });
			return;
		}

		/* if(_data.prefer_local1 == _data.prefer_local2) {
			show({ content: '같은 선호지역은 고를 수 없습니다.' });
			return;
		} */

		// 중복 클릭 방지 설정
		if(isClickable) {
			setIsClickable(false);
			setIsLoading(true);

			const body = _data;
			console.log('body ::::: ' , body);
			
			try {
				const { success, data } = await join_save_profile_add(body);
				if (success) {
					switch (data.result_code) {
						case SUCCESS:
							navigation.navigate(ROUTES.SIGNUP_INTEREST, {
								memberSeq: memberSeq,
								gender: gender,
								nickname: nickname,
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
			};
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
			<SpaceView viewStyle={_styles.wrap}>
				<SpaceView viewStyle={{flex: 0.5}}>

					{/* ####################################################################################### HEADER */}
					<SpaceView>
						<CommonHeader title="" />
					</SpaceView>

					<SpaceView viewStyle={{justifyContent: 'space-between'}}>
						<SpaceView>
							<SpaceView mt={40} mb={50}>
								<Text style={styles.fontStyle('H', 28, '#fff')}>내 소개 정보</Text>
							</SpaceView>

							<ScrollView 
								bounces={false}
								showsVerticalScrollIndicator={false} 
								/* style={{height: height-350}} */
							>

								{/* ####################################################################################### 필수 설정 */}
								<SpaceView mb={20}>
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
					</SpaceView>
				</SpaceView>

				{/* ####################################################################################### 버튼 */}
				<SpaceView mb={20} viewStyle={_styles.bottomWrap}>
					<TouchableOpacity 
						//disabled={!comment}
						onPress={() => { 
							saveFn();

							/* navigation.navigate(ROUTES.SIGNUP_INTEREST, {
								memberSeq: memberSeq,
								gender: gender,
								nickname: nickname,
							}); */
						}}
						style={_styles.nextBtnWrap(true)}>
						<Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
						<SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
					</TouchableOpacity>
				</SpaceView>
			
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
		flex: 1,
    height: height,
    backgroundColor: '#000000',
    paddingTop: 30,
    paddingHorizontal: 10,
		justifyContent: 'space-between',
	},
	bottomWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
		paddingHorizontal: 10,
  },
  nextBtnWrap: (isOn:boolean) => {
		return {
			backgroundColor: isOn ? '#1F5AFB' : '#808080',
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
    };
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

	


});