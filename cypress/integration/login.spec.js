context('login', () => {
  beforeEach(() => {
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.visit('http://localhost:3000')
  })

  it('should login', () => {
    cy.contains("Accéder a l'application").click()
    cy.get('#username').type('kim.mens@uclouvain.be')
    cy.get('#password').type('Het_Wachtw00rd_Van_Kim')
    cy.get('button[type=submit]').first().click()
    cy.url().should('eq', 'http://localhost:3000/no-garden')
  })
})
