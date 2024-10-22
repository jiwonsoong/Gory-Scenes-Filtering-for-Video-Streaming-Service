/**
 * 기능: 
 * 1. 초기 상태를 설정하거나
 * 2. 설치 시 일부 태스크 수행할 수 있음 
 */
chrome.runtime.onInstalled.addListener(() => {
    chrome.action.setBadgeText({
      text: "OFF", // off 상태로 설정 
    });
  });

/**
 * <현재 탭의 상태 추적>
 * 1. url이 문서 페이지와 일치하는지 확인
 * 2. 현재 탭의 상태를 확인하고 다음 상태를 설정
 */
const youtube = 'https://www.youtube.com/watch'

chrome.action.onClicked.addListener(async (tab) => {
  if (tab.url.startsWith(youtube)) {
    /**
     * 새로 작성
     */




    // Retrieve the action badge to check if the extension is 'ON' or 'OFF'
    const prevState = await chrome.action.getBadgeText({ tabId: tab.id });
    // Next state will always be the opposite
    const nextState = prevState === 'ON' ? 'OFF' : 'ON'

    // Set the action badge to the next state
    await chrome.action.setBadgeText({
      tabId: tab.id,
      text: nextState,
    });

    if (nextState === "ON") {
        // Insert the CSS file when the user turns the extension on
        await chrome.scripting.insertCSS({
          files: ["hide-original.css"],
          target: { tabId: tab.id },
        });
        // 추가로 실행되고 있던 비디오 멈추는거 구현

        // 새 비디오가 보이게


    } else if (nextState === "OFF") {
        // Remove the CSS file when the user turns the extension off
        await chrome.scripting.removeCSS({
          files: ["hide-original.css"],
          target: { tabId: tab.id },
        });

        // 새 비디오가 숨겨지게 
        
        // 추가로 멈추고 숨기는거 
        // 추가로 기존 비디오 시작 지점 이동
    }
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showVideo') {
        chrome.tabs.sendMessage(sender.tab.id, message, sendResponse);
        return true; // 비동기 응답을 위해 true 반환
    }
});