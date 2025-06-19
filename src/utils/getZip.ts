const getZip = (
  zipName: string,
  zipPath: string,
  progressCallback: (progress: number) => any,
): Promise<ArrayBuffer> => {
  return new Promise(function (resolve, reject) {
    const req = new XMLHttpRequest();
    req.responseType = 'arraybuffer';

    // Run callback on progress events
    req.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        progressCallback(progress);
      }
    };

    req.onload = () => {
      const arrayBuffer = req.response;
      resolve(arrayBuffer);
    };
    console.log(zipPath + '/' + zipName);

    req.onerror = () => reject();
    req.open('GET', zipPath + zipName);
    req.send();
  });
};

export default getZip;
