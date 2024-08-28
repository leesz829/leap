import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import React, { useRef, useState, useEffect } from 'react';
import { View, Image, ScrollView, TouchableOpacity, StyleSheet, FlatList, Text, Dimensions, Platform } from 'react-native';
import { ICON, findSourcePath, findSourcePathLocal } from 'utils/imageUtils';
import { Modalize } from 'react-native-modalize';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { usePopup } from 'Context';
import { join_save_profile_auth, get_member_auth_list, regist_second_auth } from 'api/models';
import { SUCCESS, MEMBER_NICKNAME_DUP } from 'constants/reusltcode';
import { ROUTES } from 'constants/routes';
import { CommonLoading } from 'component/CommonLoading';
import { isEmptyData, imagePickerOpen } from 'utils/functions';
import LinearGradient from 'react-native-linear-gradient';
import { TextInput } from 'react-native-gesture-handler';
import { CommonText } from 'component/CommonText';
import { SecondAuthPopup } from 'screens/commonpopup/SecondAuthPopup';



/* ################################################################################################################
###################################################################################################################
###### 회원가입 - 프로필 인증
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation : StackNavigationProp<StackParamList, 'SignUp_Auth'>;
	route : RouteProp<StackParamList, 'SignUp_Auth'>;
}

const { width, height } = Dimensions.get('window');

export const SignUp_Auth = (props : Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();
	const isFocus = useIsFocused();
	const { show } = usePopup(); // 공통 팝업
	const [isLoading, setIsLoading] = React.useState(false);
	const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

	const memberSeq = props.route.params?.memberSeq; // 회원 번호
	const gender = props.route.params?.gender; // 성별
	const mstImgPath = props.route.params?.mstImgPath; // 대표 사진 경로

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

	const detail_modalizeRef = useRef<Modalize>(null);
  const detail_onOpen = () => {
		detail_modalizeRef.current?.open();
    //getMemberSecondDetail('JOB');
  };
  const detail_onClose = () => { 
    detail_modalizeRef.current?.close();
  };

	const [detailAuthData, setDetailAuthData] = React.useState({
		auth_code: '',
		auth_name: '',
		list: [],
	});

	// ############################################################################# 인증 탭 클릭 함수
	const openDetail = async (data:any) => {
		setDetailAuthData(data);
		detail_onOpen();
	};

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

	// ############################################################################# 인증 정보 조회
	const getAuth = async () => {
	  const body = {
		  member_seq: memberSeq,
	  };
	  try {
      const { success, data } = await get_member_auth_list(body);
      if (success) {
        switch (data.result_code) {
        case SUCCESS:
          if(isEmptyData(data.auth_list)) {
            setAuthList(data?.auth_list);
          }
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
		  setIsLoading(false);
	  }
	};

	// ############################################################################# 2차인증 저장 함수
  const saveSecondAuth = async(type: string, file_list: any, auth_code: string, auth_comment: string) => {
    setIsLoading(true);

    /* if(file_list.length == 0 && filePathData.filePath01 == '' && filePathData.filePath02 == '' && filePathData.filePath03 == ''){
      show({ content: '인증 심사를 위한 증빙 자료 이미지를 올려주세요.' });
      setIsLoading(false);
       return false;
    } */

    const body = {
      member_seq: props.route.params.memberSeq,
      file_list: file_list,
      auth_code: auth_code,
      auth_comment: auth_comment,
    };
    try {
      //const { success, data } = await regist_second_auth(body);
			const { success, data } = await join_save_profile_auth(body);

      if (success) {
        if (data.result_code == '0000') {
          show({
            content: '심사 요청 되었습니다.' ,
            confirmCallback: function() {
              //getMemberProfileSecondAuth();
							getAuth();
              /* if(type == 'JOB') { job_onClose(); }
              else if(type == 'EDU') { edu_onClose(); }
              else if(type == 'INCOME') { income_onClose(); }
              else if(type == 'ASSET') { asset_onClose(); }
              else if(type == 'SNS') { sns_onClose(); }
              else if(type == 'VEHICLE') { vehicle_onClose(); } */
							detail_onClose();
            }
          });
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
  }

	// ############################################################################# 인증 저장
	const saveAuth = async (isTab:boolean, _authCode:any, _authDetailList:any, _authComment:any, _imgDelSeqStr:any) => {

		let isSave = false; // 저장 여부

		// 저장 여부 체크
		/* _authDetailList.map((item, index) => {
			const memberAuthDetailSeq = item?.member_auth_detail_seq;
			if(memberAuthDetailSeq == 0) { isSave = true; }
		});

		if(isEmptyData(_imgDelSeqStr) || isEmptyData(_authComment)) {
			isSave = true;
	  }; */

    // 중복 클릭 방지 설정
	  if(isClickable) {
    	setIsClickable(false);
      setIsLoading(true);
    
      const body = {
      	member_seq: memberSeq,
				//file_list: _authDetailList,
				file_list: null,
				auth_code:   _authCode,
				//auth_comment: _authComment,
				auth_comment: null,
				img_del_seq_str: _imgDelSeqStr,
      };

			console.log('body ::::::: ' , body);

      try {
				if(isSave) {
					const { success, data } = await join_save_profile_auth(body);
					if(success) {
						switch (data.result_code) {
							case SUCCESS:
								if(isTab == false) {
									navigation.navigate(ROUTES.APPROVAL, { memberSeq: memberSeq });
								} else {
									getAuth();
								}

								break;
							default:
								show({ content: '오류입니다. 관리자에게 문의해주세요.' });
								break;
						}
					} else {
						show({ content: '오류입니다. 관리자에게 문의해주세요.' });
					}

				} else {
					navigation.navigate(ROUTES.APPROVAL, { memberSeq: memberSeq });
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
		getAuth();
	}, [isFocus]);

	return (
		<>
			<SpaceView viewStyle={_styles.wrap}>
        <SpaceView>
          <CommonHeader title="" />
        </SpaceView>

        <SpaceView viewStyle={{justifyContent: 'space-between'}}>
          <SpaceView>
            <SpaceView mt={50} mb={50}>
              <Text style={styles.fontStyle('H', 28, '#fff')}>멤버십 인증 관리</Text>
              <SpaceView mt={10}>
                <Text style={styles.fontStyle('SB', 12, '#fff')}>회원 간 안전한 커뮤니티 환경을 위해{'\n'}최소 1개의 직업/학력 인증은 필수입니다. </Text>
              </SpaceView>
            </SpaceView>

						<ScrollView showsVerticalScrollIndicator={false} style={{height: height-360}}>
							<SpaceView mb={30}>
								<SpaceView mb={10}>
									<Text style={styles.fontStyle('B', 20, '#fff')}>필수 인증</Text>
								</SpaceView>
								<SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
									{authList.map((item, index) => {
										return (item?.common_code == 'JOB' || item?.common_code == 'EDU') && (
											<>
												<AuthItemRender key={item?.common_code} data={item} detailOpenFn={openDetail}  />
											</>
										);
									})}
								</SpaceView>
							</SpaceView>
							<SpaceView>
								<SpaceView mb={10}>
									<Text style={styles.fontStyle('B', 20, '#fff')}>선택 인증</Text>
								</SpaceView>
								<SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'space-between'}}>
									{authList.map((item, index) => {
										return (item?.common_code == 'ASSET' || item?.common_code == 'SNS' || item?.common_code == 'INCOME') && (
											<>
												<AuthItemRender key={item?.common_code} data={item} detailOpenFn={openDetail}  />
											</>
										);
									})}
								</SpaceView>
							</SpaceView>
						</ScrollView>

						{/* <SpaceView mt={20}>
							<FlatList
								data={authList}
								keyExtractor={item => item?.common_code}
								numColumns={2}
								columnWrapperStyle={{flex: 1, justifyContent: 'space-between'}}
								style={{height: height-330}}
								renderItem={({ item, index }) => (
									<AuthItemRender key={item?.common_code} data={item} detailOpenFn={null}  />
								)}
							/>
						</SpaceView> */}

						<SpaceView mt={15} viewStyle={_styles.bottomWrap}>
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
					</SpaceView>
				</SpaceView>
			</SpaceView>


			{/* #############################################################################################################
			######### 상세 팝업 영역
			############################################################################################################# */}
			<Modalize
				ref={detail_modalizeRef}
				adjustToContentHeight = {false}
				handleStyle={modalStyle.modalHandleStyle}
				modalStyle={{borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden', backgroundColor: '#1B1633'}} 
				modalHeight={height - 130}>
				<SecondAuthPopup
					modalHeight={height - 130}
					type={'JOB'}
					onCloseFn={detail_onClose}
					saveFn={saveSecondAuth}
					/* saveFn={saveSecondAuth}
					filePath01={filePathData.filePath01}
					filePath02={filePathData.filePath02}
					filePath03={filePathData.filePath03}
					auth_status={filePathData.auth_status}
					auth_comment={filePathData.auth_comment}
					return_reason={filePathData.return_reason} */
					isShopComment={true}
					data={detailAuthData}
				/>
			</Modalize>


			{/* #############################################################################################################
			######### 상단 영역
			############################################################################################################# */}
			{/* <SpaceView viewStyle={{backgroundColor: '#445561', padding: 30}}>
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
			</SpaceView> */}

			{/* #############################################################################################################
			######### 컨텐츠 영역
			############################################################################################################# */}
			{/* {authList.map((item, index) => {
				return currentAuthCode == item?.common_code && (
					<AuthRender 
						key={'auth_item'+index}
						_data={item}
						_selectedAuthCode={selectedAuthCode} 
						_modActiveFn={modActive}
						_setCurrentCode={setCurrentAuthCode} 
						_isModStatus={isMod.status}
						_saveFn={saveFn}
					/>
				)
			})} */}
		</>
	);
};



{/* #######################################################################################################
								인증 아이템 렌더링
####################################################################################################### */}
const AuthItemRender = React.memo(({ data, detailOpenFn }) => {
  //const data = dataObj.data;

	let isSmall = true;

  let imgSrc:any = '';
  let authDesc = '';

  if(data.common_code == 'JOB') {
    imgSrc = ICON.auth_itemJob;
    authDesc = '커리어를 확인할 수 있는 명함 또는 증명서를 올려주세요';
		isSmall = false;
  } else if(data.common_code == 'EDU') {
    imgSrc = ICON.auth_itemEdu;
    authDesc = '대학교/대학원의 재학증명서/졸업증명를 올려주세요.';
		isSmall = false;
  } else if(data.common_code == 'INCOME') {
    imgSrc = ICON.auth_itemIncome;
    authDesc = '소득 자료를 올려주세요.';
  } else if(data.common_code == 'ASSET') {
    imgSrc = ICON.auth_itemAsset;
    authDesc = '은행에서 발급해주는 잔고 증명서를 올려주세요.';
  } else if(data.common_code == 'SNS') { 
    imgSrc = ICON.auth_itemJob;
    authDesc = '팔로워 수가 충족되는 경우 스크린샷을 올려주세요.';
  } else if(data.common_code == 'VEHICLE') {
    imgSrc = ICON.auth_itemJob;
    authDesc = '차량 등록등 또는 자동차보험가입 증빙 자료를 올려주세요.';
  }

  return (
		<>
			<TouchableOpacity 
				style={{width: isSmall ? '32%' : '48.8%', marginBottom: 10}}
				activeOpacity={0.5}
				onPress={() => {
					detailOpenFn(data);
				}} >
				<LinearGradient
					colors={['rgba(203,241,255,0.3)', 'rgba(113,147,156,0.3)', 'rgba(122,132,183,0.3)']}
					start={{ x: 0, y: 0.1 }}
					end={{ x: 0.4, y: 1 }}
					style={[_styles.authItemWrap, {height: isSmall ? 120 : 170}]}>
					<SpaceView><Image source={imgSrc} style={styles.iconSquareSize(isSmall ? 54 : 64)} /></SpaceView>
					<SpaceView mt={13}><Text style={styles.fontStyle('B', isSmall ? 16 : 18, '#fff')}>{data.code_name} 인증</Text></SpaceView>
				</LinearGradient>
			</TouchableOpacity>
		</>
  );
});














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
									{/* <AuthImageRender index={0} imgData={authDetailList.length > 0 ? authDetailList[0] : null} imgSelectedFn={imgSelected} mngModalFn={imgMng_onOpen} />
									<AuthImageRender index={1} imgData={authDetailList.length > 1 ? authDetailList[1] : null} imgSelectedFn={imgSelected} mngModalFn={imgMng_onOpen} />
									<AuthImageRender index={2} imgData={authDetailList.length > 2 ? authDetailList[2] : null} imgSelectedFn={imgSelected} mngModalFn={imgMng_onOpen} /> */}
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
								{/* <AuthMaterialRender authCode={_authCode} /> */}
							</View>
						</View>

						<SpaceView mt={30}>
							<CommonBtn
								value={'가입 신청하기'}
								type={'reNewId'}
								fontSize={16}
								fontFamily={'Pretendard-Bold'}
								borderRadius={5}
								onPress={() => {
									_saveFn(false, _authName, _authCode, authDetailList, authComment, imgDelSeqStr);
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



{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}
const _styles = StyleSheet.create({
	wrap: {
		flex: 1,
    minHeight: height,
    backgroundColor: '#000000',
    paddingTop: 30,
    paddingHorizontal: 10,
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
			paddingVertical: 5,
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
	},
	inputContainer: {
		backgroundColor: '#445561',
		height: 80,
		borderRadius: 10,
		textAlign: 'center',
		marginTop: 10,
		color: '#FFFDEC',
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









	authItemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(168,220,255,0.3)',
    borderRadius: 10,
  },
	bottomWrap: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
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