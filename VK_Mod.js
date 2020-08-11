// ==UserScript==
// @name			VK Mod
// @name:ru			Мод для Вконтакте
// @namespace			SoThUg
// @version			0.9
// @description			Add some function on site "vk.com"
// @description:ru		Добавляет разные функции на сайт вконтакте
// @author			SoThUg
// @downloadURL			https://raw.githubusercontent.com/sothug/vk-mod/master/VK_Mod.js
// @updateURL			https://raw.githubusercontent.com/sothug/vk-mod/master/VK_Mod.js
// @match			*://vk.com/*
// @match			*://*.vk.com/*
// @start-at			document-start
// @grant			none
// ==/UserScript==

"use strict"

const script_name = "VK Mod"

const storageName = "vk_mod_preference"
const DNTName = "vk_mod_do_not_type"
const DNRName = "vk_mod_do_not_read"
const default_storage = {
	ads_left: true,
	ads_block: true,
	marked_as_ads: true,
	story: false,
	audio_ads: true,
	dnr: true,
	dnr_audio: true,
	dnt: true,
	dnt_audio: true,
	getDeep: 100
}


// vars on window
var vk = {id: 0},			// window.vk
ap,							// window.ap - аудиоплеер
cur = {peer: 0},			// window.cur

vkMod,						// window.vkMod
w,							// window

uiActionsMenu,				// window.uiActionsMenu
TopMenu						// window.TopMenu

var get = {
	varOnWindow(id, callback = null, deep = 1) {
		if (!isrtype(id, "", "get.varOnWindow")) {
			return false
		}

		if (!!w[id]) {
			console.debug(`get.varOnWindow: ${id} успешно получен`)
			callback.call(this, id, w[id])
			return true
		}

		if (deep > get.deep) {
			console.error(`get.varOnWindow: ${id} - превышен лимит ожидания(${get.deep})`)
			return false
		}

		w.setTimeout(get.varOnWindow, 100, id, callback, deep + 1)
		console.debug(`get.varOnWindow: ${id} - ожидание(${deep})`)
	}, 
	elementOnDOM(id, callback = null, deep = 1) {
		if (!isrtype(id, "", "get.elementOnDOM")) {
			return false
		}

		if (document.querySelectorAll(id).length) {
			console.debug(`get.elementOnDOM: "${id}" успешно получен`)
			callback.call(this, id, document.querySelectorAll(id))
			return true
		}

		if (deep > get.deep) {
			console.error(`get.elementOnDOM: "${id}" - превышен лимит ожидания(${get.deep})`)
			return false
		}

		w.setTimeout(get.elementOnDOM, 100, id, callback, deep + 1)
		console.debug(`get.elementOnDOM: "${id}" - ожидание(${deep})`)
	}
}
Object.defineProperty(get, "deep", {
	get: () => {return getStorageForId(storageName, vk.id)["getDeep"]}, 
	set: (val) => {setStorageForId(storageName, "getDeep", val, vk.id)}, 
	enumerable: true, 
	configurable: true
})

var menu = {
	html: `
<div id="vk_mod_menu">
	<div id="vk_mod_menu_bg" onclick="vkMod.menu.close()"></div>
	<div id="vk_mod_menu_wrap">
		<div class="popup_box_container" style="width: fit-content;height: auto;margin-top: 20vh;z-index: 10500;position: relative;" tabindex="0">
			<div class="box_layout">
				<div class="vk_mod_menu_box_title box_title_wrap" style="">
					<div class="box_x_button" aria-label="Закрыть" tabindex="0" role="button" onclick="vkMod.menu.close()"></div>
					<div class="box_title_controls">VK Mod 0.9</div>
					<div class="box_title">Настройки VK Mod</div>
				</div>
				<div class="vk_mod_menu_box_body box_body box_no_buttons" style="display: block;padding: 1vh 2vh 1vh 2vh">
					<div class="settings_line">
						<div class="settings_label">Реклама</div>
						<div class="settings_labeled_text">
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_ads_left" type="checkbox" class="vk_mod_input _checkbox input_ads_left" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'ads_left', document.getElementsByClassName('input_ads_left')[0].checked, vk.id);
									vkMod.styles.updateStyles('ads_left')
									vkMod.menu.updateInputs('ads_left')
								">
								<label for="vk_mod_settigns_ads_left">Выключить рекламу слева</label>
							</div>
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_ads_block" type="checkbox" class="vk_mod_input _checkbox input_ads_block" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'ads_block', document.getElementsByClassName('input_ads_block')[0].checked, vk.id);
									vkMod.styles.updateStyles('ads_block')
									vkMod.menu.updateInputs('ads_block')
								">
								<label for="vk_mod_settigns_ads_block">Выключить блок "Рекламная запись"</label>
							</div>
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_marked_as_ads" type="checkbox" class="vk_mod_input _checkbox input_marked_as_ads" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'marked_as_ads', document.getElementsByClassName('input_marked_as_ads')[0].checked, vk.id);
									vkMod.styles.updateStyles('marked_as_ads')
									vkMod.menu.updateInputs('marked_as_ads')
								">
								<label for="vk_mod_settigns_marked_as_ads">Выключить посты с проплаченной рекламой(работает наполовину)</label>
							</div>
						</div>
					</div>
					<div class="settings_line">
						<div class="settings_label">Интерфейс</div>
						<div class="settings_labeled_text">
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_story" type="checkbox" class="vk_mod_input _checkbox input_story" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'story', document.getElementsByClassName('input_story')[0].checked, vk.id);
									vkMod.styles.updateStyles('story')
									vkMod.menu.updateInputs('story')
								">
								<label for="vk_mod_settigns_story">Выключить блок историй</label>
							</div>
						</div>
					</div>
					<div class="settings_line">
						<div class="settings_label">Аудио</div>
						<div class="settings_labeled_text">
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_audio_ads" type="checkbox" class="vk_mod_input _checkbox input_audio_ads" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'audio_ads', document.getElementsByClassName('input_audio_ads')[0].checked, vk.id);
									vkMod.menu.updateInputs('audio_ads')
								">
								<label for="vk_mod_settigns_audio_ads">Выключить рекламу в аудиоплеере</label>
							</div>
						</div>
					</div>
					<div class="settings_line">
						<div class="settings_label">Активность</div>
						<div class="settings_labeled_text">
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_dnr" type="checkbox" class="vk_mod_input _checkbox input_dnr" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'dnr', document.getElementsByClassName('input_dnr')[0].checked, vk.id);
									vkMod.menu.updateInputs('dnr')
								">
								<label for="vk_mod_settigns_dnr" class="label_for_checkbox">Нечиталка</label>
							</div>
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_dnr_audio" type="checkbox" class="vk_mod_input _checkbox input_dnr_audio" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'dnr_audio', document.getElementsByClassName('input_dnr_audio')[0].checked, vk.id);
									vkMod.menu.updateInputs('dnr_audio')
								">
								<label for="vk_mod_settigns_dnr_audio" class="label_for_checkbox">Нечиталка голосовых</label>
							</div>
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_dnt" type="checkbox" class="vk_mod_input _checkbox input_dnt" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'dnt', document.getElementsByClassName('input_dnt')[0].checked, vk.id);
									vkMod.menu.updateInputs('dnt')
								">
								<label for="vk_mod_settigns_dnt">Неписалка</label>
							</div>
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_dnt_audio" type="checkbox" class="vk_mod_input _checkbox input_dnt_audio" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'dnt_audio', document.getElementsByClassName('input_dnt_audio')[0].checked, vk.id);
									vkMod.menu.updateInputs('dnt_audio')
								">
								<label for="vk_mod_settigns_dnt_audio">Неписалка голосовых</label>
							</div>
						</div>
					</div>
					<div class="settings_line">
						<div class="settings_label">Системные</div>
						<div class="settings_labeled_text">
							<div class="settings_labeled_row">
								<input id="vk_mod_settigns_getDeep" type="number" class="vk_mod_input _number input_getDeep dark" onchange="
									vkMod.setStorageForId('vk_mod_preference', 'getDeep', document.getElementsByClassName('input_getDeep')[0].value, vk.id);
									vkMod.menu.updateInputs('getDeep')
								">
								<label for="vk_mod_settigns_getDeep">Глубина ожидания переменной</label>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
	`,
	updateInputs(id = undefined) {
		if (id) {
			let el = document.getElementsByClassName(`input_${id}`)[0]
			if (getStorageForId(storageName, vk.id)[id] == undefined) {
				setStorageForId(storageName, id, default_storage[id], vk.id)
			}

			console.debug("updateInputs:", id, getStorageForId(storageName, vk.id)[id])

			if (el.type == "number") {
				el.value = getStorageForId(storageName, vk.id)[id]
			}
			if (el.type == "checkbox") {
				el.checked = getStorageForId(storageName, vk.id)[id]
			}
		}
		else {
			let inputs_class = ["ads_left", "ads_block", "marked_as_ads", "story", "audio_ads", "dnr", "dnr_audio", "dnt", "dnt_audio", "getDeep"]

			inputs_class.forEach((e, i, a) => {
				let el = document.getElementsByClassName(`input_${e}`)[0]
				if (getStorageForId(storageName, vk.id)[e] == undefined) {
					setStorageForId(storageName, e, default_storage[e], vk.id)
				}

				console.debug("updateInputs:", e, getStorageForId(storageName, vk.id)[e])

				if (el.type == "number") {
					el.value = getStorageForId(storageName, vk.id)[e]
				}
				if (el.type == "checkbox") {
					el.checked = getStorageForId(storageName, vk.id)[e]
				}
			})
		}
	},
	show() {
		if (!document.getElementById("vk_mod_menu")) {
			document.body.insertAdjacentHTML("afterBegin", menu.html)
		}
		if (!document.getElementById("vk_mod_style_menu")) {
			document.head.insertAdjacentHTML("beforeEnd", styles.menu)
		}

		menu.updateInputs()
	},
	close() {
		if (document.getElementById("vk_mod_menu")) {
			document.getElementById("vk_mod_menu").remove()
		}
		if (document.getElementById("vk_mod_style_menu")) {
			document.getElementById("vk_mod_style_menu").remove()
		}
	}
}

var styles = {
	menu: `
<style id="vk_mod_style_menu">
	[dir] #vk_mod_menu {
		background: rgba(0, 0, 0, 0.7);
	}
	[dir=ltr] #vk_mod_menu {
		left: 0;
	}
	#vk_mod_menu {
		position: fixed;
		width: 100%;
		height: 100%;
		z-index: 10000;
	}
	.vk_mod_menu_box_body {
		max-height: 50vmin;
		overflow-y: auto;
	}
	.vk_mod_input._number {
		width: 10vmax;
	}
	[dir] .settings_line {
		margin: 0;
		padding: 15px 0 14px;
		border-bottom: 1px solid var(--steel_gray_80);
	}
	[dir=ltr] .settings_label {
		padding: 6px 10px 6px 0;
		float: left;
	}
	.settings_label {
		color: var(--gray_600);
		width: 145px;
		line-height: 16px;
	}
	[dir=ltr] .settings_labeled_text {
		margin: 0 0 8px 155px;
	}
	[dir] .settings_labeled_text {
		padding-top: 6px;
	}
	.settings_labeled_row {
		margin-bottom: 5px;
	}
</style>
	`,
	ads_left: `
<style id="vk_mod_style_ads_left">
	#ads_left {
		display: none !important;
	}
</style>
	`,
	ads_block: `
<style id="vk_mod_style_ads_block">
	._ads_block_data_w {
		display: none !important;
	}
</style>
	`,
	marked_as_ads: `
<style id="vk_mod_style_marked_as_ads">
	.marked_as_ads {
		display: none !important;
	}
</style>
	`,
	story: `
<style id="vk_mod_style_story">
	.stories_feed_wrap {
		display: none !important;
	}
</style>
	`,
	updateStyles(id = undefined) {
		if (id) {
			let el = document.getElementById(`vk_mod_style_${id}`)
			if (getStorageForId(storageName, vk.id)[id] == undefined) {
				setStorageForId(storageName, id, default_storage[id], vk.id)
			}

			console.debug("updateStyles:", id, getStorageForId(storageName, vk.id)[id])

			if (getStorageForId(storageName, vk.id)[id] && !el) {
				document.head.insertAdjacentHTML("beforeEnd", styles[id])
			}
			if (!getStorageForId(storageName, vk.id)[id] && el) {
				el.remove()
			}
		}
		else {
			let styles_list = ["ads_left", "ads_block", "marked_as_ads", "story"]
			
			styles_list.forEach((e, i, a) => {
				let el = document.getElementById(`vk_mod_style_${e}`)
				if (getStorageForId(storageName, vk.id)[e] == undefined) {
					setStorageForId(storageName, e, default_storage[e], vk.id)
				}

				console.debug("updateStyles:", e, getStorageForId(storageName, vk.id)[e])

				if (getStorageForId(storageName, vk.id)[e] && !el) {
					document.head.insertAdjacentHTML("beforeEnd", styles[e])
				}
				if (!getStorageForId(storageName, vk.id)[e] && el) {
					el.remove()
				}
			})
		}
	}
}

function getStorage(name = storageName) {
	let storage = JSON.parse(localStorage.getItem(name))
	if ((name == storageName) && !storage) {
		return default_storage
	}
	return storage || {}
}

function getStorageForId(name, id) {
	let storage = JSON.parse(localStorage.getItem(name))
	if ((name == storageName) && !storage) {
		return default_storage
	}
	return storage[id] || {}
}

function setStorage(name, key, value) {
	console.debug("setStorage(", name, ',', key, ',', value, ')')
	let storage = getStorage(name)

	storage[key] = value

	localStorage.setItem(name, JSON.stringify(storage))
}

function setStorageForId(name, key, value, id) {
	console.debug("setStorageForId(", name, ',', key, ',', value, ',', id, ')')
	let storage = getStorage(name),
	storage_for_id = storage[id] || {}

	storage_for_id[key] = value
	storage[id] = storage_for_id

	localStorage.setItem(name, JSON.stringify(storage))
}

function getDNTStatus(id) {
	return !(getStorageForId(storageName, vk.id)["dnt_preference"] || '').match(`.${id}.`)
}

function setDNTStatus(id, val = true) {
	console.debug("setDNTStatus(", id, ",", val, ")")
	let DNT = (getStorageForId(storageName, vk.id)["dnt_preference"] || '')

	if (val && DNT.match(`.${id}.`)) {
		setStorageForId(storageName, "dnt_preference", DNT.replace(`.${id}.`, ""), vk.id)
	}

	if (!val && !DNT.match(`.${id}.`)) {
		setStorageForId(storageName, "dnt_preference", DNT + `.${id}.`, vk.id)
	}
}

function getDNRStatus(id) {
	return !(getStorageForId(storageName, vk.id)["dnr_preference"] || '').match(`.${id}.`)
}

function setDNRStatus(id, val = true) {
	console.debug("setDNRStatus(", id, ",", val, ")")
	let DNR = (getStorageForId(storageName, vk.id)["dnr_preference"] || '')

	if (val && DNR.match(`.${id}.`)) {
		setStorageForId(storageName, "dnr_preference", DNR.replace(`.${id}.`, ""), vk.id)
	}

	if (!val && !DNR.match(`.${id}.`)) {
		setStorageForId(storageName, "dnr_preference", DNR + `.${id}.`, vk.id)
	}
}

function setUI(id, val) {
	if (!isrtype(id, "", "setUI")) {
		return undefined
	}

	switch(id) {
		case "uiActionsMenu":
			let {show} = val

			val.show = function(t, e, i) {
				show.apply(this, Array.prototype.slice.call(arguments))

				let el = (document.getElementsByClassName("im-action_mute")[0] || document.getElementsByClassName("im-action_unmute")[0]);
				if (!el) {
					return !1
				}

				if (!document.getElementsByClassName("im-action_dnr").length && !document.getElementsByClassName("im-action_dnt").length) {
					el.insertAdjacentHTML("beforeBegin", 
						`<style type="text/css">
							[dir]
							.ui_actions_menu_item.im-action.im-action_dnr.true::before,
							.ui_actions_menu_item.im-action.im-action_dnt.true::before {
								background-position: 5px -405px;
							}
							[dir]
							.ui_actions_menu_item.im-action.im-action_dnr.false::before,
							.ui_actions_menu_item.im-action.im-action_dnt.false::before {
								background-position: 5px -305px;
							}
						</style>`)
					el.insertAdjacentHTML("beforeBegin", `<a 
															id="im_dnr" 
															tabindex="0" 
															role="link" 
															class="ui_actions_menu_item _im_action im-action im-action_dnr" 
															onclick="
																window.cur && !!cur.peer && vkMod.setDNRStatus(cur.peer, !vkMod.getDNRStatus(cur.peer));
																this.text = vkMod.getDNRStatus(cur.peer) ? ' Выключить нечиталку' : ' Включить нечиталку';
																this.classList.add((vkMod.getDNRStatus(cur.peer)).toString());
																this.classList.remove((!vkMod.getDNRStatus(cur.peer)).toString())
															">
																 ${vkMod.getDNRStatus(cur.peer) ? "Выключить нечиталку" : "Включить нечиталку"}
															</a>`)
					el.insertAdjacentHTML("beforeBegin", `<a 
															id="im_dnt" 
															tabindex="0" 
															role="link" 
															class="ui_actions_menu_item _im_action im-action im-action_dnt" 
															onclick="
																window.cur && !!cur.peer && vkMod.setDNTStatus(cur.peer, !vkMod.getDNTStatus(cur.peer));
																this.text = vkMod.getDNTStatus(cur.peer) ? ' Выключить неписалку' : ' Включить неписалку';
																this.classList.add((vkMod.getDNTStatus(cur.peer)).toString());
																this.classList.remove((!vkMod.getDNTStatus(cur.peer)).toString())
															">
																 ${vkMod.getDNTStatus(cur.peer) ? "Выключить неписалку" : "Включить неписалку"}
															</a>`)
					el.insertAdjacentHTML("beforeBegin", `<div class="ui_actions_menu_sep"></div>`)
					document.getElementById("im_dnr").classList.add((vkMod.getDNRStatus(cur.peer)).toString())
					document.getElementById("im_dnr").classList.remove((!vkMod.getDNRStatus(cur.peer)).toString())
					document.getElementById("im_dnt").classList.add((vkMod.getDNTStatus(cur.peer)).toString())
					document.getElementById("im_dnt").classList.remove((!vkMod.getDNTStatus(cur.peer)).toString())
				}
			}
			break;
		case "#top_profile_menu":
			let el = document.getElementById("top_profile_menu")

			if (!document.getElementById("top_vk_mod_menu_link")) {
				el.lastElementChild.insertAdjacentHTML("beforeBegin", `<a 
																		class="top_profile_mrow" 
																		id="top_vk_mod_menu_link" 
																		onclick="vkMod && vkMod.menu.show()" 
																		style="">
																			Настройки VK Mod
																		</a>`)
				el.lastElementChild.insertAdjacentHTML("beforeBegin", `<div class="top_profile_sep"></div>`)
			}
			break
		default:
			console.error(`setUI has no id: ${id}`)
			return () => {}
	}
}

function isrtype(id, rid, name) {
	if (typeof id !== typeof "") {
		console.error(`${name}: id must be a ${typeof rid}`)
		return false
	}
	return true
}

function XHRListener() {
	const {send} = XMLHttpRequest.prototype

	XMLHttpRequest.prototype.send = function (data) {
		if (/type=typing/.test(data) && getStorageForId(storageName, vk.id)["dnt"] && getDNTStatus(data.match(/peer=([0-9]+)/)[1])) {
			this.abort()
		}
		if (/type=audiomessage/.test(data) && getStorageForId(storageName, vk.id)["dnt_audio"] && getDNTStatus(data.match(/peer=([0-9]+)/)[1])) {
			this.abort()
		}

		if (/act=a_mark_read/.test(data) && getStorageForId(storageName, vk.id)["dnr"] && getDNRStatus(data.match(/peer=([0-9]+)/)[1])) {
			this.abort()
		}
		if (/act=a_mard_listened/.test(data) && getStorageForId(storageName, vk.id)["dnr_audio"] && getDNTStatus(data.match(/peer=([0-9]+)/)[1])) {
			this.abort()
		}

		send.apply(this, Array.prototype.slice.call(arguments))
	}
}

function vkApi() {
	w.vkAsyncInit = function() {
		VK.init({
			apiId: 7556888
		})
	}

	document.body.insertAdjacentHTML("afterBegin", "<div id=\"vk_api_transport\"></div>")

	var api = document.createElement("script")
	api.src = "https://vk.com/js/api/openapi.js?168"
	api.type = "text/javascript"
	api.async = true
	document.getElementById("vk_api_transport").appendChild(api)
}

function watcher(id, oldVal, val) {
	console.debug("Watcher:", id, oldVal, val);
	switch(id) {
		case "_adman":
			if (getStorageForId(storageName, vk.id)["audio_ads"] && val != null) {
				let {start} = val;
				val.start = function(a) {start.apply(this, Array.prototype.slice.call(arguments)); setTimeout(function() {val.skip()}, 100)};
			}
			return val;
		case "cur":
			if (getStorageForId(storageName, vk.id)["marked_as_ads"] == undefined) {
				setStorageForId(storageName, "marked_as_ads", default_storage["marked_as_ads"], vk.id)
			}
			if (getStorageForId(storageName, vk.id)["marked_as_ads"] && ["feed", "public"].includes(val.module)) {
				get.elementOnDOM(".wall_marked_as_ads", (id, val) => {
					val.forEach((e, i, a) => {
						e.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add("marked_as_ads")
					})
				})
			}
			return val;
		default:
			return val;
	}
}

function objWatch() {
	/*
	 * object.watch polyfill
	 *
	 * 2012-04-03
	 *
	 * By Eli Grey, http://eligrey.com
	 * Public Domain.
	 * NO WARRANTY EXPRESSED OR IMPLIED. USE AT YOUR OWN RISK.
	 */


	// object.watch
	if (!w.Object.prototype.watchh) {
		w.Object.defineProperty(w.Object.prototype, "watchh", {
			enumerable: false
			, configurable: true
			, writable: false
			, value: function (prop, handler) {
				var
				oldval = this[prop]
				, newval = oldval
				, getter = function () {
					return newval;
				}
				, setter = function (val) {
					oldval = newval;
					return newval = handler.call(this, prop, oldval, val);
				}
				;

				if (delete this[prop]) { // can't watch constants
					w.Object.defineProperty(this, prop, {
						get: getter
						, set: setter
						, enumerable: true
						, configurable: true
					});
				}
			}
		});
	}

	// object.unwatch
	if (!w.Object.prototype.unwatchh) {
		w.Object.defineProperty(w.Object.prototype, "unwatchh", {
			enumerable: false
			, configurable: true
			, writable: false
			, value: function (prop) {
				var val = this[prop];
				delete this[prop]; // remove accessors
				this[prop] = val;
			}
		});
	}
}

function setWindow(w) {
	w.vkMod = {}
	vkMod = w.vkMod

	vkMod.getStorage = getStorage
	vkMod.getStorageForId = getStorageForId
	vkMod.setStorage = setStorage
	vkMod.setStorageForId = setStorageForId

	vkMod.getDNTStatus = getDNTStatus
	vkMod.setDNTStatus = setDNTStatus
	vkMod.getDNRStatus = getDNRStatus
	vkMod.setDNRStatus = setDNRStatus

	vkMod.get = get

	vkMod.menu = menu

	vkMod.styles = styles
}

(function(window, undefined) {
	w = window
	if (w.self != w.top)
		return

	console.info(script_name)

	objWatch()

	XHRListener()
	setWindow(window)

	get.varOnWindow("uiActionsMenu", (id, val) => {uiActionsMenu = val; setUI(id, val)})
	get.elementOnDOM("#top_profile_menu", (id, val) => {setUI(id, val)})
	get.varOnWindow("vk", (id, val) => {vk = val})
	get.varOnWindow("ap", (id, val) => {ap = val; ap.ads.watchh(`_adman`, watcher)})
	get.varOnWindow("cur", (id, val) => {
		cur = val
		w.watchh(`cur`, watcher)
		if (getStorageForId(storageName, vk.id)["marked_as_ads"] == undefined) {
			setStorageForId(storageName, "marked_as_ads", default_storage["marked_as_ads"], vk.id)
		}
		if (getStorageForId(storageName, vk.id)["marked_as_ads"] && (val.module == "feed" || val.module == "public")) {
			document.getElementsByClassName("wall_marked_as_ads").forEach((e, i, a) => {
				e.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.classList.add("marked_as_ads")
			})
		}
	})

	w.addEventListener('load', function() {
		//vkApi()
		styles.updateStyles()
		//menu.show()
	})
})(window)
