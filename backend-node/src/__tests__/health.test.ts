import request from 'supertest';
import app from '../server';

describe('Health Check Endpoint', () => {
  it('should return status 200 with health information', async () => {
    const response = await request(app).get('/health');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status');
    expect(response.body).toHaveProperty('mysql');
    expect(response.body).toHaveProperty('rabbitmq');
  });

  it('should return status as string', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.status).toBe('string');
    expect(['ok', 'degraded', 'error']).toContain(response.body.status);
  });

  it('should return mysql and rabbitmq status as strings', async () => {
    const response = await request(app).get('/health');
    
    expect(typeof response.body.mysql).toBe('string');
    expect(typeof response.body.rabbitmq).toBe('string');
  });
});
