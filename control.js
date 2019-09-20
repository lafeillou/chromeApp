// document.getElementById("minimize").onclick = function() {
//   current_window.minimize();
// };

var button = $(".button");
var mic = button.find("svg");
var active = $(".active-wrapper");
var stop = $(".stop-button");
var dotCol = $(".dots-col");
var w = $(window);
var vw = w.innerWidth();
var vh = w.innerHeight();
var bw = button.innerWidth();
var bh = button.innerHeight();
var s;
// 调用麦克风相关
function __log(e, data) {
  // log.innerHTML += "\n" + e + " " + (data || "");
  console.log(e + " " + (data || ""));
}
var audio_context;
var recorder;

var clone = button.clone();
clone.find("svg").remove();
button.before(clone);

var open = function() {
  if (vw > vh) {
    s = (vw / bw) * 1.5;
  } else {
    s = (vh / bh) * 1.5;
  }
  var scale = "scale(" + s + ") translate(-50%,-50%)";

  clone.css({
    transform: scale
  });

  mic.css({
    fill: "rgba(0,0,0,0.2)",
    transform: "scale(4)"
  });

  button.on("transitionend", function() {
    active.addClass("active");
    $(this).off("transitionend");
  });

  // 开启麦克风
  startRecording(this);

  return false;
};

var closeFn = function() {
  active.removeClass("active");
  clone.removeAttr("style");
  mic.removeAttr("style");
  stopRecording();
};

// 调用麦克风相关
function startUserMedia(stream) {
  var input = audio_context.createMediaStreamSource(stream);
  __log("Media stream created.");
  // Uncomment if you want the audio to feedback directly
  //input.connect(audio_context.destination);
  //__log('Input connected to audio context destination.');

  recorder = new Recorder(input, {
    numChannels: 1,
    sampleRate: 16000
  });
  __log("Recorder initialised.");
}
function startRecording(button) {
  recorder && recorder.record();
  __log("Recording...");
}

function stopRecording() {
  recorder && recorder.stop();
  __log("Stopped recording.");
  uploadVoice(function(promise) {
    promise.then(function(res) {
      if (res.status === 200) {
        if (res.data.result) {
          $(".text-content").show();
          $("#close-btn").hide();
          $("#voice-result").html(res.data.result[0]);
        }
      }
    });
  });
  recorder.clear();
}

function transformVoiceToText(formData) {
  return axios({
    method: "post",
    url: "http://111.47.10.117:30012/api/v1/speech/answer ",
    headers: {
      "Content-Type": "multipart/form-data"
    },
    data: formData
  });
}

function uploadVoice(cb) {
  recorder &&
    recorder.exportWAV(function(blob) {
      // var url = URL.createObjectURL(blob);
      // var au = document.createElement("audio");
      // au.controls = true;
      // au.src = url;
      // $("body").append($(au));
      // au.play();
      // au.style.visibility = "hidden";
      var formData = new FormData();
      formData.append("file", blob, +new Date() + ".wav");
      cb(transformVoiceToText(formData));
    });
}

// 初始化
function init() {
  try {
    // webkit shim
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    navigator.getUserMedia =
      navigator.getUserMedia || navigator.webkitGetUserMedia;
    window.URL = window.URL || window.webkitURL;
    audio_context = new AudioContext();
    __log("Audio context set up.");
    __log(
      "navigator.getUserMedia " +
        (navigator.getUserMedia ? "available." : "not present!")
    );
  } catch (e) {
    alert("No web audio support in this browser!");
  }

  navigator.getUserMedia({ audio: true }, startUserMedia, function(e) {
    __log("No live audio input: " + e);
  });

  // ui
  $(".text-content").on("click", function(e) {
    // console.log(e);
    if (e.target === $("#voice-result")[0]) {
      return;
    }
    $(".text-content").hide();
    $("#close-btn").show();
  });

  $("#copyTextBtn").on("click", function(e) {
    e.stopPropagation();
    $("#voice-result")[0].select();

    document.execCommand("copy");
    document.getSelection().removeAllRanges();
  });

  var current_window = chrome.app.window.current();

  document.getElementById("close-btn").onclick = function() {
    current_window.close();
  };
}

$(document).ready(function() {
  init();
  button.on("click", open);
  stop.on("click", closeFn);
});
