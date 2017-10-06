"use strict";

window.repeatable = true;

var getParams = window
    .location
    .search
    .replace('?','')
    .split('&')
    .reduce(
        function(p, e){
            var a = e.split('=');
            p[decodeURIComponent(a[0])] = decodeURIComponent(a[1]);
            return p;
        },
        {}
    ),

params = {
    collAskComplete: true,
    firstLoad: true,
    opacitySetAble: true
},

historyResponse = {
	array: [],
	maxLength: 50,
	position: 0,

	update: function(add) {
		if (this.array.length < this.maxLength) {
			this.array.push(add);
			this.position = this.array.length - 1;
			// console.log(this.position);
		} else {
			this.array.shift();
			this.array.push(add);
			this.position = this.array.length - 1;
			// console.log(this.position);
		}
	},

	goBack: function() {
		if ( (this.position > 0) & (params.collAskComplete) ) {
			params.collAskComplete = false;
			elements.responceOpacity(false);
			historyTimeout();
		} 
	}
},

elements = {
    radio: {
        pril: document.getElementsByName('pril'),
        word: document.getElementsByName('word'),
        voice: document.getElementsByName('voice'),
        emotion: document.getElementsByName('emotion')
    },
    
    checkbox: {
        forExample: document.getElementsByName('forExample'),
        textToSpeech: document.getElementsByName('useTextSpeech')
    },

    block: {
        settings: document.getElementById("settings"),
        response: document.getElementById("aaa")
    },
    
    range: {
        speed: document.getElementsByName('speed')
    },
    
    radioCheck: function(temp) {
        for (var i = 0; i < temp.length; i++) {
            if (temp[i].type == "radio" && temp[i].checked) {
                return temp[i].value;
            }
        } 
    },
    
    responceOpacity: function(bool) {
        if (bool === false) {
            this.block.response.style.opacity = '0';
            this.block.response.style.transform = 'scale(.95)';
        }
        if (bool === true) {
            this.block.response.style.opacity = '1';
            this.block.response.style.transform = 'scale(1)';
        }
    }
};

document.getElementById("butt").onclick = getW;

new Clipboard('.btn-clipboard');

function getW() {
    if (window.repeatable && params.collAskComplete) {
        params.collAskComplete = false;
        elements.responceOpacity(false);

    	var xhr = new XMLHttpRequest();
        params.loadend = false;

        if ((params.firstLoad) &
        	!!(getParams.wd) &
        	!!(getParams.pd) &
        	!!(getParams.wnum) & 
        	!!(getParams.pnum)) {
            xhr.open('GET', 'scripts/back4.php?word='
            	+ getParams.wd
            	+ '&pril='
            	+ getParams.pd
            	+ '&wnum='
            	+ getParams.wnum
            	+ '&pnum='
            	+ getParams.pnum, true);
        } else {
            xhr.open('GET', 'scripts/back4.php?word='
            	+ elements.radioCheck(elements.radio.word)
            	+ '&pril='
            	+ elements.radioCheck(elements.radio.pril), true);
        }

        xhr.send();
        xhr.timeout = 10000;

        xhr.onload = function() {
            elements.responceOpacity(false);
            params.loadend = true;

            setTimeout(function() {
                window.textVal = JSON.parse(xhr.responseText).result;
                historyResponse.update(window.textVal);

                if (elements.checkbox.forExample[0].checked) window.textVal += ', например';
                elements.block.response.innerHTML = (window.textVal);
                elements.responceOpacity(true);
                
                window.tts = new ya.speechkit.Tts({
                    apikey: '',
                    stopCallback: function () {
                        window.repeatable = true;
                    }
                });

                if (elements.checkbox.textToSpeech[0].checked) say();
                params.collAskComplete = true;
                params.firstLoad = false;
            }, 200);
        };

        xhr.onerror = function() {
            elements.responceOpacity(false);
            params.loadend = true;
            
            setTimeout(function() {
                elements.block.response.innerHTML = ('ошибка');
                if (elements.checkbox.forExample[0].checked) elements.block.response.innerHTML += ', например';
                elements.responceOpacity(true);
            }, 200);
            params.collAskComplete = true;
        };

        setTimeout(function() {
            if (!params.loadend) {
                elements.block.response.innerHTML = ('<div class="loader"></div>');
                elements.responceOpacity(true);
            }
        }, 300);

        xhr.ontimeout = function() {
            elements.responceOpacity(false);
            params.loadend = true;
            
            setTimeout(function() {
                elements.block.response.innerHTML = ('превышен интервал ожидания');
                if (elements.checkbox.forExample[0].checked) elements.block.response.innerHTML += ', например';
                elements.responceOpacity(true);
            }, 200);
            params.collAskComplete = true;
        }
    }
}

/**
  * Следующая фунция - полная срань, надо переделывать
  */
function openSettings(block, speedd, type, simg, tryAnyway) {
    if (block.style.display != 'none') {
        if ((params.opacitySetAble) || (tryAnyway)) {
            params.opacitySetAbl = false;
            
            if (simg) {
                document.getElementById('setimg').classList.remove('no-op');
            }
            
            var tim = setInterval(function() {
                var a = parseFloat(block.style.opacity);
                if (a < 0) a = 0;
                a -= 0.05;
                block.style.opacity = a;
                if (a <= 0) {
                    block.style.display = 'none';
                    clearInterval(tim);
                    params.opacitySetAbl = true;
                }
            }, speedd);
        }
    } else {
        if ( (params.opacitySetAble) || (tryAnyway) ) {
            params.opacitySetAbl = false;
            
            if (simg) {
                document.getElementById('setimg').classList.add('no-op');
            }
            
            block.style.display = type;
            var tim = setInterval(function() {
                var a = parseFloat(block.style.opacity);
                if (a > 1) a = 1;
                a += 0.05;
                block.style.opacity = a;
                if (a >= 1) {
                    clearInterval(tim);
                    params.opacitySetAbl = true;
                }
            }, speedd);
        }
        // return true;
    }
}

function historyTimeout() {
	setTimeout(function() {
		historyResponse.position--;
		window.textVal = historyResponse.array[historyResponse.position];
		elements.block.response.innerHTML += ', например';
		elements.block.response.innerHTML = window.textVal;
		if (elements.checkbox.forExample[0].checked) elements.block.response.innerHTML += ', например';
		elements.responceOpacity(true);

// if (elements.checkbox.textToSpeech[0].checked) say();
		params.collAskComplete = true;
	}, 200);
} 

function say() {
    if (window.repeatable) {
        window.repeatable = false;
        tts.speak(window.textVal, {
            speaker: elements.radioCheck(elements.radio.voice),
            emotion: elements.radioCheck(elements.radio.emotion),
            speed: elements.range.speed[0].value / 10
        });
    }
}
