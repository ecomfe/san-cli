
/* global SanComponent */
export default class ModuletList extends SanComponent {
    static template = /* html */`
    <div class="{{styles.moduleList}}">
        <fragment s-for="item in moduletList">
            <span class="{{styles.name}}">{{item.name}}</span>
            <span class="{{styles.size}}">{{item.size/1000 + ' kb'}}</span>
        </fragment>
        <div class="{{styles.empty}}" s-if="!moduletList || moduletList.length === 0">...</div>
    </div>
    `;
};
