import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { ReachResource } from '../src/react';

storiesOf('ReactResource', module).add('default', () => (
  <ReachResource<Array<{ id: string; title: string }>> endpoint="todos">
    {({ data }) => (
      <>
        {(data || []).map(x => (
          <div>
            {x.id} : {x.title}
          </div>
        ))}
      </>
    )}
  </ReachResource>
));

storiesOf('ReactResource', module).add('EmptyState', () => {
  return (
    <ReachResource<
      Array<{ id: string; title: string }>
    > endpoint="todos?id=11111">
      {({ data }) => (
        <>
          {(data || []).map(x => (
            <div>
              {x.id} : {x.title}
            </div>
          ))}
        </>
      )}
    </ReachResource>
  );
});

storiesOf('ReactResource', module).add('ErrorState', () => {
  return (
    <ReachResource<Array<{ id: string; title: string }>> endpoint="todoss">
      {({ data }) => (
        <>
          {(data || []).map(x => (
            <div>
              {x.id} : {x.title}
            </div>
          ))}
        </>
      )}
    </ReachResource>
  );
});
