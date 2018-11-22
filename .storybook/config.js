import * as React from 'react';
import { addDecorator, configure } from '@storybook/react';
import { ReachProvider } from '../src/react';

const EmptyState = () => <>Fant ikke resurs</>;
const BusyState = () => <>Laster...</>;
const ErrorState = ({ error }) => (
  <>
    FEIL!: {error.code} : {error.message}
  </>
);

addDecorator(story => (
  <ReachProvider
    url="https://jsonplaceholder.typicode.com"
    authorization={{
      token: 'coolToken'
    }}
    EmptyState={EmptyState}
    BusyState={BusyState}
    ErrorState={ErrorState}
  >
    {story()}
  </ReachProvider>
));

const req = require.context('../stories', true, /\.tsx$/);

function loadStories() {
  req.keys().forEach(filename => req(filename));
}

configure(loadStories, module);
