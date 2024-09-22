import { styles, modalStyle, layoutStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { CommonInput } from 'component/CommonInput';
import { CommonText } from 'component/CommonText';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions } from 'react-native';
import { ICON, IMAGE } from 'utils/imageUtils';
import * as React from 'react';
import { CommonBtn } from 'component/CommonBtn';
import { StackParamList, ScreenNavigationProp, ColorType } from '@types';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { usePopup } from 'Context';
import { update_member_password, update_member_exit } from 'api/models';
import { SUCCESS } from 'constants/reusltcode';
import { STACK } from 'constants/routes';
import { myProfile } from 'redux/reducers/authReducer';
import { clearPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';


/* ################################################################################################################
###################################################################################################################
###### 비밀번호 변경 화면
###################################################################################################################
################################################################################################################ */

interface Props {
	
}

const { width, height } = Dimensions.get('window');

export const ChangePassword = (props : Props) => {

	const navigation = useNavigation<ScreenNavigationProp>();
	const { show } = usePopup();  // 공통 팝업
	const dispatch = useDispatch();


	const [oldPassword,    		setOldPassword]         = React.useState('');
	const [compareOldPassword,  setCompareOldPassword]  = React.useState('');
	const [newPassword,    		setNewPassword]    		= React.useState('');
	const [newPasswordChk, 		setNewPasswordChk]      = React.useState('');

  	// 오류메시지 상태저장
  	const [oldPasswordConfirmMessage,    setOldPasswordConfirmMessage]    = React.useState<string>('');
  	const [newPasswordConfirmMessage,    setNewPasswordConfirmMessage]    = React.useState<string>('');
  	const [newPasswordChkConfirmMessage, setNewPasswordChkConfirmMessage] = React.useState<string>('');

  	// 오류메시지 폰트컬러 상태저장
  	const [oldPasswordConfirmMessageColor,    setOldPasswordConfirmMessageColor]    = React.useState<string>('');
  	const [newPasswordConfirmMessageColor,    setNewPasswordConfirmMessageColor]    = React.useState<string>('');
  	const [newPasswordChkConfirmMessageColor, setNewPasswordChkConfirmMessageColor] = React.useState<string>('');

	// 유효성 검사
	const [isOldPassword,    setIsOldPassword]    = React.useState<boolean>(false);
	const [isNewPassword,    setIsNewPassword]    = React.useState<boolean>(false);
	const [isNewPasswordChk, setIsNewPasswordChk] = React.useState<boolean>(false);


	// ####################################################### 비밀번호 Validate 체크
	const validatePassword = async () => {

		setIsOldPassword(false);
		setIsNewPassword(false);
		setIsNewPasswordChk(false);

		setOldPasswordConfirmMessage("");
		setNewPasswordConfirmMessage("");
		setNewPasswordChkConfirmMessage("");

		if(oldPassword == '') {
			setOldPasswordConfirmMessage("현재 사용하고 계신 비밀번호를 입력해주세요.");
			setOldPasswordConfirmMessageColor('#8854D2');
			return;
		}

		if(newPassword == '') {
			setIsNewPassword(true);
			setNewPasswordConfirmMessage("새로 사용하실 비밀번호를 입력해주세요.");
			setNewPasswordConfirmMessageColor('#8854D2');
			return;
		}

		let regPass = /^(?=.*[a-zA-Z])(?=.*[!@#$%^*+=-])(?=.*[0-9]).{8,25}$/;
		if((!regPass.test(newPassword))){
			setIsNewPassword(true);
			setNewPasswordConfirmMessage("새 비밀번호를 올바르게 입력해주세요.");
			setNewPasswordConfirmMessageColor('#E04136');
			return;
		}

		if(newPasswordChk == '') {
			setIsNewPasswordChk(true);
			setNewPasswordChkConfirmMessage("새 비밀번호를 재입력해주세요.");
			setNewPasswordChkConfirmMessageColor('#8854D2');
			return;
		}

		if (newPassword != newPasswordChk) {
			setIsNewPasswordChk(true);
			setNewPasswordChkConfirmMessage("새 비밀번호가 일치하지 않습니다.");
			setNewPasswordChkConfirmMessageColor('#E04136');
			return;
		}

		if(oldPassword == newPassword) {
			setIsNewPassword(true);
			setNewPasswordConfirmMessage("동일한 비밀번호는 사용하실 수 없습니다.");
			setNewPasswordChkConfirmMessageColor('#E04136');
			return;
		}


		//setOldPasswordConfirmMessage("정상 입력되었습니다.");
		setNewPasswordConfirmMessage("정상 입력되었습니다.");
		setNewPasswordChkConfirmMessage("정상 입력되었습니다.");
		setOldPasswordConfirmMessageColor('#43AB90');
		setNewPasswordConfirmMessageColor('#43AB90');
		setNewPasswordChkConfirmMessageColor('#43AB90');

		show({ 
			title: '비밀번호 변경',
			content: '비밀번호 변경하시겠습니까?\n변경 처리 후 로그인 상태는 유지됩니다.' ,
			cancelCallback: function() {
			},
			confirmCallback: async function() {
				updatePassword();
			}
		});

	}

	// ####################################################### 비밀번호 변경
	const updatePassword = async () => {
		const body = {
			old_password : oldPassword
			, new_password : newPassword
		};
		try {
		const { success, data } = await update_member_password(body);
		if(success) {
			switch (data.result_code) {
			case SUCCESS:
				show({
					title: '변경완료',
					content: '비밀번호 변경이 완료되었습니다.' ,
					confirmCallback: async function() {
						dispatch(myProfile());
						navigation.navigate(STACK.TAB, {
							screen: 'Roby',
						});
					}
				});
				break;
			case "8001":
				setIsOldPassword(true);
				setOldPasswordConfirmMessage("비밀번호가 일치하지 않습니다.");
				setOldPasswordConfirmMessageColor('#E04136');
				break;
			default:
				show({
				content: '오류입니다. 관리자에게 문의해주세요.' ,
				confirmCallback: function() {}
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
	};

	// ###################################################################### 탈퇴 버튼
	const btnDeleteMyAccount = async () => {
		show({
			title: '회원 탈퇴',
			content: '회원 탈퇴는 24시간 뒤 완료 처리되며, 암호화된\n모든 개인정보 및 보유한 아이템은 자동으로 폐기됩니다.\n단, 24시간 이내에 로그인 시 회원 탈퇴는 자동 철회 됩니다.',
			cancelCallback: function() {},
			confirmCallback: function() {
				exitProc();
			}
		});
	};
	
	// ###################################################################### 탈퇴 처리
	const exitProc = async () => {
		const { success, data } = await update_member_exit();
		if(success) {
			switch (data.result_code) {
				case SUCCESS:
					dispatch(clearPrincipal());
				break;
				default:
					show({ content: '오류입니다. 관리자에게 문의해주세요.' });
				break;
			}
		
		} else {
			show({ content: '오류입니다. 관리자에게 문의해주세요.' });
		}
	};

	// ####################################################### 최초 실행
	React.useEffect(() => {
		
	}, []);

	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
				<CommonHeader title={'개인정보 변경 및 관리'} />

				<View>
					<SpaceView mt={40}>
						<SpaceView>
							<Text style={_styles.title}>사용하실{'\n'}비밀번호를 입력해 주세요.
							</Text>
							<Text style={_styles.desc}>비밀번호는 8글자 이상, 영문포함, 숫자포함, 특수기호 허용</Text>
						</SpaceView>
					</SpaceView>

					<SpaceView mb={24} mt={80}>
						<CommonInput
							value={oldPassword}
							onChangeText={(oldPassword) => setOldPassword(oldPassword)}
							placeholder='현재 비밀번호를 입력해 주세요.'
							placeholderTextColor='#808080'
							style={_styles.inputText}
							isMasking={true}
							maxLength={20}

						/>
						{/* {isOldPassword && (<Text style={{color: oldPasswordConfirmMessageColor}}>{oldPasswordConfirmMessage}</Text>)} */}
						{oldPasswordConfirmMessage !== '' && (<Text style={{marginTop: 10, color: oldPasswordConfirmMessageColor}}>{oldPasswordConfirmMessage}</Text>)}
					</SpaceView>

					<SpaceView mb={24}>
						<CommonInput
							value={newPassword}
							onChangeText={(newPassword) => setNewPassword(newPassword)}
							isMasking={true}
							maxLength={20}
							placeholderTextColor={'#808080'}
							placeholder={'새 비밀번호를 입력해 주세요.'}
							style={_styles.inputText}
						/>
						{isNewPassword && (<Text style={{color: newPasswordConfirmMessageColor, marginTop: 10}}>{newPasswordConfirmMessage}</Text>)}
					</SpaceView>

					<SpaceView mb={44}>
						<CommonInput
							value={newPasswordChk}
							onChangeText={(newPasswordChk) => setNewPasswordChk(newPasswordChk)}
							isMasking={true}
							maxLength={20}
							placeholderTextColor={'#808080'}
							placeholder={'새 비밀번호를 입력해 주세요.'}
							style={_styles.inputText}
						/>
						{isNewPasswordChk && (<Text style={{color: newPasswordChkConfirmMessageColor, marginTop: 10}}>{newPasswordChkConfirmMessage}</Text>)}
					</SpaceView>

					<SpaceView mt={24}>
						<SpaceView>
							<TouchableOpacity onPress={() => { validatePassword(); }}>
								<Text style={_styles.btnText('#44B6E5', '#FFFFFF', '#44B6E5')}>비밀번호 변경</Text>
							</TouchableOpacity>
						</SpaceView>
						<SpaceView mt={15}>
							<TouchableOpacity onPress={() => { btnDeleteMyAccount(); }}>
								<Text style={_styles.btnText('transparent', '#FF516F', '#FF516F')}>탈퇴하기</Text>
							</TouchableOpacity>
						</SpaceView>
					</SpaceView>
				</View>
			</SpaceView>
		</>
	);
};



const _styles = StyleSheet.create({
	wrap: {
	  minHeight: height,
	  paddingTop: 24,
	  paddingHorizontal: 10,
	  backgroundColor: '#16112A',
	},
	title: {
		fontFamily: 'SUITE-Bold',
		fontSize: 30,
		color: '#FFFFFF',
	},
	desc: {
		fontFamily: 'SUITE-Bold',
		fontSize: 12,
		color: '#FFFFFF',
		marginTop: 10,
	},
	inputText: {
		fontFamily: 'SUITE-Bold',
		fontSize: 30,
		color: '#808080',
		marginBottom: -10,
	},
	btnText: (_bg:string, _cr:string, _bdcr:string) => {
		return {
			backgroundColor: _bg,
			borderColor: _bdcr,
			borderWidth: 1,
			color: _cr,
			fontFamily: 'SUITE-Bold',
			fontSize: 12,
			textAlign: 'center',
			borderRadius: 50,
			overflow: 'hidden',
			paddingVertical: 15,
			paddingHorizontal: 20,
		};
	  },
  });