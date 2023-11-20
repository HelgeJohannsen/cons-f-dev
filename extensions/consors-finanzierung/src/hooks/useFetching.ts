import { useEffect, useState } from "react";

export function useFetching(url: string|undefined){
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>({});
  const [error, setError] = useState<unknown>(null);
  const [reload, setReload] = useState(true);

  useEffect(() =>{
    let interval = setInterval(() => setReload(true), 5000)
    //destroy interval on unmount
    return () => clearInterval(interval)
  })


  useEffect(() => {
    const fetchData = async () => {

      if(url !== undefined  && loading != true){
        setLoading(true)
        try {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error('Something went wrong');
          }
          const json = await response.json();
          if (json) {
            console.log("fetched: ", json)
            setData(json);
          }
        } catch (error) {
          setError(error);
          console.error(error)
        }
      }
      setLoading(false);
    }
    if(reload == true){
        fetchData();
        setReload(false);
    }
  }, [url, reload]);
  return {
    loading,
    data,
    error
  };
};