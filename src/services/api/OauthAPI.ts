import axios from 'axios'
import type { AxiosResponse } from 'axios'

import config from '@/config'

interface TokenParams {
  code: string
  pkceCodeVerifier: string
  clientId: string
  clientSecret: string
  redirectURI: string
}

export default class OauthAPI {
  /**
   * Get a token after PKCE flow
   */
  async token(tokenConfig: TokenParams): Promise<string> {
    const url = `${config.datagouvfr.base_url}/oauth/token`
    const bodyFormData = new FormData()
    bodyFormData.append('grant_type', 'authorization_code')
    bodyFormData.append('code', tokenConfig.code)
    bodyFormData.append('redirect_uri', tokenConfig.redirectURI)
    bodyFormData.append('client_id', tokenConfig.clientId)
    bodyFormData.append('client_secret', tokenConfig.clientSecret)
    bodyFormData.append('code_verifier', tokenConfig.pkceCodeVerifier)
    const response = await axios({
      method: 'post',
      url,
      data: bodyFormData
    })
    return response.data.access_token
  }

  /**
   * Logout API call
   */
  async logout(token: string, headers: object): Promise<AxiosResponse> {
    // we're using a new axios instance because we don't want the default interceptor
    const httpClient = axios.create()
    const bodyFormData = new FormData()
    bodyFormData.append('token', token)
    const response = await httpClient({
      method: 'post',
      url: `${config.datagouvfr.base_url}/oauth/revoke`,
      data: bodyFormData,
      headers
    })
    return response
  }
}
