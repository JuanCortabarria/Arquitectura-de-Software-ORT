import express from 'express';
import request from 'supertest';
import preferenceRoutes from '../src/routes/preferenceRoutes';
import { preferenceService } from '../src/services/preferenceService';

jest.mock('../src/services/preferenceService', () => ({
  preferenceService: {
    update: jest.fn(),
    get: jest.fn(),
  },
}));

const app = express();
app.use(express.json());
app.use('/preferences', preferenceRoutes);

describe('preferenceRoutes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('PUT /preferences/:userId devuelve 400 si el payload es inválido', async () => {
    const response = await request(app)
      .put('/preferences/user-1')
      .send({});

    expect(response.status).toBe(400);
    expect(preferenceService.update).not.toHaveBeenCalled();
  });

  it('PUT /preferences/:userId actualiza preferencias válidas', async () => {
    jest.mocked(preferenceService.update).mockResolvedValueOnce({
      displayCurrency: 'USD',
      alertLimit: 1000,
    });

    const response = await request(app)
      .put('/preferences/user-1')
      .send({ displayCurrency: 'USD', alertLimit: 1000 });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      displayCurrency: 'USD',
      alertLimit: 1000,
    });
  });
});
