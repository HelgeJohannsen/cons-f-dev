

import {useEffect, useState, useMemo, useCallback } from "react";
  
import {
  backendUrl,
  useAppFetchJson,
  useAppConfig,
  AppConfig,
  useCreateNewConsorsNotifyUUID,
  consorsNotifyUrl
} from './useAppFetchJson';

import { ServerSideEventListener } from '../utils/serverSideEventListener';

  
export function useConsorsSSE(consorsUUID: string|undefined, setConsorsState: (newValue: string) => Promise<unknown>){
  console.log("useConsorsSSE hook called")
  const [ssel, setSsel] = useState<ServerSideEventListener|undefined>()
  
  useEffect(()=>{
    console.log("trying to setup sse")
    if(/*ssel ==undefined &&*/ consorsUUID!=undefined && consorsUUID != undefined){
      const stateUrl = `${backendUrl()}/api/public/state/${consorsUUID}`
      console.log("listenerUrl",)
      console.log("setting up event source with url:",  stateUrl)
      const ssel = new ServerSideEventListener()
      ssel.setHandler("heartbeat", (data) => {
        console.log("heartbeat:",data)
      })
      ssel.setHandler("state", (data) => {
        console.log("state is:",data)
        setConsorsState(data)
      })
      ssel.listen(stateUrl)
      setSsel(ssel)
    }else{
      if(ssel != undefined){
        console.log("already setup")
      }
      if(consorsUUID == undefined){
        console.log("consorsUUID is undefined")
      }
    }
  },[consorsUUID, setConsorsState])
}