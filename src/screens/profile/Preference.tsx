import { useRef } from 'react';
import { Image, ScrollView, TouchableOpacity, View, StyleSheet, Text, Dimensions, KeyboardAvoidingView, Modal, FlatList } from 'react-native';
import { Modalize } from 'react-native-modalize';
import React, { useEffect, useState, useCallback } from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { ColorType, StackParamList, BottomParamList, ScreenNavigationProp } from '@types';
import CommonHeader from 'component/CommonHeader';
import { layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import SpaceView from 'component/SpaceView';
import { Color } from 'assets/styles/Color';
import { useDispatch } from 'react-redux';
import { useUserInfo } from 'hooks/useUserInfo';
import { useIdeal } from 'hooks/useIdeal';
import { get_common_code, update_prefference, get_member_introduce_guide, get_member_add_code } from 'api/models';
import { usePopup } from 'Context';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import { ROUTES, STACK } from 'constants/routes';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonLoading } from 'component/CommonLoading';
import LinearGradient from 'react-native-linear-gradient';
import { ICON } from 'utils/imageUtils';
import { SUCCESS } from 'constants/reusltcode';
import SetSelectPopup from 'screens/commonpopup/SetSelectPopup';
import { isEmptyData } from 'utils/functions';




/* ################################################################################################################
###################################################################################################################
###### 내 선호 이성
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Preference'>;
  route: RouteProp<StackParamList, 'Preference'>;
}

const { width, height } = Dimensions.get('window');

export const Preference = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const isFocus = useIsFocused();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = React.useState(false);

  const { show } = usePopup();  // 공통 팝업

  const memberBase = useUserInfo(); // 회원 기본정보
  const mbrIdealType = useIdeal();  // 회원 선호이성 정보

  const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const [isModalVisible, setIsModalVIsible] = React.useState(false); // 모달 visible 여부


  /* ########################################################################################
  ###### 목록 데이터 변수 
  ######################################################################################## */

  // 목록
  const [selectList, setSelectList] = React.useState([
    {code: 'AGE', name: '나이', isEssential: true, value1: mbrIdealType?.want_age_min, value2: mbrIdealType?.want_age_max},
    {code: 'DISTANCE', name: '거리', isEssential: true, value1: mbrIdealType?.want_local1, value2: mbrIdealType?.want_local2},
    {code: 'HEIGHT', name: '키(cm)', isEssential: false, value1: mbrIdealType?.want_height_min, value2: mbrIdealType?.want_height_max},
    {code: 'BODY', name: '체형', isEssential: false, vName: mbrIdealType?.want_body_name, vCode: mbrIdealType?.want_body},
    {code: 'MBTI', name: 'MBTI', isEssential: false, vName: mbrIdealType?.want_mbti_name, vCode: mbrIdealType?.want_mbti},
    {code: 'LOCAL', name: '선호지역', isEssential: false, vName: mbrIdealType?.want_region_name, vCode: mbrIdealType?.want_region},
    {code: 'RELIGION', name: '종교', isEssential: false, vName: mbrIdealType?.want_religion_name, vCode: mbrIdealType?.want_religion},
    {code: 'DRINK', name: '음주', isEssential: false, vName: mbrIdealType?.want_drink_name, vCode: mbrIdealType?.want_drink},
    {code: 'SMOKE', name: '흡연', isEssential: false, vName: mbrIdealType?.want_smoking_name, vCode: mbrIdealType?.want_smoking},
  ]);

  // 나이 목록
  let ageList = [];
  for (let i = 20; i <= 45; i++) {
    ageList.push({ label: i.toString(), value: i });
  };

  // 거리 목록
  let distanceList = [];
  for (let i = 0; i <= 45; i++) {
    distanceList.push({ label: i.toString() + 'km', value: i });
  };

  // 키 목록
  let heightList = [];
  for (let i = 155; i <= 190; i++) {
    heightList.push({ label: i.toString() + 'cm', value: i });
  };

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
    dataList: [],
    isMinMax: false,
  });

  // 팝업 활성화
  const popupOpen = (item:any) => {
    const _code = item.code;
    
    let list = [];
    let isMinMax = false;

    if(_code == 'AGE') {
      isMinMax = true;
      list = ageList;
    } else if(_code == 'DISTANCE') {
      isMinMax = true;
      list = distanceList;
    } else if(_code == 'HEIGHT') {
      list = heightList;
      isMinMax = true;
    } else if(_code == 'BODY') {
      if(memberBase.gender == 'M') {
        list = codeData.womanBodyCdList;
      } else {
        list = codeData.manBodyCdList;
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
    }

    setPopupData({
      ...popupData,
      name: item?.name,
      code: _code,
      value: item?.vCode,
      value1: item?.value1,
      value2: item?.value2,
      dataList: list,
      isMinMax: isMinMax,
    });

    setIsModalVIsible(true);
  };

  // 팝업 닫기
  const popupClose = useCallback(async () => {
    setIsModalVIsible(false);
  }, []);
  
  // 팝업 확인
  const popupConfirm = useCallback(async (code:string, vName:string, vCode:string, value1:string, value2:string) => {
    popupClose();

    let isChk = true;
    if(code == 'AGE' || code == 'DISTANCE' || code == 'HEIGHT') {
      if(!isEmptyData(value1) || !isEmptyData(value2)) {
        isChk = false;
        show({ content: '값을 모두 선택해 주세요.' });
      } else if(value1 > value2) {
        isChk = false;
        show({ content: '최소값이 최대값 보다 작은 숫자를 선택해 주세요.' });
      }
    }

    if(isChk) {
      setSelectList((prev) => 
        prev.filter((d, i) => {
          if(d.code == code) {
            if(code == 'AGE' || code == 'DISTANCE' || code == 'HEIGHT') {
              d.value1 = value1;
              d.value2 = value2;
            } else {
              d.vName = vName;
              d.vCode = vCode;
            }
          }
          return d;
        })
      );
      saveMemberIdealType();
    }
  }, []);

  // ############################################################ 회원 소개 정보 조회
	const getMemberAddCode = async() => {

		try {
			const { success, data } = await get_member_add_code();

			if(success) {
				switch (data.result_code) {
					case SUCCESS:

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

  // 내 선호이성 저장
  const saveMemberIdealType = async () => {

    // 중복 클릭 방지 설정
    if(isClickable) {
      setIsClickable(false);
      setIsLoading(true);

      try {
        if(wantAgeMin < 19) {
          show({ content: '선호 이성의 나이를 확인해 주세요.' });
          return false;
        };

        if(wantAgeMin > wantAgeMax) {
          show({ content: '선호 이성의 나이는 최대값이 최소값보다 많거나 같아야 합니다.' });
          return false;
        };

        if(wantLocal1 >= wantLocal2) {
          show({ content: '거리는 최대값이 최소값보다 많아야 합니다.' });
          return false;
        };

        let _data = {};

        selectList.map((item: any, index) => {
          const code = item.code;

          if(code == 'AGE') {
            _data.want_age_min = item.value1;
            _data.want_age_max = item.value2;
          } else if(code == 'DISTANCE') {
            _data.want_local1 = item.value1;
            _data.want_local2 = item.value2;
          } else if(code == 'HEIGHT') {
            _data.want_height_min = item.value1;
            _data.want_height_max = item.value2;
          } else if(code == 'BODY') { _data.want_body = item.vCode;
          } else if(code == 'MBTI') { _data.want_mbti = item.vCode;
          } else if(code == 'LOCAL') { _data.want_region = item.vCode;
          } else if(code == 'RELIGION') { _data.want_religion = item.vCode;
          } else if(code == 'DRINK') { _data.want_drink = item.vCode;
          } else if(code == 'SMOKE') { _data.want_smoking = item.vCode;
          }
        });
    
        /* const body = {
          want_local1: wantLocal1,
          want_local2: wantLocal2,
          want_age_min: wantAgeMin,
          want_age_max: wantAgeMax,
          want_business1: wantBusiness1,
          want_business2: wantBusiness2,
          want_business3: wantBusiness3,
          want_job1: wantJob1,
          want_job2: wantJob2,
          want_job3: wantJob3,
          want_person1: wantPerson1,
          want_person2: wantPerson2,
          want_person3: wantPerson3,
          want_body: wantBod;
          want_mbti: string;
          want_religion: string;
          want_drink: string;
          want_smoking: string;
        }; */

        const body = _data;
        console.log('body :::: ', body);

        const { success, data } = await update_prefference(body);
        if(success) {
          if(data.result_code == '0000') {  
            dispatch(setPartialPrincipal({mbr_ideal_type : data.mbr_ideal_type}));
  
            /* show({ 
              content: '저장되었습니다.' ,
              confirmCallback: function() {
                navigation.navigate(STACK.TAB, {
                  screen: 'Roby',
                });
              }
            }); */

            show({
              type: 'RESPONSIVE',
              content: '내 선호 이성 정보가 저장되었습니다.',
            });

            /* navigation.navigate(STACK.TAB, {
              screen: 'Roby',
            }); */

          } else {
            show({ content: '오류입니다. 관리자에게 문의해주세요.' });
            return false;
          }
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsClickable(true);
        setIsLoading(false);
      }

    }
  };

































  const [idealTypeSeq, setIdealTypeSeq] = React.useState<any>(mbrIdealType?.ideal_type_seq);
  const [wantLocal1, setWantLocal1] = React.useState<any>(mbrIdealType?.want_local1);
  const [wantLocal2, setWantLocal2] = React.useState<any>(mbrIdealType?.want_local2);
  const [wantAgeMin, setWantAgeMin] = React.useState<any>(mbrIdealType?.want_age_min);
  const [wantAgeMax, setWantAgeMax] = React.useState<any>(mbrIdealType?.want_age_max);
  const [wantBusiness1, setWantBusiness1] = React.useState<any>(mbrIdealType?.want_business1);
  const [wantBusiness2, setWantBusiness2] = React.useState<any>(mbrIdealType?.want_business2);
  const [wantBusiness3, setWantBusiness3] = React.useState<any>(mbrIdealType?.want_business3);
  const [wantJob1, setWantJob1] = React.useState<any>(mbrIdealType?.want_job1);
  const [wantJob2, setWantJob2] = React.useState<any>(mbrIdealType?.want_job2);
  const [wantJob3, setWantJob3] = React.useState<any>(mbrIdealType?.want_job3);
  const [wantPerson1, setWantPerson1] = React.useState<any>(mbrIdealType?.want_person1);
  const [wantPerson2, setWantPerson2] = React.useState<any>(mbrIdealType?.want_person2);
  const [wantPerson3, setWantPerson3] = React.useState<any>(mbrIdealType?.want_person3);

  // 나이 에러 여부
  const [isAgeError, setIsAgeError] = React.useState<boolean>(false);


  // 직업 그룹 코드 목록
  const [jobCdList1, setJobCdList1] = React.useState([
    { label: '', value: '' },
  ]);
  const [jobCdList2, setJobCdList2] = React.useState([
    { label: '', value: '' },
  ]);
  const [jobCdList3, setJobCdList3] = React.useState([
    { label: '', value: '' },
  ]);

  // 여자 인상 항목 목록
  const gFaceItemList = [
    { label: '다정해보여요', value: 'FACE_G_01' },
    { label: '웃는게 예뻐요', value: 'FACE_G_02' },
    { label: '스타일이 남달라요', value: 'FACE_G_03' },
    { label: '피부가 좋아요', value: 'FACE_G_04' },
    { label: '눈이 예뻐요', value: 'FACE_G_05' },
    { label: '현모양처상', value: 'FACE_G_06' },
  ];

  // 남자 인상 항목 목록
  const mFaceItemList = [
    { label: '다정해보여요', value: 'FACE_M_01' },
    { label: '패션 감각이 좋아 보여요', value: 'FACE_M_02' },
    { label: '피부가 좋아요', value: 'FACE_M_03' },
    { label: '오똑한 콧날', value: 'FACE_M_04' },
    { label: '넓은 어깨', value: 'FACE_M_05' },
    /* { label: '요섹남', value: 'FACE_M_06' }, */
  ];

  

  // 셀렉트 박스 콜백 함수
  const busi1CallbackFn = (value: string) => {
    setWantBusiness1(value);
  };
  const busi2CallbackFn = (value: string) => {
    setWantBusiness2(value);
  };
  const busi3CallbackFn = (value: string) => {
    setWantBusiness3(value);
  };
  const jobCd1CallbackFn = (value: string) => {
    setWantJob1(value);
  };
  const jobCd2CallbackFn = (value: string) => {
    setWantJob2(value);
  };
  const jobCd3CallbackFn = (value: string) => {
    setWantJob3(value);
  };
  const wantPerson1CallbackFn = (value: string) => {
    setWantPerson1(value);
  };
  const wantPerson2CallbackFn = (value: string) => {
    setWantPerson2(value);
  };
  const wantPerson3CallbackFn = (value: string) => {
    setWantPerson3(value);
  };

  // 첫 렌더링 때 실행
  React.useEffect(() => {}, []);

  React.useEffect(() => {
    if(wantAgeMin != '' && wantAgeMin != null && wantAgeMin < 19) {
      setIsAgeError(true);
    } else {
      setIsAgeError(false);
    }

	}, [wantAgeMin]);

  React.useEffect(() => {
    if(isFocus) {
      getMemberAddCode();
    }
	}, [isFocus]);

  return (
    <>
      {isLoading && <CommonLoading />}

      <SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="선호 이성 설정" />

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
                        <Text style={styles.fontStyle('EB', 16, '#fff')}>{item.name}</Text>
                        <SpaceView viewStyle={layoutStyle.rowCenter}>
                          <Text style={styles.fontStyle('EB', 16, '#fff')}>{item.value1 + ' ~ ' + item.value2}</Text>
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

                return !item?.isEssential && (
                  <>
                    <SpaceView mb={10}>
                      <TouchableOpacity 
                        style={_styles.itemWrap}
                        onPress={() => { popupOpen(item); }}>
                        <Text style={styles.fontStyle('EB', 16, '#fff')}>{item?.name}</Text>
                        <SpaceView viewStyle={layoutStyle.rowCenter}>
                          <Text style={styles.fontStyle('EB', 16, '#fff')}>{item?.code == 'HEIGHT' ? item.value1 + ' ~ ' + item.value2 : item?.vName}</Text>
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



      {/* <CommonHeader title={'선호이성 설정'} />

      <LinearGradient
        colors={['#3D4348', '#1A1E1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{paddingHorizontal: 20, minHeight: height}}
        >
        <ScrollView style={{marginTop: 20}}>

          <KeyboardAvoidingView behavior={"padding"} style={{flex:1}}>

            <View>
              <SpaceView mb={32}>
                  <SpaceView mb={15}>
                    <CommonText color={'#D5CD9E'} fontWeight={'600'} type={'h4'}>
                      나이
                    </CommonText>
                  </SpaceView>

                  <SpaceView viewStyle={[styles.halfContainer, {alignItems: 'center', justifyContent: 'space-between'}]}>
                      <View>
                        <CommonRoundInput
                          label={'최소'}
                          keyboardType="number-pad"
                          value={wantAgeMin}
                          onChangeText={(wantAgeMin) => setWantAgeMin(wantAgeMin)}
                          maxLength={2}
                          placeholder={''}
                          placeholderTextColor={'#c6ccd3'}
                        />
                      </View>

                      <View>
                        <Text style={styles1.hipenText}>-</Text>
                      </View>

                      <View>
                        <CommonRoundInput
                          label={'최대'}
                          keyboardType="number-pad"
                          value={wantAgeMax}
                          onChangeText={(wantAgeMax) => setWantAgeMax(wantAgeMax)}
                          maxLength={2}
                          placeholder={''}
                          placeholderTextColor={'#FFF'}
                        />
                      </View>
                  </SpaceView>

                  {isAgeError &&
                    <SpaceView mt={10}>
                      <Text style={styles1.minAgeErrorText}>최소 나이는 19 이상으로 입력해야 합니다.</Text>
                    </SpaceView>
                  }
                  
                </SpaceView>

                <SpaceView mb={32}>
                  <SpaceView mb={15}>
                    <CommonText color={'#D5CD9E'} fontWeight={'600'} type={'h4'}>
                      거리
                    </CommonText>
                  </SpaceView>

                  <SpaceView viewStyle={[styles.halfContainer, {alignItems: 'center', justifyContent: 'space-between'}]}>
                    <View>
                      <CommonRoundInput
                        label={'Km'}
                        keyboardType="number-pad"
                        value={wantLocal1}
                        onChangeText={(wantLocal1) => setWantLocal1(wantLocal1)}
                        maxLength={3}
                        placeholder={'최소'}
                        placeholderTextColor={'#FFF'}
                      />
                    </View>

                    <View>
                      <Text style={styles1.hipenText}>-</Text>
                    </View>

                    <View>
                      <CommonRoundInput
                        label={'Km'}
                        keyboardType="number-pad"
                        value={wantLocal2}
                        onChangeText={(wantLocal2) => setWantLocal2(wantLocal2)}
                        maxLength={3}
                        placeholder={'최대'}
                        placeholderTextColor={'#c6ccd3'}
                      />
                    </View>
                  </SpaceView>
                </SpaceView>

            </View>

            <SpaceView mb={16}>
              <CommonBtn
                value={'저장'}
                type={'reNewId'}
                borderRadius={5}
                onPress={() => {
                  saveMemberIdealType();
                }}
              />
            </SpaceView>

          </KeyboardAvoidingView>
        </ScrollView>
      </LinearGradient> */}
    </>
  );
};

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    backgroundColor: '#16112A',
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


});