/* global SanComponent */
export default class App extends SanComponent {
    static template = /* html */`
        <div class="{{styles.breadcrumbs}}">
            <fragment s-for="node, index in nodes">
                {{node.name}}
                <span s-if="{{node.name && (index + 1 !== nodes.length)}}">&gt;</span>
            </fragment>
        </div>
    `;
};

