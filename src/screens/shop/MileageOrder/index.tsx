import { Color } from 'assets/styles/Color';
import CommonHeader from 'component/CommonHeader';
import React, { useEffect, useState } from 'react';
import { Dimensions, View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ImageBackground, FlatList } from 'react-native';
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
import { layoutStyle, styles } from 'assets/styles/Styles';
import { Slider } from '@miblanchard/react-native-slider';
import MileageInfo from 'component/shop/MileageInfo';


const DATA = [
  {
    title: '23/03/01',
    data: ['PizzaPizza', 'BurgerBurger', 'RisottoRisotto'],
  },
];

const { width, height } = Dimensions.get('window');
export default function MileageOrder() {
  const navigation = useNavigation<ScreenNavigationProp>();
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

      {/* <CommonHeader title={'주문 내역'} walletTextStyle={{ color: 'white' }} /> */}

      <ScrollView>

        <LinearGradient
          colors={['#390D1D', '#390D1D']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={_styles.wrap}>

          <SpaceView mt={40} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
            <TouchableOpacity onPress={() => (navigation.goBack())}>
              <Image source={ICON.backBtnType01} style={styles.iconSquareSize(35)} />
            </TouchableOpacity>

            <SpaceView>
              <Text style={styles.fontStyle('H', 30, '#fff')}>주문내역</Text>
            </SpaceView>
            
            <TouchableOpacity>
              <Image source={ICON.shop_refresh} style={styles.iconSquareSize(35)} />
            </TouchableOpacity>
          </SpaceView>

          <SpaceView mt={35} mb={20}>
            <SpaceView viewStyle={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity>
                <Image source={ICON.orderIcon} style={styles.iconSquareSize(24)} />
              </TouchableOpacity>
              <TouchableOpacity style={{marginLeft: 10}}>
                <Image source={ICON.settingIcon} style={styles.iconSquareSize(24)} />
              </TouchableOpacity>
            </SpaceView>
          </SpaceView>

          <SpaceView>
            {/* <View style={_styles.paddingBox}>
              <SpaceView mb={10} viewStyle={[layoutStyle.row, layoutStyle.alignCenter]}>
                <Image source={findSourcePath(mbrProfileImgList[0]?.img_file_path)} style={_styles.profileImg} />
                <Text style={_styles.nameText}>{me?.nickname}</Text>
              </SpaceView>
              
              <MileageInfo data={me} />
            </View> */}

            {orderList.length > 0 ? (
              <FlatList
                /* onScroll={handleScroll}
                showsHorizontalScrollIndicator={false}
                pagingEnabled={true}
                horizontal={false} */
                style={{marginBottom: 180}}
                data={orderList}
                renderItem={(data) => <RenderItem data={data} /> }
              />
            ) : (
              <>
                <View style={_styles.line} />

                <SpaceView viewStyle={{justifyContent: 'center', alignItems: 'center', height: 150}}>
                  <Text style={styles.fontStyle('B', 20, '#fff')}>주문 내역이 없습니다.</Text>
                </SpaceView>
              </>
            )}
          </SpaceView>
        </LinearGradient>
        
      </ScrollView>
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
      <SpaceView>
        <Text style={[styles.fontStyle('EB', 20, '#fff')]}>{dateStr}</Text>
      </SpaceView>

      <SpaceView mt={15}>
        {prodList.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            onPress={() => {
              if(item.order_type == 'AUCT'){
                onPressMileageOrder();
              }
            }}
          >
            <View style={_styles.itemBox} key={'order_item_' + idx}>
              <SpaceView viewStyle={_styles.thumbArea}>
                <ImageBackground source={findSourcePath(item?.file_path + item?.file_name)} style={styles.iconSquareSize(60)}>
                  {/* 분기 */}

                  {/* {item.status_code == 'COMPLET' ? (
                    <View style={_styles.completeMark}>
                      <Text style={_styles.completeText}>판매완료</Text>
                    </View>
                  ) : null} */}

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

              <SpaceView viewStyle={_styles.brandLogo}>
                <Image source={ICON.naverLogo} style={styles.iconSquareSize(20)} />
              </SpaceView>

              <SpaceView pl={10} viewStyle={{flex: 0.8}}>
                <SpaceView>
                  <SpaceView viewStyle={_styles.priceBox}>
                    <Text style={styles.fontStyle('B', 10, '#FFFF5D')}>{CommaFormat(item?.buy_price)}RP</Text>
                  </SpaceView>
                  <SpaceView mt={5} viewStyle={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    <SpaceView viewStyle={{flex: 0.95}}>
                      <Text style={styles.fontStyle('SB', 15, '#fff')}>{item.brand_name}</Text>
                      <SpaceView mt={5}><Text numberOfLines={2} style={styles.fontStyle('SB', 15, '#C4B6AA')}>{item.prod_name}</Text></SpaceView>
                    </SpaceView>
                    <SpaceView>
                      <TouchableOpacity>
                        <Text style={styles.fontStyle('R', 26, '#fff')}>{'>'}</Text>
                      </TouchableOpacity>
                    </SpaceView>
                  </SpaceView>
                </SpaceView>
                {/* <View style={_styles.itemInfoBox}>
                  {item.invc_num != null ? (
                    <View style={_styles.copyCode}>
                      <Text style={_styles.copyText}>송장번호 복사</Text>
                    </View>
                  ) : null}
                </View> */}
              </SpaceView>
            </View>
          </TouchableOpacity>
        ))}
      </SpaceView>
    </>
  );
};







{/* ################################################################################################################
############### Style 영역
################################################################################################################ */}

const _styles = StyleSheet.create({
  wrap: {
    minHeight: height,
    paddingHorizontal: 10,
  },
  line: {
    height: 1,
    backgroundColor: '#ABA99A',
    marginTop: 40,
  },
  itemBox: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#CFCFCF',
    paddingBottom: 10,
  },
  thumbArea: {
    width: 65,
    height: 65,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 0.2,
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
  brandLogo: {
    position: 'absolute',
    left: 15,
    top: 10,
    width: 20,
    height: 20,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  priceBox: {
    backgroundColor: '#44B6E5',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
});
