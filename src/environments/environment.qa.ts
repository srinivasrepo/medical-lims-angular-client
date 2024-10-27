import { defaultEnvironment } from './environment.default';

export const environment = {
  ...defaultEnvironment,
  baseUrl: 'http://localhost:8080/medicallimsapi/',
  commonAPIUrl: 'http://localhost:8080/commonapi/',

  othUrl: 'http://localhost:8080/medicallimsapi/',
  userToken: "QA",
};
