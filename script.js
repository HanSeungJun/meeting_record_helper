const startButton = document.getElementById('startButton');
const stopButton = document.getElementById('stopButton');
const transcription = document.getElementById('transcription');
const fullText = document.getElementById('fullText');
let recognition;
let startTime; // 음성 인식 시작 시간을 저장할 변수
let timerInterval; // 회의 시작 타이머 

let mediaRecorder; // 음성 녹음
let audioChunks = [];

if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onend = function() {
        // 음성 인식이 종료되면 자동으로 다시 시작, Speech Web API가 자동으로 연결을 끊기 때문
        recognition.start();
    };

    recognition.onresult = function(event) {
        let interim_transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                const currentTime = new Date();
                const elapsedTime = Math.floor((currentTime - startTime) / 1000);
                const minutes = Math.floor(elapsedTime / 60);
                const seconds = elapsedTime % 60;

                fullText.value += `[${minutes}:${seconds.toString().padStart(2, '0')}]` + event.results[i][0].transcript + "\n";
            } else {
                interim_transcript += event.results[i][0].transcript;
            }
        }
        transcription.value = interim_transcript;
    };

    // 회의 시작 버튼 클릭 시
    startButton.onclick = function() {
        fullText.value = ''; // 텍스트 창 초기화
        startButton.disabled = true; // 회의 시작 버튼 비활성화
        stopButton.disabled = false;  // 회의 종료 버튼 활성화

        startTime = new Date(); // 음성 인식 시작 시 startTime 초기화
        timerInterval = setInterval(updateTimer, 1000);

        // 회의 상태 메시지 변경
        document.getElementById('meetingStatus').innerText = '🔴 회의가 시작되었습니다.';

        // 음성 녹음 시작
        navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();

            mediaRecorder.ondataavailable = function(event) {
                audioChunks.push(event.data);
            };
        });

        recognition.start();
    };

    // 회의 종료 버튼 클릭 시
    stopButton.onclick = function() {
        clearInterval(timerInterval);
        startButton.disabled = false; // 회의 시작 버튼 활성화
        stopButton.disabled = true;   // 회의 종료 버튼 비활성화

        // 회의 상태 메시지 변경
        document.getElementById('meetingStatus').innerText = '회의가 종료되었습니다.';

        // 음성 녹음 종료 및 저장
        mediaRecorder.stop();
        mediaRecorder.onstop = function() {
            const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' });
            const audioUrl = URL.createObjectURL(audioBlob);
            const downloadLink = document.createElement('a');
            downloadLink.href = audioUrl;
            downloadLink.download = 'recorded_audio.mp3';
            downloadLink.click();
    };

        recognition.stop();
        saveTextAsFile();
    };
} else {
    alert('이 브라우저는 음성 인식 기능을 지원하지 않습니다.');
}

function saveTextAsFile() {
    const textToWrite = fullText.value;
    const textFileAsBlob = new Blob([textToWrite], { type: 'text/plain' });
    const fileNameToSaveAs = new Date().toISOString() + '.txt';  // 날짜와 시간을 ISO 8601 형식으로 변환, YYYY-MM-DDTHH:mm:ss.sssZ

    const downloadLink = document.createElement('a');
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = 'Download File';
    if (window.webkitURL != null) {
        downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
        downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
        downloadLink.onclick = destroyClickedElement;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
    }

    downloadLink.click();
}

function destroyClickedElement(event) {
    document.body.removeChild(event.target);
}

// 타이머 업데이트 함수
function updateTimer() {
    const currentTime = new Date();
    const elapsedTime = new Date(currentTime - startTime);
    const hours = elapsedTime.getUTCHours().toString().padStart(2, '0');
    const minutes = elapsedTime.getUTCMinutes().toString().padStart(2, '0');
    const seconds = elapsedTime.getUTCSeconds().toString().padStart(2, '0');
    
    document.getElementById('timer').innerText = `${hours}:${minutes}:${seconds}`;
}