import subprocess
import cv2
from ultralytics import YOLO
import numpy as np

model = YOLO("model/best.pt")


def get_youtube_url(video_id):
    # yt-dlp를 이용해 실시간 스트리밍 URL을 추출
    command = [
        'yt-dlp',
        '--get-url',  # URL을 직접 추출 # 영상, 오디오 따로 url 두 개 나옴
        '--skip-download',
        f'https://www.youtube.com/watch?v={video_id}'
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, text=True)
    urls = result.stdout.strip().split('\n')
    return urls


def start_ffmpeg_process(output_path, framerate):
    command = [
        'ffmpeg',
        '-y',   # 덮어쓰기
        '-f', 'image2pipe',
        '-framerate', str(framerate),  # 입력 프레임 속도 설정
        '-i', '-',  # 표준 입력에서 프레임을 읽음
        '-pix_fmt', 'yuv420p',  # 대부분의 플레이어와 호환되는 픽셀 포맷
        '-vcodec', 'libx264',  # 코덱
        '-crf', '23',  # 영상 품질과 압축률 설정 (값이 낮을수록 품질이 좋음)
        '-preset', 'fast',  # 인코딩 속도와 품질의 균형 설정
        '-r', str(framerate),  # 출력 프레임 속도 설정
        output_path  # 출력 파일명
    ]
    return subprocess.Popen(command, stdin=subprocess.PIPE)


def close_ffmpeg_process(ffmpeg_process, cap):
    # FFmpeg 종료 처리
    ffmpeg_process.stdin.close()
    print('Sending EOF to FFmpeg')
    try:
        exit_code = ffmpeg_process.wait(timeout=10)  # 10초 후에 대기를 종료
        print('FFmpeg process exited with code', exit_code)
    except subprocess.TimeoutExpired:
        print('FFmpeg did not exit, killing the process')
        ffmpeg_process.kill()  # FFmpeg 프로세스 강제 종료
        ffmpeg_process.wait()  # 강제 종료 후 정리
        print('FFmpeg process was killed and cleaned up')
    finally:
        if cap:
            cap.release()  # 비디오 캡처 객체 해제
            print('Video capture released')

def gen_frames_and_encode(output_path, framerate):
    ffmpeg_process = start_ffmpeg_process(output_path, framerate)

    ret, test_frame = cap.read()
    height, width = test_frame.shape[:2]
    mask = np.zeros((height, width), dtype=np.uint8)
    cap.set(cv2.CAP_PROP_POS_FRAMES, 0)

    totalframes = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    try:
        framecount = 0
        while True:
            print(f"Video is being made. {framecount}")
            ret, frame = cap.read()
            if not ret:
                if framecount != totalframes:
                    print(f"Expected frames: {totalframes}, Read frames: {framecount}")
                break
            results = model(frame)[0]
            mask.fill(0)  # 마스크를 0으로 리셋
            if results.masks:
                coords_list = results.masks.xy
                for coords in coords_list:
                    coords = np.array(coords, dtype=np.int32)
                    cv2.fillPoly(mask, [coords], 255)
                blurred_image = cv2.GaussianBlur(frame, (21, 21), 0)
                masked_blurred_image = cv2.bitwise_and(blurred_image, blurred_image, mask=mask)
                final_image = cv2.bitwise_and(frame, frame, mask=cv2.bitwise_not(mask))
                final_image += masked_blurred_image
            else:
                final_image = frame
            ret, buffer = cv2.imencode('.jpg', final_image)
            try:
                ffmpeg_process.stdin.write(buffer.tobytes()) # 중단되는 경우가 발생하는데, 그 경우에 여기서 못 넘어감
                ffmpeg_process.stdin.flush()  # 버퍼 플러시
            except BrokenPipeError as e:
                print(f"FFmpeg has closed the pipe: {e}")
                break
            framecount += 1
            # del final_image, blurred_image, masked_blurred_image  # 메모리 정리
    finally:
        close_ffmpeg_process(ffmpeg_process, cap)


def merge_audio_video(video_filename, audio_url, output_filename):
    command = [
        'ffmpeg',
        '-i', video_filename,
        '-i', audio_url,
        '-c:v', 'copy',
        '-c:a', 'aac',
        '-strict', 'experimental',
        output_filename
    ]
    subprocess.run(command)


def get_video(video_id):
    video_url, audio_url = get_youtube_url(video_id)
    output_filename = 'output_' + video_id + '.mp4'
    output_path = 'static/' + output_filename
    final_output_path = 'static/final_' + output_filename

    print('File generating starts...')

    global cap
    cap = cv2.VideoCapture(video_url)
    if not cap.isOpened():
        print("Error: Cannot open downloaded video file.")
    framerate = cap.get(cv2.CAP_PROP_FPS) or 30

    gen_frames_and_encode(output_path, framerate)

    merge_audio_video(output_path, audio_url, final_output_path)


def main():
    print("유튜브 동영상 url을 입력하세요:")
    video_id = input().split('=')[-1]
    get_video(video_id)


if __name__ == "__main__":
    main()
