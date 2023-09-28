import axios from "axios"
import config from "@/config"

export default class OauthAPI {
  /**
   * Get a token after PKCE flow
   *
   * @param {object}
   * @returns {object}
   */
  async token ({code, pkceCodeVerifier, clientId, clientSecret, redirectURI}) {
    const url = `${config.datagouvfr_base_url}/oauth/token`
    const bodyFormData = new FormData()
    bodyFormData.append("grant_type", "authorization_code")
    bodyFormData.append("code", code)
    bodyFormData.append("redirect_uri", redirectURI)
    bodyFormData.append("client_id", clientId)
    bodyFormData.append("client_secret", clientSecret)
    bodyFormData.append("code_verifier", pkceCodeVerifier)
    const response = await axios({
      method: "post",
      url,
      data: bodyFormData,
    })
    return response.data.access_token
  }
}
