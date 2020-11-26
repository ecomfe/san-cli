/* eslint-disable */
describe('Code box render test', () => {
    beforeEach(() => {
        cy.visit('/docit/sanbox-demo/');
    });

    it('Custom tag san-box is rendered.', () => {
        cy.get('san-box-0').should('have.length', 1);
        cy.get('san-box-1').should('have.length', 1);

        cy.get('san-box-0 > .code-box').children().should('have.length', 3);
        cy.get('san-box-1 > .code-box').children().should('have.length', 3);
    });

    it('Simple custom component is rendered correct.', () => {
        cy.get('san-box-0')
            .find('#hello-sanbox > h1')
            .should('contain', 'Hi, San Component from sanbox');

        cy.get('san-box-0')
            .find('#hello-sanbox > h2')
            .should('contain', 'Red, Less enabled!');
    });

    it('Code box less supported.', () => {
        cy.get('san-box-0')
            .find('#hello-sanbox > h2')
            .should('have.css', 'color', 'rgb(255, 0, 0)');
    });

    it('Code part default is hidden.', () => {
        cy.get('.code-box > .highlight-wrapper')
            .should('be.hidden');

        cy.get('.code-box > .code-box-demo')
            .should('be.visible');

        cy.get('.code-box > .code-box-meta')
            .should('be.visible');
    });

    it('Code part can display.', () => {
        cy.get('.code-box > .highlight-wrapper')
            .should('be.hidden');

        // open
        cy.get('.code-box-meta > .code-expand-icon').each(item => item.click());

        cy.get('.code-box > .highlight-wrapper')
            .should('be.visible');

        // close
        cy.get('.code-box-meta > .code-expand-icon').each(item => item.click());

        cy.get('.code-box > .highlight-wrapper')
            .should('be.hidden');
    });

    // `sanbox` tag
    it('Complex custom component `sanbox` is rendered correct.', () => {
        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(0)
            .should('have.class', 'code-box')
            .should($el => expect($el[0].tagName).to.equal('SECTION'));

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(0)
            .children()
            .should('have.length', 3);

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(0)
            .find('.code-box-demo > #_sanbox > h2')
            .should('contain', 'From _sanbox.md.');

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(0)
            .find('.code-box-meta > section > p')
            .should('contain', '这段文字来自')
            .should('contain', '_sanbox.md');

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(0)
            .find('.highlight-wrapper').children()
            .should('have.class', 'language-html')
            .should($el => expect($el[0].tagName).to.equal('PRE'))

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(0)
            .find('.highlight-wrapper').children().children()
            .should('have.class', 'language-html')
            .should($el => expect($el[0].tagName).to.equal('CODE'));
    });

    // `text-tag` tag
    it('Complex custom component `text-tag` is rendered correct.', () => {
        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(1)
            .children('p')
            .should('contain', '这段文字来自')
            .should('contain', '_sanbox.md');

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(1)
            .find('h4 > a')
            .should('have.class', 'header-anchor');
    });

    // `highlight-code` tag
    it('Complex custom component `highlight-code` is rendered correct.', () => {
        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(2)
            .should('have.class', 'language-html')
            .should($el => expect($el[0].tagName).to.equal('PRE'));

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(2)
            .children()
            .should('have.class', 'language-html')
            .should($el => expect($el[0].tagName).to.equal('CODE'));
    });

    // `san-code` tag
    it('Complex custom component `san-code` is rendered correct.', () => {
        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(3)
            .should('have.id', '_sanbox')
            .should($el => expect($el[0].tagName).to.equal('DIV'));

        cy.get('san-box-1 > .code-box > .code-box-demo > .sanbox-demo > h1').next().eq(3)
            .children()
            .should('contain', 'From _sanbox.md.')
            .should($el => expect($el[0].tagName).to.equal('H2'));
    });
});
