const BASE_URL = 'https://ffe3-119-194-21-72.ngrok-free.app';

var interval = setInterval(function() {
    var targetElement = document.getElementById("owner");
    if (targetElement) {
        // 코드 실행
        var newframe = document.createElement("div");
        newframe.classList.add("ulala-frame")

        var button = document.createElement("button");
        button.classList.add("ulala-btn");
        button.classList.add("btn-16");
        button.textContent = "블러 처리";


        // 버튼 클릭 이벤트 추가
        button.addEventListener("click", async () => {
            // 나중에 캐시 확인하는 거 해야 함
            console.log("Button is clicked.");
        
            var currentUrl = window.location.href;
            var video_id = currentUrl.split('=')[1]; // 현재 탭 youtube video id
            const url = `${BASE_URL}/api/data?videoId=${encodeURIComponent(video_id)}`;
            // img source 변경
        
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const blob = await response.blob(); // 서버로부터 받은 비디오 데이터를 Blob으로 변환
                const videoUrl = URL.createObjectURL(blob);  // Blob 객체로부터 URL 생성
        
                // 비디오 URL 저장 및 버튼 보이기
                viewVideoButton.dataset.videoUrl = videoUrl;
                viewVideoButton.classList.remove('hidden');
        
            } catch (error) {
                console.error('Error starting the stream:', error);
                alert(`Error: ${error}`);
            } finally {
                // loadingIndicator.classList.add('hidden');
            }
        });

        newframe.appendChild(button);
        targetElement.appendChild(newframe);
        console.log('Button inserted successfully');
        clearInterval(interval); // 조건이 충족되면 setInterval을 종료합니다.
    }
    else {
        console.log("cannot read owner");
    }
}, 1000); // 1초 간격으로 실행


// 페이지 로드 시 비디오 태그를 추가하고 숨긴다.
const article = document.querySelector("#content");
if (article) {
    const newVideo = document.createElement("video");

    newVideo.setAttribute('width', '640');
    newVideo.setAttribute('height', '480');
    newVideo.setAttribute('controls', '');  // 비디오 컨트롤러 추가
    newVideo.setAttribute('id', 'ullalalala');
    newVideo.autoplay = false;  // 비디오 자동 재생 설정
    newVideo.style.display = 'none'; // 처음에는 비디오를 숨김
    
    const source = document.createElement('source');
    // source.setAttribute('src', chrome.runtime.getURL('tmp/testvideo.mp4'));
    source.setAttribute('type', 'video/mp4');  // 적절한 MIME 타입 설정
    newVideo.appendChild(source);

    // 비디오 태그 추가
    article.insertAdjacentElement("beforebegin", newVideo);
    console.log('Video inserted successfully');
    
}
else {
    console.log('Article element not found');
}


// popup.js로부터 비디오 url을 수신하여 해당 url을 'source'태그의 'src'속성에 설정한다.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message recieved:", message)
    if (message.action === 'showVideo' && message.url) {

        const fullVideoUrl = BASE_URL + message.url; // 0601추가햇음
        console.log("Full video url: ", fullVideoUrl);

        const video = document.querySelector('#ullalalala');
        video.querySelector('source').src = fullVideoUrl;
        video.load();  // 비디오를 다시 로드하여 변경사항을 적용한다.
        video.style.display = '';  // 비디오를 보이게 한다.
        sendResponse({status: 'Video is now visible'});
    }
})


// const createVideoButton = document.getElementById("hellohello");
// createVideoButton.addEventListener("click", async () => {
//     // 나중에 캐시 확인하는 거 해야 함
//     console.log("d.");

//     var video_id = currentTab.url.split('=')[1]; // 현재 탭 youtube video id
//     const url = `${BASE_URL}/api/data?videoId=${encodeURIComponent(video_id)}`;
//     // img source 변경
//     createVideoButton.src = '';

//     try {
//         const response = await fetch(url);
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const blob = await response.blob(); // 서버로부터 받은 비디오 데이터를 Blob으로 변환
//         const videoUrl = URL.createObjectURL(blob);  // Blob 객체로부터 URL 생성

//         // 비디오 URL 저장 및 버튼 보이기
//         viewVideoButton.dataset.videoUrl = videoUrl;
//         viewVideoButton.classList.remove('hidden');

//     } catch (error) {
//         console.error('Error starting the stream:', error);
//         alert(`Error: ${error}`);
//     } finally {
        // loadingIndicator.classList.add('hidden');
//     }
// });