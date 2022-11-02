declare global {
  let remitData: any[];
  interface Window {
    webkitAudioContext: AudioContext;
    remitData: any[];
  }
}

declare global {
  namespace NodeJS {
      interface Global {
        remitData: any[];
      }
  }
}
export default global;

export {};
