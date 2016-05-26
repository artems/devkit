import got from 'got';
import YandexStaff from './class';

export default function (options) {
  const service = new YandexStaff(got, options);

  return service;
}
