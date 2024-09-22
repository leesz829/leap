import React, { createContext, useContext, useState } from 'react';
import { BasePopup } from 'screens/commonpopup/context/BasePopup';
import { GuidePopup } from 'screens/commonpopup/context/GuidePopup';
import { EventPopup } from 'screens/commonpopup/context/EventPopup';
import { ResponsivePopup } from 'screens/commonpopup/context/ResponsivePopup';
import { PromotionPopup } from 'screens/commonpopup/context/PromotionPopup';
import { OpenProfilePopup } from 'screens/commonpopup/context/OpenProfilePopup';
import { SelectPopup } from 'screens/commonpopup/context/SelectPopup';
import { MatchPopup } from 'screens/commonpopup/context/MatchPopup';

export const PopupContext = createContext({} as any);

interface PopupContextProps {
  title: string | undefined; // 제목
  content: string | undefined; // 내용
  subContent: string | undefined; // 부가 내용
  confirmCallback: Function | undefined; // 확인 콜백 함수
  cancelCallback: Function | undefined; // 취소 콜백 함수
  confirmBtnText: string | undefined; // 확인 버튼 텍스트
  cancelBtnText: string | undefined; // 취소 버튼 텍스트
  type: string | undefined; // 팝업 유형
  guideType: string | undefined; // 가이드 팝업 유형
  guideSlideYn: string | undefined; // 가이드 팝업 슬라이드 여부
  guideNexBtnExpoYn: string | undefined; // 가이드 팝업 그만보기 버튼 노출 여부
  btnExpYn: string | undefined; // 버튼 노출 여부
  eventType: string | undefined; // 이벤트 팝업 유형
  etcCallback: Function | undefined; // 기타 콜백 함수
  popupDuration: any | undefined; // 팝업 지속 시간
  dataList: any | undefined; // 데이터 목록
  passType: string | undefined; // 패스 종류
  passAmt: string | undefined; // 패스 금액
  isCross: boolean | undefined; // 교차 여부
  memberImg: string | undefined; // 회원 이미지
  btnIcon: string | undefined; // 버튼 아이콘
  isNoPass: boolean | undefined; // 패스 금액 부족 여부
}

export const PopupProvider = ({ children }: any) => {
  const [visible, setVisible] = useState(false);
  const [visibleResponsive, setVisibleResponsive] = useState(false);
  const [visibleCross, setVisibleCross] = useState(false);
  const [contents, setContents] = useState<PopupContextProps>({
    title: '',
    content: '',
    subContent: '',
    confirmCallback: undefined,
    cancelCallback: undefined,
    confirmBtnText: '',
    cancelBtnText: '',
    type: '',
    guideType: '',
    guideSlideYn: '',
    guideNexBtnExpoYn: '',
    btnExpYn: '',
    eventType: '',
    etcCallback: undefined,
    popupDuration: undefined,
    dataList: [],
    passType: '',
    passAmt: '',
    isCross: false,
    memberImg: '',
    btnIcon: '',
    isNoPass: false,

  });

  function show(content: PopupContextProps) {
    if(content.type == 'RESPONSIVE') {
      setVisibleResponsive(true);
    } else {
      if(content.isCross) {
        setVisibleCross(true);
      } else {
        setVisible(true);
      }
    }
    setContents(content);
  }
  function hide(content: PopupContextProps) {
    if(content.isCross) {
      setVisibleCross(true);
    } else {
      setVisible(false);
    }
    
    setContents({
      title: '',
      content: '',
      subContent: '',
      confirmCallback: undefined,
      cancelCallback: undefined,
      confirmBtnText: '',
      cancelBtnText: '',
      type: '',
      guideType: '',
      guideSlideYn: '',
      guideNexBtnExpoYn: '',
      btnExpYn: '',
      eventType: '',
      etcCallback: undefined,
      popupDuration: undefined,
      dataList: [],
      passType: '',
      passAmt: '',
      isCross: false,
      memberImg: '',
      btnIcon: '',
      isNoPass: false,
    });
  }

  return (
    <PopupContext.Provider value={{ show, hide }}>
      {children}

      {contents.type == 'GUIDE' ? (
        <GuidePopup
          popupVisible={visible}
          setPopupVIsible={setVisible}
          confirmCallbackFunc={contents.confirmCallback}
          guideType={contents.guideType}
          guideSlideYn={contents.guideSlideYn}
          guideNexBtnExpoYn={contents.guideNexBtnExpoYn}
        />
      ) : contents.type == 'EVENT' ? (
        <EventPopup
          popupVisible={visible}
          setPopupVIsible={setVisible}
          confirmCallbackFunc={contents.confirmCallback}
          eventType={contents.eventType}
          eventPopupList={contents.dataList}
          etcCallbackFunc={contents.etcCallback}
        />
      ) : contents.type == 'RESPONSIVE' ? (
        <ResponsivePopup
          popupVisible={visibleResponsive}
          setPopupVIsible={setVisibleResponsive}
          text={contents.content}
          subText={contents.subContent}
          duration={contents.popupDuration}
        />
      ) : contents.type == 'PROMOTION' ? (
        <PromotionPopup
          popupVisible={visible}
          setPopupVIsible={setVisible}
          confirmCallbackFunc={contents.confirmCallback}
          prodList={contents.dataList}
          etcCallbackFunc={contents.etcCallback}
        />
      ) : contents.type == 'OPEN' ? (
        <OpenProfilePopup
          popupVisible={!contents.isCross ? visible : visibleCross}
          setPopupVIsible={setVisible}
          confirmCallbackFunc={contents.confirmCallback}
          cancelCallbackFunc={contents.cancelCallback}
          passAmt={contents.passAmt}
          passType={contents.passType}
        />
      ) : contents.type == 'SELECT' ? (
        <SelectPopup
          popupVisible={!contents.isCross ? visible : visibleCross}
          setPopupVIsible={setVisible}
          title={contents.title}
          dataList={contents.dataList}
          confirmCallbackFunc={contents.confirmCallback}
          cancelCallbackFunc={contents.cancelCallback}
        />
      ) : contents.type == 'MATCH' ? (
        <MatchPopup
          popupVisible={!contents.isCross ? visible : visibleCross}
          setPopupVIsible={!contents.isCross ? setVisible : setVisibleCross}
          title={contents.title}
          text={contents.content}
          isConfirm={
            typeof contents.confirmCallback != 'undefined' &&
            typeof contents.cancelCallback != 'undefined'
          }
          confirmCallbackFunc={contents.confirmCallback}
          cancelCallbackFunc={contents.cancelCallback}
          confirmBtnText={contents.confirmBtnText}
          passType={contents.passType}
          passAmt={contents.passAmt}
          memberImg={contents.memberImg}
          btnIcon={contents.btnIcon}
          isNoPass={contents.isNoPass}
        />
      ) : (
        <BasePopup
          popupVisible={!contents.isCross ? visible : visibleCross}
          setPopupVIsible={!contents.isCross ? setVisible : setVisibleCross}
          title={contents.title}
          text={contents.content}
          subText={contents.subContent}
          isConfirm={
            typeof contents.confirmCallback != 'undefined' &&
            typeof contents.cancelCallback != 'undefined'
          }
          confirmCallbackFunc={contents.confirmCallback}
          cancelCallbackFunc={contents.cancelCallback}
          confirmBtnText={contents.confirmBtnText}
          cancelBtnText={contents.cancelBtnText}
          btnExpYn={contents.btnExpYn}
          passType={contents.passType}
          passAmt={contents.passAmt}
          type={contents.type}
          memberImg={contents.memberImg}
          isNoPass={contents.isNoPass}
        />
      )}
    </PopupContext.Provider>
  );
};

export const usePopup = () => {
  const { show, hide } = useContext(PopupContext);
  return { show, hide };
};
