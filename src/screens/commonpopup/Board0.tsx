import { styles, layoutStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { useState } from 'react';
import * as React from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import SpaceView from 'component/SpaceView';
import { CommonText } from 'component/CommonText';
import { ICON } from 'utils/imageUtils';
import { Color } from 'assets/styles/Color';
import { get_board_list, board_detail_view } from 'api/models';
import { usePopup } from 'Context';
import { CommonLoading } from 'component/CommonLoading';
import { CommonBtn } from 'component/CommonBtn';
import { STACK } from 'constants/routes';
import LinearGradient from 'react-native-linear-gradient';


/* ################################################################################################################
###################################################################################################################
###### 최근 소식
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation: StackNavigationProp<StackParamList, 'Board0'>;
	route: RouteProp<StackParamList, 'Board0'>;
}

export const Board0 = (props: Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();

	const { show } = usePopup();
	const [isLoading, setIsLoading] = useState(false);
	const isFocus = useIsFocused();

	const [noticeList, setnoticeList] = React.useState([]);

	const [activeIndex, setActiveIndex] = useState(-1);

	// 이용약관 이동
	const onPressBoardDetail = async (item:any) => {
		navigation.navigate(STACK.COMMON, {screen: 'BoardDetail',
		params : item
	})
	};

	// 토글
	const toggleAccordion = (item:any) => {
		const board_seq = item.board_seq;
		const view_yn = item.view_yn;

		if(activeIndex !== board_seq && view_yn == 'N') {
			boardDetailView(board_seq);
		};

		setActiveIndex(activeIndex === board_seq ? -1 : board_seq);
	};

	// 게시글 목록 조회
	const getBoardList = async () => {
		setIsLoading(true);
		try {
			const { success, data } = await get_board_list();
			if (success) {
				if (data.result_code == '0000') {
					setnoticeList(data.boardList);
				};
			} else {
				show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			}
		} catch (error) {
			show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			console.log(error);
		} finally {
			setIsLoading(false);
		}
	};

	// 게시글 상세 조회
	const boardDetailView = async (board_seq:any) => {
		try {
			const body = {
				board_seq: board_seq
			};
			const { success, data } = await board_detail_view(body);
			if (success) {
				if (data.result_code == '0000') {
					
					const newList = noticeList.map((item:any, index) => {
						if(item.board_seq == board_seq) {
							item.view_yn = 'Y';
						};

						return item;
					});

					setnoticeList(newList);
				};
			} else {
				show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			}
		} catch (error) {
			show({ content: '오류입니다. 관리자에게 문의해주세요.' });
			console.log(error);
		} finally {

		}
	};

	// ############################################# 바로가기 이동 함수
	const goLink = async (type:any) => {
		if(type == 'EVENT') {
			navigation.navigate(STACK.COMMON, { 
				screen: 'EventDetail',
				params: {
					index: 0
				}
			});
		};
	};

	// ######################################################################################## 초기 실행 함수
	React.useEffect(() => {
		if(isFocus) {
			getBoardList();
		};
	  }, [isFocus]);

	return (
		<>
			{isLoading && <CommonLoading />}

			<CommonHeader title={'새소식'} />
			
			<LinearGradient
				colors={['#3D4348', '#1A1E1C']}
				start={{ x: 0, y: 0 }}
				end={{ x: 0, y: 1 }}
				style={{paddingHorizontal: 20}}
			>		
				<ScrollView style={{marginTop: 40, marginBottom: 70}}>
					{/* <SpaceView mb={45}>
						<View style={layoutStyle.alignStart}>
							<CommonText	type={'h2'} fontWeight={'200'}>리미티드의 소식을{'\n'}전해드립니다 :)</CommonText>
						</View>
					</SpaceView> */}

					{noticeList.map((item, index) => (
						<SpaceView mb={10} key={item.board_seq}>
							<View style={_styles.rowContainer}>
								<TouchableOpacity
									style={_styles.inner}
									activeOpacity={0.3}
									onPress={() => (
										onPressBoardDetail(item)
										//sstoggleAccordion(item);
										)			
									}>
									
									<View style={[_styles.titleContainer, activeIndex === item.board_seq && _styles.active]}>
										<View style={{flexDirection:'row'}}>
											{item.board_type == 'EVENT' &&
												<Text style={_styles.iconType('#AFF20E')}>이벤트</Text>
											}
											{(item.board_type == 'RECENT_NEWS' && item.board_sub_type == 'NOTICE') &&
												<Text style={_styles.iconType('#00FFDC')}>공지사항</Text>
											}
											{(item.board_type == 'RECENT_NEWS' && item.board_sub_type == 'GUIDE') &&
												<Text style={_styles.iconType('#FFDD00')}>가이드</Text>
											}
										</View>

										<View>
											{(item.new_yn == 'Y' && item.view_yn == 'N') && (
												<View style={_styles.newIcon} />
											)}
											<CommonText textStyle={_styles.titleText} type={'h5'} fontWeight={'200'} color={'#D5CD9E'}>{item.title}</CommonText>
											<CommonText type={'h6'} fontWeight={'200'} color={'#445561'}>{item.reg_dt}</CommonText>
										</View>
									</View>

									<View style={[_styles.iconContainer, activeIndex === item.board_seq && _styles.activeIcon]}>
										{/* <Image source={ICON.arrBottom} style={_styles.iconStyle} /> */}
										<Image source={ICON.circleArrow} style={styles.iconSize18} />
									</View>
								</TouchableOpacity>
							</View>

							{/* {new_yn == 'Y' &&
								<View style={_styles.newArea}>
									<Text style={_styles.newText}>NEW</Text>
								</View>
							} */}

							{/* {activeIndex === item.board_seq && (
								<View style={_styles.descContainer}>
									<CommonText textStyle={_styles.descText} type={'h5'} color={'#D5CD9E'}>{item.content}</CommonText>
									<CommonText textStyle={_styles.dateText} type={'h5'} color={'#445561'}>{item.reg_dt}</CommonText>
									
									{item.board_type == 'EVENT' &&
										<SpaceView mt={10}>
											<CommonBtn 
												value={'바로가기'} 
												type={'gray2'}
												width={'100%'}
												height={35}
												fontSize={13}
												borderRadius={5}
												onPress={() => {
													goLink('EVENT');
												}} />
										</SpaceView>
									}
								</View>
							)} */}
						</SpaceView>
					))}
				</ScrollView>
			</LinearGradient>
		</>
	);
};



const _styles = StyleSheet.create({
	iconContainer: {
	  	position: 'absolute',
		top: '45%',
	  	right: 20,
	  	// transform: [{ rotate: '360deg' }],
		transform: [{ rotate: '270deg' }],
	},
	activeIcon: {
	  	// transform: [{ rotate: '180deg' }],
	},
	inner: {
	  	width: '100%',
	},
	labelContainer: {
	  	marginBottom: 12,
	},
	rowContainer: {
	 	flexDirection: 'row',
	  	justifyContent: 'space-between',
	},
	iconStyle: {
	  	width: 18,
	  	height: 10,
	},
	titleContainer: {
	  	borderBottomWidth: 1,
	  	borderColor: '#E1DFD1',
	  	//borderRadius: 15,
	  	paddingHorizontal: 15,
	  	paddingVertical: 15,
	},
	titleText: {
		paddingRight: 35,
	},
	active: {
	  	borderBottomWidth: 0,
	  	borderBottomLeftRadius: 0,
	  	borderBottomRightRadius: 0,
	},
	descContainer: {
		//padding: 16,
		paddingHorizontal: 10,
		paddingBottom: 20,
		borderWidth: 1,
		borderTopWidth: 0,
		borderColor: Color.grayEBE,
		borderBottomLeftRadius: 15,
		borderBottomRightRadius: 15,
	},
	descText: {
		paddingHorizontal: 15,
		paddingVertical: 20,
	},
	dateText: {
		textAlign: 'right',
		paddingHorizontal: 15,
		marginTop: 5,
	},
	newArea: {
		position: 'absolute',
		top: -10,
		left: 0,
		backgroundColor: '#000',
		borderRadius: 20,
		paddingHorizontal: 8,
		paddingVertical: 2,
	},
	newText: {
		fontFamily: 'AppleSDGothicNeoM00',
		fontSize: 12,
		color: '#fff',
	},
	iconType: (color:string) => {
		return {
			width: 50,
			fontFamily: 'Pretendard-Medium',
			fontSize: 10,
			color: '#3D4348',
			backgroundColor: color,
			textAlign: 'center',
			borderRadius: Platform.OS == 'android' ? 10 : 7,
			marginRight: 5,
			overflow: 'hidden',
			paddingVertical: 2,
		};
	},
	newIcon: {
		position: 'absolute',
		top: 10,
		left: -7,
		width: 5,
		height: 5,
		backgroundColor: '#FF4D29',
		borderRadius: 30,
	},
  });