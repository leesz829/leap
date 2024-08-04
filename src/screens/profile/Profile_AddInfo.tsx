import { styles, layoutStyle, modalStyle, commonStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import SpaceView from 'component/SpaceView';
import { ScrollView, View, StyleSheet, TouchableOpacity, Image, Dimensions, KeyboardAvoidingView, Platform, Text, TextInput } from 'react-native';
import * as React from 'react';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import { ColorType, StackParamList, BottomParamList, ScreenNavigationProp } from '@types';
import { useDispatch } from 'react-redux';
import { STACK } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import { get_member_interest, save_member_interest, get_member_add_info, save_member_interview } from 'api/models';
import { usePopup } from 'Context';
import { Modalize } from 'react-native-modalize';
import { SUCCESS } from 'constants/reusltcode';
import { isEmptyData } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import { setPartialPrincipal } from 'redux/reducers/authReducer';
import LinearGradient from 'react-native-linear-gradient';
import RNPickerSelect from 'react-native-picker-select';
import { ICON, PROFILE_IMAGE, findSourcePath, findSourcePathLocal } from 'utils/imageUtils';
import InterestRegiPopup from 'component/member/InterestRegiPopup';
import { getInterview } from 'hooks/member';


/* ################################################################################################################
###################################################################################################################
###### 간편소개, 부가정보 상세
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation: StackNavigationProp<StackParamList, 'Profile_AddInfo'>;
  	route: RouteProp<StackParamList, 'Profile_AddInfo'>;
}

const { width, height } = Dimensions.get('window');

export const Profile_AddInfo = (props: Props) => {
  const navigation = useNavigation<ScreenNavigationProp>();
  const dispatch = useDispatch();

  const { show } = usePopup();  // 공통 팝업
	const isFocus = useIsFocused();
	const [isLoading, setIsLoading] = React.useState(false); // 로딩 여부
	const [isClickable, setIsClickable] = React.useState(true); // 클릭 여부

  const memberBase = useUserInfo(); // 회원 기본정보

	// 현재 탭
	const [currentTab, setCurrentTab] = React.useState('INTEREST');

	// 인터뷰 목록
	const [interviewList, setInterviewList] = React.useState([]);

	// 관심사 목록
	const [intList, setIntList] = React.useState([]);

	// 관심사 체크 목록
	const [checkIntList, setCheckIntList] = React.useState([{code_name: "", common_code: "", interest_seq: ""}]);

	// ############################################################## 관심사 등록 팝업 관련
	const int_modalizeRef = React.useRef<Modalize>(null);
	const int_onOpen = () => { 
		int_modalizeRef.current?.openModal(intList, checkIntList);
	};
	const int_onClose = () => {	
		int_modalizeRef.current?.closeModal(); 
	};

	// 관심사 등록 콜백 함수
	const intCallbackFn = async (list:any) => {
		console.log('list ::::::: ' , list);

		setCheckIntList(list);
		int_onClose();

		if(list.length > 0) {
			saveInterest(list);
		}
	};

	// ############################################################ 추가 정보 조회
	const getAddInfo = async() => {
		const body = {};
		try {
			const { success, data } = await get_member_add_info(body);
			if(success) {
				switch (data.result_code) {
          case SUCCESS:
            setIntList(data?.interest_list);
      
            let setList = new Array();
            data?.interest_list.map((item, index) => {
              item.list.map((obj, idx) => {
                if(obj.interest_seq != null) {
                  setList.push(obj);
                };
              });
            });
					  setCheckIntList(setList);

						setInterviewList(data?.interview_list);

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
	const saveInterest = async (list:any) => {

		if(list.length < 1){
			show({ content: '관심사를 입력해 주세요.' });
			return;
		};

		// 중복 클릭 방지 설정
		if(isClickable) {
			setIsClickable(false);
			setIsLoading(true);

			const body = {
				//interest_list: checkIntList,
				interest_list: list,
			};
			try {
        const { success, data } = await save_member_interest(body);
        if (success) {
          switch (data.result_code) {
            case SUCCESS:
							show({ type: 'RESPONSIVE', content: '관심사가 저장되었습니다.' });
							getAddInfo();
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

	// ############################################################################# 저장 함수
	const saveInterview = async (data:any) => {

		/* console.log('data ::: ' , data);
		return; */

		// 중복 클릭 방지 설정
		if(isClickable) {
			setIsClickable(false);
			setIsLoading(true);

			const body = {
				member_interview_seq: data?.interview_seq,
				common_code: data?.common_code,
				answer: data?.answer,
				order_seq: data?.order_seq,
			};
			try {
        const { success, data } = await save_member_interview(body);
        if (success) {
          switch (data.result_code) {
            case SUCCESS:
							show({ type: 'RESPONSIVE', content: '인터뷰가 저장되었습니다.' });
							getAddInfo();
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

	/* ############################################################################# 인터뷰 답변 핸들러 */
	const answerChangeHandler = (common_code: any, text: any) => {
		setInterviewList((prev) =>
			prev.map((item: any) =>
			item.common_code === common_code
				? { ...item, answer: text }
				: item
			)
		);
		//callbackAnswerFn && callbackAnswerFn(member_interview_seq, text);
	};





	const onTabActive = async (value:string) => {
		setCurrentTab(value);
	};

	// 첫 렌더링 때 실행
  React.useEffect(() => {
		if(isFocus) {
			getAddInfo();
    }
  }, [isFocus]);

  return (
		<>
			{isLoading && <CommonLoading />}

			<SpaceView viewStyle={_styles.wrap}>
				<SpaceView pl={10} pr={10}>
					<CommonHeader title="추가 정보" />
				</SpaceView>

				<SpaceView mt={30} viewStyle={layoutStyle.rowBetween}>
					<TouchableOpacity 
						style={_styles.tabItemWrap(currentTab == 'INTEREST')}
						onPress={() => { onTabActive('INTEREST'); }}
						activeOpacity={0.5}>
						<Text style={styles.fontStyle('EB', 20, currentTab == 'INTEREST' ? '#46F66F' : '#808080')}>관심사</Text>
					</TouchableOpacity>
					<TouchableOpacity 
						style={_styles.tabItemWrap(currentTab == 'INTERVIEW')}
						onPress={() => { onTabActive('INTERVIEW'); }}
						activeOpacity={0.5}>
						<Text style={styles.fontStyle('EB', 20, currentTab == 'INTERVIEW' ? '#46F66F' : '#808080')}>인터뷰</Text>
					</TouchableOpacity>
				</SpaceView>

				<SpaceView>

					{/* 관심사 */}
					{currentTab == 'INTEREST' && (
						<SpaceView>
							<ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingBottom: 15, marginTop: 30, height: height-300}}>
								<SpaceView pl={10} pr={10}>
									<SpaceView>
										<SpaceView viewStyle={layoutStyle.rowStart}>
											<Image source={ICON.int_lifestyle} style={styles.iconSquareSize(15)} />
											<SpaceView ml={3}><Text style={styles.fontStyle('EB', 16, '#fff')}>라이프 스타일</Text></SpaceView>
										</SpaceView>
										<SpaceView mt={20} viewStyle={_styles.interestListWrap}>
											{checkIntList.map((i, index) => {
												return isEmptyData(i.code_name) && (
													<SpaceView key={index + 'reg'} mr={5} mb={10} viewStyle={_styles.interestItemWrap}>
														<Text style={styles.fontStyle('B', 14, '#fff')}>{i.code_name}</Text>
													</SpaceView>
												);
											})}
										</SpaceView>
									</SpaceView>
								</SpaceView>
							</ScrollView>
							<TouchableOpacity
								style={_styles.interestAddBtn}
								onPress={() => {
									int_onOpen();
								}}>
								<Text style={styles.fontStyle('B', 12, '#fff')}>관심사 추가/삭제</Text>
							</TouchableOpacity>
						</SpaceView>
					)}

					{/* 인터뷰 */}
					{currentTab == 'INTERVIEW' && (
						<SpaceView pl={10} pr={10}>
							<SpaceView mt={25}>
								<Text style={styles.fontStyle('EB', 20, '#fff')}>리프의 친구들에게{'\n'}{memberBase?.nickname}님의 생각을 남겨 보세요.</Text>
							</SpaceView>
							<ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, marginTop: 25, height: height-280}}>

								{interviewList.map((item, index) => {
								
									return (
										<>
											<SpaceView>
												<LinearGradient
													colors={['rgba(203,239,255,0.3)', 'rgba(113,143,156,0.3)', 'rgba(122,154,183,0.3)']}
													start={{ x: 0.1, y: 0 }}
													end={{ x: 0.8, y: 0.8 }}
													style={_styles.interviewItemWrap}
												>
													<SpaceView>
														<Text style={styles.fontStyle('B', 14, '#fff')}>{item?.code_name}</Text>
													</SpaceView>
													<SpaceView mt={30} viewStyle={_styles.interviewAnswerWrap}>
														<TextInput
															defaultValue={item?.answer}
															onChangeText={(text) => answerChangeHandler(item?.common_code, text) }
															autoCapitalize={'none'}
															multiline={true}
															style={[_styles.textInputBox(100), styles.fontStyle('SB', 12, '#C4B6AA')]}
															placeholder={'내용을 입력해 주세요.\n※입력된 내용이 없는 인터뷰는 상대에게 공개되지 않습니다. '}
															placeholderTextColor={'#C4B6AA'}
															maxLength={200}
															caretHidden={true}
														/>
													</SpaceView>
													<SpaceView mt={10} viewStyle={_styles.interviewBtnWrap}>
														<TouchableOpacity style={_styles.interviewCancelBtn}>
															<Text style={styles.fontStyle('B', 16, '#fff')}>취소</Text>
														</TouchableOpacity>
														<TouchableOpacity 
															style={_styles.interviewSaveBtn}
															onPress={() => {
																saveInterview(item);
															}}>
															<Text style={styles.fontStyle('B', 16, '#fff')}>저장</Text>
														</TouchableOpacity>
													</SpaceView>
												</LinearGradient>
											</SpaceView>
										</>
									);
								})}

							</ScrollView>
						</SpaceView>
					)}
					
				</SpaceView>
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
		minHeight: height,
    backgroundColor: '#13111C',
    paddingTop: 30,
	},
	tabItemWrap: (isOn:boolean) => {
		return {
			width: '50%',
			alignItems: 'center',
			borderBottomWidth: 2,
			borderBottomColor: isOn ? '#46F66F' : '#808080',
			paddingBottom: 5,
    };
	},
	interestListWrap: {
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	interestItemWrap: {
		backgroundColor: '#808080',
		borderRadius: 25,
		borderColor: '#40E0D0',
		borderWidth: 1,
		paddingHorizontal: 18,
		paddingVertical: 10,
	},
	interestAddBtn: {
		backgroundColor: '#44B6E5',
		borderRadius: 25,
		alignItems: 'center',
		marginHorizontal: 10,
		paddingVertical: 10,
		marginTop: 30,
	},
	interviewItemWrap: {
		borderRadius: 10,
		paddingHorizontal: 13,
		paddingTop: 30,
		paddingBottom: 10,
		marginBottom: 25,
	},
	interviewAnswerWrap: {
		backgroundColor: '#fff',
		borderRadius: 10,
		paddingHorizontal: 13,
		paddingVertical: 10,
	},
	interviewBtnWrap: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
	},
	interviewCancelBtn: {
		backgroundColor: '#FF516F',
		borderRadius: 25,
		width: 95,
		paddingVertical: 5,
		alignItems: 'center',
		marginRight: 10,
	},
	interviewSaveBtn: {
		backgroundColor: '#46F66F',
		borderRadius: 25,
		width: 95,
		paddingVertical: 5,
		alignItems: 'center',
	},
	textInputBox: (_hegiht: number) => {
		return {
			width: '100%',
			height: _hegiht,
			borderRadius: 10,
			textAlign: 'left',
			textAlignVertical: 'top',
			margin: 0,
			padding: 0,
		};
	},


});