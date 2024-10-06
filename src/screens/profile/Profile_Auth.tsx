import { styles, layoutStyle, modalStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, StyleSheet, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, Platform, Text, TextInput, FlatList } from 'react-native';
import * as React from 'react';
import { FC, useState, useEffect, useRef, useCallback } from 'react';
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
import { SecondAuthPopup } from 'screens/commonpopup/SecondAuthPopup';


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

	const detail_modalizeRef = useRef<Modalize>(null);
  const detail_onOpen = () => {
		detail_modalizeRef.current?.open();
    //getMemberSecondDetail('JOB');
  };
  const detail_onClose = () => { 
    detail_modalizeRef.current?.close();
  };
	const [authList, setAuthList] = React.useState([]); // 인증 목록

  const authInfoArr = [
		{ name: '직업', code: 'JOB' },
		{ name: '학업', code: 'EDU' },
		{ name: '소득', code: 'INCOME' },
		{ name: '자산', code: 'ASSET' },
		{ name: 'SNS', code: 'SNS' },
		{ name: '차량', code: 'VEHICLE' },
	];

	const [detailAuthData, setDetailAuthData] = React.useState({
		auth_code: '',
		auth_name: '',
		list: [],
	});

	// ############################################################################# 인증 탭 클릭 함수
	const openDetail = useCallback(async (data:any) => {
		setDetailAuthData(data);
		detail_onOpen();
  }, []);

	// ############################################################################# 인증 저장
	const saveSecondAuth = useCallback(async (type: string, file_list: any, auth_code: string, auth_comment: string) => {

		// 증명자료 유효성 체크
		/* if(_authDetailList.length == 0) {
			show({ content: '증명자료를 등록해 주세요.' });
			return;
		} */

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
				file_list: file_list,
				auth_code: auth_code,
				auth_comment: auth_comment,
				//img_del_seq_str: _imgDelSeqStr,
			};

			try {
				const { success, data } = await save_profile_auth(body);
				if (success) {
					switch (data.result_code) {
						case SUCCESS:

							show({
								content: '심사 요청 되었습니다.' ,
								confirmCallback: function() {
									getAuth();
									detail_onClose();
								}
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
	}, []);

  // ############################################################################# 인증 정보 조회
	const getAuth = async () => {
	  try {
    	const body = {};
  		const { success, data } = await get_member_profile_auth(body);
      if(success) {
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

		<SpaceView viewStyle={_styles.wrap}>
			<SpaceView pl={10} pr={10}>
				<CommonHeader title="멤버십 인증 관리" />
			</SpaceView>

			<ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, marginTop: 20, paddingTop: 46}}>
				<SpaceView pl={10} pr={10} viewStyle={{zIndex:2}}>
					<SpaceView viewStyle={layoutStyle.alignCenter}>
						<SpaceView><Text style={styles.fontStyle('EB', 24, '#fff')}>나도 멤버십 인증 레벨업</Text></SpaceView>
						<SpaceView mt={15}>
							<Text style={[styles.fontStyle('B', 14, '#fff'), layoutStyle.textCenter]}>당신의 성취를 자랑해 주세요.{'\n'}리프가 프라이드로 만들어 드립니다.</Text>
						</SpaceView>
					</SpaceView>

					<SpaceView mt={25} mb={200}>
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
					</SpaceView>
				</SpaceView>

				<LinearGradient
					colors={['rgba(19,17,28,0.4)', 'rgba(89,88,119,0.4)', 'rgba(89,88,119,0.4)', 'rgba(19,17,28,0.4)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={[_styles.gradientBg]}
				/>

			</ScrollView>
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
				isShopComment={false}
				data={detailAuthData}
			/>
		</Modalize>
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
    imgSrc = ICON.auth_itemSns;
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
					end={{ x: 0.5, y: 0.4 }}
					style={[_styles.authItemWrap, {height: isSmall ? 120 : 170}]}>
					<SpaceView><Image source={imgSrc} style={styles.iconSquareSize(isSmall ? 54 : 64)} /></SpaceView>
					<SpaceView mt={13}><Text style={styles.fontStyle('B', isSmall ? 16 : 18, '#fff')}>{data.code_name} 인증</Text></SpaceView>

					{!isSmall && (
						<SpaceView mt={7} viewStyle={_styles.essenTextWrap}>
							<Text style={styles.fontStyle('SB', 9, '#fff')}>필수(택1)</Text>
						</SpaceView>
					)}

				</LinearGradient>
			</TouchableOpacity>
		</>
  );
});









{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}
const _styles = StyleSheet.create({
	wrap: {
		minHeight: height,
    backgroundColor: '#13111C',
    //paddingHorizontal: 10,
    paddingTop: 30,
	},
	authItemWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 170,
    borderWidth: 1,
    borderColor: 'rgba(168,220,255,0.3)',
    borderRadius: 10,
  },
	essenTextWrap: {
		backgroundColor: '#3875DF',
		borderRadius: 12,
		paddingHorizontal: 10,
		paddingVertical: 2,
	},
	gradientBg: {
		position: 'absolute',
		top: -50,
		bottom: 0,
		left: 0,
		right: 0,
		zIndex: 1,
	},

});