import { styles, layoutStyle } from 'assets/styles/Styles';
import CommonHeader from 'component/CommonHeader';
import { useState } from 'react';
import * as React from 'react';
import { ScrollView, View, Image, Modal, TouchableOpacity, Alert, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ColorType, ScreenNavigationProp, StackParamList } from '@types';
import { RouteProp, useNavigation, useIsFocused } from '@react-navigation/native';
import SpaceView from 'component/SpaceView';
import { ICON } from 'utils/imageUtils';
import { get_board_list, board_detail_view } from 'api/models';
import { usePopup } from 'Context';
import { CommonLoading } from 'component/CommonLoading';
import { STACK, ROUTES } from 'constants/routes';
import { useUserInfo } from 'hooks/useUserInfo';
import BoardDetailPopup from 'screens/commonpopup/BoardDetailPopup';
import { Modalize } from 'react-native-modalize';


/* ################################################################################################################
###################################################################################################################
###### 최근 소식
###################################################################################################################
################################################################################################################ */

interface Props {
	navigation: StackNavigationProp<StackParamList, 'Board'>;
	route: RouteProp<StackParamList, 'Board'>;
}

const { width, height } = Dimensions.get('window');

export const Board = (props: Props) => {
	const navigation = useNavigation<ScreenNavigationProp>();

	const { show } = usePopup();
	const [isLoading, setIsLoading] = useState(false);
	const isFocus = useIsFocused();

	const memberBase = useUserInfo();

	const [noticeList, setnoticeList] = React.useState([]);

	const [activeIndex, setActiveIndex] = useState(-1);

	const [detailData, setDetailData] = useState({
		title: '',
		content: '',
	});


	// 상세 팝업 Ref
  const detail_modalizeRef = React.useRef<Modalize>(null);

  // 상세 팝업 활성화
  const detailModalOpen = () => {
    detail_modalizeRef?.current?.open();
  };

	// 상세 팝업 닫기
	const detailModalClose = React.useCallback(async (type:string) => {
    detail_modalizeRef?.current?.close();
  }, []);

	// 게시글 상세 이동
	const onPressBoardDetail = async (item:any) => {
		setDetailData({
			title: item.title,
			content: item.content,
		})

		detailModalOpen();
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

			<SpaceView viewStyle={_styles.wrap}>
        <CommonHeader title="새소식" />

        <ScrollView bounces={false} showsVerticalScrollIndicator={false} style={{flexGrow: 1, paddingTop: 15, marginTop: 30}}>
					<SpaceView>
						{noticeList.map((item, index) => {

							let iconSrc = ICON.boardEvent;

							if(item.board_type == 'RECENT_NEWS') {
								if(item.board_sub_type == 'NOTICE') {
									iconSrc = ICON.boardNotice;
								} else if(item.board_sub_type == 'GUIDE') {
									iconSrc = ICON.boardGuide;
								}
							}

							return (
								<>
									<SpaceView mb={23} key={item.board_seq} viewStyle={_styles.rowContainer}>
										<SpaceView viewStyle={{flex: 0.15}}>
											<Image source={iconSrc} style={styles.iconSquareSize(38)} />
										</SpaceView>
										<SpaceView pb={15} viewStyle={{flex: 0.85, borderBottomWidth: 1, borderBottomColor: '#617494'}}>
											<SpaceView>
												<Text style={styles.fontStyle('SB', 11, '#fff')}>{item.title}</Text>
											</SpaceView>
											<SpaceView mt={20} viewStyle={layoutStyle.rowBetween}>
												<Text style={styles.fontStyle('R', 10, '#888888')}>{item.reg_dt}</Text>
												<TouchableOpacity
													style={_styles.btnDetail()}
													activeOpacity={0.3}
													onPress={() => (
														onPressBoardDetail(item)
														//sstoggleAccordion(item);
													)}
												>
													<Text style={styles.fontStyle('SB', 10, '#fff')}>보기</Text>
												</TouchableOpacity>
											</SpaceView>
										</SpaceView>

										{/* <TouchableOpacity
											style={_styles.inner}
											activeOpacity={0.3}
											onPress={() => (
												onPressBoardDetail(item)
												//sstoggleAccordion(item);
											)}
										>
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
													<CommonText type={'h6'} fontWeight={'200'} color={'#E1DFD1'}>{item.reg_dt}</CommonText>
												</View>
											</View>

											<View style={[_styles.iconContainer, activeIndex === item.board_seq && _styles.activeIcon]}>
												<Image source={ICON.circleArrow} style={styles.iconSize18} />
											</View>
										</TouchableOpacity> */}
									</SpaceView>
								</>
							)
						})}
					</SpaceView>
				</ScrollView>
			</SpaceView>


			{/* ################################################################################### 게시글 상세 팝업 */}
			<BoardDetailPopup modalRef={detail_modalizeRef} closeFunc={detailModalClose} data={detailData} />




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
	rowContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	btnDetail: (color:string) => {
		return {
			borderRadius: 25,
			backgroundColor: '#44B6E5',
			paddingHorizontal: 25,
			paddingVertical: 4,
		};
	},




});