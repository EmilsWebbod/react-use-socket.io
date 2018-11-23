import { reachService } from '../reachService';
import { reachApi, reachCreateError } from '../reachApi';

interface AccessToken {
  token: string;
  expires: Date;
  data: any;
}

async function refreshAccessToken(): Promise<void> {
  try {
    const refreshToken = reachService.getAuth('refreshToken');
    const refreshingToken = reachService.getAuth('refreshingToken');
    let endPoint = reachService.getAuth('endPoint');
    endPoint = endPoint && endPoint !== '' ? endPoint : reachService.get('url');

    if (refreshingToken) {
      throw reachCreateError(
        401,
        'Innlogging har utgått. Vennligst logg inn igjen.'
      );
    }

    if (!refreshToken || refreshToken === '') {
      throw reachCreateError(
        401,
        'Kan ikke hente ny tilgangs token. Ingen refresh token gitt'
      );
    }

    reachService.setAuth('refreshingToken', true);
    const response: AccessToken = await reachApi<AccessToken>(endPoint, {
      method: 'POST',
      auth: false,
      body: { refreshToken }
    });
    reachService.setAuth('refreshingToken', false);
    reachService.setAuth('token', response.token);
  } catch (e) {
    throw e;
  }
}

export default refreshAccessToken;
