// || DOM object reference
// input
const $file = document.getElementById('file');
const $speedInput = document.getElementById('speed-input');
const $pitchInput = document.getElementById('pitch-input');
const $timeInput = document.getElementById('time-input');
const $filterInput = document.getElementById('filter-input');

// button
const $preparation = document.getElementById('preparation');
const $reverseProcess = document.getElementById('reverse-process');
const $speedProcess = document.getElementById('speed-process');
const $pitchProcess = document.getElementById('pitch-process');
const $timeProcess = document.getElementById('time-process');
const $filterProcess = document.getElementById('filter-process');

// audio
const $reverse = document.getElementById('reverse');
const $speed = document.getElementById('speed-control');
const $pitch = document.getElementById('pitch-shifter');
const $time = document.getElementById('time-stretcher');
const $filter = document.getElementById('filter');

// variable declaration
let actx;

// || AudioContext activation
function activateAudioContext() {
    actx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 44100 });
    console.log('AudioContext activated');
}

$preparation.addEventListener('click', activateAudioContext);

// || Processing
// reversed playback
async function process_reverse() {
    const audioData = await actx.decodeAudioData(await $file.files[0].arrayBuffer());
    const original = audioData.getChannelData(0);
    const audioBuffer = new AudioBuffer({ length: original.length, sampleRate: actx.sampleRate });
    const buffering = audioBuffer.getChannelData(0);

    for (let i = 0; i < audioBuffer.length; i++) {
        buffering[i] = original[original.length - 1 - i];
    }

    const url = window.URL.createObjectURL(writeWAV(audioBuffer, 1, 1, 16));

    $reverse.setAttribute('src', url);
}

$reverseProcess.addEventListener('click', process_reverse);

// sample rate modification
async function process_speed() {
    const audioData = await actx.decodeAudioData(await $file.files[0].arrayBuffer());
    const original = audioData.getChannelData(0);
    const arr = [];
    const step = Number($speedInput.value) ?? 1;

    for (let i = 0; i < original.length; i += step) {
        arr.push(original[Math.floor(i)]);
    }
    
    const f32Arr = Float32Array.from(arr);
    const audioBuffer = new AudioBuffer({ length: f32Arr.length, numberOfChannels: 1, sampleRate: actx.sampleRate });

    audioBuffer.copyToChannel(f32Arr, 0);

    const url = window.URL.createObjectURL(writeWAV(audioBuffer, 1, 1, 16));

    $speed.setAttribute('src', url);
}

$speedProcess.addEventListener('click', process_speed);

// pitch shifter
async function process_pitch() {
    const audioData = await actx.decodeAudioData(await $file.files[0].arrayBuffer());
    const original = audioData.getChannelData(0);
    const arr = [];
    const grainSize = 2000;
    const pitch = Number($pitchInput.value) ?? 1;

    for (let i = 0; i < original.length; i += grainSize) {
        for (let j = 0, k = 0; j < grainSize; j++, k += pitch) {
            arr.push(original[Math.floor(i + k)]);

            if (k >= grainSize - pitch) k = -pitch;
        }
    }

    const f32Arr = Float32Array.from(arr);
    const audioBuffer = new AudioBuffer({ length: f32Arr.length, numberOfChannels: 1, sampleRate: actx.sampleRate });

    audioBuffer.copyToChannel(f32Arr, 0);

    const url = window.URL.createObjectURL(writeWAV(audioBuffer, 1, 1, 16));

    $pitch.setAttribute('src', url);
}

$pitchProcess.addEventListener('click', process_pitch);

// time stretcher
async function process_time() {
    const audioData = await actx.decodeAudioData(await $file.files[0].arrayBuffer());
    const original = audioData.getChannelData(0);
    const arr = [];
    const grainSize = 2000;
    const speed = Number($timeInput.value) ?? 1;
    const L = Math.floor(grainSize / speed);

    if (speed > 1) {
        for (let i = 0; i < original.length; i += grainSize) {
            for (let j = 0; j < L; j++) {
                const v = original[i + j];

                arr.push(v);
            }
        }
    } else {
        for (let i = 0; i < original.length; i += grainSize) {
            for (let j = 0, k = 0; j < L; j++, k++) {
                const v = original[i + k];

                arr.push(v);

                if (k === grainSize - 1) k = -1;
            }
        }
    }

    const f32Arr = Float32Array.from(arr);
    const audioBuffer = new AudioBuffer({ length: f32Arr.length, numberOfChannels: 1, sampleRate: actx.sampleRate });

    audioBuffer.copyToChannel(f32Arr, 0);

    const url = window.URL.createObjectURL(writeWAV(audioBuffer, 1, 1, 16));

    $time.setAttribute('src', url);
}

$timeProcess.addEventListener('click', process_time);

// moving average
async function process_filter() {
    const audioData = await actx.decodeAudioData(await $file.files[0].arrayBuffer());
    const original = audioData.getChannelData(0);
    const num = Number($filterInput.value) ?? 1;
    const arr = new Array(original.length - (num - 1));

    function local_mean(i) {
        let sum = 0;

        for (let j = 0; j < num; j++) {
            sum += original[i + j];
        }

        return sum / num;
    }

    for (let i = 0; i < arr.length; i++) {
        arr[i] = local_mean(i);
    }

    const f32Arr = Float32Array.from(arr);
    const audioBuffer = new AudioBuffer({ length: f32Arr.length, numberOfChannels: 1, sampleRate: actx.sampleRate });

    audioBuffer.copyToChannel(f32Arr, 0);

    const url = window.URL.createObjectURL(writeWAV(audioBuffer, 1, 1, 16));

    $filter.setAttribute('src', url);
}

$filterProcess.addEventListener('click', process_filter);

// || Writing .wav file
function writeWAV(audioBuffer, audioFormat, numChannel, bitDepth) {
    const AUDIOBUFFER_LENGTH = audioBuffer.length;
    const AUDIO_FORMAT = audioFormat; // 1 = PCM
    const NUM_CHANNEL = numChannel; // 1 = mono
    const SAMPLE_RATE = audioBuffer.sampleRate;
    const BIT_PER_SAMPLE = bitDepth;
    const BYTE_TO_BITS = 8; // 1 byte = 8 bits
    const BYTE_PER_SAMPLE = BIT_PER_SAMPLE / BYTE_TO_BITS;
    const BYTE_RATE = SAMPLE_RATE * BYTE_PER_SAMPLE * NUM_CHANNEL;
    const BLOCK_ALIGN = NUM_CHANNEL * BYTE_PER_SAMPLE;
    const NUM_METADATA_BYTES = 44;
    const AUDIO_DATA_SIZE = AUDIOBUFFER_LENGTH * BYTE_PER_SAMPLE;
    const FILE_SIZE = AUDIO_DATA_SIZE + NUM_METADATA_BYTES;
    const arrayBuffer = new ArrayBuffer(FILE_SIZE);
    const dataView = new DataView(arrayBuffer);
    const LE = true; // little endian
    const BE = false; // big endian
    const soundLevel = (2 ** (BIT_PER_SAMPLE - 1)) - 1; // // bit depth = 2^16 = 65536; -32768 ~ 32767

    function writeRIFFChunk() {
        dataView.setInt32(0, 0x52494646, BE); // RIFF
        dataView.setInt32(4, FILE_SIZE - 8, LE); // total bytes after this
        dataView.setInt32(8, 0x57415645, BE); // WAVE
    }

    function writeFmtChunk() {
        dataView.setInt32(12, 0x666D7420, BE); // fmt_ (_ = empty)
        dataView.setInt32(16, 16, LE); // number of bytes used to write RIFF ~ fmt_
        dataView.setInt16(20, AUDIO_FORMAT, LE);
        dataView.setInt16(22, NUM_CHANNEL, LE);
        dataView.setInt32(24, SAMPLE_RATE, LE);
        dataView.setInt32(28, BYTE_RATE, LE);
        dataView.setInt16(32, BLOCK_ALIGN , LE); // block align
        dataView.setInt16(34, BIT_PER_SAMPLE, LE);
    }

    function writeDataChunk() {
        dataView.setInt32(36, 0x64617461, BE); // data
        dataView.setInt32(40, AUDIO_DATA_SIZE, LE);

        const audioData = audioBuffer.getChannelData(0);
        let sample;
        
        for (let i = 0; i < AUDIOBUFFER_LENGTH; i++) {
            sample = audioData[i] * soundLevel;
            dataView.setInt16(NUM_METADATA_BYTES + i * BYTE_PER_SAMPLE, sample, LE);
        }
    }

    writeRIFFChunk();
    writeFmtChunk();
    writeDataChunk();

    return new Blob([arrayBuffer], { type: 'audio/wav' });
}