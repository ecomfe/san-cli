var san = require('san');
var SubComponent = require('./components/subcomponent.san');
SubComponent = SubComponent.__esModule ? SubComponent.default : SubComponent;
console.log('this is index');

var sub = new SubComponent();
sub.attach(document.body);

console.log(sub)
window.haha = sub
