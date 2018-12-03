import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { ReachProvider, ReachResource } from '../src/react';

type Test = Array<{ _id: string; name: string }>;

storiesOf('Secure', module).add('Basic', () => (
  <ReachProvider
    url="https://elko-productapi.herokuapp.com"
    authorization={{
      type: 'Basic',
      token: ''
    }}
  >
    <ReachResource<Test> endpoint="products">
      {({ data }) => (
        <div>
          {(data || []).map(x => (
            <div>
              {x._id} : {x.name}
            </div>
          ))}
        </div>
      )}
    </ReachResource>
  </ReachProvider>
));

storiesOf('Secure', module).add('Bearer', () => (
  <ReachProvider
    url="http://localhost:1337"
    authorization={{
      type: 'Bearer',
      endpoint: 'http://localhost:1337/auth/get-access-token',
      token: '',
      refreshToken: ''
    }}
  >
    <ReachResource<Test> endpoint="units/mine">
      {({ data }) => (
        <div>
          {(data || []).map(x => (
            <div>
              {x._id} : {x.name}
            </div>
          ))}
        </div>
      )}
    </ReachResource>
  </ReachProvider>
));
