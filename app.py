from flask import Flask, render_template, Response, request, jsonify, send_from_directory, url_for
from flask_cors import CORS
import cv2  # OpenCV: 영상 처리 및 비디오 처리를 위해 사용
import torch    # PyTorch: 딥러닝 프레임워크로 YOLOv5 모델을 로드하는 데 사용
import pathlib
temp = pathlib.PosixPath
pathlib.PosixPath = pathlib.WindowsPath
import supervision as sv    # 블러 처리할 때 사용
import subprocess
import os
import json


# Flask 인스턴스 생성
app = Flask(__name__)
CORS(app)

# 모델 로드
model_weights = 'model/best.pt' # 가중치 파일의 경로
model = torch.hub.load('yolov5', 'custom', path=model_weights, source='local', force_reload=True)
model.conf = 0.6
# model.iou = 0.45

# 모델 input을 위한 영상의 스트리밍 url 획득
def get_youtube_url(video_id):
    # yt-dlp를 이용해 실시간 스트리밍 URL을 추출합니다.
    command = [
        'yt-dlp',
        '--format', 'best',
        '--get-url',  # URL을 직접 추출 # 영상, 오디오 따로 url 두 개 나옴
        #'--skip-download',
        f'https://www.youtube.com/watch?v={video_id}'
    ]
    result = subprocess.run(command, stdout=subprocess.PIPE, text=True)
    url = result.stdout.strip()
    return url

# ffmpeg 프로세스 설정
def start_ffmpeg_process(output_path):
    command = [
        'ffmpeg',
        '-y',   # 덮어쓰기
        '-f', 'image2pipe',
        '-i', '-',  # 표준 입력에서 프레임을 읽음
        '-pix_fmt', 'yuv420p',  # 대부분의 플레이어와 호환되는 픽셀 포맷
        '-vcodec', 'libx264',  # H.264 코덱 사용
        '-crf', '23',  # 영상 품질과 압축률 설정 (값이 낮을수록 품질이 좋음)
        '-preset', 'fast',  # 인코딩 속도와 품질의 균형 설정
        output_path  # 출력 파일명
    ]
    return subprocess.Popen(command, stdin=subprocess.PIPE, stderr=subprocess.PIPE)

# 프레임 생성하여 ffmpeg로 전송
def gen_frames_and_encode(output_filename):
    # output_dir = 'output'
    # if not os.path.exists(output_dir):
    #     os.makedirs(output_dir)  # 디렉토리가 없다면 생성
    #
    # output_path = f'{output_dir}/{output_filename}'
    output_path = f'{output_filename}'
    ffmpeg_process = start_ffmpeg_process(output_path)

    try:
        i = 0
        while True:
            print(f"Video is being made. {i}")
            i += 1

            ret, frame = cap.read()  # 프레임 받아온다. ret: 성공 True, 실패 False. frame: 현재 프레임 (numpy.ndarray)
            if not ret:
                break
            results = model(frame) # 프레임에 모델을 적용하여 객체 감지

            # Ultralytics 결과를 Supervision의 Detections 객체로 변환
            detections = sv.Detections.from_yolov5(results)

            # Supervision 블러 처리
            blur_annotator = sv.BlurAnnotator()
            annotated_frame = blur_annotator.annotate(
                scene=frame.copy(),  # 원본 프레임 복사
                detections=detections
            )

            # 프레임을 JPEG 이미지 형식으로 인코딩
            ret, buffer = cv2.imencode('.jpg', annotated_frame)

            # ffmpeg로 전송
            try:
                ffmpeg_process.stdin.write(buffer.tobytes())
                # 중단되는 경우가 발생하는데, 그 경우에 여기서 못 넘어감
                ffmpeg_process.stdin.flush()  # 버퍼 플러시
            except BrokenPipeError as e:
                print("FFmpeg has closed the pipe:", e)
                stderr_output = ffmpeg_process.stderr.read().decode()
                print("FFmpeg stderr:", stderr_output)
                break
    finally:
        # FFmpeg 종료 처리
        ffmpeg_process.stdin.close()
        print('Sending EOF to FFmpeg')
        try:
            stderr_output = ffmpeg_process.stderr.read().decode()
            print("FFmpeg stderr:", stderr_output)
            exit_code = ffmpeg_process.wait(timeout=10)  # 10초 후에 대기를 종료
            print('FFmpeg process exited with code', exit_code)
        except subprocess.TimeoutExpired:
            print('FFmpeg did not exit, killing the process')
            ffmpeg_process.kill()  # FFmpeg 프로세스 강제 종료
            ffmpeg_process.wait()  # 강제 종료 후 정리

    return output_path

# Flask 라우트 설정
@app.route('/')
def video_show():
    return render_template('video_show.html')

# @app.route('/video')
# def video():
#     return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame') # 비디오 프레임을 지속적으로 전송하는 HTTP 응답을 생성

@app.route('/api/data', methods=['GET'])
def get_video():
    video_id = request.args.get('videoId')  # 'url' 파라미터로 전달된 비디오 ID를 받음
    print(video_id)

    video_file_path = os.path.join(app.static_folder, f'output_{video_id}.mp4')
    # 파일이 존재하는지 확인하고 삭제
    if os.path.exists(video_file_path):
        try:
            os.remove(video_file_path)
            print(f'Deleted existing file: {video_file_path}')
        except OSError as e:
            print(f'Error deleting file {video_file_path}: {e}')
    else:
        print(f'File does not exist: {video_file_path}.')
    print('File generating starts...')

    video_url = get_youtube_url(video_id)   # yt-dlp를 사용해 실시간 스트리밍 URL을 추출
    global cap  # 전역 변수 사용을 명시
    cap = cv2.VideoCapture(video_url)  # 새로운 비디오 URL로 비디오 캡처 객체 갱신

    #return jsonify({"message": "Received Video ID", "video_id": video_id})

    # output_path = gen_frames_and_encode('output_' + video_id) # gen_frame_and_encode()도 promise 객체 반환하도록
    #
    # # 비디오 파일의 경로를 지정
    # directory = 'output'
    # filename = output_path.split('/')[-1]
    # # print(output_path, filename)
    # response = send_from_directory(directory, filename, as_attachment=False)
    # response.headers['Content-Type'] = 'video/mp4'
    # return response

    # 수정사항
    output_filename = 'output_' + video_id + '.mp4'
    output_path = os.path.join(app.static_folder, output_filename)  # 파일 저장 경로 조정
    print(app.static_folder)
    gen_frames_and_encode(output_path)  # 프레임 생성 및 인코딩

    video_url = url_for('static', filename=output_filename, _external=True)  # 생성된 비디오 파일에 대한 URL 생성

    print(video_url)
    response = jsonify({"videoUrl": video_url})
    print(response)
    response.headers['ngrok-skip-browser-warning'] = 'skip-browser-warning'  # ngrok 브라우저 경고 스킵
    return response


# Flask 애플리케이션 시작
if __name__ == '__main__':
    app.debug=True
    app.run(port=5000)
