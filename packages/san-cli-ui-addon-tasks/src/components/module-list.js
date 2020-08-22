import './module-list.less';

/* global SanComponent */
export default class ModuletList extends SanComponent {
    static template = /* html */`
    <div class="module-list">
        <fragment s-for="item in moduletList">
            <span class="name">{{item.name}}</span><span class="size">{{item.size/1000 + 'kb'}}</span>
        </fragment>
    </div>
    `;
};
