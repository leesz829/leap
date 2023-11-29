import { styles, modalStyle, layoutStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import { validateEmailChk } from 'utils/functions';
import React, { useEffect } from 'react';
import { CommonBtn } from 'component/CommonBtn';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { usePopup } from 'Context';
import { SUCCESS } from 'constants/reusltcode';
import { search_email_id, search_password } from 'api/models';
import LinearGradient from 'react-native-linear-gradient';
import { ROUTES } from 'constants/routes';


/* ################################################################################################################
###################################################################################################################
###### 아이디/비밀번호 찾기 화면
###################################################################################################################
################################################################################################################ */

interface Props {
	
}

const { width, height } = Dimensions.get('window');

export const SearchIdAndPwd = (props : Props) => {	

	const dispatch   = useDispatch();
	const navigation = useNavigation<ScreenNavigationProp>();

	const { show } = usePopup();
	const isFocus = useIsFocused();

	// 아이디 찾기 결과 메시지
	const [searchIdResult, setSearchIdResult] = React.useState({
		code : String
		, message : String
		, textColor : String
	})

	// 비밀번호 전송 결과 메시지
	const [searchPwdResult, setSearchPwdResult] = React.useState({
		code : String
		, message : String
		, textColor : String
	})

	const [phoneNumber,	setPhoneNumber] = React.useState('');
	const [emailId,    	setEmailId]     = React.useState('');
	
	// ################### 팝업 관련 #####################
	const [selectEmailIdPopup,  setSelectEmailIdPopup]  = React.useState(false); // 아이디 찾기 팝업
	const [selectPasswordPopup, setSelectPasswordPopup] = React.useState(false); // 비밀번호 찾기 팝업
	

	// ############################################# 아이디 찾기 전송 팝업
	const searchIdPopup = async () => {
		show({ 
		  content: '아이디 찾기' ,
		  cancelCallback: function() {
			
		  },
		  confirmCallback: async function() {
			btnSelectEmailIdFromPhoneNumber();
		  }
		});
	};

	// ############################################# 비밀번호 찾기 전송 팝업
	const searchPwdPopup = async () => {
		show({
		  content: '비밀번호 찾기' ,
		  cancelCallback: function() {
			
		  },
		  confirmCallback: async function() {
			btnSelectPasswordFromEmailId();
		  }
		});
	};

	// ########################################################################### 아이디 찾기 버튼 클릭
	const btnSelectEmailIdFromPhoneNumber = async () => {
		if(phoneNumber == '') {
			setSearchIdResult({
				code: '9999'
				, message: '휴대폰 번호를 입력해주세요.'
				, textColor: '#8854D2'
			});

			return;
		}

		const body = {
			phone_number: phoneNumber
		};
		try {
		  const { success, data } = await search_email_id(body);
		  console.log(data);
		  if(success) {
			switch (data.result_code) {
			  case SUCCESS:
				setSearchIdResult({
					code: data.result_code
					, message: data.email_id
					, textColor: '#43AB90'
				});
				break;
			  default:
				setSearchIdResult({
					code: data.result_code
					, message: '존재하지 않은 전화번호 입니다.'
					, textColor: '#E04136'
				});
				break;
			}
		   
		  } else {
			show({
			  content: '오류입니다. 관리자에게 문의해주세요.' ,
			  confirmCallback: function() {}
			});
		  }
		} catch (error) {
		  console.log(error);
		} finally {
		  
		}
	}

	// ########################################################################### 비밀번호 찾기 버튼 클릭
	const btnSelectPasswordFromEmailId = async () => {
		if(emailId == '') {
			setSearchPwdResult({
				code: '9999'
				, message: '이메일을 입력해주세요.'
				, textColor: '#43AB90'
			});

			return;
		}

		if(!validateEmailChk(emailId)) {
			setSearchPwdResult({
				code: '9999'
				, message: '이메일 형식에 맞게 입력해주세요.'
				, textColor: '#43AB90'
			});

			return;
		}

		const body = {
			email_id: emailId
		};
		try {
		  const { success, data } = await search_password(body);
		  if(success) {
			switch (data.result_code) {
			  case SUCCESS:
				navigation.navigate({
					name : 'NiceAuth',
					params : {
						type : 'PW_SEARCH'
						, phoneNumber : data.phone_number
						, emailId : emailId
					}
				});

				/* setSearchPwdResult({
					code: data.result_code
					, message: '새 비밀번호가 전송되었습니다.'
					, textColor: '#E04136'
				}); */
				break;
			  default:
				setSearchPwdResult({
					code: data.result_code
					, message: '존재하지 않은 이메일 입니다.'
					, textColor: '#E04136'
				});
				break;
			}
		   
		  } else {
			show({
			  content: '오류입니다. 관리자에게 문의해주세요.' ,
			  confirmCallback: function() {}
			});
		  }
		} catch (error) {
		  console.log(error);
		} finally {
		  
		}
	}



	// ####################################################### 아이디 입력 effect
	React.useEffect(() => {
		if (phoneNumber.length === 10) {
			setPhoneNumber(phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3'));
		} else if (phoneNumber.length === 13) {
			setPhoneNumber(phoneNumber.replace(/-/g, '').replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3'));
		}
	}, [phoneNumber]);

	// ####################################################### 최초 실행
	React.useEffect(() => {
		//setSearchResultCode('');
		//setSearchId('');
	}, [isFocus]);


	return (
		<>
			{/* <CommonHeader title={'아이디/비밀번호 찾기'} /> */}

			<LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 1, y: 1 }}
				style={_styles.wrap}
			>
				<ScrollView>
					<SpaceView pl={20} pr={20}>
						<View>
							<SpaceView mt={50} mb={30}>
								<Image source={IMAGE.logoLeapTmon} style={{width: 200, height: 57}} />
							</SpaceView>

							<SpaceView mb={50} mt={50}>
								<View>
									<CommonInput
										label={'아이디 찾기'}
										value={phoneNumber}
										onChangeText={(phoneNumber) => setPhoneNumber(phoneNumber)}
										isMasking={false}
										maxLength={13}
										placeholder="휴대폰 번호를 입력해주세요."
										placeholderTextColor={'#c6ccd3'} />

									<View style={[_styles.btnArea]}>
										<TouchableOpacity onPress={() => { btnSelectEmailIdFromPhoneNumber(); }}>
											<Text style={_styles.btnText}>찾기</Text>
										</TouchableOpacity>
									</View>
								</View>

								<View>
									{searchIdResult.code != null ? (
										<Text style={{color: searchIdResult.textColor, marginTop: 10}}>{searchIdResult.message}</Text>
									) : null}
								</View>
							</SpaceView>
							

							<SpaceView mb={24}>
								
								<View>
									<CommonInput
										label={'비밀번호 찾기'}
										value={emailId}
										onChangeText={(emailId) => setEmailId(emailId)}
										placeholder="이메일을 입력해주세요."
										placeholderTextColor={'#c6ccd3'} />

									<View style={[_styles.btnArea]}>
										<TouchableOpacity onPress={() => { btnSelectPasswordFromEmailId(); }}>
											<Text style={_styles.btnText}>전송</Text>
										</TouchableOpacity>
									</View>
								</View>

								<View>
									{searchPwdResult.code != null ? (
										<Text style={{color: searchPwdResult.textColor, marginTop: 10}}>{searchPwdResult.message}</Text>
									) : null}
								</View>

								{/* <CommonInput
									label="비밀번호 찾기"
									placeholder="이메일을 입력해주세요."
									value={emailId}
									onChangeText={(emailId) => setEmailId(emailId)}
									isMasking={true}
									maxLength={13}

								/>
								<CommonBtn value={'전송'} type={'purple'} onPress={() => setSelectPasswordPopup(true)} /> */}
							</SpaceView>

						</View>

						<SpaceView mb={24}>
							<TouchableOpacity onPress={() => { navigation.navigate(ROUTES.LOGIN); }}>
								<Text style={_styles.prevBtnText}>로그인 하기</Text>
							</TouchableOpacity>
						</SpaceView>
					</SpaceView>
				</ScrollView>
			</LinearGradient>
		</>
	);
};


const _styles = StyleSheet.create({
	wrap: {
		minHeight: height,
	},
	btnText: {
		backgroundColor: '#FFDD00',
		color: '#3D4348',
		fontFamily: 'Pretendard-Bold',
		fontSize: 14,
		textAlign: 'center',
		borderRadius: 5,
		overflow: 'hidden',
		paddingVertical: 5,
		paddingHorizontal: 20,
	},
	btnArea: {
	  position: 'absolute',
	  right: 0,
	  top: 15,
	  height: '100%',
	  justifyContent: 'center',
	},
	prevBtnText: {
		backgroundColor: '#262626',
		borderColor: '#BBB18B',
		borderWidth: 1,
		color: '#D5CD9E',
		fontFamily: 'Pretendard-Bold',
		fontSize: 14,
		textAlign: 'center',
		borderRadius: 5,
		overflow: 'hidden',
		paddingVertical: 15,
		paddingHorizontal: 20,
	},
  
});