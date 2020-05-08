/**
 * @file services/index.js
 * @author ksky521 <ksky521@gmail.com>
 */
import fly from 'flyio';

export const getData = () => fly.get('/api/getData');
export const publish = data => fly.post('/api/publish', data);
