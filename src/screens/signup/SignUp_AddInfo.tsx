import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import React, { useRef, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Text, Dimensions } from 'react-native';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePopup } from 'Context';
import { regist_introduce, get_member_introduce_guide, get_common_code_list, join_save_profile_add } from 'api/models';
import { SUCCESS, MEMBER_NICKNAME_DUP } from 'constants/reusltcode';
import { ROUTES } from 'constants/routes';
import { CommonLoading } from 'component/CommonLoading';
import { isEmptyData } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';
import RNPickerSelect from 'react-native-picker-select';
import { ICON, findSourcePath, findSourcePathLocal } from 'utils/imageUtils';


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

	// 추가 정보 데이터
	const [addData, setAddData] = React.useState({
		height: '', // 키
		business: '', // 직업1
		job: '', // 직업2
		form_body: '', // 체형
		religion: '', // 종교
		drinking: '', // 음주
		smoking: '', // 흡연
		introduce_comment: '', // 자기소개
		mbti_type: '', // MBTI
		prefer_local1: '', // 선호 활동 지역1
		prefer_local2: '', // 선호 활동 지역2
	});

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

	// ############################################################ 업종 그룹 코드 목록
	const busiGrpCdList = [
		{ label: '일반', value: 'JOB_00' },
		{ label: '공군/군사', value: 'JOB_01' },
		{ label: '교육/지식/연구', value: 'JOB_02' },
		{ label: '경영/사무', value: 'JOB_03' },
		{ label: '기획/통계', value: 'JOB_04' },
		{ label: '건설/전기', value: 'JOB_05' },
		{ label: '금융/회계', value: 'JOB_06' },
		{ label: '기계/기술', value: 'JOB_07' },
		{ label: '보험/부동산', value: 'JOB_08' },
		{ label: '생활', value: 'JOB_09' },
		{ label: '식음료/여가/오락', value: 'JOB_10' },
		{ label: '법률/행정', value: 'JOB_11' },
		{ label: '생산/제조/가공', value: 'JOB_12' },
		{ label: '영업/판매/관리', value: 'JOB_13' },
		{ label: '운송/유통', value: 'JOB_14' },
		{ label: '예체능/예술/디자인', value: 'JOB_15' },
		{ label: '의료/건강', value: 'JOB_16' },
		{ label: '인터넷/IT', value: 'JOB_17' },
		{ label: '미디어', value: 'JOB_18' },
		{ label: '기타', value: 'JOB_19' },
	];

	// 직업 그룹 코드 목록
	const [jobCdList, setJobCdList] = React.useState([{ label: '', value: '' }]);

	// 직업 코드 콜백 함수
	const busiCdCallbackFn = (value: string) => {
		if(addData.business != value) {
			setAddData({...addData, business: value});
			getCommonCodeList(value);
		}
	};

	// ############################################################ 직업, 지역 코드 목록 조회 함수
	const getCommonCodeList = async (value: string) => {
		const isType = /JOB/.test(value);
		const body = {
			group_code: value,
		};
		try {
			setIsLoading(true);
			const { success, data } = await get_common_code_list(body);

			if(success) {
				switch (data.result_code) {
					case SUCCESS:
						let dataList = new Array();
						data.code_list?.map(({group_code, common_code, code_name,}: {group_code: any; common_code: any; code_name: any;}) => {
							let dataMap = { label: code_name, value: common_code };
							dataList.push(dataMap);
						});
						if(isType) {
							setJobCdList(dataList);
						} else {
							//setBLocalCdList(dataList);
						}
					
						break;
					default:
						show({content: '오류입니다. 관리자에게 문의해주세요.' });
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
						setAddData({
							height: data?.add_info?.height,
							business: data?.add_info?.business,
							job: data?.add_info?.job,
							form_body: data?.add_info?.form_body,
							religion: data?.add_info?.religion,
							drinking: data?.add_info?.drinking,
							smoking: data?.add_info?.smoking,
							introduce_comment: data?.add_info?.introduce_comment,
							mbti_type: data?.add_info?.mbti_type,
							prefer_local1: data?.add_info?.prefer_local1,
							prefer_local2: data?.add_info?.prefer_local2,
						});
						
						getCommonCodeList(data?.add_info?.business,);

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

		if(!isEmptyData(addData.height) || !addData.height.trim()) {
			show({ content: '키를 입력해 주세요.' });
			return;
		}
		if(!isEmptyData(addData.business) || !addData.business.trim() || !isEmptyData(addData.job) || !addData.job.trim()) {
			show({ content: '직업을 선택해 주세요.' });
			return;
		}

		if(!isEmptyData(addData.form_body) || !addData.form_body.trim()) {
			show({ content: '체형을 선택해 주세요.' });
			return;
		}

		if(addData.prefer_local1 == addData.prefer_local2) {
			show({ content: '같은 선호지역은 고를 수 없습니다.' });
			return;
		}

		// 중복 클릭 방지 설정
		if(isClickable) {
			setIsClickable(false);
			setIsLoading(true);

			const body = {
				member_seq: memberSeq,
				business: addData.business,
				job: addData.job,
				height: addData.height,
				form_body: addData.form_body,
				religion: addData.religion,
				drinking: addData.drinking,
				smoking: addData.smoking,
				join_status: 'ADD',
				introduce_comment: addData.introduce_comment,
				mbti_type: addData.mbti_type,
				prefer_local1: addData.prefer_local1,
				prefer_local2: addData.prefer_local2,
			};

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
		getMemberIntro();
	}, [isFocus]);

	return (
		<>
			<LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={_styles.wrap}
			>
				<ScrollView showsVerticalScrollIndicator={false} style={{height: height-200}}>
					<SpaceView viewStyle={_styles.titleContainer}>
						<Image source={findSourcePath(mstImgPath)} style={_styles.addInfoImg} />
						<Text style={_styles.title}><Text style={{color: '#F3E270'}}>{nickname}</Text>님의{'\n'}간편소개 정보를{'\n'}선택해 주세요.</Text>
					</SpaceView>

					{/* ##################################################################################################################
					###### 필수 정보
					################################################################################################################## */}
					<SpaceView mt={30}>
						<View>
							<Text style={_styles.essentialTitle}>필수 정보</Text>
						</View>
						<View style={_styles.underline}></View>
						<View style={_styles.essentialOption}>

							{/* ############################################################################# 키 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>키(cm)</Text>
								{/* <TextInput maxLength={3} style={_styles.optionSelect}/> */}

								<TextInput
									value={addData.height}
									onChangeText={(text) => setAddData({...addData, height: text})}
									keyboardType="number-pad"
									autoCapitalize={'none'}
									style={[_styles.optionText, {height: 30, width: 105}]}
									maxLength={3}
								/>
							</View>

							{/* ############################################################################# 직업 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>직업</Text>
								<View style={{flexDirection: 'row', justifyContent: 'space-between', width: '74%'}}>
									<RNPickerSelect
										placeholder={{label: '선택', value: ''}}
										style={{
											inputIOS: {
												...pickerSelectStyles.inputIOS,
												width: 120,
											},
											inputAndroid: {
												...pickerSelectStyles.inputAndroid,
												width: 120,
											},
										}}
										useNativeAndroidPickerStyle={false}
										onValueChange={busiCdCallbackFn}
										value={addData.business}
										items={busiGrpCdList}
									/>
									<RNPickerSelect
										placeholder={{label: '선택', value: ''}}
										style={{
											inputIOS: {
												...pickerSelectStyles.inputIOS,
												width: 120,
											},
											inputAndroid: {
												...pickerSelectStyles.inputAndroid,
												width: 120,
											},
										}}
										useNativeAndroidPickerStyle={false}
										onValueChange={(value) => setAddData({...addData, job: value})}
										value={addData.job}
										items={jobCdList}
									/>
								</View>
							</View>

							{/* ############################################################################# 체형 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>체형</Text>
								<RNPickerSelect
									placeholder={{label: '선택', value: ''}}
									style={pickerSelectStyles}
									useNativeAndroidPickerStyle={false}
									onValueChange={(value) => setAddData({...addData, form_body: value})}
									value={addData.form_body}
									items={gender == 'M' ? codeData.manBodyCdList : codeData.womanBodyCdList}
								/>
							</View>
						</View>
					</SpaceView>

					{/* ##################################################################################################################
					###### 선택 정보
					################################################################################################################## */}
					<SpaceView mt={20}>
						<View>
							<Text style={_styles.choiceTitle}>선택 정보</Text>
						</View>
						<View style={_styles.underline}></View>
						<View>

							{/* ############################################################################# MBTI */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>MBTI</Text>
								<RNPickerSelect
									placeholder={{label: '선택', value: ''}}
									style={pickerSelectStyles}
									useNativeAndroidPickerStyle={false}
									onValueChange={(value) => setAddData({...addData, mbti_type: value})}
									value={addData.mbti_type}
									items={codeData.mbtiCdList}
								/>
							</View>

							{/* ############################################################################# 선호지역 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>선호지역</Text>
								<View style={{flexDirection: 'row', justifyContent: 'space-between', width: '74%'}}>
									<RNPickerSelect
										placeholder={{label: '선택', value: ''}}
										style={{
											inputIOS: {
												...pickerSelectStyles.inputIOS,
												width: 120,
											},
											inputAndroid: {
												...pickerSelectStyles.inputAndroid,
												width: 120,
											},
										}}
										useNativeAndroidPickerStyle={false}
										onValueChange={(value) => setAddData({...addData, prefer_local1: value})}
										value={addData.prefer_local1}
										items={codeData.localCdList}
									/>
									<RNPickerSelect
										placeholder={{label: '선택', value: ''}}
										style={{
											inputIOS: {
												...pickerSelectStyles.inputIOS,
												width: 120,
											},
											inputAndroid: {
												...pickerSelectStyles.inputAndroid,
												width: 120,
											},
										}}
										useNativeAndroidPickerStyle={false}
										onValueChange={(value) => setAddData({...addData, prefer_local2: value})}
										value={addData.prefer_local2}
										items={codeData.localCdList}
									/>
								</View>
							</View>

							{/* ############################################################################# 종교 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>종교</Text>
								<RNPickerSelect
									placeholder={{label: '선택', value: ''}}
									style={pickerSelectStyles}
									useNativeAndroidPickerStyle={false}
									onValueChange={(value) => setAddData({...addData, religion: value})}
									value={addData.religion}
									items={codeData.religionCdList}
								/>
							</View>

							{/* ############################################################################# 음주 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>음주</Text>
								<RNPickerSelect
									placeholder={{label: '선택', value: ''}}
									style={pickerSelectStyles}
									useNativeAndroidPickerStyle={false}
									onValueChange={(value) => setAddData({...addData, drinking: value})}
									value={addData.drinking}
									items={codeData.drinkCdList}
								/>
							</View>

							{/* ############################################################################# 흡연 */}
							<View style={_styles.option}>
								<Text style={_styles.optionTitle}>흡연</Text>
								<RNPickerSelect
									placeholder={{label: '선택', value: ''}}
									style={pickerSelectStyles}
									useNativeAndroidPickerStyle={false}
									onValueChange={(value) => setAddData({...addData, smoking: value})}
									value={addData.smoking}
									items={codeData.smokeCdList}
								/>
							</View>
						</View>
					</SpaceView>
				</ScrollView>

				<SpaceView mb={10}>
					<SpaceView>
						<CommonBtn
							value={'관심사 등록하기'}
							type={'reNewId'}
							fontSize={16}
							fontFamily={'Pretendard-Bold'}
							borderRadius={5}
							onPress={() => {
								saveFn();
							}}
						/>
					</SpaceView>

					<SpaceView mt={8}>
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

			</LinearGradient>
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
		padding: 30,
	},
	titleContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
	},
	title: {
		fontSize: 30,
		fontFamily: 'Pretendard-Bold',
		color: '#D5CD9E',
	},
	addInfoImg: {
		width: 110,
		height: 160,
		borderWidth: 2,
		borderColor: '#D5CD9E',
		borderRadius: 5,
		backgroundColor: '#FFF',
		marginRight: 10,
	},
	essentialCont : {

	},
	essentialTitle: {
		fontFamily: 'Pretendard-SemiBold',
		color: '#D5CD9E',
		fontSize: 20,
	},
	essentialOption: {

	},
	choiceCont: {

	},
	choiceTitle: {
		fontFamily: 'Pretendard-SemiBold',
		color: '#D5CD9E',
		fontSize: 20,
	},
	choiceOption: {

	},
	underline: {
		width: '100%',
		height: 1,
		backgroundColor: '#D5CD9E',
		marginTop: 10,
	},
	option: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
	},
	optionTitle: {
		fontFamily: 'Pretendard-Regular',
		color: '#F3E270',
	},
	optionText: {
		fontFamily: 'Pretendard-Light',
		fontSize: 12,
		color: '#F3E270',
		textAlign: 'center',
		width: 120,
		backgroundColor:'#445561',
		borderRadius: 50,
		justifyContent: 'center',
		padding: 0,
	},
	optionSelect: {
		width: 100,
		height: 40,
		backgroundColor:'#445561',
		borderRadius: 50,
		textAlign: 'center',
		color: '#F3E270',
		justifyContent: 'center',
	},
});

const pickerSelectStyles = StyleSheet.create({
	inputIOS: {
		width: 120,
		height: 30,
		backgroundColor:'#445561',
		borderRadius: 50,
		textAlign: 'center',
		color: '#F3E270',
		justifyContent: 'center',
	},
	inputAndroid: {
		width: 120,
		backgroundColor:'#445561',
		borderRadius: 50,
		textAlign: 'center',
		justifyContent: 'center',
		padding: 0,
		fontFamily: 'Pretendard-Light',
		fontSize: 12,
		color: '#F3E270',
	},
  });