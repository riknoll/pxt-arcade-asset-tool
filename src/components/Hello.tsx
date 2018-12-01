import * as React from 'react';

export class Hello extends React.Component<{}, {}> {

    constructor(props: {}) {
        super(props);
    }

    render() {
        return (
            <div className="Hello">
                Hello from MakeCode!
            </div>
        );
    }
}