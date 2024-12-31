import { useRef, forwardRef, useImperativeHandle } from 'react';
import { Image, TouchableOpacity, View, Text, StyleSheet, Dimensions, Platform } from 'react-native';
import { Modalize } from 'react-native-modalize';
import * as React from 'react';
import { layoutStyle, modalStyle, styles } from 'assets/styles/Styles';
import { ICON } from 'utils/imageUtils';
import SpaceView from 'component/SpaceView';
import { isEmptyData } from 'utils/functions';
import { BottomSheetModal, BottomSheetModalProvider, BottomSheetView, BottomSheetScrollView } from '@gorhom/bottom-sheet';



/* ################################################################################################################
###################################################################################################################
###### 팝업 - 신고하기 화면
###################################################################################################################
################################################################################################################ */

const { width, height } = Dimensions.get('window');

interface Props {
	modalRef: undefined
  confirmFn: (value: string) => void
	onChangeFn: () => void
	codeList: []
};

const ReportPopup = forwardRef((props, ref) => {

	const [selectedValue, setSelectedValue] = React.useState('');

	const selectFn = (value:string) => {
		setSelectedValue(value);
	}

	return (
		<>
			<BottomSheetModalProvider>
        <BottomSheetModal
          ref={props.modalRef}
          index={0}
          onChange={props.onChangeFn}
          //snapPoints={snapPoints}
          maxDynamicContentSize={Platform.OS == 'android' ? height-150 : height-200}
          enablePanDownToClose={true}
          handleIndicatorStyle={{
            backgroundColor: '#808080', // 핸들러 색상 변경
            width: 37, // 핸들러 너비 변경
            height: 7, // 핸들러 높이 변경
            borderRadius: 5, // 둥글게 처리
          }}
          handleStyle={{
            backgroundColor: '#1B1633', // 핸들러 배경 변경
            borderTopLeftRadius: 30, // 모달 상단 모서리 둥글게
            borderTopRightRadius: 30,
            overflow: 'hidden',
            paddingTop: 20,
          }}
          backgroundStyle={{backgroundColor: '#1B1633'}}
        >
					<SpaceView pl={20} pr={20} mt={20}>
						<SpaceView viewStyle={_styles.titleArea}>
							<Text style={styles.fontStyle('EB', 22, '#fff')}>신고 및 차단하기</Text>
						</SpaceView>

						<SpaceView mt={15} pb={25} viewStyle={{borderBottomWidth: 1, borderColor: '#BCBCBC'}}>
							<Text style={styles.fontStyle('B', 13, '#fff')}>신고사유를 알려주시면 더 좋은 리프를 만드는데 도움이 됩니다.</Text>
						</SpaceView>
					</SpaceView>

					<BottomSheetScrollView 
						contentContainerStyle={{ minHeight: Platform.OS == 'android' ? height-250 : height-200 }}  
						showsVerticalScrollIndicator={false}
					>
						<SpaceView ml={20} mr={20} mt={30}>
							{props.codeList?.map((item, index) => {
								return (
									<TouchableOpacity 
										style={_styles.itemWrap(item?.value == selectedValue)}
										onPress={() => {
											selectFn(item?.value);
										}}
									>
										{item?.value == selectedValue ? (
											<Image source={ICON.checkGreenIcon} style={styles.iconSquareSize(18)} />
										) : (
											<SpaceView viewStyle={{width: 18, height: 18}} />
										)}
										<SpaceView ml={10}><Text style={styles.fontStyle('B', 14, item?.value == selectedValue ? '#fff' : '#808080')}>{item.label}</Text></SpaceView>
									</TouchableOpacity>
								)
							})}
						</SpaceView>
					</BottomSheetScrollView>

					<SpaceView pl={10} pr={10} viewStyle={{backgroundColor: '#1B1633'}}>
						<SpaceView mb={10}>
							<TouchableOpacity 
								onPress={() => {
									props.confirmFn(selectedValue);
								}} 
								style={_styles.btnArea('#44B6E5')}>
								<Text style={styles.fontStyle('B', 12, '#fff')}>신고 및 차단하기</Text>
							</TouchableOpacity>
						</SpaceView>
					</SpaceView>
        </BottomSheetModal>
      </BottomSheetModalProvider>

			{/* <Modalize
				ref={modalizeRef}
				adjustToContentHeight={false}
				handleStyle={modalStyle.modalHandleStyle}
				//modalStyle={[modalStyle.modalContainer, {borderRadius: 0, borderTopLeftRadius: 50, borderTopRightRadius: 50}]}
				modalStyle={{borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden', backgroundColor: '#1B1633'}}
				//modalHeight={height - 160}
				modalHeight={640}
				scrollViewProps={{
					scrollEnabled: false, // 스크롤 비활성화
				}}
				onOverlayPress={() => { closeModal(); }}
				FooterComponent={
					<>
						<SpaceView pl={10} pr={10} pb={20} viewStyle={{backgroundColor: '#1B1633'}}>
							<SpaceView mb={10}>
								<TouchableOpacity 
									onPress={() => {
										confirmFn(selectedValue);
									}} 
									style={_styles.btnArea('#44B6E5')}>
									<Text style={styles.fontStyle('B', 12, '#fff')}>신고 및 차단하기</Text>
								</TouchableOpacity>
							</SpaceView>
						</SpaceView>
					</>
				}
			>
				<SpaceView viewStyle={_styles.titleArea}>
					<SpaceView mb={50} viewStyle={layoutStyle.alignCenter}>
						<Image source={ICON.popupDown} style={styles.iconNoSquareSize(37, 7)} />
					</SpaceView>
					<Text style={styles.fontStyle('EB', 22, '#fff')}>신고 및 차단하기</Text>
				</SpaceView>

				<SpaceView ml={25} mr={25}>
					<View style={[modalStyle.modalBody, {paddingBottom: 0, paddingHorizontal: 0}]}>
						<SpaceView mt={15} mb={13} pb={25} viewStyle={{borderBottomWidth: 1, borderColor: '#BCBCBC'}}>
							<Text style={styles.fontStyle('B', 13, '#fff')}>신고사유를 알려주시면 더 좋은 리프를 만드는데 도움이 됩니다.</Text>
						</SpaceView>

						<SpaceView mt={20}>
							{codeList?.map((item, index) => {
								return (
									<TouchableOpacity 
										style={_styles.itemWrap(item?.value == selectedValue)}
										onPress={() => {
											selectFn(item?.value);
										}}
									>
										{item?.value == selectedValue ? (
											<Image source={ICON.checkGreenIcon} style={styles.iconSquareSize(18)} />
										) : (
											<SpaceView viewStyle={{width: 18, height: 18}} />
										)}
										<SpaceView ml={10}><Text style={styles.fontStyle('B', 14, item?.value == selectedValue ? '#fff' : '#808080')}>{item.label}</Text></SpaceView>
									</TouchableOpacity>
								)
							})}
						</SpaceView>
					</View>
				</SpaceView>
			</Modalize> */}
		</>
	);
});


{/* #######################################################################################################
###########################################################################################################
##################### Style 영역
###########################################################################################################
####################################################################################################### */}

const _styles = StyleSheet.create({
	titleArea: {
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		overflow: 'hidden',
		backgroundColor:'#1B1633',
		paddingVertical: 10,
	},
  reportButton: {
    height: 43,
    borderRadius: 21.5,
    backgroundColor: '#363636',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    marginTop: 20,
  },
  reportBtnArea: (bg:number, bdc:number) => {
		return {
			/* width: '50%',
			height: 48, */
			backgroundColor: bg,
			alignItems: 'center',
			justifyContent: 'center',
      borderWidth: 1,
      borderColor: bdc,
      borderRadius: 5,
      paddingVertical: 13,
		}
	},
  reportBtnText: (cr:string) => {
		return {
		  fontFamily: 'Pretendard-Bold',
		  fontSize: 16,
		  color: isEmptyData(cr) ? cr : '#fff',
		};
	},
	itemWrap: (isOn:boolean) => {
		return {
		  flexDirection: 'row',
			alignItems: 'center',
			borderWidth: 1,
			borderRadius: 10,
			borderColor: isOn ? '#FFFFFF' : '#808080',
			paddingVertical: 10,
			paddingHorizontal: 10,
			marginBottom: 10,
		};
	},
	btnArea: (bg:number) => {
		return {
			width: '100%',
			height: 35,
			backgroundColor: bg,
			alignItems: 'center',
			justifyContent: 'center',
			borderRadius: 25,
			marginBottom: 10,
		}
	},

});


export default ReportPopup;