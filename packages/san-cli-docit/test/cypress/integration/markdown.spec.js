/* eslint-disable */
describe('Code box render test', () => {
    beforeEach(() => {
        cy.visit('/docit/markdownit/');
    });

    it('Markdown is rendered.', () => {
        cy.get('#content > div')
            .should('have.class', 'markdown')
            .children()
            .should($el => expect($el.length).to.be.at.least(6));
    });

    it('Heading is rendered.', () => {
        cy.get('#content > .markdown').children()
            .should($el => {
                expect($el[0].tagName).to.equal('H1');
                expect($el[1].tagName).to.equal('H2');
                expect($el[2].tagName).to.equal('H3');
                expect($el[3].tagName).to.equal('H4');
                expect($el[4].tagName).to.equal('H5');
                expect($el[5].tagName).to.equal('H6');
            });
    });

    it('Horizontal Rule is rendered.', () => {
        cy.get('#content > .markdown').children('#horizontal-rule')
            .should($el => {
                expect($el[0].tagName).to.equal('H2');
                expect($el.next()[0].tagName).to.equal('HR');
            });

        cy.get('#content > .markdown').children('#horizontal-rule-2')
            .should($el => {
                expect($el[0].tagName).to.equal('H2');
                expect($el.next()[0].tagName).to.equal('HR');
            });

        cy.get('#content > .markdown').children('#horizontal-rule-3')
            .should($el => {
                expect($el[0].tagName).to.equal('H2');
                expect($el.next()[0].tagName).to.equal('HR');
            });
    });

    it('Emphasis is rendered.', () => {
        cy.get('#content > .markdown').children('#emphasis')
            .should($el => {
                expect($el.next()[0]).to.have.html('<strong>This is bold text</strong>');
                expect($el.next().next().next()[0]).to.have.html('<em>This is italic text</em>');
                expect($el.next().next().next().next().next()[0]).to.have.html('<s>Strikethrough</s>');
            });
    });

    it('Blockquotes is rendered.', () => {
        cy.get('#content > .markdown')
            .children('blockquote')
            .children('blockquote')
            .children('blockquote')
            .should('have.length', 1);
    });

    it('Lists is rendered.', () => {
        cy.get('#content > .markdown')
            .children('ul')
            .should($el => {
                expect($el.length).to.be.at.least(1);
            });

        cy.get('#content > .markdown')
            .children('ul')
            .children('li')
            .eq(1)
            .children('ul')
            .children('li')
            .children('ul')
            .children('li')
            .should($el => {
                expect($el.length).to.be.at.least(1);
            });

        cy.get('#content > .markdown')
            .children('ol')
            .should($el => {
                expect($el.length).to.be.at.least(1);
            });
    });

    it('Code is rendered.', () => {
        cy.get('#content > .markdown')
            .children('pre')
            .should($el => {
                $el.each((index, dom) => {
                    expect(dom.childNodes).to.be.length(1);
                    expect(dom.childNodes[0].tagName).to.equal('CODE');
                })
            });

        cy.get('#content > .markdown')
            .children('pre.language-js')
            .children('code.language-js')
            .should('have.length', 1);

        cy.get('#content > .markdown')
            .children('pre.language-js')
            .children('code.language-js')
            .children()
            .should($el => {
                let countMap = {
                    keyword: 0,
                    function: 0,
                    punctuation: 0,
                    parameter: 0,
                    operator: 0
                };
                $el.each((index, dom) => {
                    if (!dom.className) {
                        return;
                    }
                    dom.className.split(/\s+/).forEach(item => {
                        if (countMap.hasOwnProperty(item)) {
                            countMap[item]++;
                        }
                    });
                });

                expect(countMap.keyword).to.be.at.least(1);
                expect(countMap.function).to.be.at.least(1);
                expect(countMap.punctuation).to.be.at.least(1);
                expect(countMap.parameter).to.be.at.least(1);
                expect(countMap.operator).to.be.at.least(1);
            });
    });

    it('Tables is rendered.', () => {
        cy.get('#content > .markdown')
            .children('table')
            .should($el => {
                $el.each((index, dom) => {
                    expect(dom.childNodes.length).to.have.least(2);

                    let hasThead = false;
                    let hasTbody = false;
                    dom.childNodes.forEach(item => {
                        if (item.tagName === 'THEAD') {
                            hasThead = true;
                        }
                        else if (item.tagName === 'TBODY') {
                            hasTbody = true;
                        }
                    });

                    expect(hasThead).to.be.true;
                    expect(hasTbody).to.be.true;
                })
            });
    });

    it('Links is rendered.', () => {
        cy.get('#content > .markdown')
            .children('#links')
            .next()
            .should($el => {
                expect($el[0].tagName).to.be.equal('P');
                expect($el.children()).to.have.length(1);
                expect($el.children()[0].tagName).to.be.equal('A');
                expect($el.children()).to.be.attr('href');
            });
    });

    it('Images is rendered.', () => {
        cy.get('#content > .markdown')
            .find('p > img')
            .should('have.length', 3);
    });

    it('Emoji is rendered.', () => {
        cy.get('#content > .markdown')
            .should('contain', '🤖 🎉 💯 💪 🎅 🇨🇳 💥 🦊');
    });

    it('Tip is rendered.', () => {
        cy.get('#content > .markdown')
            .children('div.info')
            .should('have.length', 2);

        cy.get('#content > .markdown')
            .children('div.warning')
            .should('have.length', 1);

        cy.get('#content > .markdown')
            .children('div.danger')
            .should('have.length', 1);

        cy.get('#content > .markdown')
            .children('div.success')
            .should('have.length', 1);
    });
});
