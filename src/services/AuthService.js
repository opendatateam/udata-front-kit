import config from '@/config'

import OauthAPI from './api/OauthAPI'

const api = new OauthAPI()

export default class AuthService {
  constructor() {
    this.clientSecret = config.datagouvfr.oauth_client_secret
    this.clientId = config.datagouvfr.oauth_client_id
    this.baseURL = config.datagouvfr.base_url
    this.redirectURI = `${window.location.origin}/login/callback`
  }

  /**
   * Compute data.gouv.fr URL to be redirected to for oauth authorization
   */
  async getRedirectURL() {
    const codeVerifier = this.generateRandomString()
    const codeChallenge = await this.pkceChallengeFromVerifier(codeVerifier)
    const state = this.generateRandomString()
    const redirectURI = encodeURIComponent(this.redirectURI)
    const encodedState = encodeURIComponent(state)
    const encodedCC = encodeURIComponent(codeChallenge)

    localStorage.setItem('pkceCodeVerifier', codeVerifier)
    localStorage.setItem('pkceState', state)

    return `${this.baseURL}/oauth/authorize?redirect_uri=${redirectURI}&response_type=code&state=${encodedState}&client_id=${this.clientId}&scope=default&code_challenge=${encodedCC}&code_challenge_method=S256`
  }

  /**
   * Retrive an oauth token from a verification code
   */
  async retrieveToken(code, state) {
    const storedState = localStorage.getItem('pkceState')
    if (state !== storedState) {
      const error = `Unmatching states: ${state} vs ${storedState}`
      console.error(error)
      throw new Error(error)
    }
    const pkceCodeVerifier = localStorage.getItem('pkceCodeVerifier')
    return await api.token({
      code,
      pkceCodeVerifier,
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      redirectURI: this.redirectURI
    })
  }

  createBasicAuthHeader() {
    const headerStr = btoa(`${this.clientId}:${this.clientSecret}`)
    return { Authorization: `Basic ${headerStr}` }
  }

  /**
   * Logout remote procedure
   */
  async logout(token) {
    return await api.logout(token, this.createBasicAuthHeader())
  }

  /**
   * Cleanup after login flow
   */
  cleanup() {
    localStorage.removeItem('pkceCodeVerifier')
    localStorage.removeItem('pkceState')
  }

  /**
   * Utils functions
   * see https://github.com/aaronpk/pkce-vanilla-js/blob/master/index.html
   *
   * This avoids using bloated and/or potentially unsafe packages for crypto features
   *
   * TODO: merge the copyright with our own if we use a MIT license
   *
   * MIT License
   *
   * Copyright (c) 2019 Aaron Parecki
   *
   * Permission is hereby granted, free of charge, to any person obtaining a copy
   * of this software and associated documentation files (the "Software"), to deal
   * in the Software without restriction, including without limitation the rights
   * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
   * copies of the Software, and to permit persons to whom the Software is
   * furnished to do so, subject to the following conditions:

   * The above copyright notice and this permission notice shall be included in all
   * copies or substantial portions of the Software.
   *
   * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
   * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
   * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
   * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
   * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
   * SOFTWARE.
   *
   */

  generateRandomString() {
    const array = new Uint32Array(28)
    window.crypto.getRandomValues(array)
    return Array.from(array, (dec) => `0${dec.toString(16)}`.substr(-2)).join(
      ''
    )
  }

  sha256(plain) {
    const encoder = new TextEncoder()
    const data = encoder.encode(plain)
    return window.crypto.subtle.digest('SHA-256', data)
  }

  base64urlencode(str) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(str)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }

  async pkceChallengeFromVerifier(v) {
    const hashed = await this.sha256(v)
    return this.base64urlencode(hashed)
  }

  /*
   * end util functions
   **/
}
