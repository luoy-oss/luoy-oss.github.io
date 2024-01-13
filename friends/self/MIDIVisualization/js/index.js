! function() {
    (function() {
        function t(t) {
            var e = !0,
                n = !1,
                i = null,
                s = {
                    text: !0,
                    search: !0,
                    url: !0,
                    tel: !0,
                    email: !0,
                    password: !0,
                    number: !0,
                    date: !0,
                    month: !0,
                    week: !0,
                    time: !0,
                    datetime: !0,
                    "datetime-local": !0
                };

            function o(t) {
                return !!(t && t !== document && "HTML" !== t.nodeName && "BODY" !== t.nodeName && "classList" in t && "contains" in t.classList)
            }

            function r(t) {
                t.classList.contains("focus-visible") || (t.classList.add("focus-visible"), t.setAttribute("data-focus-visible-added", ""))
            }

            function a(t) {
                e = !1
            }

            function l() {
                document.addEventListener("mousemove", d), document.addEventListener("mousedown", d), document.addEventListener("mouseup", d), document.addEventListener("pointermove", d), document.addEventListener("pointerdown", d), document.addEventListener("pointerup", d), document.addEventListener("touchmove", d), document.addEventListener("touchstart", d), document.addEventListener("touchend", d)
            }

            function d(t) {
                t.target.nodeName && "html" === t.target.nodeName.toLowerCase() || (e = !1, document.removeEventListener("mousemove", d), document.removeEventListener("mousedown", d), document.removeEventListener("mouseup", d), document.removeEventListener("pointermove", d), document.removeEventListener("pointerdown", d), document.removeEventListener("pointerup", d), document.removeEventListener("touchmove", d), document.removeEventListener("touchstart", d), document.removeEventListener("touchend", d))
            }
            document.addEventListener("keydown", (function(n) {
                n.metaKey || n.altKey || n.ctrlKey || (o(t.activeElement) && r(t.activeElement), e = !0)
            }), !0), document.addEventListener("mousedown", a, !0), document.addEventListener("pointerdown", a, !0), document.addEventListener("touchstart", a, !0), document.addEventListener("visibilitychange", (function(t) {
                "hidden" === document.visibilityState && (n && (e = !0), l())
            }), !0), l(), t.addEventListener("focus", (function(t) {
                var n, i, a;
                o(t.target) && (e || (n = t.target, i = n.type, "INPUT" === (a = n.tagName) && s[i] && !n.readOnly || "TEXTAREA" === a && !n.readOnly || n.isContentEditable)) && r(t.target)
            }), !0), t.addEventListener("blur", (function(t) {
                var e;
                o(t.target) && (t.target.classList.contains("focus-visible") || t.target.hasAttribute("data-focus-visible-added")) && (n = !0, window.clearTimeout(i), i = window.setTimeout((function() {
                    n = !1
                }), 100), (e = t.target).hasAttribute("data-focus-visible-added") && (e.classList.remove("focus-visible"), e.removeAttribute("data-focus-visible-added")))
            }), !0), t.nodeType === Node.DOCUMENT_FRAGMENT_NODE && t.host ? t.host.setAttribute("data-js-focus-visible", "") : t.nodeType === Node.DOCUMENT_NODE && (document.documentElement.classList.add("js-focus-visible"), document.documentElement.setAttribute("data-js-focus-visible", ""))
        }
        if ("undefined" != typeof window && "undefined" != typeof document) {
            var e;
            window.applyFocusVisiblePolyfill = t;
            try {
                e = new CustomEvent("focus-visible-polyfill-ready")
            } catch (t) {
                (e = document.createEvent("CustomEvent")).initCustomEvent("focus-visible-polyfill-ready", !1, !1, {})
            }
            window.dispatchEvent(e)
        }
        "undefined" != typeof document && t(document)
    })();
    var t = {};
    t = core;
    const e = document.createElement("template");
    e.innerHTML = '\n<style>\n:host {\n  display: inline-block;\n  width: 1080px;\n  margin: 3px;\n  vertical-align: bottom;\n  font-family: sans-serif;\n  font-size: 14px;\n}\n\n:focus:not(.focus-visible) {\n  outline: none;\n}\n\n.controls {\n  width: inherit;\n  height: inherit;\n  box-sizing: border-box;\n  display: flex;\n  flex-direction: row;\n  position: relative;\n  overflow: hidden;\n  align-items: center;\n  border-radius: 100px;\n  background: #f2f5f6;\n  padding: 0 0.25em;\n  user-select: none;\n}\n.controls > * {\n  margin: 0.8em 0.45em;\n}\n.controls input, .controls button {\n  cursor: pointer;\n}\n.controls input:disabled, .controls button:disabled {\n  cursor: inherit;\n}\n.controls button {\n  text-align: center;\n  background: rgba(204, 204, 204, 0);\n  border: none;\n  width: 32px;\n  height: 32px;\n  border-radius: 100%;\n  transition: background-color 0.25s ease 0s;\n  padding: 0;\n}\n.controls button:not(:disabled):hover {\n  background: rgba(204, 204, 204, 0.3);\n}\n.controls button:not(:disabled):active {\n  background: rgba(204, 204, 204, 0.6);\n}\n.controls button .icon {\n  display: none;\n}\n.controls button .icon, .controls button .icon svg {\n  vertical-align: middle;\n}\n.controls button .icon svg {\n  fill: currentColor;\n}\n.controls .seek-bar {\n  flex: 1;\n  min-width: 0;\n  margin-right: 1.1em;\n  background: transparent;\n}\n.controls .seek-bar::-moz-range-track {\n  background-color: #555;\n}\n.controls.stopped .play-icon, .controls.playing .stop-icon, .controls.error .error-icon {\n  display: inherit;\n}\n.controls.frozen > div, .controls > button:disabled .icon {\n  opacity: 0.5;\n}\n.controls .overlay {\n  z-index: 0;\n  position: absolute;\n  top: 0;\n  left: 0;\n  right: 0;\n  bottom: 0;\n  margin: 0;\n  box-sizing: border-box;\n  display: none;\n  opacity: 1;\n}\n.controls.loading .loading-overlay {\n  display: block;\n  background: linear-gradient(110deg, #92929200 5%, #92929288 25%, #92929200 45%);\n  background-size: 250% 100%;\n  background-repeat: repeat-y;\n  animation: shimmer 1.5s linear infinite;\n}\n\n@keyframes shimmer {\n  0% {\n    background-position: 125% 0;\n  }\n  100% {\n    background-position: -200% 0;\n  }\n}\n</style>\n<div class="controls stopped frozen" part="control-panel">\n  <button class="play" part="play-button" disabled>\n    <span class="icon play-icon"><svg width="24" height="24" version="1.1" viewBox="0 0 6.35 6.35" xmlns="http://www.w3.org/2000/svg">\n <path d="m4.4979 3.175-2.1167 1.5875v-3.175z" stroke-width=".70201"/>\n</svg>\n</span>\n    <span class="icon stop-icon"><svg width="24" height="24" version="1.1" viewBox="0 0 6.35 6.35" xmlns="http://www.w3.org/2000/svg">\n <path d="m1.8521 1.5875v3.175h0.92604v-3.175zm1.7198 0v3.175h0.92604v-3.175z" stroke-width=".24153"/>\n</svg>\n</span>\n    <span class="icon error-icon"><svg width="24" height="24" version="1.1" viewBox="0 0 6.35 6.35" xmlns="http://www.w3.org/2000/svg">\n <path transform="scale(.26458)" d="m12 3.5a8.4993 8.4993 0 0 0-8.5 8.5 8.4993 8.4993 0 0 0 8.5 8.5 8.4993 8.4993 0 0 0 8.5-8.5 8.4993 8.4993 0 0 0-8.5-8.5zm-1.4062 3.5h3v6h-3v-6zm0 8h3v2h-3v-2z"/>\n</svg>\n</span>\n  </button>\n  <div part="time"><span class="current-time" part="current-time">0:00</span> / <span class="total-time" part="total-time">0:00</span></div>\n  <input type="range" min="0" max="0" value="0" step="any" class="seek-bar" part="seek-bar" disabled>\n  <div class="overlay loading-overlay" part="loading-overlay"></div>\n</div>\n';
    const n = document.createElement("template");

    function secondToTime(t) {
        const e = t < 0,
            n = (t = Math.floor(Math.abs(t || 0))) % 60,
            i = (t - n) / 60,
            s = (t - n - 60 * i) / 3600;
        return (e ? "-" : "") + (s ? `${s}:` : "") + (i > 9 || !s ? `${i}:` : `0${i}:`) + (n > 9 ? `${n}` : `0${n}`)
    }
    n.innerHTML = "\n<style>\n:host {\n  display: block;\n  height: 720px;\n  width: 1080px;\n}\n\n::slotted(.piano-roll-visualizer) {\n  overflow-x: auto;\n}\n</style>\n<slot>\n</slot>\n";
    const s = ["piano-roll", "waterfall", "staff"];
    class o extends HTMLElement {
        constructor() {
            super(...arguments), this.domInitialized = !1, this.ns = null, this._config = {}
        }
        static get observedAttributes() {
            return ["src", "type"]
        }
        connectedCallback() {
            this.attachShadow({
                mode: "open"
            }), 
			this.shadowRoot.appendChild(n.content.cloneNode(!0)), 
			this.domInitialized || (this.domInitialized = !0, 
			this.wrapper = document.createElement("div"), 
			this.appendChild(this.wrapper), 
			this.initVisualizerNow())
        }
        attributeChangedCallback(t, e, n) {
            "src" !== t && "type" !== t || this.initVisualizer()
        }
        initVisualizer() {
            null == this.initTimeout && (this.initTimeout = window.setTimeout((() => this.initVisualizerNow())))
        }
        async initVisualizerNow() {
            if (this.initTimeout = null, this.domInitialized && (this.src && (this.ns = null, this.ns = await t.urlToNoteSequence(this.src)), this.wrapper.innerHTML = "", this.ns))
                if ("piano-roll" === this.type) {
                    this.wrapper.classList.add("piano-roll-visualizer");
                    const e = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                    this.wrapper.appendChild(e);
					this.visualizer = new t.PianoRollSVGVisualizer(this.ns, e, this._config)
                } else if ("waterfall" === this.type) {
					this.wrapper.classList.add("waterfall-visualizer");
					this.visualizer = new t.WaterfallSVGVisualizer(this.ns, this.wrapper, this._config);
				}
            else if ("staff" === this.type) {
                this.wrapper.classList.add("staff-visualizer");
                const e = document.createElement("div");
                this.wrapper.appendChild(e), this.visualizer = new t.StaffSVGVisualizer(this.ns, e, this._config)
            }
        }
        redraw(t) {
            this.visualizer && this.visualizer.redraw(t, null != t)
        }
        clearActiveNotes() {
            this.visualizer && this.visualizer.clearActiveNotes()
        }
        get noteSequence() {
            return this.ns
        }
        set noteSequence(t) {
            this.ns = t, this.removeAttribute("src"), this.initVisualizer()
        }
        get src() {
            return this.getAttribute("src")
        }
        set src(t) {
            this.ns = null, this.setOrRemoveAttribute("src", t), this.initVisualizer()
        }
        get type() {
            let t = this.getAttribute("type");
            return s.indexOf(t) < 0 && (t = "piano-roll"), t
        }
        set type(t) {
            if (null != t && s.indexOf(t) < 0) throw new Error(`Unknown visualizer type ${t}. Allowed values: ${s.join(", ")}`);
            this.setOrRemoveAttribute("type", t)
        }
        get config() {
            return this._config
        }
        set config(t) {
            this._config = t, this.initVisualizer()
        }
        setOrRemoveAttribute(t, e) {
            null == e ? this.removeAttribute(t) : this.setAttribute(t, e)
        }
    }
    const r = ["start", "stop", "note"];
    let a = null;
    class l extends HTMLElement {
        constructor() {
            super(), this.domInitialized = !1, this.needInitNs = !1, this.visualizerListeners = new Map, this.ns = null, this._playing = !1, this.seeking = !1, this.attachShadow({
                mode: "open"
            }), this.shadowRoot.appendChild(e.content.cloneNode(!0)), 
			this.controlPanel = this.shadowRoot.querySelector(".controls"), 
			this.playButton = this.controlPanel.querySelector(".play"), 
			this.currentTimeLabel = this.controlPanel.querySelector(".current-time"), 
			this.totalTimeLabel = this.controlPanel.querySelector(".total-time"), 
			this.seekBar = this.controlPanel.querySelector(".seek-bar")
        }
        static get observedAttributes() {
            return ["sound-font", "src", "visualizer"]
        }
        connectedCallback() {
            if (this.domInitialized) return;
            this.domInitialized = !0;
            const t = window.applyFocusVisiblePolyfill;
            null != t && t(this.shadowRoot), this.playButton.addEventListener("click", (() => {
                this.player.isPlaying() ? this.stop() : this.start()
            })), this.seekBar.addEventListener("input", (() => {
                this.seeking = !0, this.player && "started" === this.player.getPlayState() && this.player.pause()
            })), this.seekBar.addEventListener("change", (() => {
                const t = this.currentTime;
                this.currentTimeLabel.textContent = secondToTime(t), 
				this.player && this.player.isPlaying() && (this.player.seekTo(t), "paused" === this.player.getPlayState() && this.player.resume()), this.seeking = !1
            })), this.initPlayerNow()
        }
        attributeChangedCallback(t, e, n) {
            if (this.hasAttribute(t) || (n = null), "sound-font" === t || "src" === t) this.initPlayer();
            else if ("visualizer" === t) {
                const t = () => {
                    this.setVisualizerSelector(n)
                };
                "loading" === document.readyState ? window.addEventListener("DOMContentLoaded", t) : t()
            }
        }
        initPlayer(t = !0) {
            this.needInitNs = this.needInitNs || t, null == this.initTimeout && (this.stop(), this.setLoading(), this.initTimeout = window.setTimeout((() => this.initPlayerNow(this.needInitNs))))
        }
        async initPlayerNow(e = !0) {
            if (this.initTimeout = null, this.needInitNs = !1, this.domInitialized) try {
                let n = null;
                if (e && (this.src && (this.ns = null, this.ns = await t.urlToNoteSequence(this.src)), this.currentTime = 0, this.ns || this.setError("No content loaded")), n = this.ns, !n) return this.seekBar.max = "0", void(this.totalTimeLabel.textContent = secondToTime(0));
                this.seekBar.max = String(n.totalTime), this.totalTimeLabel.textContent = secondToTime(n.totalTime);
                let s = this.soundFont;
                const o = {
                    run: t => this.ns === n && this.noteCallback(t),
                    stop: () => {}
                };
                if (null === s ? 
				this.player = new t.Player(!1, o) : 
				(
					"" === s && (s = "https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus"), 
					this.player = new t.SoundFontPlayer(s, void 0, void 0, void 0, o), 
					await this.player.loadSamples(n)
				), 
				this.ns !== n) 
					return;
                this.setLoaded(), this.dispatchEvent(new CustomEvent("load"))
            } catch (t) {
                throw this.setError(String(t)), t
            }
        }
        start() {
            (async () => {
                if (this.player)
                    if ("stopped" == this.player.getPlayState()) {
                        a && a.playing && a.stop(), a = this, this._playing = !0;
                        let t = this.currentTime;
                        0 == this.ns.notes.filter((e => e.startTime > t)).length && (t = 0), this.currentTime = t, this.controlPanel.classList.remove("stopped"), this.controlPanel.classList.add("playing");
                        try {
                            const e = this.player.start(this.ns, void 0, t);
                            this.dispatchEvent(new CustomEvent("start")), await e, this.handleStop(!0)
                        } catch (t) {
                            throw this.handleStop(), t
                        }
                    } else "paused" == this.player.getPlayState() && this.player.resume()
            })()
        }
        stop() {
            this.player && this.player.isPlaying() && this.player.stop(), this.handleStop(!1)
        }
        addVisualizer(t) {
            const e = {
                start: () => {
                    t.noteSequence = this.noteSequence
                },
                stop: () => {
                    t.clearActiveNotes()
                },
                note: e => {
                    t.redraw(e.detail.note)
                }
            };
            for (const t of r) this.addEventListener(t, e[t]);
            this.visualizerListeners.set(t, e)
        }
        removeVisualizer(t) {
            const e = this.visualizerListeners.get(t);
            for (const t of r) this.removeEventListener(t, e[t]);
            this.visualizerListeners.delete(t)
        }
        noteCallback(t) {
            this.playing && (this.dispatchEvent(new CustomEvent("note", {
                detail: {
                    note: t
                }
            })), this.seeking || (this.seekBar.value = String(t.startTime), 
			//↓播放时时间记录
			this.currentTimeLabel.textContent = secondToTime(t.startTime)))
        }
        handleStop(t = !1) {
            t && (this.currentTime = this.duration), this.controlPanel.classList.remove("playing"), this.controlPanel.classList.add("stopped"), this._playing && (this._playing = !1, this.dispatchEvent(new CustomEvent("stop", {
                detail: {
                    finished: t
                }
            })))
        }
        setVisualizerSelector(t) {
            for (const t of this.visualizerListeners.values())
                for (const e of r) this.removeEventListener(e, t[e]);
            if (this.visualizerListeners.clear(), null != t)
                for (const e of document.querySelectorAll(t)) e instanceof o ? this.addVisualizer(e) : console.warn(`Selector ${t} matched non-visualizer element`, e)
        }
        setLoading() {
            this.playButton.disabled = !0, this.seekBar.disabled = !0, this.controlPanel.classList.remove("error"), this.controlPanel.classList.add("loading", "frozen"), this.controlPanel.removeAttribute("title")
        }
        setLoaded() {
            this.controlPanel.classList.remove("loading", "frozen"), this.playButton.disabled = !1, this.seekBar.disabled = !1
        }
        setError(t) {
            this.playButton.disabled = !0, this.seekBar.disabled = !0, this.controlPanel.classList.remove("loading", "stopped", "playing"), this.controlPanel.classList.add("error", "frozen"), this.controlPanel.title = t
        }
        get noteSequence() {
            return this.ns
        }
        set noteSequence(t) {
            this.ns = t, this.removeAttribute("src"), this.initPlayer()
        }
        get src() {
            return this.getAttribute("src")
        }
        set src(t) {
            this.ns = null, this.setOrRemoveAttribute("src", t), this.initPlayer()
        }
        get soundFont() {
            return this.getAttribute("sound-font")
        }
        set soundFont(t) {
            this.setOrRemoveAttribute("sound-font", t)
        }
        get currentTime() {
            return parseFloat(this.seekBar.value)
        }
        set currentTime(t) {
            this.seekBar.value = String(t), 
			//↓播放前时间记录0:00
			this.currentTimeLabel.textContent = secondToTime(this.currentTime), 
			this.player && this.player.isPlaying() && this.player.seekTo(t)
        }
        get duration() {
            return parseFloat(this.seekBar.max)
        }
        get playing() {
            return this._playing
        }
        setOrRemoveAttribute(t, e) {
            null == e ? this.removeAttribute(t) : this.setAttribute(t, e)
        }
    }
    window.customElements.define("midi-player", l), 
	window.customElements.define("midi-visualizer", o), 
	window.addEventListener("DOMContentLoaded", (() => {
        const e = document.getElementById("midiFile");
        e && e.addEventListener("change", (e => {
            t.blobToNoteSequence(e.target.files[0]).then((t => {
                document.getElementById("mainPlayer").noteSequence = t, document.getElementById("mainVisualizer").noteSequence = t
            })).catch((t => {
                alert("Midi文件载入失败."), console.error(t)
            }))
        }))
    }))
}();
//# sourceMappingURL=index.js.map