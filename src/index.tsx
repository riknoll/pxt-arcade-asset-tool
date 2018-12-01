import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { PXTExtension } from './PXTExtension';

declare let module: any

ReactDOM.render(
    <PXTExtension />,
    document.getElementById('root') as HTMLElement
);

if (module.hot) {
    module.hot.accept();
}