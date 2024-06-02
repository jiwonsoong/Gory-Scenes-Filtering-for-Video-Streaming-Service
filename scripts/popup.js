const BASE_URL = 'https://ffe3-119-194-21-72.ngrok-free.app';

// createVideo ID element를 취득
const createVideoButton = document.getElementById("createVideo");
const loadingIndicator = document.getElementById("loading");
const viewVideoButton = document.getElementById("viewVideo");

// 동영상 생성 버튼 이벤트 리스너
createVideoButton.addEventListener("click", async () => {
    // 나중에 캐시 확인하는 거 해야 함

    chrome.tabs.query({active: true, currentWindow: true}, async (tabs) => {
        var currentTab = tabs[0];  // 현재 활성 탭
        var currentTabUrl = currentTab.url; // 현재 탭의 URL
        
        if (currentTabUrl.includes("https://www.youtube.com/watch")) {
            var video_id = currentTabUrl.split('=')[1]; // 현재 탭 youtube video id
            const url = `${BASE_URL}/api/data?videoId=${encodeURIComponent(video_id)}`;
            
            createVideoButton.classList.add('hidden'); // 버튼 숨기기
            loadingIndicator.classList.remove('hidden'); // 로딩 인디케이터 보여주기
            var today = new Date();
            alert(today);

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                // const blob = await response.blob(); // 서버로부터 받은 비디오 데이터를 Blob으로 변환
                // const videoUrl = URL.createObjectURL(blob);  // Blob 객체로부터 URL 생성

                const data = await response.json(); // 서버로부터 URL을 JSON 형태로 받음
                const videoUrl = data.videoUrl; // JSON에서 URL 추출

                // 비디오 URL 저장 및 버튼 보이기
                viewVideoButton.dataset.videoUrl = videoUrl;
                viewVideoButton.classList.remove('hidden');
                var today = new Date();
                alert(today);

            } catch (error) {
                console.error('Error starting the stream:', error);
                alert(`Error: ${error}`);
            } finally {
                loadingIndicator.classList.add('hidden');
            }
        } else {
            // 유튜브 탭 아니면 알림 문구 띄우기
            alert("유튜브 동영상 페이지 내에서 시도해주세요.");
        }
    })
});

// 비디오 보기 버튼 이벤트 리스너
viewVideoButton.addEventListener("click", () => {
    //alert(1);
    if (viewVideoButton.dataset.videoUrl) {
        //alert(2);
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {

            chrome.tabs.sendMessage(tabs[0].id, {
                action: 'showVideo',
                url: viewVideoButton.dataset.videoUrl
            }, response => {
                if (chrome.runtime.lastError) {
                    alert(chrome.runtime.lastError.message);
                    //alert(4);
                }
                console.log('Video shown with response:', response);
                //alert(5);
            });

        });
    }
});