/* eslint-disable */
describe('Code box render test', () => {
    beforeEach(() => {
        cy.visit('/docit/sanbox-demo/');
    });

    if (process.env.NODE_ENV !== 'production') {
        return;
    }

    it('SSR is rendered.', () => {
        cy.route2('/docit/sanbox-demo/*', req => {
            req.reply(res => {
                console.log(res);
            });
        });
    });
});
