import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import React, { useRef, useState } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Text, Dimensions } from 'react-native';
import { ICON } from 'utils/imageUtils';
import { Modalize } from 'react-native-modalize';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePopup } from 'Context';
import { join_save_profile_add, get_member_introduce_guide } from 'api/models';
import { SUCCESS, MEMBER_NICKNAME_DUP } from 'constants/reusltcode';
import { ROUTES } from 'constants/routes';
import { CommonLoading } from 'component/CommonLoading';
import { isEmptyData } from 'utils/functions';
import InterestRegiPopup from 'component/member/InterestRegiPopup';



/* ################################################################################################################
###################################################################################################################
###### 회원가입 - 관심사
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation : StackNavigationProp<StackParamList, 'SignUp_Interest'>;
	route : RouteProp<StackParamList, 'SignUp_Interest'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Interest = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const [currentIndex, setCurrentIndex] = React.useState(0);

	const { show } = usePopup();  // 공통 팝업
	const isFocus = useIsFocused();
	const [isLoading, setIsLoading] = React.useState(false);
	const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

	const memberSeq = props.route.params?.memberSeq; // 회원 번호
	const gender = props.route.params?.gender; // 성별
	const mstImgPath = props.route.params?.mstImgPath; // 대표 사진 경로
	const nickname = props.route.params?.nickname; // 닉네임

	// ############################################################## 관심사 등록 팝업 관련
	const int_modalizeRef = useRef<Modalize>(null);
	const int_onOpen = () => { 
		int_modalizeRef.current?.openModal(intList, checkIntList);
	};
	const int_onClose = () => {	
		int_modalizeRef.current?.closeModal(); 
	};

	// 관심사 목록
	const [intList, setIntList] = React.useState([]);

	// 관심사 체크 목록
	const [checkIntList, setCheckIntList] = React.useState([{code_name: "", common_code: "", interest_seq: ""}]);

	// 관심사 등록 확인 함수
	const int_confirm = () => {
		int_modalizeRef.current?.close();
	};

	// 관심사 등록 콜백 함수
	const intCallbackFn = async (list:any) => {
		console.log('list ::::::: ' , list);

		//saveFn(list);
		setCheckIntList(list);
		int_onClose();
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
					setIntList(data.int_list);
		
					let setList = new Array();
					data.int_list.map((item, index) => {
						item.list.map((obj, idx) => {
							if(obj.interest_seq != null) {
								setList.push(obj);
							}
						})
					})
		
					setCheckIntList(setList);
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
	const saveFn = async (chkList:any) => {
		if(!isEmptyData(checkIntList) || checkIntList.length < 1){
			show({ content: '관심사를 입력해 주세요.' });
			return;
		}

		// 중복 클릭 방지 설정
		if(isClickable) {
			setIsClickable(false);
			setIsLoading(true);

			const body = {
				member_seq: memberSeq,
				interest_list: checkIntList,
				join_status: 'INTEREST',
			};
			
			try {
				const { success, data } = await join_save_profile_add(body);
				if (success) {
					switch (data.result_code) {
						case SUCCESS:
							navigation.navigate(ROUTES.SIGNUP_INTRODUCE, {
								memberSeq: memberSeq,
								gender: gender,
								mstImgPath: mstImgPath,
								nickname: nickname,
							});
							break;
						default:
							show({
								content: '오류입니다. 관리자에게 문의해주세요.',
								confirmCallback: function () {},
							});
						break;
					}
				} else {
					show({
						content: '오류입니다. 관리자에게 문의해주세요.',
						confirmCallback: function () {},
					});
				}
			} catch (error) {
				console.log(error);
			} finally {
				setIsClickable(true);
				setIsLoading(false);
			};
		}
	};

	// ############################################################ 최초 실행
	React.useEffect(() => {
		getMemberIntro();		
	}, [isFocus]);

	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				<SpaceView>

					{/* ####################################################################################### HEADER */}
					<SpaceView>
						<CommonHeader title="" />
					</SpaceView>

					<SpaceView viewStyle={{justifyContent: 'space-between'}}>
						<SpaceView>
							<SpaceView mt={50} mb={50}>
								<Text style={styles.fontStyle('H', 28, '#fff')}>추가 정보(관심사)</Text>
								<SpaceView mt={10}>
									<Text style={styles.fontStyle('SB', 12, '#fff')}>나와 비슷한 성향을 가진 친구를 찾기 위해{'\n'}관심사와 인터뷰 내용을 작성해 주세요.</Text>
								</SpaceView>
							</SpaceView>

							<ScrollView 
								bounces={false}
								showsVerticalScrollIndicator={false} 
								style={{height: height-350}}
							>
								<SpaceView mb={20}>
									{intList.map((i, n) => {
										//let list:any;
										const list = checkIntList.filter(item => item.group_code === i.group_code);
										const groupCode = i.group_code;
										let icon = ICON.int_active;

										// 아이콘 설정
										if(groupCode == 'INTEREST_CATEGORY_01') {
											icon = ICON.int_lifestyle;
										} else if(groupCode == 'INTEREST_CATEGORY_02') {
											icon = ICON.int_leisure;
										} else if(groupCode == 'INTEREST_CATEGORY_03') {
											icon = ICON.int_food;
										} else if(groupCode == 'INTEREST_CATEGORY_04') {
											icon = ICON.int_body;
										} else if(groupCode == 'INTEREST_CATEGORY_05') {
											icon = ICON.int_active;
										} else if(groupCode == 'INTEREST_CATEGORY_06') {
											icon = ICON.int_social;
										} else if(groupCode == 'INTEREST_CATEGORY_07') {
											icon = ICON.int_entertainment;
										} else if(groupCode == 'INTEREST_CATEGORY_08') {
											icon = ICON.int_game;
										}

										return list.length > 0 && (
											<>
												<SpaceView mb={30}>
													<SpaceView viewStyle={layoutStyle.rowStart}>
														<Image source={icon} style={styles.iconSquareSize(15)} />
														<SpaceView ml={5}><Text style={styles.fontStyle('B', 14, '#fff')}>{i.group_code_name}</Text></SpaceView>
													</SpaceView>

													<SpaceView mt={20} viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
														{list.map((i2, n2) => {
															return isEmptyData(i2.code_name) && (
																<SpaceView key={n2 + 'reg'} mr={5} mb={10} viewStyle={_styles.interestItemWrap}>
																	<Text style={styles.fontStyle('B', 14, '#fff')}>{i2.code_name}</Text>
																</SpaceView>
															);
														})}
													</SpaceView>
												</SpaceView>
											</>
										);
									})}
								</SpaceView>
							</ScrollView>
						</SpaceView>
					</SpaceView>

				</SpaceView>

				<SpaceView mb={20} viewStyle={_styles.bottomWrap}>
					<TouchableOpacity 
						onPress={() => { int_onOpen(); }}
						style={[_styles.nextBtnWrap(false), {marginRight: 10}]}>
						<Text style={styles.fontStyle('B', 16, '#000000')}>관심사 추가/삭제</Text>
					</TouchableOpacity>
					<TouchableOpacity 
						//disabled={!comment}
						onPress={() => { 
							saveFn();
						}}
						style={_styles.nextBtnWrap(true)}>
						<Text style={styles.fontStyle('B', 16, '#fff')}>다음으로</Text>
						<SpaceView ml={10}><Text style={styles.fontStyle('B', 20, '#fff')}>{'>'}</Text></SpaceView>
					</TouchableOpacity>
				</SpaceView>

				{/* <ScrollView showsVerticalScrollIndicator={false}>
					<SpaceView mt={20}>
						<Text style={_styles.title}>관심사 등록하기</Text>
						<Text style={_styles.subTitle}>나와 관심사를 공유할 수 있는 사람을 찾을 수 있어요.</Text>
					</SpaceView>

					<SpaceView mb={10}>
						<TouchableOpacity style={_styles.regiBtn} onPress={int_onOpen}>
							<Text style={_styles.regiBtnText}>관심사 등록</Text>
						</TouchableOpacity>
					</SpaceView>

					<SpaceView viewStyle={{flexDirection: 'row', flexWrap: 'wrap'}}>
						{checkIntList.map((i, index) => {
							return isEmptyData(i.code_name) && (
								<SpaceView mr={5} key={index + 'reg'}>
									<TouchableOpacity disabled={true} style={_styles.interBox}>
										<Text style={_styles.interText}>{i.code_name}</Text>
									</TouchableOpacity>
								</SpaceView>	
							);
						})}

					</SpaceView>

					<SpaceView mt={205}>
						<CommonBtn
							value={'프로필 추가 정보 입력하기(선택)'}
							type={'reNewId'}
							fontSize={16}
							fontFamily={'Pretendard-Bold'}
							borderRadius={5}
							onPress={() => {
								saveFn();
							}}
						/>
					</SpaceView>

					<SpaceView mt={20}>
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
				</ScrollView> */}
			</SpaceView>


			{/* #############################################################################
											관심사 설정 팝업
			############################################################################# */}
			<InterestRegiPopup
        ref={int_modalizeRef}
				callbackFunc={intCallbackFn}
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
	interestItemWrap: {
		backgroundColor: '#808080',
		borderRadius: 25,
		borderColor: '#40E0D0',
		borderWidth: 1,
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	bottomWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
		paddingHorizontal: 10,
  },
  nextBtnWrap: (isOn:boolean) => {
		return {
			backgroundColor: isOn ? '#1F5AFB' : '#fff',
      borderRadius: 25,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 10,
    };
	},
  textInputStyle: {
    width: '100%',
    borderBottomWidth: 1,
    borderBottomColor: '#A8A8A8',
    padding: 0,
    paddingBottom: 5,
    paddingTop: 5,
  },
});