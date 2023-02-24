import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../index';

chai.use(chaiHttp);

describe('User routes', () => {
  it('Test the endpoint', (done) => {
    chai
      .request(app)
      .post('/api/v1/user')
      .end((err) => {
        // expect(res.status).to.equal(200);
        done(err);
      });
  });
});

// import chai from 'chai';
// import chaiHttp from 'chai-http';
// // import app from '../../index';
// const app = '../../index';

// chai.use(chaiHttp);

// describe('test', () => {
//   it('hbhkk', (done) => {
//     chai
//       .request(app)
//       .post('')
//       .end((err) => {
//         done(err);
//       });
//   });
// });
