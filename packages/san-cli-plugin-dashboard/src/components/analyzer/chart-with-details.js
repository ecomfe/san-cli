import Chart from './chart';
import ChartDetails from './details';
import Breadcrumbs from './breadcrumbs';

/* global SanComponent */
export default class App extends SanComponent {
    static template = /* html */`
        <div class="{{chartAreaClass}}" s-if="!disabled">
            <c-char-details
                bundleDetails="{{bundleDetails}}"
                details="{{hoverDetails}}"
                topMargin="0"
            />
            <c-chart
                data="{{chartData}}"
                on-hover="onChartHover"
                on-unhover="onChartUnhover"
                on-render="onChartRender"
            />
            <c-breadcrumbs nodes="{{breadcrumbNodes}}" />
        </div>
    `;

    static components = {
        'c-chart': Chart,
        'c-char-details': ChartDetails,
        'c-breadcrumbs': Breadcrumbs
    };

    initData() {
        return {
            disabled: false,
            breadcrumbNodes: [],
            hoverDetails: null,
            paddingDiff: 0
        };
    }

    onChartHover(details) {
        this.data.set('hoverDetails', details);
        this.data.set('breadcrumbNodes', details.ancestorArray);
    }

    onChartUnhover() {
        this.data.set('hoverDetails', null);
        this.data.set('breadcrumbNodes', []);
    }

    onChartRender(details) {
        this.data.set('paddingDiff', details.removedTopPadding);
    }

    attached() {
        this.watch('chartData', chartData => {
            this.updateChart();
        });
    }

    updateChart() {
        let chartAreaClass = 'chart';
        const {chartData, bundleDetails} = this.data.get();
        if (chartData && chartData.maxDepth > 9) {
            chartAreaClass += ' chart--large';
        }

        this.data.set('chartAreaClass', chartAreaClass);

        if (!bundleDetails || Object.keys(bundleDetails).length === 0) {
            this.data.set('disabled', true);
        }
    }
};
