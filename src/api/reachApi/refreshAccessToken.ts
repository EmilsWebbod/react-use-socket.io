import { reachService } from '../reachService';
import { reachApi, reachCreateError } from '../reachApi';
import { goToRoot } from '../../utils';

interface AccessToken {
  token: string;
  expires: Date;
  data: any;
}

async function refreshAccessToken(): Promise<void> {
  try {
    const refreshToken = reachService.getAuth('refreshToken');
    let endPoint = reachService.getAuth('endPoint');
    endPoint = endPoint !== '' ? endPoint : reachService.get('url');

    if (!refreshToken || refreshToken === '') {
      goToRoot();

      throw reachCreateError(
        500,
        'En feil har oppstått. Vennligst logg inn igjen.'
      );
    }

    const response: AccessToken = await reachApi<AccessToken>(endPoint, {
      method: 'POST',
      auth: false,
      body: { refreshToken }
    });

    reachService.setAuth('token', response.token);
  } catch (e) {
    throw e;
  }
}

export default refreshAccessToken;
