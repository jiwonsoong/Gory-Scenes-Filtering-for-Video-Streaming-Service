# 영상 내 잔인한 장면 필터링 시스템
- 동영상 속 피를 감지하고 블러 처리함으로써, 잔인한 장면들을 필터링한 동영상 제공하는 시스템입니다.
- 크롬 확장프로그램으로 구현되어 유튜브 동영상 페이지 내에서 기능을 사용할 수 있습니다.<br/><br/>

## 기술스택
### Model
- **YOLOv8s-seg**(객체 감지 & 세그멘테이션)
- **Pytorch**(이미지 처리 및 모델 학습)
  
### Backend
- **Flask**
- **Python**
- 라이브러리: **Pytorch**(모델 로드·실행), **Opencv**(이미지 캡쳐·처리), **Yt-dlp**(스트리밍 url 추출), **Ffmpeg**(비디오 파일 변환·스트리밍), **Supervision**(블러 처리)
  
### Frontend
- **Javascript, Html, Css**

<br/>


## 시스템 구조
<img src="https://github.com/user-attachments/assets/02997ffd-b47e-479f-8e85-83b70eafaf3e" width="500"/>
<br/>


## 작동 예시
![image](https://github.com/user-attachments/assets/5db27dac-62c3-4d14-873e-90c6fad570c5)<br/>
![image](https://github.com/user-attachments/assets/f81b0d54-034a-440f-91e0-de047533589e)
<br/>

