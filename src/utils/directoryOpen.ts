interface Options {
  recursive: boolean;
}

export interface FilesWithPath {
  file: File;
  path: string;
}

const getFiles = async (
  dirHandle: any,
  recursive: boolean,
  path: string = dirHandle.name,
): Promise<FilesWithPath[]> => {
  const dirs: Promise<FilesWithPath[]>[] = [];
  const files: FilesWithPath[] = [];

  for await (const entry of dirHandle.values()) {
    const nestedPath = `${path}/${entry.name}`;
    if (entry.kind === 'file') {
      const file = await entry.getFile();
      files.push({
        file: file,
        path: nestedPath,
      });
    } else if (entry.kind === 'directory' && recursive) {
      dirs.push(getFiles(entry, recursive, nestedPath));
    }
  }

  const resolvedDirs = await Promise.all(dirs);
  return [...resolvedDirs.flat(), ...files];
};

export default async (options: Options): Promise<FilesWithPath[] | undefined> => {
  if (!('showDirectoryPicker' in window) || !window.showDirectoryPicker) {
    alert('Your browser doesn\'t support the Filesystem Access API. You will have to make ZIP file out of your game directory, please click on the instructions link in the sidebar menu for a guide.');
    return;
  }
  options.recursive = options.recursive || false;
  // @ts-ignore -- it does exist
  const handle = await window.showDirectoryPicker();
  return await getFiles(handle, options.recursive);
};
