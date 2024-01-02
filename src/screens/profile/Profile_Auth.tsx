import { styles, layoutStyle, modalStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, StyleSheet, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, Platform, Text, TextInput } from 'react-native';
import * as React from 'react';
import { FC, useState, useEffect, useRef } from 'react';
import { CommonBtn } from 'component/CommonBtn';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { ColorType, StackParamList, BottomParamList, ScreenNavigationProp } from '@types';
import { useDispatch } from 'react-redux';
import { STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { get_member_profile_auth, save_profile_auth } from 'api/models';
import { usePopup } from 'Context';
import { ICON, PROFILE_IMAGE, findSourcePath, findSourcePathLocal } from 'utils/imageUtils';
import { Modalize } from 'react-native-modalize';
import { SUCCESS } from 'constants/reusltcode';
import { isEmptyData, imagePickerOpen } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';
import { CommonText } from 'component/CommonText';


/* ################################################################################################################
###################################################################################################################
###### 프로필 인증 상세
###################################################################################################################
################################################################################################################ */

interface Props {
  navigation: StackNavigationProp<StackParamList, 'Profile_Auth'>;
  route: RouteProp<StackParamList, 'Profile_Auth'>;
}

const { width, height } = Dimensions.get('window');

export const Profile_Auth = (props: Props) => {
  	const navigation = useNavigation<ScreenNavigationProp>();
  	const dispatch = useDispatch();

  	const { show } = usePopup();  // 공통 팝업
	const isFocus = useIsFocused();
	const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부
	const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  	const memberBase = useUserInfo(); // 회원 기본정보

  	const [selectedAuthCode, setSelectedAuthCode] = React.useState('JOB'); // 선택한 인증 코드
	const [currentAuthCode, setCurrentAuthCode] = React.useState('JOB'); // 현재 인증 코드
	const [authList, setAuthList] = React.useState([]); // 인증 목록

  	const [isMod, setIsMod] = React.useState({status: false}); // 수정 여부

  	const authInfoArr = [
		{ name: '직업', code: 'JOB' },
		{ name: '학업', code: 'EDU' },
		{ name: '소득', code: 'INCOME' },
		{ name: '자산', code: 'ASSET' },
		{ name: 'SNS', code: 'SNS' },
		{ name: '차량', code: 'VEHICLE' },
	];
  
  	// ############################################################################# 인증 탭 클릭 함수
	const selectedAuthTab = async (_authCode:string) => {
		setSelectedAuthCode(_authCode);
	};

	// ############################################################################# 수정 여부 값 변경 함수
	const modActive = async (isValue:boolean) => {
		setIsMod((prev) => {
			return Object.assign({}, prev, {status: isValue});
		});
	};

  	// ############################################################################# 저장 함수
	const saveFn = async (_isMod:boolean, _name:string, _authCode:any, _authDetailList:any, _authComment:any, _imgDelSeqStr:any) => {
		if(_isMod) {
			if(currentAuthCode != selectedAuthCode) {
				show({
					content: '입력하신 ' + _name + '인증 정보를 저장하시겠습니까?',
					cancelCallback: function() {
						setCurrentAuthCode(selectedAuthCode);
						modActive(false);
					},
					confirmCallback: function() {
						saveAuth(true, _authCode, _authDetailList, _authComment, _imgDelSeqStr);
						setCurrentAuthCode(selectedAuthCode);
						modActive(false);
					}
				});
			}
		} else {
			saveAuth(false, _authCode, _authDetailList, _authComment, _imgDelSeqStr);
		}
	};

  	// ############################################################################# 인증 저장
	const saveAuth = async (isTab:boolean, _authCode:any, _authDetailList:any, _authComment:any, _imgDelSeqStr:any) => {

		let isSave = false; // 저장 여부

		// 증명자료 유효성 체크
		if(_authDetailList.length == 0) {
			show({ content: '증명자료를 등록해 주세요.' });
			return;
		}

		// 저장 여부 체크
		_authDetailList.map((item, index) => {
			const memberAuthDetailSeq = item?.member_auth_detail_seq;
			if(memberAuthDetailSeq == 0) { isSave = true; }
		});

		if(isEmptyData(_imgDelSeqStr) || isEmptyData(_authComment)) {
			isSave = true;
	  	};

	  	// 중복 클릭 방지 설정
	  	if(isClickable) {
			setIsClickable(false);
		  	setIsLoading(true);
  
      		const body = {
        		file_list: _authDetailList,
        		auth_code: _authCode,
	        	auth_comment: _authComment,
		        img_del_seq_str: _imgDelSeqStr,
      		};

      		try {
				if(isSave) {
					const { success, data } = await save_profile_auth(body);
					if (success) {
						switch (data.result_code) {
							case SUCCESS:
								if(isTab) { getAuth();
								} else { navigation.goBack(); }

								break;
							default:
								show({ content: '오류입니다. 관리자에게 문의해주세요.' });
								break;
						}
					} else {
						show({ content: '오류입니다. 관리자에게 문의해주세요.' });
					}

				} else {
					if(isTab) { getAuth();
					} else { navigation.goBack(); }
				}

      		} catch (error) {
        		console.log(error);
      		} finally {
        		setIsClickable(true);
        		setIsLoading(false);
      		};
	  	}
	};

  	// ############################################################################# 인증 정보 조회
	const getAuth = async () => {
	  	try {
      		const body = {};
  			const { success, data } = await get_member_profile_auth(body);
      		if (success) {
        		switch (data.result_code) {
          			case SUCCESS:
            			if(isEmptyData(data.auth_list)) {
              				setAuthList(data?.auth_list);
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
			setIsLoading(false);
	  	}
	};

  	// 첫 렌더링 때 실행
  	React.useEffect(() => {
	    if(isFocus) {
      		getAuth();
    	}
	}, [isFocus]);

  	return (
	    <>
      		{isLoading && <CommonLoading />}

      		{/* #############################################################################################################
			######### 상단 영역
			############################################################################################################# */}
			<SpaceView viewStyle={{backgroundColor: '#445561', padding: 30}}>
				<Text style={_styles.title}>멤버쉽 인증하고{'\n'}내 강점을 드러내기(선택)</Text>
				<Text style={_styles.subTitle}>
					아래 가이드를 참고하시고 멤버쉽 인증 자료를 올려 주세요.{'\n'}
					심사 기준에 따라 프로필에 인증 뱃지가 부여되며{'\n'}
					이성과의 매칭에 유리할 수 있습니다.
				</Text>
				<ScrollView horizontal={true} contentContainerStyle={{justifyContent: 'space-between', width: width * 1.2}} showsHorizontalScrollIndicator={false}>
					{authInfoArr.map((item, index) => (
						<TouchableOpacity 
							disabled={currentAuthCode == item?.code}
							style={_styles.authBox} 
							key={'auth_tab_' + item?.code}
							onPress={() => { selectedAuthTab(item?.code); }}>
							<Text style={_styles.authBoxTitle(item?.code == currentAuthCode)}>{item?.name}</Text>
						</TouchableOpacity>
					))}
				</ScrollView>
			</SpaceView>

			{/* #############################################################################################################
			######### 컨텐츠 영역
			############################################################################################################# */}
      		{authList.length > 0 ? (
        		<>
          			{authList.map((item, index) => {
            			return currentAuthCode == item?.common_code && (
              				<> 
                				<AuthRender 
                  					key={'auth'+index}
                  					_data={item}
                  					_selectedAuthCode={selectedAuthCode} 
                  					_modActiveFn={modActive}
                  					_setCurrentCode={setCurrentAuthCode} 
                  					_isModStatus={isMod.status}
                  					_saveFn={saveFn}
                				/>
              				</>
            			)
          			})}
        		</>
      		) : (
        		<>
          			<LinearGradient
				    	colors={['#3D4348', '#1A1E1C']}
				    	start={{ x: 0, y: 0 }}
				    	end={{ x: 0, y: 1 }}
				    	style={_styles.wrap} />
        		</>
      		)}
    	</>
  	);
};


/* ##########################################################################################
##### 인증 렌더링
########################################################################################## */
function AuthRender({ _data, _selectedAuthCode, _modActiveFn, _setCurrentCode, _isModStatus, _saveFn }) {
	const navigation = useNavigation<ScreenNavigationProp>();
	
	const _authName = _data?.code_name; // 인증 명
	const _authCode = _data?.common_code; // 인증 코드
	const _authStatus = _data?.auth_status; // 인증 상태
	const _authComment = _data?.auth_comment; // 인증 코멘트

	const [authDetailList, setAuthDetailList] = React.useState<[]>(_data?.auth_detail_list); // 인증 이미지 목록
	const [authComment, setAuthComment] = React.useState(_data?.auth_comment); // 인증 코멘트 입력 변수
	const [imgDelSeqStr, setImgDelSeqStr] = React.useState(''); // 인증 이미지 삭제 시퀀스 문자열

	// ############################################################################# 사진 관리 컨트롤 변수
	const [imgMngData, setImgMngData] = React.useState<any>({
		member_auth_detail_seq: 0,
		img_file_path: '',
		order_seq: '',
	});

	// ############################################################################# 사진 관리 팝업 관련 함수
	const imgMng_modalizeRef = useRef<Modalize>(null);
	const imgMng_onOpen = (imgData: any, order_seq: any) => {
		setImgMngData({
			member_auth_detail_seq: imgData.member_auth_detail_seq,
			img_file_path: imgData.img_file_path,
			order_seq: order_seq,
		});
		imgMng_modalizeRef.current?.open();
	};
	const imgMng_onClose = () => {
		imgMng_modalizeRef.current?.close();
	};

	// ############################################################################# 사진 선택
	const imgSelected = (idx:number, isNew:boolean) => {
		if(isNew) {
			imagePickerOpen(function(path:any, data:any) {
				_modActiveFn(true); // 수정 여부 변경

				let _data = {
					member_auth_detail_seq: 0,
					img_file_path: path,
					order_seq: authDetailList.length+1,
					org_order_seq: authDetailList.length+1,
					file_base64: data,
				};
			
				setAuthDetailList((prev) => {
					return [...prev, _data];
				});
			});
		} else {

		}
	}

	// ############################################################################# 사진 변경
	const imgModfyProc = () => {
		imagePickerOpen(function(path:any, data:any) {
			_modActiveFn(true); // 수정 여부 변경
	
			// 삭제 데이터 저장
			if(isEmptyData(imgMngData.member_auth_detail_seq) && 0 != imgMngData.member_auth_detail_seq) {
				let delArr = imgDelSeqStr;
				if (delArr == '') {
					delArr = imgMngData.member_auth_detail_seq;
				} else {

          			// 중복 여부 체크
          			let isDup = false;
					
          			if(typeof delArr == 'number') {
            			if(delArr == imgMngData.member_auth_detail_seq) { isDup = true; }
          			} else {
            			const delList = delArr.split(',');
            			delList.map((item, index) => {
              				if(item == imgMngData.member_auth_detail_seq) { isDup = true; }
            			});
          			}

          			if(!isDup) {
            			delArr = delArr + ',' + imgMngData.member_auth_detail_seq;
          			}
				}

				setImgDelSeqStr(delArr);
			}
	
			// 목록 재구성
			setAuthDetailList((prev) => {
				const dupChk = prev.some(item => item.order_seq === imgMngData.order_seq);
				if(dupChk) {
					return prev.map((item) => item.order_seq === imgMngData.order_seq 
						? { ...item, img_file_path: path, file_base64: data }
						: item
					);
				}
			});
	
			// 모달 닫기
			imgMng_onClose();
		});
	};

	// ############################################################################# 사진 삭제
	const imgDelProc = () => {
		_modActiveFn(true); // 수정 여부 변경

		// 인증 이미지 목록 재구성
		let _authDetailList:any = [];
		authDetailList.map((item, index) => {
			if(index+1 != imgMngData.order_seq) {
				_authDetailList.push(item);
			}
		});
		_authDetailList.map((item, index) => {
			item.order_seq = index+1;
		});
		setAuthDetailList(_authDetailList);
	
		// 삭제 데이터 저장
		if(isEmptyData(imgMngData.member_auth_detail_seq) && 0 != imgMngData.member_auth_detail_seq) {
			let delArr = imgDelSeqStr;
			if (delArr == '') {
				delArr = imgMngData.member_auth_detail_seq;
			} else {
				delArr = delArr + ',' + imgMngData.member_auth_detail_seq;
			}
	
			setImgDelSeqStr(delArr);
		}
	
		// 모달 닫기
		imgMng_onClose();
	};

	// 선택된 인증 코드 적용
	useEffect(() => {
		if(_isModStatus || _authComment != authComment) {
			_saveFn(true, _authName, _authCode, authDetailList, authComment, imgDelSeqStr);
		} else {
			_setCurrentCode(_selectedAuthCode);
		}

	}, [_selectedAuthCode]);
	
	return (
		<>
			<LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={_styles.wrap}
			>
				<ScrollView showsVerticalScrollIndicator={false}>
					<SpaceView pb={300}>
						<View>
							{isEmptyData(_authStatus) && (
								<View style={_styles.authBoxStatus}>
									<Text style={_styles.statusText(_authStatus)}>
										{_authStatus == 'PROGRESS' && '심사중'}
										{_authStatus == 'ACCEPT' && '승인'}
										{_authStatus == 'REFUSE' && '반려'}
									</Text>
								</View>
							)}
							<View>
								<View style={{flexDirection: 'row', alignItems: 'center'}}>
									<Image source={ICON.commentYellow} style={styles.iconSize16} />
									<Text style={_styles.contentsTitle}>심사에 요구되는 증명자료를 올려주세요.</Text>
								</View>
								<Text style={_styles.contentsSubtitle}>
									{_authCode == 'JOB' ? '• 재직증명서, 사원증, 명함, 공무원증(급수포함), 사업자등록증, 재무제표, 기타 입증자료'
										: _authCode == 'EDU' ? '• 졸업 증명서, 재학 증명서, 학위 증명서'
										: _authCode == 'ASSET' ? '• 은행 직인이 찍힌 잔고 증명서 및 확인 가능한 부동산 관련 서류 또는 그 외에 확인 가능한 자산 입증 서류'
										: _authCode == 'VEHICLE' ? '• 자동차 등록증, 최근 자동차 보험 납부 기록'
										: _authCode == 'SNS' ? '• 대중적 SNS인 인스타그램, 페이스북, 틱톡 등에서 메시지 수신이 가능한 계정이 노출된 스크린샷\n\n• 유튜브, 트위치 등은 별도 문의 부탁드립니다.\n(kozel.macju@gmail.com 또는 가입 후 \'고객문의\')'
										: '• 소득 금액 증명원, 근로 소득 원천 징수증, 부가 가치세 증명원, 기타소득 입증자료, 근로계약서 등'
									}
								</Text>
								<View style={_styles.uploadBoxContainer}>
									<AuthImageRender index={0} imgData={authDetailList.length > 0 ? authDetailList[0] : null} imgSelectedFn={imgSelected} mngModalFn={imgMng_onOpen} />
									<AuthImageRender index={1} imgData={authDetailList.length > 1 ? authDetailList[1] : null} imgSelectedFn={imgSelected} mngModalFn={imgMng_onOpen} />
									<AuthImageRender index={2} imgData={authDetailList.length > 2 ? authDetailList[2] : null} imgSelectedFn={imgSelected} mngModalFn={imgMng_onOpen} />
								</View>
							</View>
							<View>
								<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
									<Image source={ICON.commentYellow} style={styles.iconSquareSize(16)} />
									<Text style={_styles.contentsTitle}>인증 소개글(선택)</Text>
								</View>

								<TextInput
									value={authComment}
									onChangeText={(text) => setAuthComment(text)}
									autoCapitalize={'none'}
									multiline={true}
									style={_styles.inputContainer}
									placeholder={'인증 소개글 입력(가입 후 변경 가능)'}
									placeholderTextColor={'#FFFDEC'}
									maxLength={50}
									caretHidden={true}
								/>
							</View>

							<View>
								<View style={{flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
									<Image source={ICON.commentYellow} style={styles.iconSquareSize(16)} />
									<Text style={_styles.contentsTitle}>심사에 요구되는 증명자료를 올려주세요.</Text>
								</View>
								<AuthMaterialRender authCode={_authCode} />
							</View>
						</View>

						<SpaceView mt={50}>
							<CommonBtn
								value={'저장하기'}
								type={'reNewId'}
								fontSize={16}
								fontFamily={'Pretendard-Bold'}
								borderRadius={5}
								onPress={() => {
									_saveFn(false, _authName, _authCode, authDetailList, authComment, imgDelSeqStr);
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
				</ScrollView>
			</LinearGradient>

			{/* ###############################################
			##### 사진 관리 팝업
			############################################### */}
			<Modalize
				ref={imgMng_modalizeRef}
				adjustToContentHeight={true}
				handleStyle={modalStyle.modalHandleStyle}
				modalStyle={[modalStyle.modalContainer, {backgroundColor: '#333B41'}]}
			>
				<SpaceView pl={30} pr={30} mb={30} viewStyle={_styles.imgMngModalWrap}>
					<SpaceView mb={15} viewStyle={{flexDirection: 'row'}}>
						{isEmptyData(imgMngData.img_file_path) && (
							<SpaceView mr={10}>
								<Image source={findSourcePath(imgMngData.img_file_path)} style={[styles.iconSquareSize(64), {borderRadius:5}]} />
							</SpaceView>
						)}
						<SpaceView>
							<Text style={_styles.imgMngModalTit}>인증 자료 수정</Text>
							<Text style={_styles.imgMngModalDesc}>인증 자료를 변경하거나 삭제할 수 있어요.</Text>
						</SpaceView>
					</SpaceView>

					<SpaceView>
						<TouchableOpacity onPress={() => { imgModfyProc(); }} style={{marginBottom: 8}}>
							<Text style={_styles.imgMngModalBtn('#FFDD00', 16, '#3D4348')}>변경</Text>
						</TouchableOpacity>

						{_authStatus != 'ACCEPT' && (
							<TouchableOpacity onPress={() => { imgDelProc(); }} style={{marginBottom: 8}}>
								<Text style={_styles.imgMngModalBtn('#FFFFFF', 16, '#FF4D29')}>삭제</Text>
							</TouchableOpacity>
						)}

						<TouchableOpacity onPress={() => { imgMng_onClose(); }}>
							<Text style={_styles.imgMngModalBtn('transparent', 16, '#D5CD9E', '#BBB18B')}>취소</Text>
						</TouchableOpacity>
					</SpaceView>
				</SpaceView>
			</Modalize>
		</>
	);
};

/* ##########################################################################################
##### 인증 사진 렌더링
########################################################################################## */
function AuthImageRender({ index, imgData, imgSelectedFn, mngModalFn }) {
	const imgUrl = findSourcePath(imgData?.img_file_path); // 이미지 경로

		return (
		<>
			{isEmptyData(imgUrl) ? (
				<>
					<TouchableOpacity 
						style={_styles.uploadBox}
						onPress={() => { mngModalFn(imgData, index+1, imgUrl); }}
						activeOpacity={0.9}
					>
						<Image
							resizeMode="cover"
							resizeMethod="scale"
							style={_styles.authImgStyle}
							key={imgUrl}
							source={imgUrl}
						/>
					
					</TouchableOpacity>
				</>
			) : (
				<>
					<TouchableOpacity 
						style={_styles.uploadBox}
						onPress={() => { imgSelectedFn(index, !isEmptyData(imgData)); }}
						activeOpacity={0.9}
					>
						<Image source={ICON.cloudUpload} style={styles.iconSquareSize(32)} />
					</TouchableOpacity>
				</>
			)}
		</>
	);
};

/* ##########################################################################################
##### 인증 자료 렌더링
########################################################################################## */
function AuthMaterialRender({ authCode }) {
	
	return (
		<>
      {authCode == 'JOB' && (
        <>
          <SpaceView mt={20} mb={12}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>직업 심사 기준</CommonText>
            </View>
          </SpaceView>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>사기업</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>중소기업, 중견기업, 대기업</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>공무원</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>국내 모든 공무 직종</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>전문직</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>의료인, 법조인, 약사, 수의사, 회계, 세무, 무역, 부동산, 각종 기술사 등</Text>
          </View>
          <SpaceView mb={12} mt={20}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>세부 기준</CommonText>
            </View>
          </SpaceView>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>사기업</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>사원급, 과장급, 임원급, 대표</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>공무원</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>공무원 급수에 따라 차등하여 레벨 부여</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>전문직</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>운영 내규에 따라 차등하여 레벨 부여</Text>
          </View>

          <SpaceView mb={12} mt={13}>
            <View style={styles.dotTextContainer}>
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>※ 개인사업자는 내규에 따라 별도 심사 가능</CommonText>
            </View>
          </SpaceView>
        </>
      )}

      {authCode == 'EDU' && (
        <>
          <SpaceView mt={20} mb={12}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>THE(세계 대학 순위)에서 최근에 발표한 세계대학 순위에{'\n'}기초하여 학력 레벨이 부여됩니다.</CommonText>
            </View>
          </SpaceView>
          <SpaceView mb={12}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>학력 심사 기준</CommonText>
            </View>
          </SpaceView>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 5</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 80점 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 4</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 70점 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 3</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 50~70점</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 2</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 30~50점</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 1</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>THE 스코어 기준 30점 미만</Text>
          </View>
          <SpaceView mb={12} mt={20}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: 'FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>세부 기준</CommonText>
            </View>
          </SpaceView>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>일반</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>학사 -  석사 - 박사에 따라 차등하여 레벨 가산</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>특수</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>의대, 법대, 약대, 교대, 사범대, 예체능 등 별도 레벨 가산</Text>
          </View>

          <SpaceView mb={12} mt={13}>
            <View style={styles.dotTextContainer}>
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>※ THE 기준 외 국내외 대학은 내규에 따라 별도 심사 가능</CommonText>
            </View>
          </SpaceView>
        </>
      )}

      {authCode == 'INCOME' && (
        <>
          <SpaceView mt={20}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>근로소득자 : 원청징수영수증 또는 법인 직인이 날인된 연봉 계약서</CommonText>
            </View>
          </SpaceView>
          <SpaceView mt={10}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>법인 및 개인사업자 : 소득금액증명원, 부가가치세증명원</CommonText>
            </View>
          </SpaceView>
          <SpaceView mt={10} mb={12}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>소득 심사 기준(단위: 만원)</CommonText>
            </View>
          </SpaceView>
          <View style={[_styles.rowStyle, _styles.rowHeader]}>
            <Text style={[_styles.rowTextLeft, {color: '#FFDD00', fontFamily: 'Pretendard-SemiBold'}]}>구분</Text>
            <Text style={[_styles.rowTextRight, {color: '#FFDD00', fontFamily: 'Pretendard-SemiBold'}]}>연소득</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 1</Text>
            <Text style={_styles.rowTextRight}>3,000</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 2</Text>
            <Text style={_styles.rowTextRight}>5,000</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 3</Text>
            <Text style={_styles.rowTextRight}>7,000</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 4</Text>
            <Text style={_styles.rowTextRight}>10,000</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 5</Text>
            <Text style={_styles.rowTextRight}>20,000</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 6</Text>
            <Text style={_styles.rowTextRight}>50,000</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 7</Text>
            <Text style={_styles.rowTextRight}>100,000</Text>
          </View>
        </>
      )}

      {authCode == 'ASSET' && 
        <>
          <SpaceView mt={20} viewStyle={{width: '96%'}}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>현금 또는 부동산 자산 중 1가지를 선택하여 증빙 자료를 올려주세요. 단, 2가지 모두 충족하시는 경우 한 단계 높은 레벨이 부여됩니다.(최대 7레벨)</CommonText>
            </View>
          </SpaceView>
          <SpaceView mt={10} mb={12}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>자산 심사 기준(단위: 억원)</CommonText>
            </View>
          </SpaceView>
          <View style={[_styles.rowStyle, _styles.rowHeader]}>
            <Text style={[_styles.rowTextLeft, {color: '#FFDD00', fontFamily: 'Pretendard-SemiBold'}]}>구분</Text>
            <Text style={[_styles.rowTextCenter, {color: '#FFDD00', fontFamily: 'Pretendard-SemiBold'}]}>현금</Text>
            <Text style={[_styles.rowTextRight, {color: '#FFDD00', fontFamily: 'Pretendard-SemiBold'}]}>부동산</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 1</Text>
            <Text style={_styles.rowTextCenter}>1</Text>
            <Text style={_styles.rowTextRight}>5</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 2</Text>
            <Text style={_styles.rowTextCenter}>3</Text>
            <Text style={_styles.rowTextRight}>10</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 3</Text>
            <Text style={_styles.rowTextCenter}>5</Text>
            <Text style={_styles.rowTextRight}>20</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 4</Text>
            <Text style={_styles.rowTextCenter}>10</Text>
            <Text style={_styles.rowTextRight}>30</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 5</Text>
            <Text style={_styles.rowTextCenter}>30</Text>
            <Text style={_styles.rowTextRight}>50</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 6</Text>
            <Text style={_styles.rowTextCenter}>50</Text>
            <Text style={_styles.rowTextRight}>100</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextLeft}>LV 7</Text>
            <Text style={_styles.rowTextCenter}>100</Text>
            <Text style={_styles.rowTextRight}>200</Text>
          </View>
        </>
      }

      {authCode == 'SNS' && (
        <>
          <SpaceView mt={20} mb={12}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>가장 높은 팔로워 수를 보유한 SNS 매체를 기준으로 레벨이 부여됩니다.</CommonText>
            </View>
          </SpaceView>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 1</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>500명 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 2</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>1,000명 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 3</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>2.500명 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 4</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>5,000명 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 5</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>1만명 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 6</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>5만명 이상</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('40%')}>LV 7</Text>
            <Text style={_styles.rowTextHalfRight('60%')}>10만명 이상</Text>
          </View>
        </>
      )}

      {authCode == 'VEHICLE' && (
        <>
          <SpaceView mt={20} mb={12} viewStyle={{width: '96%'}}>
            <View style={styles.dotTextContainer}>
              <View style={[styles.dot, {backgroundColor: '#FFDD00'}]} />
              <CommonText
                color={'#FFDD00'} 
                fontWeight={'500'}
                lineHeight={17}
                type={'h5'}
                textStyle={{marginTop: 4}}>증빙 자료로 제출한 자동차의 출고가에 따라 레벨이 부여됩니다.</CommonText>
            </View>
          </SpaceView>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('20%')}>LV 1</Text>
            <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 2,000만원 이상의 차량</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('20%')}>LV 2</Text>
            <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 4,000만원 이상의 차량</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('20%')}>LV 3</Text>
            <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 7,000만원 이상의 고급 차량</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('20%')}>LV 4</Text>
            <Text style={_styles.rowTextHalfRight('80%')}>출고가 기준 1억~2억원의 상당의 럭셔리카</Text>
          </View>
          <View style={_styles.rowStyle}>
            <Text style={_styles.rowTextHalfLeft('20%')}>LV 5</Text>
            <Text style={_styles.rowTextHalfRight('80%')}>슈퍼카 및 하이엔드급 럭셔리 차량</Text>
          </View>
        </>
      )}
		</>
	)
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
	title: {
		fontSize: 30,
		fontFamily: 'Pretendard-Bold',
		color: '#D5CD9E',
	},
	subTitle: {
		fontSize: 12,
		fontFamily: 'Pretendard-Light',
		color: '#F3E270',
		marginTop: 5,
	},
	authBox: {
		marginTop: 20,
	},
	authBoxTitle: (isOn: boolean) => {
		return {
			fontFamily: 'Pretendard-Bold',
			fontSize: 16,
			color: '#D5CD9E',
			textAlign: 'center',
			paddingHorizontal: 20,
			paddingVertical: 3,
			borderRadius: Platform.OS == 'ios' ? 15 : 50,
			borderWidth: 1,
			borderColor: isOn ? '#FFFFFF' : '#D5CD9E',
			backgroundColor: isOn ? '#FFFFFF' : 'transparent',
      		overflow: 'hidden',
		};
	},
	authBoxStatus: {
		position: 'absolute',
		top: 0,
		right: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	statusText: (_authCode: string) => {
		let _cr = '#D5CD9E';

		if(_authCode == 'ACCEPT') {
			_cr = '#15F3DC';
		} else if(_authCode == 'REFUSE') {
			_cr = '#FF4D29';
		}

		return {
			fontFamily: 'Pretendard-Regular',
			fontSize: 10,
			color: _cr,
			borderRadius: 5,
			backgroundColor: '#FFF',
			paddingVertical: 3,
			paddingHorizontal: 10,
      overflow: 'hidden',
		};
	},
	contentsTitle: {
		fontFamily: 'Pretendard-Regular',
		fontSize: 15,
		color: '#FFDD00',
		marginLeft: 5,
	},
	contentsSubtitle: {
		fontFamily: 'Pretendard-Regular',
		color: '#D5CD9E',
		fontSize: 14,
		marginTop: 10,
	},
	uploadBoxContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
	},
	uploadBox: {
		width: 100,
		height: 100,
		borderWidth: 1,
		borderColor: '#E1DFD1',
		borderRadius: 10,
		borderStyle: 'dashed',
		justifyContent: 'center',
		alignItems: 'center',
		overflow: 'hidden',
	},
	inputContainer: {
		backgroundColor: '#445561',
		height: 80,
		borderRadius: 10,
		textAlign: 'center',
		marginTop: 10,
		color: '#FFFDEC',
	},
	authInfoContainer: {
		width: '100%',
		borderRadius: 15,
		overflow: 'hidden',
		marginTop: 20,
	},
	authInfoBox: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		paddingHorizontal: 20,
		paddingVertical: 10,
	},
	authInfoTitle: {
		fontFamily: 'Pretendard-SemiBold',
		fontSize: 15,
		color: '#FFDD00',
	},
	authInfoSubTitle: {
		fontFamily: 'Pretendard-Regular',
		fontSize: 15,
		color: '#D5CD9E',
	},
	authImgStyle: {
		width: 100,
		height: 100,
		borderRadius: 5,
	},
	imgMngModalWrap: {
		backgroundColor: '#333B41',
	  },
	imgMngModalTit: {
		fontFamily: 'Pretendard-SemiBold',
		fontSize: 20,
		color: '#F3E270',
	},
	imgMngModalDesc: {
		fontFamily: 'Pretendard-Light',
		fontSize: 12,
		color: '#D5CD9E',
	},
	imgMngModalBtn: (_bg:string, _fs:number, _cr:string, _bdcr) => {
		return {
			backgroundColor: _bg,
			fontFamily: 'Pretendard-Bold',
			fontSize: _fs,
			color: _cr,
			textAlign: 'center',
			paddingVertical: 10,
			borderRadius: 5,
			borderWidth: isEmptyData(_bdcr) ? 1 : 0,
			borderColor: isEmptyData(_bdcr) ? _bdcr : _bg,
		};
	},
	imageDisabled: (isMaster: boolean) => {
		return {
			position: 'absolute',
			left: 0,
			right: 0,
			bottom: -1,
			borderBottomLeftRadius: 5,
			borderBottomRightRadius: 5,
			flexDirection: 'column',
			alignItems: 'center',
			justifyContent: 'flex-end',
			overflow: 'hidden',
			backgroundColor: !isMaster ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
		};
	},
	rowHeader: {
		backgroundColor: '#3D4348',
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		paddingHorizontal: 20,
		marginTop: 10,
	},
	rowStyle: {
		width: '100%',
		borderStyle: 'solid',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingVertical: 5,
		paddingHorizontal: 20,
	},
	rowTextLeft: {
		fontFamily: 'Pretendard-Regular',
		fontSize: 15,
		lineHeight: 30,
		letterSpacing: 0,
		textAlign: 'left',
		color: '#D5CD9E',
		width: '33%',
	},
	rowTextCenter: {
		fontFamily: 'Pretendard-Regular',
		fontSize: 15,
		lineHeight: 30,
		letterSpacing: 0,
		textAlign: 'center',
		color: '#D5CD9E',
		width: '33%',
	},
	rowTextRight: {
		fontFamily: 'Pretendard-Regular',
		fontSize: 15,
		lineHeight: 30,
		letterSpacing: 0,
		textAlign: 'right',
		color: '#D5CD9E',
		width: '33%',
	},
	rowTextHalfLeft: (width:string) => {
		return {
		  fontFamily: 'Pretendard-Regular',
		  fontSize: 15,
		  lineHeight: 20,
		  letterSpacing: 0,
		  textAlign: 'left',
		  color: '#D5CD9E',
		  width: width,
		  paddingVertical: 5,
		};
	},
	rowTextHalfRight: (width:string) => {
		return {
		  fontFamily: 'Pretendard-Regular',
		  fontSize: 15,
		  lineHeight: 20,
		  letterSpacing: 0,
		  textAlign: 'left',
		  color: '#D5CD9E',
		  width: width,
		  paddingVertical: 5,
		};
	},
});