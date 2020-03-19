export default {
    initData() {
        return {
            name: 'inited Child Component'
        }
    },
    attached() {
        console.log('child component attached!!')
    }
}
