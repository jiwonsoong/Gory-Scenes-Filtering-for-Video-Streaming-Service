// const BASE_URL = 'https://c62a-61-98-214-250.ngrok-free.app';
const BASE_URL = 'http://127.0.0.1:5000';


// 페이지 로드 시 비디오 태그를 추가하고 숨긴다.
var interval1 = setInterval(function() {
    var targetElement = document.getElementById("below");
    if (targetElement) {
        // video를 감싸는 div 생성
        var newVideoFrame = document.createElement("div");
        newVideoFrame.setAttribute('id', 'player2');
        newVideoFrame.classList.add("style-scope");
        newVideoFrame.classList.add("ytd-watch-flexy");

        // video 생성
        const newVideo = document.createElement("video");
        newVideo.setAttribute('id', 'ullalalala');
        //newVideo.classList.add("video-stream");
        //newVideo.classList.add("html5-main-video");
        newVideo.setAttribute('controls', '');  // 비디오 컨트롤러 추가
        newVideo.autoplay = false;  // 비디오 자동 재생 설정
        
        // **css확인중: 이 부분 되돌리기
        // newVideo.style.display = 'none'; // 처음에는 비디오를 숨김
        
        const source = document.createElement('source');
        source.setAttribute('type', 'video/mp4');  // 적절한 MIME 타입 설정
        newVideo.appendChild(source);

        // **css확인중: 이 부분 지우기
        newVideo.querySelector('source').src = 'http://127.0.0.1:5000/static/output_FJyxYf3UH6A.mp4';


        // DOM에 삽입
        // console.log(targetElement);
        newVideoFrame.appendChild(newVideo);
        targetElement.before(newVideoFrame); //여기 수정
        console.log('Video inserted successfully');
        clearInterval(interval1); // 조건이 충족되면 setInterval을 종료합니다.
    }
    else {
        console.log("While adding video: Cannot read property.");
    }
}, 1000);


// 버튼 추가 
var interval2 = setInterval(function() {
    var targetElement = document.getElementById("owner");
    if (targetElement) {
        // 코드 실행
        var btnframe = document.createElement("div");
        btnframe.classList.add("ulala-btn-frame")

        var button = document.createElement("button");
        button.classList.add("ulala-btn");
        button.classList.add("btn-14");
        button.textContent = "😶";


        // 버튼 클릭 이벤트 추가
        button.addEventListener("click", async () => {
            console.log("Button is clicked.");
        
            var currentUrl = window.location.href;
            var video_id = currentUrl.split('=')[1]; // 현재 탭 youtube video id
            const url = `${BASE_URL}/api/data?videoId=${encodeURIComponent(video_id)}`;
        
            try {
                var today = new Date();
                console.log("요청 시각: ", today);
                // 로딩 & 예상 대기 시간 화면 있으면 좋음

                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                // console.log(await response.text());

                console.log("response: ", response);

                // const blob = await response.blob(); // 서버로부터 받은 비디오 데이터를 Blob으로 변환
                // const videoUrl = URL.createObjectURL(blob);  // Blob 객체로부터 URL 생성

                const data = await response.json(); // 서버로부터 URL을 JSON 형태로 받음
                console.log("data: ", data);
                const videoUrl = data.videoUrl; // JSON에서 URL 추출
                console.log("서버에서 받은 url: ", videoUrl);

                // 비디오 보이기
                // const fullVideoUrl = BASE_URL + videoUrl;
                // console.log("수정한 url: ", fullVideoUrl);
                const newVideo = document.querySelector('#ullalalala');
                newVideo.querySelector('source').src = videoUrl;
                newVideo.load();  // 비디오를 다시 로드하여 변경사항을 적용한다.
                newVideo.style.display = '';  // 비디오를 보이게 한다.
                console.log("Video is now visible.");

                today = new Date();
                console.log("응답 시각: ", today);
        
            } catch (error) {
                console.error('Error starting the stream:', error);
                alert(`Error: ${error}`);
            } finally {
                // loadingIndicator.classList.add('hidden');
            }
        });

        button.addEventListener('mouseover', function() {
            this.textContent = '😎'; // New Text
        });
        button.addEventListener('mouseout', function() {
            this.textContent = '😶'; // Original Text
        });


        btnframe.appendChild(button);
        targetElement.appendChild(btnframe);
        console.log('Button inserted successfully');
        clearInterval(interval2); // 조건이 충족되면 setInterval을 종료합니다.
    }
    else {
        console.log("While adding button: Cannot read property.");
    }
}, 1000); // 1초 간격으로 실행

