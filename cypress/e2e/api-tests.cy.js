import user from '../fixtures/user.json';
import { faker } from '@faker-js/faker';
import { registerUser } from '../support/helper';
import tkn from '../fixtures/token.json';
import postData from '../fixtures/post.json';

user.email = faker.internet.email();
user.password = faker.internet.password();

before(() => {
  registerUser(user);
})

describe('template spec', () => {

  it('TASK 1. Get all posts. Verify HTTP response status code and content type.', () => {
    cy.request('GET', '/posts').then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(200);
      expect(response.headers['content-type']).to.eq('application/json; charset=utf-8');
    })
  })

  it('TASK 2. Get only first 10 posts. Verify HTTP response status code. Verify that only first posts are returned.', () => {
    cy.request('GET', '/posts?_page=1').then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(200);

      expect(response.body[0].id).to.be.equal(1);
      expect(response.body[9].id).to.be.equal(10);
      expect(response.body[10]).to.be.undefined;
    })
  })

  it('TASK 3. Get posts with id = 55 and id = 60. Verify HTTP response status code. Verify id values of returned records.', () => {
    cy.request('GET', '/posts?id=55&id=60').then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(200);

      expect(response.body.length).to.equal(2);
      expect(response.body[0].id).to.be.equal(55);
      expect(response.body[1].id).to.be.equal(60);
    })
  })

  it('TASK 4. Create a post. Verify HTTP response status code.', () => {
    cy.request({
      method: 'POST',
      url: '/664/posts',
      failOnStatusCode: false
    }).then(response => {
      expect(response.isOkStatusCode).to.be.false;
      expect(response.status).to.be.equal(401);
    })

  })

  it('TASK 5. Create post with adding access token in header. Verify HTTP response status code. Verify post is created.', () => {
    cy.request({
      method: 'POST',
      url: '/664/posts',
      headers: {
        Authorization: `Bearer ${tkn.token}`
      }
    }).then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(201);
      return response.body.id;
    }).then(id => {
      cy.log("*Getting post by GET . .**")
      cy.request('GET', `/posts/${id}`).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(200);
        expect(response.body.id).to.be.equal(id);
      })
    })
  })

  it('TASK 6. Create post entity and verify that the entity is created. Verify HTTP response status code. Use JSON in body.', () => {
    postData.id = faker.number.int({ min: 10000, max: 20000 });
    postData.title = faker.lorem.lines(1);
    postData.author = faker.person.fullName();

    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        Authorization: `Bearer ${tkn.token}`
      },
      body: postData
    }).then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(201);
    }).then(() => {
      cy.log("*Getting post by GET . .**")
      cy.request('GET', `/posts/${postData.id}`).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(200);

        expect(response.body.id).to.be.equal(postData.id);
        expect(response.body.title).to.be.equal(postData.title);
        expect(response.body.author).to.be.equal(postData.author);

      })
    })

  })

  it('TASK 7. Update non-existing entity. Verify HTTP response status code.', () => {
    postData.id = faker.number.int({ min: 10000, max: 20000 });
    postData.title = faker.lorem.lines(1);
    postData.author = faker.person.fullName();

    cy.request({
      method: 'PATCH',
      url: '/posts',
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${tkn.token}`
      },
      body: postData
    }).then(response => {
      expect(response.isOkStatusCode).to.be.false;
      expect(response.status).to.be.equal(404);
    })
  })

  it('TASK 8. Create post entity and update the created entity. Verify HTTP response status code and verify that the entity is updated.', () => {
    cy.log("**Updating post data for POST. . .**")
    postData.id = faker.number.int({ min: 10000, max: 20000 });
    postData.title = faker.lorem.lines(1);
    postData.author = faker.person.fullName();

    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        Authorization: `Bearer ${tkn.token}`
      },
      body: postData,
      retryOnStatusCodeFailure: true
    }).then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(201);
    }).then(() => {
      cy.log("**Updating post data for PATCH. . .**")
      postData.title = faker.lorem.lines(1);
      postData.author = faker.person.fullName();
      cy.log("**Updating post by PATCH . .**")
      cy.request({
        method: 'PATCH',
        url: `/posts/${postData.id}`,
        headers: {
          Authorization: `Bearer ${tkn.token}`
        },
        body: postData
      }).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(200);

        expect(response.body.id).to.be.equal(postData.id);
        expect(response.body.title).to.be.equal(postData.title);
        expect(response.body.author).to.be.equal(postData.author);
      })
    }).then(() => {
      cy.log("*Getting post by GET . .**")
      cy.request('GET', `/posts/${postData.id}`).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(200);

        expect(response.body.id).to.be.equal(postData.id);
        expect(response.body.title).to.be.equal(postData.title);
        expect(response.body.author).to.be.equal(postData.author);

      })
    })

  })

  it('TASK 9. Delete non-existing post entity. Verify HTTP response status code.', () => {
    cy.request({
      method: 'DELETE',
      url: '/posts',
      failOnStatusCode: false,
      headers: {
        Authorization: `Bearer ${tkn.token}`
      }
    }).then(response => {
      expect(response.isOkStatusCode).to.be.false;
      expect(response.status).to.be.equal(404);
    })
  })

  it('TASK 10. Create post entity, update the created entity, and delete the entity. Verify HTTP response status code and verify that the entity is deleted.', () => {
    cy.log("**Updating post data for POST. . .**")
    postData.id = faker.number.int({ min: 10000, max: 20000 });
    postData.title = faker.lorem.lines(1);
    postData.author = faker.person.fullName();

    cy.request({
      method: 'POST',
      url: '/posts',
      headers: {
        Authorization: `Bearer ${tkn.token}`
      },
      body: postData
    }).then(response => {
      expect(response.isOkStatusCode).to.be.true;
      expect(response.status).to.be.equal(201);

    }).then(() => {
      cy.log("**Updating post data for PATCH. . .**")
      postData.title = faker.lorem.lines(1);
      postData.author = faker.person.fullName();

      cy.request({
        method: 'PATCH',
        url: `/posts/${postData.id}`,
        headers: {
          Authorization: `Bearer ${tkn.token}`
        },
        body: postData
      }).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(200);

        expect(response.body.id).to.be.equal(postData.id);
        expect(response.body.title).to.be.equal(postData.title);
        expect(response.body.author).to.be.equal(postData.author);

      })
    }).then(() => {
      cy.log("**Deleting post data for DELETE. . .**")
      cy.request({
        method: 'DELETE',
        url: `/posts/${postData.id}`,
        failOnStatusCode: false,
        headers: {
          Authorization: `Bearer ${tkn.token}`
        }
      }).then(response => {
        expect(response.isOkStatusCode).to.be.true;
        expect(response.status).to.be.equal(200);
      })
    }).then(() => {
      cy.log("**Getting post data for GET. . .**")
      cy.request({
        method: 'GET',
        url: `/posts/${postData.id}`,
        failOnStatusCode: false
      }).then(response => {
        expect(response.isOkStatusCode).to.be.false;
        expect(response.status).to.be.equal(404);
      })
    })
  })
})