import React, { useRef } from 'react';
import type { FC, useState, useEffect } from 'react';
import { CommonText } from 'component/CommonText';
import { Modalize } from 'react-native-modalize';
import SpaceView from 'component/SpaceView';
import { Image, ScrollView, StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { layoutStyle, styles, modalStyle, commonStyle } from 'assets/styles/Styles';
import { CommonBtn } from 'component/CommonBtn';
import { ICON } from 'utils/imageUtils';
import { isEmptyData } from 'utils/functions';



/* ################################################################################################################
###### 게시글 상세 팝업
################################################################################################################### */
interface Props {
	modalRef: undefined;
	closeFunc: () => void;
	data: undefined;
}

const { width, height } = Dimensions.get('window');

export default function BoardDetailPopup({ modalRef, closeFunc, data }: Props) {

	return (
		<>
			<Modalize
				ref={modalRef}
				handleStyle={modalStyle.modalHandleStyle}
				modalStyle={{borderTopLeftRadius: 30, borderTopRightRadius: 30, backgroundColor: '#1B1633'}}
				adjustToContentHeight={false}
				modalHeight={height - 150}
				FooterComponent={
					<SpaceView pl={20} pr={20}>
						<TouchableOpacity onPress={() => { closeFunc(); }} style={_styles.btnArea('#44B6E5')}>
							<Text style={styles.fontStyle('B', 12, '#fff')}>확인</Text>
						</TouchableOpacity>
					</SpaceView>
				}
				HeaderComponent={
					<SpaceView viewStyle={_styles.titleArea}>
						<SpaceView mb={50} viewStyle={layoutStyle.alignCenter}>
							<Image source={ICON.popupDown} style={styles.iconNoSquareSize(37, 7)} />
						</SpaceView>
						<Text style={styles.fontStyle('EB', 22, '#fff')}>{data?.title}</Text>
					</SpaceView>
				}
			>
				<SpaceView pl={23} pr={23} pb={20} viewStyle={[layoutStyle.flex1, {backgroundColor: '#1B1633'}]}>
					<Text style={styles.fontStyle('SB', 11, '#fff')}>{data?.content}</Text>
				</SpaceView>
			</Modalize>		
		</>
	);
};


const _styles = StyleSheet.create({
	titleArea: {
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		overflow: 'hidden',
		backgroundColor:'#1B1633',
		paddingVertical: 20,
		paddingHorizontal: 23,
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