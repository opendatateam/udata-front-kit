import config from "@/config"
import OauthAPI from "./api/OauthAPI"

const api = new OauthAPI()

export default class AuthService {
  constructor () {
    this.clientSecret = config.datagouvfr_oauth_client_secret
    this.clientId = config.datagouvfr_oauth_client_id
    this.baseURL = config.datagouvfr_base_url
    this.redirectURI = `${window.location.origin}/login/callback`
  }

  /**
   * Compute data.gouv.fr URL to be redirected to for oauth authorization
   */
  async getRedirectURL () {
    const codeVerifier = this.generateRandomString()
    const codeChallenge = await this.pkceChallengeFromVerifier(codeVerifier)
    const state = this.generateRandomString()
    const redirectURI = encodeURIComponent(this.redirectURI)
    const encodedState = encodeURIComponent(state)
    const encodedCC = encodeURIComponent(codeChallenge)

    localStorage.setItem("pkceCodeVerifier", codeVerifier)
    localStorage.setItem("pkceState", state)

    return `${this.baseURL}/oauth/authorize?redirect_uri=${redirectURI}&response_type=code&state=${encodedState}&client_id=${this.clientId}&scope=default&code_challenge=${encodedCC}&code_challenge_method=S256`
  }

  /**
   * Retrive an oauth token from a verification code
   */
  async retrieveToken (code, state) {
    const storedState = localStorage.getItem("pkceState")
    if (state != storedState) {
      const error = `Unmatching states: ${state} vs ${storedState}`
      console.error(error)
      throw new Error(error)
    }
    const pkceCodeVerifier = localStorage.getItem("pkceCodeVerifier")
    return await api.token({
      code,
      pkceCodeVerifier,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectURI: this.redirectURI,
    })
  }

  /**
   * Cleanup after login flow
   */
  cleanup () {
    localStorage.removeItem("pkceCodeVerifier")
    localStorage.removeItem("pkceState")
  }

  /**
   * Utils functions
   * see https://github.com/aaronpk/pkce-vanilla-js/blob/master/index.html
   *
   * This avoids using bloated and/or potentially unsafe packages for crypto features
   *
   */

  generateRandomString () {
    const array = new Uint32Array(28)
    window.crypto.getRandomValues(array)
    return Array.from(array, (dec) => (`0${dec.toString(16)}`).substr(-2)).join("")
  }

  createBasicAuthHeader () {
    const headerStr = btoa(`${this.clientId}:${this.clientSecret}`)
    return { Authorization: `Basic ${headerStr}` }
  }

  sha256 (plain) {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest("SHA-256", data)
  }

  base64urlencode (str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  }

  async pkceChallengeFromVerifier(v) {
    const hashed = await this.sha256(v);
    return this.base64urlencode(hashed);
  }
}
