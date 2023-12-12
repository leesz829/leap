import { Color } from 'assets/styles/Color';
import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  ImageBackground,
  FlatList
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { findSourcePath, ICON, IMAGE } from 'utils/imageUtils';
import { get_order_list } from 'api/models';
import { SectionGrid } from 'react-native-super-grid';
import { useUserInfo } from 'hooks/useUserInfo';
import { TextInput } from 'react-native-gesture-handler';
import { CommaFormat } from 'utils/functions';
import { CommonLoading } from 'component/CommonLoading';
import SpaceView from 'component/SpaceView';
import { useNavigation } from '@react-navigation/native';
import { ScreenNavigationProp } from '@types';
import { ROUTES, STACK } from 'constants/routes';
import { useProfileImg } from 'hooks/useProfileImg';
import { layoutStyle } from 'assets/styles/Styles';
import { Slider } from '@miblanchard/react-native-slider';


const DATA = [
  {
    title: '23/03/01',
    data: ['PizzaPizza', 'BurgerBurger', 'RisottoRisotto'],
  },
];

export default function MileageOrder() {
  const me = useUserInfo();
  const mbrProfileImgList = useProfileImg();

  const [memberAddr, setMemberAddr] = useState('');
  const [orderList, setOrderList] = useState([]);
  const [orderStatus, setOrderStatus] = useState({
    order_complet: 0,
    bid_fail: 0,
    bid_success: 0,
    dlvr: 0
  });

  const [isLoading, setIsLoading] = useState(false);

  const [currentIndex, setCurrentIndex] = React.useState(0);

  useEffect(() => {
    
    async function fetch() {
      setIsLoading(true);

      try {
        // 주문 목록 조회
        const body = {};
        const { success: sp, data: pd } = await get_order_list(body);
        if (sp) {
          setOrderList(pd?.order_list);
          setOrderStatus(pd?.order_status_count);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setIsLoading(false);
      }

    }
    fetch();
  }, []);

  const handleScroll = (event) => {
    let contentOffset = event.nativeEvent.contentOffset;
    let index = Math.floor(contentOffset.x / 300);
    setCurrentIndex(index);
  };

  return (
    <>
      {isLoading && <CommonLoading />}

      <CommonHeader
        title={'주문 내역'}
        backIcon={ICON.back}
        walletTextStyle={{ color: 'white' }} />

        <LinearGradient
          colors={['#3D4348', '#1A1E1C']}
          style={{ minHeight: Dimensions.get('window').height }}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.paddingBox}>
            <SpaceView mb={10} viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
              <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={styles.profileImg} />
              <Text style={styles.nameText}>{me?.nickname}</Text>
            </SpaceView>
            
            {me?.respect_grade == 'PLATINUM' || me?.respect_grade == 'DIAMOND' &&
              <SpaceView viewStyle={styles.floatWrapper}>
                <LinearGradient
                  colors={['#7AAEDB', '#608B55']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{borderRadius: 10, paddingVertical: 10}}>

                  <LinearGradient
                    colors={['#C9F0FF', me?.respect_grade == 'DIAMOND' ? '#FCF9E4' : '#C9F0FF']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.respectLine}>
                      <Image source={ICON.sparkler} style={{width: 15, height: 15}} />
                      <Text style={styles.repectGrade}>{me?.respect_grade}</Text>
                  </LinearGradient>

                  <SpaceView mt={20} pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.justifyBetween]}>
                    <SpaceView mt={25} ml={15}>
                      <Image source={ICON.icChip} style={{width: 40, height: 40}} />
                    </SpaceView>

                    <SpaceView ml={20}>
                      <Text style={styles.respectTitle}>닉네임</Text>
                      <Text style={styles.respectNickname}>{me?.nickname}</Text>
                    </SpaceView>

                    <SpaceView>
                      <Text style={styles.respectTitle}>보유RP</Text>
                      <Text style={styles.rpAmtText}>
                        {CommaFormat(me?.mileage_point)}
                        <Text style={styles.rpText}>RP</Text>
                      </Text>
                      <Text style={styles.rpAvailable}>이달 사용 가능한 RP</Text>

                      {/* ################################################################################ 이달 사용 RP 영역 */}
                      <SpaceView mt={5}>
                        <SpaceView>
                          <SpaceView viewStyle={{overflow: 'hidden', borderRadius: 50}}>
                            <LinearGradient
                              colors={['#32F9E4', '#32F9E4']}
                              start={{ x: 1, y: 0 }}
                              end={{ x: 0, y: 0 }}
                              style={styles.gradient(me?.mileage_point / 10000)}>
                            </LinearGradient>
                            <Slider
                              animateTransitions={true}
                              renderThumbComponent={() => null}
                              containerStyle={styles.sliderContainerStyle}
                              trackStyle={styles.sliderThumbStyle}
                              trackClickable={false}
                              disabled
                            />
                          </SpaceView>
                          <Text style={styles.gradeTitle}>5,500RP 남음</Text>
                        </SpaceView>
                      </SpaceView>
                    </SpaceView>
                  </SpaceView>

                  <SpaceView pl={15} pr={15} viewStyle={[layoutStyle.row, layoutStyle.alignEnd, layoutStyle.justifyBetween]}>
                    <Image source={IMAGE.logoLeapTit} style={{width: 60, height: 25}} />
                    <Text style={styles.rpDescText}>RP는 획득 건 별로 60일 동안 보관됩니다.</Text>
                  </SpaceView>
                </LinearGradient>
              </SpaceView>
            }
          </View>
                

        {orderList.length > 0 ? (
          <FlatList
            /* onScroll={handleScroll}
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            horizontal={false} */
            style={{marginBottom: 180}}
            data={orderList}
            renderItem={(data) => <RenderItem data={data} />}
          />
        ) : (
          <>
            <View style={styles.line} />

            <SpaceView viewStyle={{justifyContent: 'center', alignItems: 'center', height: 150}}>
              <Text style={{fontFamily: 'Pretendard-Medium', color: '#D5CD9E'}}>주문 내역이 없습니다.</Text>
            </SpaceView>
          </>
        )}
        </LinearGradient>
    </>
  );
}

const RenderItem = ({ data }) => {
  const navigation = useNavigation<ScreenNavigationProp>();

  const dateStr = data.item.title.replace(/\//g, '.');
  const prodList = data.item.data;

  const onPressMileageOrder = () => {
    navigation.navigate(STACK.COMMON, { screen: ROUTES.Mileage_History });
  };

  return (
    <>
      <View style={styles.dateTitle}>
        <Text style={[styles.dateText]}>{dateStr}</Text>
      </View>

      {prodList.map((item, idx) => (
        <TouchableOpacity
          onPress={() => {
            if(item.order_type == 'AUCT'){
              onPressMileageOrder();
            }
          }}
        >
          <View style={styles.itemBox} key={'order_item_' + idx}>
            <SpaceView viewStyle={styles.thumbArea}>
              <ImageBackground source={findSourcePath(item?.file_path + item?.file_name)} style={styles.thumb}>
                {/* 분기 */}

                {item.status_code == 'COMPLET' ? (
                  <View style={styles.completeMark}>
                    <Text style={styles.completeText}>판매완료</Text>
                  </View>
                ) : null}

                {/* 주문목록 상태 노출 */}
                {/* <View style={styles.bidCompleteMark}>
                  <Text style={styles.bidCompleteText}>입찰완료</Text>
                </View>
                <View style={styles.readyMark}>
                  <Text style={styles.readyText}>발송준비</Text>
                </View>
                <View style={styles.completeMark}>
                  <Text style={styles.completeText}>배송완료</Text>
                </View> */}
                
              </ImageBackground>
            </SpaceView>

            <SpaceView viewStyle={styles.brandLogo}>
                <Image source={ICON.naverLogo} style={{width: 20, height: 20}} />
            </SpaceView>
            <View style={styles.itemInfoBox}>
              <SpaceView viewStyle={styles.priceBox}>
                <Text style={styles.price}>{CommaFormat(item?.buy_price)}RP</Text>
              </SpaceView>
              <Text style={styles.title}>{item.prod_name}</Text>

                {/* 조건부 */}
                {item.invc_num != null ? (
                  <View style={styles.copyCode}>
                    <Text style={styles.copyText}>송장번호 복사</Text>
                  </View>
                ) : null}
                {/* 조건부 */}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </>
  );
};







{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const styles = StyleSheet.create({
  paddingBox: {
    paddingHorizontal: 16,
    //marginTop: 20,
  },
  nameText: {
    //marginTop: 25,
    fontFamily: 'Pretendard-Medium',
    fontSize: 24,
    color: '#FFDD00',
  },
  profileImg: {
    width: 30,
    height: 30,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: '#FFDD00',
    marginRight: 5,
  },
  amountText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 32,
    color: '#32F9E4',
  },
  line: {
    height: 1,
    backgroundColor: '#ABA99A',
    marginTop: 40,
  },
  dateText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 24,
    textAlign: 'left',
    color: '#F3E270',
  },
  itemBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  thumbArea: {
    width: Dimensions.get('window').width * 0.2,
    height: Dimensions.get('window').width * 0.2,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumb: {
    width: Dimensions.get('window').width * 0.15,
    height: Dimensions.get('window').width * 0.1,
    borderRadius: 5,
    backgroundColor: '#d1d1d1',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 7,
  },
  bidCompleteMark: {
    width: '50%',
    borderRadius: 6.5,
    backgroundColor: '#742dfa',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    padding: 2,
  },
  bidCompleteText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 9,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ffffff',
  },
  readyMark: {
    width: '50%',
    borderRadius: 6.5,
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#ada9fc',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    padding: 2,
  },
  readyText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 7,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#ada9fc',
  },
  completeMark: {
    width: '50%',
    borderRadius: 6.5,
    backgroundColor: '#f2f2f2',
    flexDirection: `row`,
    alignItems: `center`,
    justifyContent: `center`,
    padding: 2,
  },
  completeText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 7,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0,
    textAlign: 'left',
    color: '#888888',
  },
  itemInfoBox: {
    flexDirection: 'column',
    justifyContent: 'flex-end',
    //width: Dimensions.get('window').width * 0.75 - 48,
    marginLeft: 10,
  },
  brandLogo: {
    position: 'absolute',
    left: 15,
    top: 15,
    width: 20,
    height: 20,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Pretendard-Light',
    fontSize: 14,
    color: '#D5CD9E',
    marginTop: 5,
  },
  priceBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 2,
    paddingHorizontal: 10,
  },
  price: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 11,
    color: '#32F9E4',
  },
  copyCode: {
    borderRadius: 5,
    backgroundColor: '#ffffff',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#742dfa',
    padding: 4,
  },
  copyText: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 9,
    fontWeight: 'normal',
    fontStyle: 'normal',
    letterSpacing: 0, 
    textAlign: 'left',
    color: '#742cf9',
  },
  dateTitle: {
    alignItems: 'flex-end',
    marginTop: 25,
    marginRight: 20,
    marginBottom: 10,
    borderBottomColor: '#ABA99A',
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  itemDescArea: {
    paddingVertical: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  itemDescText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 12,
    color: '#ABA99A',
    textAlign: 'center',
    marginTop: 40,
  },

  floatWrapper: {
      width: '100%',
      marginTop:10,
  },
  rpStoreBtn: {
    backgroundColor: '#FFF',
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 2,
  },
  respectLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    height: 35,
    marginTop: 15,
  },
  repectGrade: {
    fontFamily: 'MinSans-Bold',
    color: '#000000',
    marginRight: 10,
    marginLeft: 2,
  },
  respectTitle: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    color: '#333B41',
  },
  respectNickname: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    color: '#FFF',
  },
  rpAvailable: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 10,
    color: '#333B41',
    marginTop: 15,
  },
  rpText: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 17,
    color: '#32F9E4',
  },
  rpAmtText: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 32,
    color: '#32F9E4',
  },
  gradeTitle: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#32F9E4',
    textAlign: 'right',
  },
  gradient: (value:any) => {
    let percent = 0;

    if(value != null && typeof value != 'undefined') {
      percent = value * 100;
    };

    return {
      position: 'absolute',
      width: percent + '%',
      height: 12,
      zIndex: 1,
      borderRadius: 20,
    };
  },
  sliderContainerStyle: {
    height: 12,
    borderRadius: 50,
    backgroundColor: '#FFF',
  },
  sliderThumbStyle: {
    height: 12,
    borderRadius: 50,
    backgroundColor: '#FFF',
  },
  rpDescText: {
    fontFamily: 'Pretendard-Light',
    fontSize: 10,
    color: '#D5CD9E',
  },
});
