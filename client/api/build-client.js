import axios from "axios";

export default ({ req }) => {
  if (typeof window === "undefined") {
    // It runs on the Server
    return axios.create({ baseURL: "http://ingress-nginx-controller.ingress-nginx.svc.cluster.local", headers: req.headers });
  } else {
    // It runs on the browser
    return axios.create({ baseURL: "/" });
  }
};
