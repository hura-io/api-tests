import tkn from '../fixtures/token.json'

export function registerUser(user) {
    cy.request('POST', '/register', user).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(201);

        tkn.token = response.body.accessToken;

    })
}
