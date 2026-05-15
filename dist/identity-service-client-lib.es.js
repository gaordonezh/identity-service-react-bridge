import { Fragment as e, createContext as t, useContext as n, useEffect as r, useMemo as i, useState as a } from "react";
import o from "axios";
import { jsx as s, jsxs as c } from "react/jsx-runtime";
//#region src/core/identity-service-axios-interceptors.ts
var l = async (e, t) => {
	let n = t?.getAccessToken();
	if (!n) {
		if (!await t?.refresh()) throw Error("Unauthenticated");
		n = t?.getAccessToken();
	}
	return e.headers = e.headers || {}, e.headers.Authorization = `Bearer ${n}`, e;
}, u = async (e, t) => {
	let n = e.config;
	if (!n || e.response?.status !== 401 || n._retry) return Promise.reject(e);
	if (n._retry = !0, !await t?.refresh()) return await t?.logout(), Promise.reject(e);
	let r = t?.getAccessToken();
	return n.headers = n.headers || {}, n.headers.Authorization = `Bearer ${r}`, n;
};
//#endregion
//#region src/utils/pkce.ts
function d(e) {
	return btoa(String.fromCharCode(...new Uint8Array(e))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
async function f() {
	let e = crypto.randomUUID() + crypto.randomUUID(), t = new TextEncoder().encode(e);
	return {
		verifier: e,
		challenge: d(await crypto.subtle.digest("SHA-256", t))
	};
}
//#endregion
//#region src/utils/storage.ts
var p = "netapp_auth_pkce_verifier", m = "netapp_auth_state";
function h(e) {
	localStorage.setItem(p, e);
}
function g() {
	return localStorage.getItem(p);
}
function _() {
	localStorage.removeItem(p);
}
function v(e) {
	localStorage.setItem(m, e);
}
function y() {
	return localStorage.getItem(m);
}
function b() {
	localStorage.removeItem(m);
}
//#endregion
//#region node_modules/jwt-decode/build/esm/index.js
var x = class extends Error {};
x.prototype.name = "InvalidTokenError";
function S(e) {
	return decodeURIComponent(atob(e).replace(/(.)/g, (e, t) => {
		let n = t.charCodeAt(0).toString(16).toUpperCase();
		return n.length < 2 && (n = "0" + n), "%" + n;
	}));
}
function C(e) {
	let t = e.replace(/-/g, "+").replace(/_/g, "/");
	switch (t.length % 4) {
		case 0: break;
		case 2:
			t += "==";
			break;
		case 3:
			t += "=";
			break;
		default: throw Error("base64 string is not of the correct length");
	}
	try {
		return S(t);
	} catch {
		return atob(t);
	}
}
function w(e, t) {
	if (typeof e != "string") throw new x("Invalid token specified: must be a string");
	t ||= {};
	let n = t.header === !0 ? 0 : 1, r = e.split(".")[n];
	if (typeof r != "string") throw new x(`Invalid token specified: missing part #${n + 1}`);
	let i;
	try {
		i = C(r);
	} catch (e) {
		throw new x(`Invalid token specified: invalid base64 for part #${n + 1} (${e.message})`);
	}
	try {
		return JSON.parse(i);
	} catch (e) {
		throw new x(`Invalid token specified: invalid json for part #${n + 1} (${e.message})`);
	}
}
//#endregion
//#region src/utils/jwt.ts
function T(e) {
	return w(e);
}
//#endregion
//#region src/core/auth-broadcast.ts
var E = "netapp_identity_channel", D = class {
	channel = new BroadcastChannel(E);
	publish(e) {
		this.channel.postMessage(e);
	}
	subscribe(e) {
		this.channel.onmessage = (t) => {
			e(t.data);
		};
	}
	destroy() {
		this.channel.close();
	}
}, O = class {
	options;
	accessToken = null;
	refreshPromise = null;
	refreshTimeout = null;
	broadcast = new D();
	tokenDecoded;
	constructor(e) {
		this.options = e, this.broadcast.subscribe((e) => {
			e === "LOGOUT" && (this.setAccessToken(null), this.redirect());
		});
	}
	setAccessToken(e) {
		if (this.accessToken = e, !e) {
			this.clearRefreshTimer();
			return;
		}
		this.tokenDecoded = T(e), this.scheduleRefresh(this.tokenDecoded.exp * 1e3);
	}
	scheduleRefresh(e) {
		this.clearRefreshTimer();
		let t = e - Date.now() - 1e3;
		if (t <= 0) {
			this.refresh();
			return;
		}
		this.refreshTimeout = setTimeout(() => {
			this.refresh();
		}, t);
	}
	clearRefreshTimer() {
		this.refreshTimeout &&= (clearTimeout(this.refreshTimeout), null);
	}
	async executeRefresh() {
		let e = await fetch(`${this.options.identityUrl}/auth/refresh`, {
			method: "POST",
			credentials: "include"
		});
		if (!e.ok) return this.setAccessToken(null), this.broadcast.publish("SESSION_EXPIRED"), !1;
		let t = await e.json();
		return this.setAccessToken(t.accessToken), !0;
	}
	redirect() {
		globalThis.location.href = this.options.logoutRedirectUri;
	}
	getAccessToken() {
		return this.accessToken;
	}
	isAuthenticated() {
		return !!this.accessToken;
	}
	async login() {
		let { verifier: e, challenge: t } = await f(), n = crypto.randomUUID();
		h(e), v(n);
		let r = new URL(`${this.options.identityUrl}/auth/authorize`);
		r.searchParams.set("client_id", this.options.clientId), r.searchParams.set("redirect_uri", this.options.redirectUri), r.searchParams.set("code_challenge", t), r.searchParams.set("state", n), this.broadcast.publish("LOGIN"), globalThis.location.href = r.toString();
	}
	async handleCallback() {
		let e = new URLSearchParams(globalThis.location.search), t = e.get("code"), n = e.get("state");
		if (!t || !n) return !1;
		if (n !== y()) throw Error("Invalid state");
		let r = g();
		if (!r) throw Error("Missing PKCE verifier");
		let i = await fetch(`${this.options.identityUrl}/auth/token`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({
				code: t,
				client_id: this.options.clientId,
				redirect_uri: this.options.redirectUri,
				code_verifier: r
			})
		});
		if (!i.ok) throw Error("Token exchange failed");
		let a = await i.json();
		return this.setAccessToken(a.accessToken), _(), b(), globalThis.history.replaceState({}, document.title, globalThis.location.pathname), !!a.accessToken;
	}
	async refresh() {
		if (this.refreshPromise !== null) return this.refreshPromise;
		this.refreshPromise = this.executeRefresh();
		try {
			return await this.refreshPromise;
		} finally {
			this.refreshPromise = null;
		}
	}
	async restoreSession() {
		return await this.refresh() && !0;
	}
	async logout() {
		await fetch(`${this.options.identityUrl}/auth/logout`, {
			method: "POST",
			credentials: "include",
			headers: { Authorization: `Bearer ${this.accessToken}` }
		}), this.setAccessToken(null), this.broadcast.publish("LOGOUT"), this.redirect();
	}
}, k = "data:image/png;base64,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", A = "data:image/svg+xml,%3csvg%20fill='%2319427D'%20viewBox='0%200%2024%2024'%20xmlns='http://www.w3.org/2000/svg'%20height='100px'%20width='100px'%3e%3cpath%20d='M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z'%20transform='translate(12,%2012)%20scale(0)'%3e%3canimateTransform%20id='spinner_XR07'%20begin='0;spinner_npiH.begin+0.4s'%20attributeName='transform'%20calcMode='spline'%20type='translate'%20dur='1.2s'%20values='12%2012;0%200'%20keySplines='.52,.6,.25,.99'%20/%3e%3canimateTransform%20begin='0;spinner_npiH.begin+0.4s'%20attributeName='transform'%20calcMode='spline'%20additive='sum'%20type='scale'%20dur='1.2s'%20values='0;1'%20keySplines='.52,.6,.25,.99'%20/%3e%3canimate%20begin='0;spinner_npiH.begin+0.4s'%20attributeName='opacity'%20calcMode='spline'%20dur='1.2s'%20values='1;0'%20keySplines='.52,.6,.25,.99'%20/%3e%3c/path%3e%3cpath%20d='M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z'%20transform='translate(12,%2012)%20scale(0)'%3e%3canimateTransform%20id='spinner_r5ci'%20begin='spinner_XR07.begin+0.4s'%20attributeName='transform'%20calcMode='spline'%20type='translate'%20dur='1.2s'%20values='12%2012;0%200'%20keySplines='.52,.6,.25,.99'%20/%3e%3canimateTransform%20begin='spinner_XR07.begin+0.4s'%20attributeName='transform'%20calcMode='spline'%20additive='sum'%20type='scale'%20dur='1.2s'%20values='0;1'%20keySplines='.52,.6,.25,.99'%20/%3e%3canimate%20begin='spinner_XR07.begin+0.4s'%20attributeName='opacity'%20calcMode='spline'%20dur='1.2s'%20values='1;0'%20keySplines='.52,.6,.25,.99'%20/%3e%3c/path%3e%3cpath%20d='M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z'%20transform='translate(12,%2012)%20scale(0)'%3e%3canimateTransform%20id='spinner_npiH'%20begin='spinner_XR07.begin+0.8s'%20attributeName='transform'%20calcMode='spline'%20type='translate'%20dur='1.2s'%20values='12%2012;0%200'%20keySplines='.52,.6,.25,.99'%20/%3e%3canimateTransform%20begin='spinner_XR07.begin+0.8s'%20attributeName='transform'%20calcMode='spline'%20additive='sum'%20type='scale'%20dur='1.2s'%20values='0;1'%20keySplines='.52,.6,.25,.99'%20/%3e%3canimate%20begin='spinner_XR07.begin+0.8s'%20attributeName='opacity'%20calcMode='spline'%20dur='1.2s'%20values='1;0'%20keySplines='.52,.6,.25,.99'%20/%3e%3c/path%3e%3c/svg%3e", j = ({ dateFormat: e }) => /* @__PURE__ */ c("div", {
	className: "sso__alert",
	children: [/* @__PURE__ */ s("p", {
		className: "sso__alert--icon sso__m-0",
		children: /* @__PURE__ */ s("svg", {
			focusable: "false",
			"aria-hidden": "true",
			viewBox: "0 0 24 24",
			"data-testid": "SuccessOutlinedIcon",
			height: 32,
			width: 32,
			children: /* @__PURE__ */ s("path", { d: "M20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4C12.76,4 13.5,4.11 14.2, 4.31L15.77,2.74C14.61,2.26 13.34,2 12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0, 0 22,12M7.91,10.08L6.5,11.5L11,16L21,6L19.59,4.58L11,13.17L7.91,10.08Z" })
		})
	}), /* @__PURE__ */ c("p", {
		className: "sso__m-0",
		children: [
			/* @__PURE__ */ s("b", { children: "¡IMPORTANTE!" }),
			" La contraseña es la misma que el usuario solo para la primera vez que ingrese con el SSO, posteriormente este le pedirá cambiarlo. Recuerda hacerlo antes del ",
			e
		]
	})]
}), M;
function N(e) {
	let t = o.create({
		withCredentials: !0,
		timeout: 3e3,
		...e
	});
	return t.interceptors.request.use(async (e) => await l(e, M)), t.interceptors.response.use((e) => e, async (e) => t(await u(e, M))), t;
}
var P = t({}), F = () => n(P), I = ({ options: t, expireDate: n, children: o }) => {
	let [l, u] = a(!0), [d, f] = a(!1), [p, m] = a(!1), h = async () => {
		try {
			if (p) return;
			u(!0), m(!0), M = new O(t), await M.handleCallback() || await M.restoreSession(), f(M.isAuthenticated());
		} finally {
			if (p) return;
			m(!1), u(!1);
		}
	};
	r(() => {
		h();
	}, [M]);
	let g = i(() => {
		let e = n.getFullYear(), t = String(n.getMonth() + 1).padStart(2, "0"), r = String(n.getDate()).padStart(2, "0");
		return {
			show: n >= /* @__PURE__ */ new Date(),
			format: `${r}/${t}/${e}`
		};
	}, [n]), _ = i(() => ({
		login: () => M.login(),
		logout: () => M.logout(),
		refresh: () => M.refresh(),
		tokenDecoded: M?.tokenDecoded
	}), [M]);
	return /* @__PURE__ */ s(P.Provider, {
		value: _,
		children: d && !l ? o : /* @__PURE__ */ c("main", {
			className: "sso__main",
			children: [g.show && !l ? /* @__PURE__ */ s(j, { dateFormat: g.format }) : null, /* @__PURE__ */ c("div", {
				className: "sso__card",
				children: [
					/* @__PURE__ */ s("img", {
						src: k,
						className: "sso__image",
						alt: "sso"
					}),
					/* @__PURE__ */ s("h1", {
						className: "sso__title",
						children: "Módulo de Usuarios"
					}),
					l ? /* @__PURE__ */ s("img", {
						src: A,
						alt: "loader"
					}) : /* @__PURE__ */ c(e, { children: [/* @__PURE__ */ c("p", {
						className: "sso__paragraph",
						children: [
							"Continue con el ",
							/* @__PURE__ */ s("code", { children: "SSO Netappperu SAC" }),
							" siguiendo los pasos que se le indique..."
						]
					}), /* @__PURE__ */ s("button", {
						className: "sso__button sso__button--full",
						onClick: () => _.login(),
						children: "INGRESAR SSO NAPCONTABLE"
					})] })
				]
			})]
		})
	});
};
//#endregion
export { I as IdentityServiceAuthenticationProvider, N as createIdentityServiceAxiosInstance, F as useIdentityServiceAuthentication };

//# sourceMappingURL=identity-service-client-lib.es.js.map