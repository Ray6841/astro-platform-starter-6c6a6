import request from 'supertest'
import { createApp } from '../../app'

describe('health', () => {
  it('returns ok', async () => {
    const app = await createApp()
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body.ok).toBe(true)
  })
})