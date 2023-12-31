import React, { useRef } from 'react';
import type { FC, useState, useEffect } from 'react';
import { CommonText } from 'component/CommonText';
import { Text } from 'react-native';
import { StyleSheet } from 'react-native';

interface Props {
	
}

export const Privacy : FC<Props> = (props) => {
	
	return (
		
		<CommonText type={'h5'}>
			리미티드 서비스(이하 ‘서비스’)를 제공하는 주식회사 앱스쿼드 (이하 ‘회사’)는 개인정보 보호법 제30조에 의거, 정보통신망 이용촉진 및 정보보호 등에 관한 법률 등 정보통신 서비스제공자가 준수하여야 할 관련 법령상의 개인정보보호 규정을 준수하며, 회사는 관계 법령에서 규정하고 있는 책임과 의무를 준수하고 실천하기 위해 최선의 노력을 하고 있습니다.
			{'\n'}{'\n'}
			회사의 개인정보 취급방침은 다음과 같은 내용을 담고 있습니다.
			{'\n'}{'\n'}
			<Text style={_styles.textBold}>1. 수집하는 이용자의 개인정보</Text>
			{'\n'}{'\n'}
			회사는 본 서비스 제공을 위해 필요한 개인정보를 수집하고 있습니다.
			{'\n'}{'\n'}
			필수항목
			{'\n'}{'\n'}
			- 필수입력 정보:
			이메일 주소(ID), 비밀번호, 성명, 생년월일, 휴대전화번호, 성별 
			{'\n'}{'\n'}
			- 프로필 작성 및 서비스 이용 과정에서 추가 수집 정보:
			닉네임, 거주지역 및 활동지역, 직업, 학력, 사진, 취미, 흡연 여부, 음주 여부, 키, 체형, 종교, 인터뷰 설문, 관심사, 등 2차 인증 자료, 지인 피하기 활성화를 위한 주소록 정보, 구매 정보, 게시글 내용, 문의 내역 등 서비스 이용 과정에서 생성된 개인정보
			{'\n'}{'\n'}
			- 자동수집 항목: 
			접속 IP주소, 접속 기기 정보
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>2. 개인정보의 수집 및 이용목적</Text>
			{'\n'}{'\n'}
			회사는 개인정보를 아래의 목적을 위해 처리합니다. 처리하고 있는 개인정보는 아래의 목적 이외의 용도로는 사용되지 않으며 이용목적이 변경될 때에는 별도의 동의를 받는 등 법령에 따라 필요한 조치를 이행할 예정입니다.
			{'\n'}{'\n'}
			- 서비스 이용 신청에 따른 본인확인, 개인식별, 회원자격 및 회원 레벨을 위한 2차 인증 심사, 불량이용자의 부정 이용방지와 비인가 불법프로그램 사용방지, 서비스 이용 신청 횟수 제한, 서비스 제공, 분쟁 대응을 위한 기록보존, 민원처리, 고지사항 전달{'\n'}
			- 빅 데이터화를 위한 고객 분석 및 관리, 맞춤형 서비스 제공, 서비스 개선 및 신규 서비스 개발, 서비스 이용 통계 및 유효성 확인 목적{'\n'}
			- 이메일, 문자 메시지, 전화, 모바일 앱 푸시 발송 등 다양한 채널을 통한 회사 제품 및 서비스 관련 정보 및 이벤트, 설문 조사 안내 및 관련 정보 제공
			{'\n'}{'\n'}{'\n'}

			<Text style={_styles.textBold}>3. 개인정보의 취급위탁에 관한 사항</Text>
			{'\n'}{'\n'}
			회사는 서비스 향상 및 원활한 개인정보 업무처리를 위하여 다음과 같이 개인정보 처리업무를 위탁하고 있습니다. 위탁업무의 내용이나 수탁자가 변경될 때는 본 방침을 통하여 그 사실을 알리겠습니다.
			{'\n'}{'\n'}
			위·수탁업체:
			{'\n'}{'\n'}
			1) 주식회사 네이버 클라우드 : 최적화된 보안 및 운영 서비스 구축을 위한 서버 관리 업무{'\n'}
			2) 주식회사 나이스 평가정보 : 서비스 가입을 위한 휴대폰 본인인증 업무
			{'\n'}{'\n'}{'\n'}

			<Text style={_styles.textBold}>4. 개인정보의 보유 및 이용 기간</Text>
			{'\n'}{'\n'}
			회사는 개인정보 수집·이용 목적이 충족되거나 개인정보 수집 시 동의받은 개인정보의 보유 및 이용 기간이 지나간 경우 귀하의 개인정보를 바로 파기합니다.
			{'\n'}{'\n'}
			- 회원 탈퇴 시 제출한 각종 2차 인증 자료는 인증 완료 후 바로 파기되며, 이름, 생년월일, 휴대전화 번호는 이용약관 위반으로 인한 부정가입 및 재가입 방지 목적으로 회원 탈퇴 후 6개월까지 보유됨
			{'\n'}{'\n'}
			단, 관련 법령에 따라 보존할 필요가 있는 경우 회사는 관련 법령이 정한 일정한 기간 개인정보를 보관하며 그 보관 목적으로만 이용합니다.
			{'\n'}{'\n'}
			- 「전자상거래 등에서의 소비자 보호에 관한 법률」에 따른 표시·광고, 계약 내용 및 이행 등 거래에 관한 기록{'\n'}
				- 표시·광고에 관한 기록: 6개월{'\n'}
				- 계약 또는 청약 철회, 대금결제, 재화 등의 공급기록: 5년{'\n'}
				- 소비자 불만 또는 분쟁 처리에 관한 기록: 3년
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>5. 개인정보 파기절차 및 방법</Text>
			{'\n'}{'\n'}
			이용자의 개인정보는 원칙적으로 개인정보 수집 및 이용목적이 달성된 후에는 해당 정보를 바로 파기합니다. 파기절차 및 방법은 다음과 같습니다.
			{'\n'}{'\n'}
			1) 파기절차{'\n'}
			이용자가 회원가입 등을 위해 입력하신 정보는 목적이 달성된 후 암호화된 스토리지로 옮겨 안전하게 보관되며, 내부 방침 및 기타 관련 법령에 따른 정보보호 사유에 따라(보유 및 이용 기간 참조) 일정 기간 저장된 후 파기됩니다. 해당 개인정보는 관련 법률에 따라 필요한 경우를 제외하고 일체 다른 목적으로 이용되지 않습니다.{'\n'}{'\n'}
			2) 파기기준{'\n'}
			- 이용자 본인 혹은 법정대리인의 회원 탈퇴 요청{'\n'}
			- 한국인터넷진흥원, 본인확인 기관 등의 개인정보 관련 기관을 통한 회원 탈퇴 요청{'\n'}
			- 개인정보 수집·이용 등에 대한 동의 철회 및 개인정보 삭제 또는 파기 요청{'\n'}
			- 정보통신망법에 따른 장기 미 이용자
			{'\n'}{'\n'}
			3) 파기방법{'\n'}
			- 전자적 파일 형태로 저장된 개인정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제{'\n'}
			- 종이에 출력된 개인정보는 분쇄기로 분쇄하거나 소각을 통하여 파기
			{'\n'}{'\n'}{'\n'}

			<Text style={_styles.textBold}>6. 이용자 개인정보 정확성을 위한 내용</Text>
			{'\n'}{'\n'}
			이용자의 부정확한 개인정보로 인하여 사용상의 불편을 줄 수 있으므로 개인정보 관리자가 판단하기에 확연히 부정확한 개인정보를 기재한 경우에는 정확하지 않은 개인정보를 파기할 수 있습니다.
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>7. 이용자의 개인정보안전을 위해 취해질 수 있는 서비스 일시 중단조치</Text>
			{'\n'}{'\n'}
			회사는 이용자의 안전한 서비스 이용을 위해서 최선을 다하고 있습니다. 그러나 원하지 않는 방법에 따라 회사의 서비스가 훼손을 당하는 경우에는 이용자들의 개인정보보호를 위하여, 문제가 완전하게 해결될 때까지 이용자의 개인정보를 이용한 서비스를 일시 중단할 수도 있습니다.
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>8. 제3 자와의 정보공유 및 제공 관련 내용</Text>
			{'\n'}{'\n'}
			회사는 정보통신망 이용촉진 및 정보보호 등에 관한 법률 제24조의2(개인정보의 제공 동의 등)에 따라 이용자의 동의가 있거나 법률에 특별한 규정이 있는 경우를 제외하고 개인정보를 고지 또는 명시한 범위를 초과하여 이용하거나 제3자에게 제공하지 않습니다.
			또한, 개인정보보호법 제59조(금지행위)에 따라 회사의 서비스 제공을 위하여 개인정보를 취급하거나 취급하였던 자는 다음 각호의 행위를 하지 않습니다.
			{'\n'}{'\n'}
			1) 거짓이나 그 밖의 부정한 수단이나 방법으로 개인정보를 취득하거나 처리에 관한 동의를 받는 행위{'\n'}
			2) 업무상 알게 된 개인정보를 누설하거나 권한 없이 다른 사람이 이용하도록 제공하는 행위{'\n'}
			3) 정당한 권한 없이 또는 허용된 권한을 초과하여 다른 사람의 개인정보를 훼손, 멸실, 변경, 위조 또는 유출하는 행위
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>9. 이용자 및 법정대리인의 권리와 그 행사방법</Text>
			{'\n'}{'\n'}
			- 이용자 및 법정대리인은 언제든지 개인정보 처리에 대한 동의를 철회할 수 있으면, 이용자의 개인정보를 열람, 정정, 처리정지, 삭제를 요청할 수 있습니다.{'\n'}
			- 이용자의 개인정보 조회, 수정을 위해서는 직접 모바일 앱을 통해 수정하시거나, 고객센터 또는 담당자에게 이메일 등을 통해 신청을, 이용해지(동의 철회)를 위해서는 회사가 정하는 탈퇴 신청양식에 따른 고객센터에 이메일 문의 또는 모바일 앱상 온라인 신청을 통하여 계약 해지 및 탈퇴를 할 수 있습니다.{'\n'}
			- 혹은 고객센터나 개인정보 책임자에게 서면 또는 이메일로 연락하시면 바로 조치하겠습니다. 단, 법령에서 정한 의무사항이 있으면 권리 행사가 제한될 수 있습니다.{'\n'}
			- 이용자가 개인정보의 오류에 대한 정정을 요청하신 경우에는 정정을 완료하기 전까지 해당 개인정보를 이용 또는 제공하지 않습니다. 또한, 잘못된 개인정보를 제3 자에게 이미 제공한 경우에는 정정 처리결과를 제3자에게 바로 통지하여 정정이 이루어지도록 하겠습니다.{'\n'}
			- 권리 행사는 정보 주체의 법정대리인이나 위임을 받은 자 등 대리인을 통하여서 하실 수 있습니다. 이 경우 “개인정보 처리방법에 관한 고시(제2020-7호)” 별지 제11호 서식에 따른 위임장을 제출하셔야 합니다.
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>10. 개인정보 자동수집 장치의 설치/운영 및 거부에 관한 사항</Text>
			{'\n'}{'\n'}
			회사는 이용자들에게 특화된 맞춤 서비스를 제공하기 위해서 이용자들의 정보를 저장하고 수시로 불러오는 ‘쿠키(cookie)’를 사용합니다. 쿠키는 웹사이트를 운영하는데 이용되는 서버(HTTP)가 이용자의 컴퓨터 브라우저에 보내는 소량의 정보이며 이용자들의 PC 컴퓨터 내의 하드디스크에 저장되기도 합니다.
			가) 쿠키의 사용 목적
			이용자들의 편리한 기능을 제공하기 위하여 활용되며 해로운 목적으로는 활용되지 않습니다.
			나) 쿠키의 설치/운영 및 거부{'\n'}
			- 이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 따라서, 이용자는 웹브라우저에서 옵션을 설정함으로써 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 아니면 모든 쿠키의 저장을 거부할 수도 있습니다.{'\n'}
			- 쿠키 설정을 거부하는 방법으로는 이용자가 사용하는 웹브라우저의 옵션을 선택함으로써 모든 쿠키를 허용하거나 쿠키를 저장할 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.{'\n'}
			- 설정 방법 예(인터넷 익스플로러의 경우): 웹브라우저 상단의 도구 > 인터넷 옵션 > 개인정보{'\n'}
			- 다만, 쿠키의 저장을 거부할 때는 이용에 어려움이 있을 수 있습니다.
			{'\n'}{'\n'}{'\n'}
			<Text style={_styles.textBold}>11. 개인정보 관리책임자와 담당자의 연락처</Text>
			{'\n'}{'\n'}
			회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 이용자의 불만 처리 및 피해구제 등을 위하여 아래와 같이 개인정보 관리담당자 혹은 담당 부서를 지정하고 있습니다
			{'\n'}{'\n'}
			개인정보 관리책임자{'\n'}
			이름 : 배선일{'\n'}
			직책 : 이사{'\n'}
			전화 : 070-7714-7732{'\n'}
			메일: gksunil1020@gmail.com
			{'\n'}{'\n'}
			기타 개인정보침해에 대한 신고나 상담이 필요하신 경우에는 아래 기관에 문의하시기 바랍니다.
			{'\n'}{'\n'}
			1, 개인정보 침해신고센터{'\n'}
			- 전화번호: 118{'\n'}
			- 홈페이지: https://privacy.kisa.or.kr{'\n'}{'\n'}
			2, 개인정보 분쟁 조정위원회{'\n'}
			- 전화번호: 1833-6972{'\n'}
			- 홈페이지: https://www.kopico.go.kr{'\n'}{'\n'}
			3, 대검찰청 사이버범죄수사단{'\n'}
			- 전화번호 : 1301{'\n'}
			- 홈페이지 : https://www.spo.go.kr{'\n'}{'\n'}
			4, 경찰청 사이버안전국{'\n'}
			- 전화번호 : 182{'\n'}
			- 홈페이지 : https://ecrm.cyber.go.kr

		</CommonText>

	);
};


const _styles = StyleSheet.create({
	textBold: {
		fontFamily: 'AppleSDGothicNeoEB00',
	},
});