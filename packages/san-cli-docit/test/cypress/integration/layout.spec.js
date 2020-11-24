/* eslint-disable */
describe('Code box render test', () => {
    beforeEach(() => {
        cy.visit('/docit/markdownit/');
    });

    it('Sidebar is rendered.', () => {
        cy.get('#sidebar').children()
            .should('have.length', 1)
            .should($el => expect($el[0].tagName).to.equal('UL'));

        cy.get('#sidebar').children().children()
            .should($el => {
                expect($el.length).to.be.at.least(1);
                expect($el[0].tagName).to.equal('LI');
            });
    });

    it('Navbar is rendered.', () => {
        cy.get('#header').children('a')
            .should('have.class', 'logo')
            .should($el => {
                expect($el[0].tagName).to.equal('A');
                expect($el).to.have.attr('href');
            });

        cy.get('#header').children('ul')
            .should('have.length', 1);

        cy.get('#header').find('ul > li')
            .should($el => {
                expect($el.length).to.be.at.least(1);
            });
    });

    it('TOC is rendered.', () => {
        cy.get('#content > aside')
            .should('have.class', 'toc');

        cy.get('#content > aside')
            .children()
            .should('have.length', 1)
            .should($el => {
                expect($el[0].tagName).to.equal('UL');
            });

        cy.get('#content > aside')
            .children()
            .children()
            .should($el => {
                expect($el[0].tagName).to.equal('LI');
                expect($el.length).to.be.at.least(1);
            });
    });
});
