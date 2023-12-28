import { useEffect, useState } from "react";
import { backendUrl } from "../utils/consorsUrls";

export const useTest = () => {
  const [test, setTest] = useState();

  useEffect(() => {
    const getTestData = async () => {
      const apiEndpoint = "api/public/productsByCollection";
      const requestUrl = `${backendUrl()}${apiEndpoint}`;
      const response = await fetch(requestUrl, { method: "GET" });
      const data = await response.json();
      console.log("useTest data", data);
      setTest(data);
    };
    getTestData();
  }, []);
  return test;
};
