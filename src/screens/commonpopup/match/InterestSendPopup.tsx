import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Dimensions, TextInput } from 'react-native';
import Modal from 'react-native-modal';
import { SafeAreaView } from 'react-native-safe-area-context';
import Image from 'react-native-fast-image';
import { ICON } from 'utils/imageUtils';
import Carousel from 'react-native-snap-carousel';
import { useUserInfo } from 'hooks/useUserInfo';
import { CommonTextarea } from 'component/CommonTextarea';
import SpaceView from 'component/SpaceView';
import { commonStyle, styles } from 'assets/styles/Styles';
import { isEmptyData, formatNowDate } from 'utils/functions';
import { VoteEndRadioBox } from 'component/story/VoteEndRadioBox';


const { width } = Dimensions.get('window');

interface Props {
  isVisible: boolean;
  closeModal: () => void;
  confirmFunc: (type:string, message:string) => void;
  useItem: undefined;
}

export default function InterestSendPopup({ isVisible, closeModal, confirmFunc, useItem }: Props) {
  const memberBase = useUserInfo(); // 회원 기본정보
  const [message, setMessage] = React.useState(''); // 메시지
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // 관심 유형
  const [interestList, setInterestList] = React.useState([
    {label: '관심', value: 'interest'},
    {label: '좋아요', value: 'sincere'},
  ]);

  const [selectedInterest, setSelectedInterest] = React.useState('interest');

  // 자유이용권 아이템 사용 여부
  const [isFreeItemUse, setIsFreeItemUse] = React.useState(function() {
    let result = false;
    if(isEmptyData(useItem) && isEmptyData(useItem?.FREE_LIKE)) {
      let endDt = useItem?.FREE_LIKE?.end_dt;
      if(endDt > formatNowDate()) {
        result = true;
      }
    };
    return result;
  });

  // 관심 선택 콜백 함수
  const interestTypeCallbackFn = (value: string) => {
    setSelectedInterest(value);
  };

  return (
    <Modal isVisible={isVisible} onRequestClose={() => { closeModal(); }}>
      <SafeAreaView style={_styles.container}>

        {/* <TouchableOpacity style={_styles.closeBtnArea} onPress={() => { closeModal(); }} hitSlop={commonStyle.hipSlop20}>
          <Image style={styles.iconSquareSize(25)} source={ICON.xBlueIcon} resizeMode={'contain'} />
        </TouchableOpacity> */}

        <SpaceView mb={2} viewStyle={_styles.titleBox}>
          <Text style={_styles.titleText}>
            이성에게 <Text style={{color: '#32F9E4'}}>관심</Text>을 보냅니다.{'\n'}
            만약 놓치고 싶지 않은 사람이라면 <Text style={{color: '#32F9E4'}}>좋아요</Text>를 추천 드려요.
          </Text>
        </SpaceView>

        <SpaceView viewStyle={{flexDirection: 'row', borderRadius: 35, overflow: 'hidden', width: 150, marginHorizontal: 13}}>

          {interestList.map((item, index) => {
            if (!item.label) return;

            return (
              <TouchableOpacity 
                //disabled={!props.isModfy}
                key={index} 
                style={_styles.checkWrap(item.value === selectedInterest)} 
                onPress={() => interestTypeCallbackFn(item.value)}
                activeOpacity={0.9}>
                <Text style={_styles.labelText(item.value === selectedInterest)}>{item.label}</Text>
              </TouchableOpacity>
            );
          })}
        </SpaceView>
        
        <View style={_styles.contentBody}>
          <SpaceView viewStyle={_styles.messageArea}>
            <TextInput
              value={message}
              onChangeText={(message) => setMessage(message)}
              multiline={true}
              autoCapitalize="none"
              style={_styles.inputStyle}
              placeholder={'(선택)상대에게 전할 정성스러운 메시지를 작성해 보세요!'}
              placeholderTextColor={'#E1DFD1'}
              editable={true}
              secureTextEntry={false}
              maxLength={150}
              numberOfLines={4}
            />

            <SpaceView viewStyle={{position:'absolute', bottom: 20, right: 20}}>
              <Text style={_styles.numberText}>{message.length}/150</Text>
            </SpaceView>
          </SpaceView>
        </View>

        <SpaceView mt={10} mb={15} viewStyle={_styles.btnContainer}>
          <TouchableOpacity 
            onPress={() => {
              closeModal();
            }}
          >
            <Text style={_styles.btnStyle('#ffffff')}>취소하기</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => {
              confirmFunc(selectedInterest, message);
            }}
          >
            <Text style={_styles.btnStyle('#FFDD00')}>보내기</Text>

            <SpaceView viewStyle={_styles.sendEtc}>
              {selectedInterest == 'INTEREST' ? (
                <>
                  {!isFreeItemUse ? (
                    <>
                      <Image source={ICON.cubeYCyan} style={styles.iconSquareSize(12)} />
                      <Text style={_styles.sendText}>15</Text>
                    </>
                  ) : (
                    <>
                      <Image source={ICON.cubeYCyan} style={styles.iconSquareSize(12)} />
                      <Text style={_styles.sendText}>FREE</Text>
                    </>
                  )}
                </>
              ) : (
                <>
                  <Image source={ICON.megaCubeCyan} style={styles.iconSquareSize(15)} />
                  <Text style={_styles.sendText}>2</Text>
                </>
              )}
              
            </SpaceView>
          </TouchableOpacity>
        </SpaceView>

      </SafeAreaView>
    </Modal>
  );
};



const _styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#3D4348',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  titleBox: {
    paddingVertical: 10,
    paddingHorizontal: 13,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },
  titleText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 13,
    color: '#D5CD9E',
  },
  countText: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
    color: '#445561',
    marginLeft: 3,
  },
  contentBody: {
    flexDirection: 'column',
    alignItems: `center`,
  },
  infoArea: {
    flexDirection: 'column',
  },
  infoText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 13,
    textAlign: 'center',
    color: '#646464',
  },
  infoSubText: {
    fontFamily: 'Pretendard-ExtraBold',
    fontSize: 12,
    color: '#625AD1',
    marginLeft: 1,
  },
  messageArea: {
    width: '100%',
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  bottomBox: {
    width: '100%',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: 'space-between',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  allButton: {
    width: '50%',
    height: 49,
    backgroundColor: '#FFDD00',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
  },
  allButtonText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 16,
    color: '#3D4348',
  },
  inputStyle: {
    width: '100%',
    height: 100,
    maxHeight: 100,
    borderRadius: 10,
    padding: 8,
    textAlignVertical: 'top',
    backgroundColor: '#445561',
    color: '#F3E270',
    fontFamily: 'Pretendard-Regular',
    fontSize: 12,
  },
  checkWrap: (isOn:boolean) => {
    return {
      backgroundColor: '#292F33',
      //paddingHorizontal: 22,
      paddingVertical: 5,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center',
      width: '50%',
    };
  },
  labelText: (isOn:boolean) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: 15,
      color: isOn ? '#FFDD00' : '#445561',
      textAlign: 'center',
      width: (width / 5) - 8,
    };
  },
  btnContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 10,
  },
  btnStyle: (bgcr: string) => {
    return {
      fontFamily: 'Pretendard-Bold',
      fontSize: 15,
      color: '#3D4348',
      backgroundColor: isEmptyData(bgcr) ? bgcr : '#FFFFFF',
      borderRadius: 8,
      paddingVertical: 4,
      width: 110,
      textAlign: 'center',
      marginHorizontal: 3,
      overflow: 'hidden',
    };
  },
  numberText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 11,
    color: '#E1DFD1',
  },
  sendEtc: {
    position: 'absolute',
    top: -10,
    right: 0,
    backgroundColor: '#292F33',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  sendText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    color: '#32F9E4',
  },



  // closeBtnArea: {
  //   position: 'absolute',
  //   top: -8,
  //   right: -5,
  //   zIndex: 1,
  // },
});
