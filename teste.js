(function(ext) {
  if (typeof Tone !== 'undefined') {
		console.log('Tone library is already loaded');
		startSynth();
	} else {
		$.getScript('http://ericrosenbaum.github.io/tone-synth-extension/Tone.min.js', startSynth);
	}
  function startSynth() {

    var tone = new Tone();
    Tone.Transport.start();

    // var quantizeUnit = '@8n';
    var quantizeUnit = '0';


    // effects

    var delay = new Tone.FeedbackDelay(0.25, 0.5);
    delay.wet.value = 0;

    var pitchShift = new Tone.PitchShift();

    var panner = new Tone.Panner();

    var reverb = new Tone.Freeverb();
    reverb.wet.value = 0;

    Tone.Master.chain(delay, pitchShift, panner, reverb);

    var soundFileNames = ['meow','boing','this_is_a_test','who_put_the_bomp','cave','drip_drop','drum_machine','eggs','zoop'];
    var soundSamplers = loadSoundFiles(soundFileNames);

    // polyphonic samplers

    function loadSoundFiles(filenames) {
        var samplers = [];

        for (var name of filenames) {

            var myVoices = [];
            for (var i=0; i<6; i++) {
                var p = new Tone.Sampler('sounds/' + name + '.mp3').toMaster();
                myVoices.push(p);
            }

            var polySampler = {
                voices : myVoices,
                currentVoice : 0,
                nextVoice : function() {return this.voices[this.currentVoice++ % this.voices.length];},
                stopAllVoices : function() {for (var i=0;i<this.voices.length;i++) {this.voices[i].triggerRelease()}},
            };

            samplers.push(polySampler);
        }

        return samplers;
    }

    // should fire once all sounds are loaded - seems to not work
    Tone.Buffer.onload = function() {
        console.log('loaded audio samples');
    };


    // Cleanup function when the extension is unloaded
    ext._shutdown = function() {
      stopAllSounds();
    };

    function stopAllSounds() {
			synth.triggerRelease();
		}

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
      if (typeof AudioContext !== "undefined") {
      return {status: 2, msg: 'Ready'};
    } else {
      return {status: 1, msg: 'Browser not supported'};
    }
    };

    ext.my_first_block = function(sound, pan) {
        // Code that gets executed when the block is run
        panner.pan.value = pan;

        soundSamplers[sound].nextVoice().triggerAttack(0, quantizeUnit);


    };

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            [' ', 'play %m.sounds with pan %n', 'my_first_block', 'meow', '1'],
        ],
        menus: {
          sounds: ['meow','boing','this_is_a_test','who_put_the_bomp','cave','drip_drop','drum_machine','eggs','zoop'],
				}
    };

    // Register the extension
    ScratchExtensions.register('Sounds', descriptor, ext);

  };
})({});
